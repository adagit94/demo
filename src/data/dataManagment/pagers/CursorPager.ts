import { IPageCursor, PagerState } from "data/dataManagment/DataManagmentTypes";
import { createState, GetState, IState, SetState } from "states/state";

type Cursor = { take: number } & Partial<{ prevPage: string; nextPage: string }>;
type CursorPagerAdvanceInfo = Cursor;
type CursorPagerState = PagerState & Cursor;
type CursorPagerSettings = Pick<CursorPagerState, "take">;

class CursorPager implements IPageCursor<CursorPagerState, CursorPagerAdvanceInfo> {
  constructor(settings: CursorPagerSettings) {
    this.state = createState({ initState: () => ({ take: settings.take }) });
    this.getState = this.state.getState;
    this.setState = this.state.setState;
    this.reset = this.state.reset;
  }

  private state: IState<CursorPagerState>;

  public getState: GetState<CursorPagerState>;
  public setState: SetState<CursorPagerState>;
  public reset: () => void;

  public advance = () => {
    const state = this.state.getState();
    const skip = state.take * state.step;
    const step = state.step + steps;

    return {
      prevPage: state.prevPage,
      nextPage: state.nextPage,
      take: state.take,
      close: (successfull: boolean) => {
        if (successfull) {
          this.setState({ step });
        }
      },
    };
  };
}

export default CursorPager;
