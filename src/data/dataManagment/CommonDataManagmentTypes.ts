export type Advance<
  Data,
  Action extends () => unknown,
  Optionals extends Record<string, unknown> = Record<string, never>,
> = (action: Action, optionals?: Optionals) => Data | Promise<Data>;

export type Reset = () => void;

export type GetData<T> = () => T;

export type SetData<T> = (data: T) => T;

type Exhausted<State extends Record<string, unknown>> = (state: State) => boolean;

export interface IPageCursor<
  Data,
  AdvanceAction extends () => unknown,
  AdvanceOptionals extends Record<string, unknown> = Record<string, never>,
> {
  advance: Advance<Data, AdvanceAction, AdvanceOptionals>;
}

export interface IDataSource<Data, State extends Record<string, unknown>> {
  getData: GetData<Data>;
//   setData: SetData<Data>;
  exhausted: Exhausted<State>;
}
