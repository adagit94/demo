import {
  DataSourceState,
  GetState,
  IDataLoader,
  IDataSource,
  IFilteredDataSource,
  IPageCursor,
  SetState,
} from "data/dataManagment/DataManagmentTypes";
import { createDataSource } from "data/dataManagment/dataSources/dataSources";
import { debounce, get, isEqual } from "lodash";
import { createQueue, ExecuteTask, IQueue, QueueTask } from "queues/queue";
import { PrimitiveValue } from "types/CommonTypes";

type RecordValue = Record<string | number, unknown>;
type DataItem = PrimitiveValue | RecordValue;

type InputDataManagerQueueTask = QueueTask & { handle: () => Promise<void> };

type InputDataManagerState<
  DataItem extends PrimitiveValue | RecordValue,
  PagerState extends Record<string, unknown>,
> = DataSourceState<DataItem[]> &
  PagerState

type LoaderOptionals = Partial<{ search: string; selectedValues: DataItem[]; reqTotalCount: boolean } & QueueTask>;

type DataInitOptionals = Pick<LoaderOptionals, "reqTotalCount">;

type FilterParams = [string, DataInitOptionals];

abstract class InputDataManager<
  Settings extends PrimitiveInputDataManagerSettings | ObjectInputDataManagerSettings,
  DataItem extends PrimitiveValue | RecordValue,
  SelectedValue extends PrimitiveValue | RecordValue,
  PagerState extends Record<string, unknown>,
  PagerAdvanceInfo extends Record<string, unknown>,
  Pager extends IPageCursor<PagerState, PagerAdvanceInfo>,
  Loader extends IDataLoader<InputDataManagerState<DataItem, PagerState>, [PagerAdvanceInfo, LoaderOptionals]>,
> implements IFilteredDataSource<DataItem[], InputDataManagerState<DataItem, PagerState>, void, FilterParams>
{
  constructor(pager: Pager, loader: Loader, settings: Settings) {
    this.queue = createQueue({ executeTask: this.executeQueueTask });
    this.dataSource = createDataSource<DataItem[]>({ initState: this.initState });
    this.pager = pager;
    this.loader = loader;
    this.settings = settings;
  }

  private queue: IQueue<InputDataManagerQueueTask>;
  private dataSource: IDataSource<DataItem[]>;
  private pager: Pager;
  private loader: Loader;
  private selectedItems: DataItem[] = [];
  protected selectedValues: SelectedValue[] = [];
  protected settings: Settings;

  protected abstract getDataItemsForValues: () => DataItem[];

  private initState = () => ({ data: [], exhausted: false });

  private executeQueueTask: ExecuteTask<InputDataManagerQueueTask> = async (task) => {
    await task.handle();
  };

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

  private loadData = async (optionals: LoaderOptionals = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      this.queue.setTask({
        priority: optionals.priority,
        privileged: optionals.privileged,
        handle: async () => {
          const step = this.pager.advance();

          try {
            const stateUpdate = await this.loader.load(step, optionals);

            this.setState(stateUpdate);
            step.close(true);
            resolve(true);
          } catch (err) {
            console.error(`Data load failed:`, err);
            step.close(false);
            resolve(false);
          }
        },
      });
    });
  };

  public getData = () => {
    const baseData = this.dataSource.getData();

    // filter out selected items that are included in base data set and prepend only those that are missing
    const prependedSelectedItems = this.selectedItems.filter(
      (selectedItem) => !baseData.some((item) => isEqual(item, selectedItem)),
    );

    return [...prependedSelectedItems, ...baseData];
  };

  public setData = (data: DataItem[]) => {
    this.pager.reset();
    this.dataSource.setData(data);
  };

  public init = ({ reqTotalCount }: DataInitOptionals = {}) => {
    this.pager.reset();
    this.loadData({ reqTotalCount });
  };

  public filter = debounce(
    (search: string, { reqTotalCount }: DataInitOptionals = {}) => {
      this.pager.reset();
      this.loadData({ search, reqTotalCount });
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

  public getState: GetState<InputDataManagerState<DataItem, PagerState>> = () => ({
    ...this.dataSource.getState(),
    ...this.pager.getState(),
  });

  public setState: SetState<InputDataManagerState<DataItem, PagerState>> = (update) => {
    const state = typeof update === "function" ? update(this.getState()) : update;

    this.dataSource.setState({ data: state.data, exhausted: state.exhausted });
    this.pager.setState(state)

    return this.getState()
  };

  public reset = () => {
    this.pager.reset();
    this.dataSource.reset();
  };
}

type PrimitiveInputDataManagerSettings = Record<string, never>;

export class PrimitiveInputDataManager<
  PagerState extends Record<string, unknown>,
  PagerAdvanceInfo extends Record<string, unknown>,
  Pager extends IPageCursor<PagerState, PagerAdvanceInfo>,
  Loader extends IDataLoader<InputDataManagerState<PrimitiveValue, PagerState>, [PagerAdvanceInfo, LoaderOptionals]>,
> extends InputDataManager<
  PrimitiveInputDataManagerSettings,
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

type ObjectInputDataManagerSettings = {
  valueKey?: string;
};

export class ObjectInputDataManager<
  PagerState extends Record<string, unknown>,
  PagerAdvanceInfo extends Record<string, unknown>,
  Pager extends IPageCursor<PagerState, PagerAdvanceInfo>,
  Loader extends IDataLoader<InputDataManagerState<RecordValue, PagerState>, [PagerAdvanceInfo, LoaderOptionals]>,
> extends InputDataManager<
  ObjectInputDataManagerSettings,
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
