export type InitState<T extends Record<string, unknown>> = () => T

export type GetState<T extends Record<string, unknown>> = () => T;

export type SetState<T extends Record<string, unknown>> = (update: Partial<T> | ((state: T) => Partial<T>)) => T;

type Reset = () => void

type CreateStateParams<T extends Record<string, unknown>> = {
  initState: InitState<T>;
};

export interface IState<T extends Record<string, unknown>> {
  getState: GetState<T>;
  setState: SetState<T>;
  reset: Reset
}

export const createState = <T extends Record<string, unknown>>({ initState }: CreateStateParams<T>): IState<T> => {
  let state: T = initState();

  const getState: GetState<T> = () => ({ ...state });

  const setState: SetState<T> = (update) => {
    if (typeof update === "function") {
      state = { ...state, ...update(state) };
    } else {
      state = { ...state, ...update };
    }

    return state;
  };

  const reset = () => {
    state = initState();
  };

  return {
    getState,
    setState,
    reset,
  };
};
