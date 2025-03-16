export type Advance<Loader extends Function, Optionals extends Record<string, unknown> = Record<string, never>> = (
  loader: Loader,
  optionals?: Partial<Optionals>,
) => void | Promise<void>;

export type Reset = () => void;

export type GetData<T> = () => T;

export type SetData<T> = (data: T) => T;

export type Exhausted = () => boolean;

export interface IPageCursor<
  AdvanceLoader extends Function,
  AdvanceOptionals extends Record<string, unknown> = Record<string, never>,
> {
  advance: Advance<AdvanceLoader, AdvanceOptionals>;
}

export interface IDataSource<Data> {
  getData: GetData<Data>;
  reset: Reset;
  exhausted: Exhausted;
  //   setData: SetData<Data>;
}
