import { IPageCursor, PagerState } from "data/dataManagment/DataManagmentTypes";
import { createState, GetState, IState, SetState } from "states/state";

type OffsetPagerState = PagerState & { step: number; take: number };
type OffsetPagerAdvanceInfo = { skip: number; take: number; merge: boolean };
type OffsetPagerSettings = Pick<OffsetPagerState, "take">;

class OffsetPager implements IPageCursor<OffsetPagerState, OffsetPagerAdvanceInfo> {
  static finished = (lastBatchCount: number, take: number) => lastBatchCount === 0 || lastBatchCount % take !== 0;

  constructor(settings: OffsetPagerSettings) {
    this.state = createState({ initState: () => ({ step: 0, take: settings.take }) });
    this.getState = this.state.getState;
    this.setState = this.state.setState;
    this.reset = this.state.reset;
  }

  private state: IState<OffsetPagerState>;

  public getState: GetState<OffsetPagerState>;
  public setState: SetState<OffsetPagerState>;
  public reset: () => void;

  public advance = ({ steps = 1 } = {}) => {
    const state = this.state.getState();
    const skip = state.take * state.step;
    const step = state.step + steps;

    return {
      skip,
      take: state.take * steps,
      merge: skip > 0,
      close: (successfull: boolean) => {
        if (successfull) {
          this.setState({ step });
        }
      },
    };
  };
}

export default OffsetPager;
