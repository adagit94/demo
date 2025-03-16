import Pager, { PagerSettings } from "data/dataManagment/paging/Pager/Pager";
import { debounce, isEqual, throttle } from "lodash";
import { PrimitiveValue, RecordValue } from "types/CommonTypes";

export const SEARCH_ITEM_BY_VALUE_INTERVAL = 3000; // ms

type DataItem = PrimitiveValue | RecordValue;

export type InputDataManagerSettings = PagerSettings & {
  paginate: boolean;
};

class InputDataManager<DataItem extends PrimitiveValue | RecordValue, Settings extends PagerSettings> {
  constructor(settings: Settings) {
    this.settings = settings;
    this.pager = new Pager(settings);
  }

  private pager: Pager<DataItem>;
  private fulltext = "";
  private prevDataItemsChunk: DataItem[] | undefined | null = [];
  private selectedValues: unknown[] = [];
  private selectedItems: DataItem[] = [];
  private scrollListener: ((e: Event) => void) | undefined;
  private scrollInfo: { scrollTop: number; prevScrollTop: number | undefined } | undefined;
  protected settings: Settings;

  private missingDataItemsForValues = () => {
    return this.selectedItems.length !== this.selectedValues.length;
  };

  private getDataItemsForValues = (): DataItem[] => {
    const dataItemConf = this.settings.getDataItemConf();

    if (!dataItemConf) return [];

    const dataItems = this.getData();
    let items: DataItem[] = [];

    if (dataItemConf.type === DataItemType.OBJECT) {
      for (const value of this.selectedValues) {
        const dataItem = dataItems.find((dataItem) => value === get(dataItem, dataItemConf.value));

        if (TypesUtils.isRecordObject(dataItem)) items.push(dataItem);
      }
    } else if (dataItemConf.type === DataItemType.PRIMITIVE) {
      for (const value of this.selectedValues) {
        const dataItem = dataItems.find((dataItem) => value === dataItem);

        if (TypesUtils.isPrimitive(dataItem)) items.push(dataItem);
      }
    }

    return items;
  };

  /**
   * @description Function emits event when data item(s) are missing for values currently set
   */
  private requestDataItemsForValues = throttle(() => {
    this.fulltext = "";
    this.scrollInfo = undefined;

    this.pager.reset();
    this.pager.advance({
      action: () => {
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
      if (this.settings.paginate) {
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

  private verifySufficientAmount = () => {
    // cause overflow of container to display scrollbar and make listening to scroll event possible to progress further with data
    if (
      this.settings.paginate &&
      this.prevDataItemsChunk?.length === this.settings.take &&
      this.pager.getData().length <= (this.settings.minItems ?? 10)
    ) {
      this.advancePager();
    }
  };

  private advancePager = () =>
    this.pager.advance({
      action: (skip, take) => {
        this.emitEvent(this.constructEvent({ skip, take, fulltext: this.fulltext }));
      },
    });

  private advancePagerDebounced = debounce(this.advancePager, 250, {
    leading: false,
    trailing: true,
  });

  protected setData = (dataItems: DataItem[]) => {
    this.prevDataItemsChunk = dataItems;
    this.pager.setData(dataItems);
    this.verifySufficientAmount();
  };

  public getData = () => {
    const pagerData = this.pager.getData();

    // filter selected items that are included in base data set and prepend only those that are missing
    const prependedSelectedItems = this.selectedItems.filter(
      (selectedItem) => !pagerData.some((item) => isEqual(item, selectedItem)),
    );

    return [...prependedSelectedItems, ...pagerData];
  };

  public handleData(data: DataItem[]): boolean {
    if (this.prevDataItemsChunk === data) {
      return false;
    }

    
    this.setData(data);

    return true;
  }

  public init = () => {
    this.fulltext = "";
    this.scrollInfo = undefined;

    this.pager.reset();
    this.advancePager();
  };

  public search = debounce(
    (fulltext: string) => {
      this.fulltext = fulltext ?? "";
      this.scrollInfo = undefined;

      this.pager.reset();
      this.advancePager();
    },
    250,
    { leading: false },
  );

  public setSelection = (values: unknown | unknown[]) => {
    this.selectedValues = (Array.isArray(values) ? values : [values]).filter((x) => x !== undefined && x !== null);
    this.selectedItems = this.getDataItemsForValues();
  };

  public sync(values: PrimitiveValue | PrimitiveValue[], data: DataItem[]) {
    this.handleData(data);
    this.setSelection(values);
    this.verifyMissingDataItemsForValues();
  }

  public attachScrollListener = (dropdownIdClass: string) => {
    const container = document.querySelector(`.${dropdownIdClass} .dx-overlay-content`) as HTMLDivElement | null;

    if (!container) return;

    const listener = (this.scrollListener = (_e: Event) => {
      const scrollbarContainer = container?.querySelector(".dx-scrollable-scrollbar");
      const scrollbarContainerRect = scrollbarContainer?.getBoundingClientRect();

      const scrollbarContent = scrollbarContainer?.querySelector("div:first-child");
      const scrollbarContentRect = scrollbarContent?.getBoundingClientRect();

      const scrollable = container?.querySelector(".dx-scrollable-container") as HTMLDivElement | null;

      if (scrollable) {
        this.scrollInfo = {
          scrollTop: scrollable.scrollTop,
          prevScrollTop: this.scrollInfo?.scrollTop,
        };
      }

      if (
        scrollbarContainerRect &&
        scrollbarContentRect &&
        this.prevDataItemsChunk &&
        this.prevDataItemsChunk.length >= this.settings.take &&
        Math.ceil(scrollbarContentRect.bottom) >= Math.floor(scrollbarContainerRect.bottom)
      ) {
        this.advancePagerDebounced();
      }
    });

    container.addEventListener("scroll", listener, true);
  };

  public detachScrollListener = (dropdownIdClass: string) => {
    if (!this.scrollListener) return;

    const container = document.querySelector(`.${dropdownIdClass} .dx-overlay-content`) as HTMLDivElement | null;

    if (!container) return;

    container.removeEventListener("scroll", this.scrollListener, true);
    this.scrollListener = undefined;
  };
}

export default InputDataManager;
