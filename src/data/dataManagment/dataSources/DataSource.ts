import { DataSourceState, IDataSource, LoadData } from "data/dataManagment/DataManagmentTypes";

class DataSource<Data, State extends DataSourceState<Data>, Load extends LoadData<Data, State>>
  implements IDataSource<Data, State, Load> {}
