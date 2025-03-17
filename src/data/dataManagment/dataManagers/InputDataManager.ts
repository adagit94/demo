import { IDataSource, IPageCursor } from "data/dataManagment/CommonDataManagmentTypes";
import Pager, { PagerSettings } from "data/dataManagment/paging/Pager/Pager";
import { debounce, isEqual, throttle } from "lodash";
import { PrimitiveValue, RecordValue } from "types/CommonTypes";

export const SEARCH_ITEM_BY_VALUE_INTERVAL = 3000; // ms

type DataItem = PrimitiveValue | RecordValue;

// cause overflow of container to display scrollbar and make listening to scroll event possible to progress further with data
// type Dropdown = { maxHeight: number; getElement: () => HTMLElement };

type VerifySufficientAmount = (itemsCount: number) => boolean;

export type InputDataManagerSettings<DataItem extends PrimitiveValue | RecordValue<string | number>> = {
  verifySufficientAmount: VerifySufficientAmount;
};

// interface InputDataManager {

// }

abstract class InputDataManager<
  DataItem extends PrimitiveValue | RecordValue<string | number>,
  SelectedValue extends PrimitiveValue | RecordValue<string | number>,
  PagerAdvanceInfo extends Record<string, unknown>,
  Pager extends IPageCursor<PagerAdvanceInfo>,
  Loader extends (
    pagerInfo: PagerAdvanceInfo,
    search: string,
  ) => DataItem | DataItem[] | Promise<DataItem | DataItem[]>,
> implements IDataSource<DataItem[]>
{
  constructor(pager: Pager, loader: Loader, { verifySufficientAmount }: InputDataManagerSettings) {
    this.pager = pager;
    this.loader = loader;
    this.verifySufficientAmount = verifySufficientAmount;
  }

  private pager: Pager;
  private loader: Loader;
  private verifySufficientAmount: VerifySufficientAmount | undefined;
  private data: DataItem[] = [];
  private searchValue = "";
  private prevDataItemsChunk: DataItem[] | undefined | null = [];
  private selectedItems: DataItem[] = [];
  protected selectedValues: SelectedValue[] = [];

  protected abstract getDataItemsForValues: () => DataItem[];

  private missingDataItemsForValues = () => {
    return this.selectedItems.length !== this.selectedValues.length;
  };

  /**
   * @description Function emits event when data item(s) are missing for values currently set
   */
  private requestDataItemsForValues = throttle(() => {
    this.searchValue = "";

    this.pager.reset();
    this.pager.advance({
      loader: () => {
        const eventInfo =
          this.settings.eventType === "OnSelectboxDataRequest"
            ? { value: this.selectedValues[0] }
            : { values: this.selectedValues };

        this.emitEvent(this.constructEvent(eventInfo));
      },
    });
  }, SEARCH_ITEM_BY_VALUE_INTERVAL);

  private verifyMissingDataItemsForValues = () => {
    if (this.missingDataItemsForValues()) {
      if (this.pager.paged()) {
        // retrieve missing data items first and then set them in setData()
        this.requestDataItemsForValues();
      } else {
        const dataItemConf = this.settings.getDataItemConf();

        if (dataItemConf?.type === DataItemType.PRIMITIVE && this.selectedValues.every(TypesUtils.isPrimitive)) {
          this.selectedItems = [...this.selectedValues];
        }
      }
    }
  };

  private hasSufficientAmount = (): boolean => {
    return !this.pager.paged() || this.verifySufficientAmount?.(this.data.length) !== false;
  };

  private loadData = async () => {
    try {
      const data = await this.loader(this.pager.advance(), this.searchValue);

      this.data = Array.isArray(data) ? data : [data];

      if (!this.hasSufficientAmount()) this.loadData();
    } catch (err) {
      console.error(`Data load failed:`, err);
      this.pager.rollback();
    }
  };

  public getData = () => {
    // filter out selected items that are included in base data set and prepend only those that are missing
    const prependedSelectedItems = this.selectedItems.filter(
      (selectedItem) => !this.data.some((item) => isEqual(item, selectedItem)),
    );

    return [...prependedSelectedItems, ...this.data];
  };

  public init = () => {
    this.searchValue = "";
    this.pager.reset();
    this.loadData();
  };

  public search = debounce(
    (searchValue: string) => {
      this.searchValue = searchValue;
      this.pager.reset();
      this.loadData();
    },
    250,
    { leading: false },
  );

  public setSelection = (values: SelectedValue | SelectedValue[] | undefined | null) => {
    this.selectedValues = (Array.isArray(values) ? values : [values]).filter((v) => v !== undefined && v !== null);
    this.selectedItems = this.getDataItemsForValues();
  };

  public sync(values: SelectedValue | SelectedValue[] | undefined | null) {
    this.setSelection(values);
    this.verifyMissingDataItemsForValues();
  }

  public exhausted: Exhausted = () => {};
}

export class PrimitiveInputDataManager<
  PagerAdvanceInfo extends Record<string, unknown>,
  Pager extends IPageCursor<PagerAdvanceInfo>,
  Loader extends (
    pagerInfo: PagerAdvanceInfo,
    search: string,
  ) => PrimitiveValue | PrimitiveValue[] | Promise<PrimitiveValue | PrimitiveValue[]>,
> extends InputDataManager<PrimitiveValue, PrimitiveValue, PagerAdvanceInfo, Pager, Loader> {
  protected override getDataItemsForValues = (): PrimitiveValue[] => {
    const data = this.getData();
    let dataItems: PrimitiveValue[] = [];

    for (const value of this.selectedValues) {
      const dataItem = data.find((item) => value === item);

      if (dataItem) dataItems.push(dataItem);
    }

    return dataItems;
  };
}

export default InputDataManager;
