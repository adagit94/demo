export type Advance<Loader extends Function, Optionals extends Record<string, unknown> = Record<string, never>> = (
  loader: Loader,
  optionals?: Partial<Optionals>,
) => void | Promise<void>;

export type Reset = () => void;

export type GetData<T> = () => T;

export type SetData<T> = (data: T) => T;

type Exhausted<State extends Record<string, unknown>> = (state: State) => boolean;

export interface IPageCursor<
  AdvanceLoader extends Function,
  AdvanceOptionals extends Record<string, unknown> = Record<string, never>,
> {
  advance: Advance<AdvanceLoader, AdvanceOptionals>;
}

export interface IDataSource<Data, State extends Record<string, unknown>> {
  getData: GetData<Data>;
  //   setData: SetData<Data>;
  exhausted: Exhausted<State>;
}
