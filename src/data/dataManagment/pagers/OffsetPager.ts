import { IPageCursor, PagerState, SetState } from "data/dataManagment/DataManagmentTypes";

type OffsetPagerState = PagerState & { step: number; take: number };
type OffsetPagerAdvanceInfo = { skip: number; take: number; merge: boolean };
type InitOffsetPagerState = () => OffsetPagerState;
type OffsetPagerSettings = Pick<OffsetPagerState, "take">;

class OffsetPager implements IPageCursor<OffsetPagerState, OffsetPagerAdvanceInfo> {
  static exahausted = (lastBatchCount: number, take: number) => lastBatchCount === 0 || lastBatchCount % take !== 0
  
  constructor(settings: OffsetPagerSettings, initState?: InitOffsetPagerState) {
    this.settings = settings;
    this.initState = initState ?? (() => ({ step: 0, take: this.settings.take }));
    this.state = this.initState();
  }

  private settings: OffsetPagerSettings;
  private state: OffsetPagerState;
  private initState: InitOffsetPagerState;

  public getState = () => ({ ...this.state });

  public setState: SetState<OffsetPagerState> = (newState) =>
    (this.state = { ...this.state, ...(typeof newState === "function" ? newState(this.state) : newState) });

  public advance = ({ steps = 1 } = {}) => {
    const skip = this.state.take * this.state.step;
    const step = this.state.step + steps;

    return {
      skip,
      take: this.state.take * steps,
      merge: skip > 0,
      close: (successfull: boolean) => {
        if (successfull) {
          this.setState({ step });
        }
      },
    };
  };

  public reset = () => {
    this.state = this.initState();
  };
}

export default OffsetPager;
