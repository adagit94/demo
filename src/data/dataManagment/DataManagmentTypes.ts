import { ImmutableGetter, VariadicFunction } from "types/CommonTypes";

type GetState<T extends Record<string, unknown>> = () => T;

type Advance<T extends Record<string, unknown>, U extends unknown[] = []> = VariadicFunction<T, U>;

type Rollback = () => void;

type Reset = () => void;

type GetData<T> = ImmutableGetter<T>;

type SetData<T> = (data: T) => void;

export type LoadData<T, U extends unknown[] = []> = VariadicFunction<T | Promise<T>, U>;

export type FilterData<T, U> = (filter: T) => U | Promise<U>;

export type DataSourceState<T> = { data: Readonly<T>; exhausted: boolean };

export interface IPageCursor<T extends Record<string, unknown>, U extends Record<string, unknown>> {
  getState: GetState<T>;
  advance: Advance<U>;
  rollback: Rollback;
  reset: Reset;
}

export interface IDataLoader<T, U extends unknown[] = []> {
  load: LoadData<T, U>;
}

export interface IDataFilter<T, U> {
  filter: FilterData<T, U>;
}

export interface IDataSource<T, U extends DataSourceState<T>> {
  getState: GetState<U>;
  getData: GetData<T>;
  setData: SetData<T>;
  reset: Reset;
}

export interface IFilteredDataSource<T, U extends DataSourceState<T>, V, W> extends IDataSource<T, U>, IDataFilter<V, W> {}
