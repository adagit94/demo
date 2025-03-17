type GetState<State extends Record<string, unknown>> = () => State;

type Advance<Info extends Record<string, unknown>, Args extends unknown[] = []> = (...args: Args) => Info;

type Rollback = () => void;

type Reset = () => void;

type GetData<T> = () => Readonly<T>;

export type DataSourceState = { sufficientAmount: boolean; exhausted: boolean };

export interface IPageCursor<State extends Record<string, unknown>, AdvanceInfo extends Record<string, unknown>> {
  getState: GetState<State>;
  advance: Advance<AdvanceInfo>;
  rollback: Rollback;
  reset: Reset;
}

export interface IDataSource<Data, State extends DataSourceState = DataSourceState> {
  getState: GetState<State>;
  getData: GetData<Data>;
}
