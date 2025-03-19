import { DataSourceState, GetData, IDataSource, SetData, SetState } from "data/dataManagment/DataManagmentTypes";

type CreateDataSourceParams<T, U extends DataSourceState<T>> = {
  initState: () => U;
};

export const createDataSource = <T, U extends DataSourceState<T>>({
  initState,
}: CreateDataSourceParams<T, U>): IDataSource<T, U> => {
  let state: U = initState();

  const setState: SetState<U> = (newState) => {
    if (typeof newState === "function") {
      state = { ...state, ...newState(state) };
    } else {
      state = { ...state, ...newState };
    }

    return state;
  };

  const getData: GetData<T> = () => state.data;
  const setData: SetData<T> = (data) => {
    let s: Partial<U> = { data }
    
    setState(s);
  };
};
