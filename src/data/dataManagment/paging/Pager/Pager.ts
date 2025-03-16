import {
  Advance,
  Exhausted,
  GetData,
  IDataSource,
  IPageCursor,
  Reset,
  SetData,
} from "data/dataManagment/CommonDataManagmentTypes";

type PagerAdvanceOptionals = { steps: number };
type PagerAdvanceLoader<Data> = (info: { skip: number; take: number }) => Promise<Data>;

export type PagerSettings = {
  take: number;
};

interface IPager<Data> extends IPageCursor<PagerAdvanceLoader<Data>, PagerAdvanceOptionals>, IDataSource<Data> {}

class Pager<DataItem> implements IPager<DataItem[]> {
  constructor({ take }: PagerSettings) {
    this.take = take;
  }

  private step = 0;
  private skip = 0;
  private take = 0;
  private data: DataItem[] = [];

  private setData: SetData<DataItem[]> = (data: DataItem[]) => {
    const merge = this.skip > 0;

    this.data = merge ? [...this.data, ...data] : data;

    return this.data;
  };

  public getData: GetData<DataItem[]> = () => this.data;

  public advance: Advance<PagerAdvanceLoader<DataItem[]>, PagerAdvanceOptionals> = async (
    loader,
    { steps = 1 } = {},
  ) => {
    this.skip = this.take * this.step;
    this.step += steps;

    const batch = await loader({ skip: this.skip, take: this.take * steps });

    this.setData(batch);
  };

  public reset: Reset = () => {
    this.step = 0;
    this.skip = 0;
    this.data = [];
  };

  public exhausted: Exhausted = () => {
    
  };

  public getState = () => ({ step: this.step, skip: this.skip, take: this.take });
}

export default Pager;
