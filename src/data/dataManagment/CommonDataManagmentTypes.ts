export type Advance<Settings extends Record<string, unknown>, Args extends unknown[] = []> = (...args: Args) => Settings;

export type Reset = () => void;

export type GetData<T> = () => T;

export type SetData<T> = (data: T) => T;

export type Exhausted = () => boolean;

export interface IPageCursor<Settings extends Record<string, unknown>> {
  advance: Advance<Settings>;
}

export interface IDataSource<Data> {
  getData: GetData<Data>;
  setData: SetData<Data>;
  reset: Reset;
  exhausted: Exhausted;
}
