export type Advance<Info extends Record<string, unknown>, Args extends unknown[] = []> = (...args: Args) => Info;

export type Rollback = () => void;

export type Reset = () => void;

export type GetData<T> = () => T;

export type SetData<T> = (data: T) => T;

export type Exhausted = () => boolean;

export interface IPageCursor<AdvanceInfo extends Record<string, unknown>> {
  advance: Advance<AdvanceInfo>;
  rollback: Rollback;
  reset: Reset;
}

export interface IDataSource<Data> {
  getData: GetData<Data>;
  setData: SetData<Data>;
  reset: Reset;
  exhausted: Exhausted;
}
