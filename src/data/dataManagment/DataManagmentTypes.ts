import { ImmutableGetter, VariadicFunction } from "types/CommonTypes";

export type GetState<T extends Record<string, unknown>> = () => T;

export type SetState<T extends Record<string, unknown>> = (newState: Partial<T> | ((state: T) => Partial<T>)) => T;

type Advance<T extends Record<string, unknown>, U extends unknown[] = []> = VariadicFunction<T, U>;

type Rollback = () => void;

export type Reset = () => void;

export type GetData<T> = ImmutableGetter<T>;

export type SetData<T> = (data: T) => void;

export type LoadData<T, U extends unknown[] = []> = VariadicFunction<T | Promise<T>, U>;

export type FilterData<T, U extends unknown[] = []> = VariadicFunction<T | Promise<T>, U>

export type DataSourceState<T> = { data: Readonly<T>; exhausted: boolean; totalCount?: number };

export interface IPageCursor<T extends Record<string, unknown>, U extends Record<string, unknown>> {
  getState: GetState<T>;
  advance: Advance<U>;
  rollback: Rollback;
  reset: Reset;
}

export interface IDataLoader<T, U extends unknown[] = []> {
  load: LoadData<T, U>;
}

export interface IDataFilter<T, U extends unknown[] = []> {
  filter: FilterData<T, U>;
}

export interface IDataSource<T, U extends DataSourceState<T> = DataSourceState<T>> {
  getState: GetState<U>;
  setState: SetState<U>;
  getData: GetData<T>;
  setData: SetData<T>;
  reset: Reset;
}

export interface IFilteredDataSource<T, U extends DataSourceState<T>, V, W extends unknown[] = []> extends IDataSource<T, U>, IDataFilter<V, W> {}
