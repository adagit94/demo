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
type PagerSettings = { skip: number; take: number }

class Pager<DataItem> implements IPageCursor<PagerSettings> {
  constructor({ take }: Partial<Pick<PagerSettings, "take">> = {}) {
    this.take = take ?? 0;
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

  public advance = (
    { steps = 1 } = {},
  ) => {
    this.skip = this.take * this.step;
    this.step += steps;

    return { skip: this.skip, take: this.take * steps };
  };

  public reset: Reset = () => {
    this.step = 0;
    this.skip = 0;
    this.data = [];
  };

  public getState = () => ({ step: this.step, skip: this.skip, take: this.take });
}

export default Pager;
