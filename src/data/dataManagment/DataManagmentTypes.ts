import { ImmutableGetter, VariadicFunction } from "types/CommonTypes";

type GetState<T extends Record<string, unknown>> = () => T;

type Advance<T extends Record<string, unknown>, U extends unknown[] = []> = VariadicFunction<T, U>;

type Rollback = () => void;

type Reset = () => void;

type GetData<T> = ImmutableGetter<T>;

export type LoadData<T, U extends DataSourceState<T>, V extends unknown[] = []> = VariadicFunction<U | Promise<U>, V>;

export type DataSourceState<T> = { data: Readonly<T>; sufficientAmount: boolean; exhausted: boolean };

export interface IPageCursor<State extends Record<string, unknown>, AdvanceInfo extends Record<string, unknown>> {
  getState: GetState<State>;
  advance: Advance<AdvanceInfo>;
  rollback: Rollback;
  reset: Reset;
}

export interface IDataSource<
  Data,
  State extends DataSourceState<Data>,
  Load extends LoadData<Data, State>,
> {
  getState: GetState<State>;
  getData: GetData<Data>;
  load: Load;
  reset: Reset;
}
