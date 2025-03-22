import { IState } from "states/state";
import { ImmutableGetter, Variadic } from "types/CommonTypes";

type Advance<T extends Record<string, unknown>, U extends unknown[] = []> = Variadic<
  T & {
    close: (successfull: boolean) => void;
  },
  U
>;

export type Reset = () => void;

export type GetData<T> = ImmutableGetter<T>;

export type SetData<T> = (data: T) => void;

export type LoadData<T, U extends unknown[] = []> = Variadic<T | Promise<T>, U>;

export type FilterData<T, U extends unknown[] = []> = Variadic<T | Promise<T>, U>;

export type PagerState = { totalCount?: number };

export interface IPageCursor<T extends PagerState, U extends Record<string, unknown>> extends IState<T> {
  advance: Advance<U>;
  reset: Reset;
}

export interface IDataLoader<T, U extends unknown[] = []> {
  load: LoadData<T, U>;
}

export interface IDataFilter<T, U extends unknown[] = []> {
  filter: FilterData<T, U>;
}
