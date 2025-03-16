type AdvanceAction<T extends Record<string, unknown>> = (settings: T) => void | Promise<void>;

type AdvanceOptionals<T extends Record<string, unknown> = Record<string, never>> = Partial<T>;

// todo: Maybe make possible to return data immediately for more straighforward use cases.
export type Advance<T extends Record<string, unknown>, U extends Record<string, unknown> = Record<string, never>> = (
  action: AdvanceAction<T>,
  optionals?: AdvanceOptionals<U>,
) => void | Promise<void>;

export type Reset = () => void;

export type GetData<T> = () => T[];

export type SetData<T> = (data: T[]) => T[];

export interface ICursor<T extends Record<string, unknown>, U extends Record<string, unknown> = Record<string, never>> {
  advance: Advance<T, U>;
}
