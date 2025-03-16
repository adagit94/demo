import { Advance, GetData, ICursor, Reset, SetData } from "data/dataManagment/CommonDataManagmentTypes";

type PagerAdvanceSettings = { skip: number; take: number };
type PagerAdvanceOptionals = { steps: number };

export type PagerSettings = {
  take: number;
};

interface IPager<T> extends ICursor<PagerAdvanceSettings, PagerAdvanceOptionals> {
  getData: GetData<T>;
  setData: SetData<T>;
  reset: Reset;
}

class Pager<T> implements IPager<T> {
  constructor({ take }: PagerSettings) {
    this.take = take;
  }

  private step = 0;
  private skip = 0;
  private take = 0;
  private data: T[] = [];

  public advance: Advance<PagerAdvanceSettings, PagerAdvanceOptionals> = (action, { steps = 1 } = {}) => {
    this.skip = this.take * this.step;
    this.step += steps;

    action({ skip: this.skip, take: this.take * steps });
  };

  public getData: GetData<T> = () => this.data;

  public setData: SetData<T> = (data: T[]) => {
    const merge = this.skip > 0;

    this.data = merge ? [...this.data, ...data] : data;

    return this.data;
  };

  public reset: Reset = () => {
    this.setData([]);

    this.step = 0;
    this.skip = 0;
  };

  public setStep = (step: number) => {
    this.step = step;
  };

  public getState = () => ({ step: this.step, skip: this.skip, take: this.take });
}

export default Pager;
