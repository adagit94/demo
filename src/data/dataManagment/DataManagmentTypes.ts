import { ImmutableGetter, VariadicFunction } from "types/CommonTypes";

type GetState<T extends Record<string, unknown>> = () => T;

type Advance<T extends Record<string, unknown>, U extends unknown[] = []> = VariadicFunction<T, U>;

type Rollback = () => void;

type Reset = () => void;

type GetData<T> = ImmutableGetter<T>;

type SetData<T> = () => T;

export type LoadData<T, U extends unknown[] = []> = VariadicFunction<T | Promise<T>, U>;

export type DataSourceState<T> = { data: Readonly<T>; sufficientAmount: boolean; exhausted: boolean };

export interface IPageCursor<State extends Record<string, unknown>, AdvanceInfo extends Record<string, unknown>> {
  getState: GetState<State>;
  advance: Advance<AdvanceInfo>;
  rollback: Rollback;
  reset: Reset;
}

export interface IDataLoader<T> {
  load: LoadData<T>;
}

export interface IDataSource<Data, State extends DataSourceState<Data>> extends IDataLoader<State> {
  getState: GetState<State>;
  getData: GetData<Data>;
  setData: SetData<Data>;
  reset: Reset;
}
