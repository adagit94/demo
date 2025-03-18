import { DataSourceState, IDataSource, LoadData } from "data/dataManagment/DataManagmentTypes";

class DataSource<Data, State extends DataSourceState<Data>, Load extends LoadData<Data, State>>
  implements IDataSource<Data, State, Load>
{
  constructor({ initState, loadData }: { initState: () => State; loadData: Load }) {
    this.state = initState();
    this.initState = initState;
    this.loadData = loadData
  }

  private state: State;
  private initState: () => State;
  private loadData: Load;

  public getState = () => ({ ...this.state });
  public getData = () => this.state.data;

  public reset = () => {
    this.state = this.initState();
  };

  public load: Load = async (...args) => {
    this.state = await this.loadData(...args)
    
    return this.state;
  };
}
