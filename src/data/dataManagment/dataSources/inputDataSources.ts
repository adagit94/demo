import { DataSourceState, IDataLoader, IDataSource, IPageCursor } from "data/dataManagment/DataManagmentTypes";
import { debounce, get, isEqual } from "lodash";
import { PrimitiveValue } from "types/CommonTypes";

type RecordValue = Record<string | number, unknown>;
type DataItem = PrimitiveValue | RecordValue;

type InputDataManagerState<DataItem extends PrimitiveValue | RecordValue> = DataSourceState<DataItem[]>;

type LoaderOptionals = Partial<{ search: string; selectedValues: DataItem[] }>;

abstract class InputDataSource<
  Settings extends PrimitiveInputDataSourceSettings | ObjectInputDataSourceSettings,
  DataItem extends PrimitiveValue | RecordValue,
  SelectedValue extends PrimitiveValue | RecordValue,
  PagerState extends Record<string, unknown>,
  PagerAdvanceInfo extends Record<string, unknown>,
  Pager extends IPageCursor<PagerState, PagerAdvanceInfo>,
  Loader extends IDataLoader<DataSourceState<DataItem[]>, [PagerAdvanceInfo, LoaderOptionals]>,
> implements IDataSource<DataItem[], DataSourceState<DataItem[]>>
{
  constructor(pager: Pager, loader: Loader, settings: Settings) {
    this.pager = pager;
    this.loader = loader;
    this.settings = settings;
  }

  private pager: Pager;
  private loader: Loader;
  private state: InputDataManagerState<DataItem> = { data: [], exhausted: false, sufficientAmount: false };
  private data: DataItem[] = [];
  private selectedItems: DataItem[] = [];
  protected selectedValues: SelectedValue[] = [];
  protected settings: Settings;

  protected abstract getDataItemsForValues: () => DataItem[];

  private missingDataItemsForValues = () => {
    return this.selectedItems.length !== this.selectedValues.length;
  };

  /**
   * @description Request missing data item(s) for values currently set.
   */
  private requestDataItemsForValues = () => {
    this.pager.reset();
    this.loadData({ selectedValues: this.selectedValues });
  };

  private loadData = async (optionals?: LoaderOptionals) => {
    try {
      const { data, exhausted, sufficientAmount } = await this.loader.load(this.pager.advance(), this.getData(), optionals);

      this.state = {
        data: Array.isArray(data) ? data : [data],
        exhausted,
        sufficientAmount,
      };

      if (!sufficientAmount) this.loadData();
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
    this.pager.reset();
    this.loadData();
  };

  public search = debounce(
    (search: string) => {
      this.pager.reset();
      this.loadData({ search });
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

    if (this.missingDataItemsForValues()) {
      this.requestDataItemsForValues();
    }
  }

  public getState = () => ({ ...this.state });
}

type PrimitiveInputDataSourceSettings = Record<string, never>;

export class PrimitiveInputDataSource<
  PagerState extends Record<string, unknown>,
  PagerAdvanceInfo extends Record<string, unknown>,
  Pager extends IPageCursor<PagerState, PagerAdvanceInfo>,
  Loader extends IDataLoader<DataSourceState<PrimitiveValue[]>, [PagerAdvanceInfo, LoaderOptionals]>,
> extends InputDataSource<
  PrimitiveInputDataSourceSettings,
  PrimitiveValue,
  PrimitiveValue,
  PagerState,
  PagerAdvanceInfo,
  Pager,
  Loader
> {
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

type ObjectInputDataSourceSettings = {
  valueKey?: string;
};

export class ObjectInputDataSource<
  PagerState extends Record<string, unknown>,
  PagerAdvanceInfo extends Record<string, unknown>,
  Pager extends IPageCursor<PagerState, PagerAdvanceInfo>,
  Loader extends IDataLoader<DataSourceState<RecordValue[]>, [PagerAdvanceInfo, LoaderOptionals]>,
> extends InputDataSource<
  ObjectInputDataSourceSettings,
  RecordValue,
  RecordValue | PrimitiveValue,
  PagerState,
  PagerAdvanceInfo,
  Pager,
  Loader
> {
  protected override getDataItemsForValues = (): RecordValue[] => {
    const data = this.getData();
    let dataItems: RecordValue[] = [];

    for (const value of this.selectedValues) {
      const dataItem = data.find((item) => {
        const { valueKey } = this.settings;

        if (valueKey) {
          return get(item, valueKey) === value;
        }

        return isEqual(item, value);
      });

      if (dataItem) dataItems.push(dataItem);
    }

    return dataItems;
  };
}
