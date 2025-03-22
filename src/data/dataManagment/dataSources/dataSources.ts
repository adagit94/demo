import {
  GetData,
  IDataFilter,
  SetData,
} from "data/dataManagment/DataManagmentTypes";
import { createState, InitState, IState } from "states/state";

export type DataSourceState<T> = { data: Readonly<T>; exhausted: boolean };

type CreateDataSourceParams<T, U extends DataSourceState<T>> = {
  initState: InitState<U>;
};

export interface IDataSource<T, U extends DataSourceState<T> = DataSourceState<T>> extends IState<U> {
  getData: GetData<T>;
  setData: SetData<T>;
  reset: () => void;
}

export const createDataSource = <T, U extends DataSourceState<T> = DataSourceState<T>>({
  initState,
}: CreateDataSourceParams<T, U>): IDataSource<T, U> => {
  let state = createState({ initState });

  const getData: GetData<T> = () => state.getState().data;

  const setData: SetData<T> = (data) => {
    state.setState((s) => ({ ...s, data }));
  };

  return {
    ...state,
    getData,
    setData,
  };
};

export interface IFilteredDataSource<T, U extends DataSourceState<T>, V, W extends unknown[] = []>
  extends IDataSource<T, U>,
    IDataFilter<V, W> {}
