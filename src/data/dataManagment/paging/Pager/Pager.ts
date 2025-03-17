import { IPageCursor, Reset } from "data/dataManagment/CommonDataManagmentTypes";

type AdvanceInfo = { skip: number; take: number; merge: boolean };
type PagerState = { step: number; skip: number; take: number };
type PagerSettings = Partial<Pick<PagerState, "take">>;

class Pager implements IPageCursor<AdvanceInfo> {
  constructor(settings: PagerSettings = {}) {
    this.settings = settings;
    this.state = this.initState();
  }

  private settings: PagerSettings;
  private state: PagerState;
  private prevState: PagerState | undefined;

  private initState = () => ({ step: 0, skip: 0, take: this.settings.take ?? 0 });

  public advance = ({ steps = 1 } = {}) => {
    this.prevState = this.state;
    this.state = {
      ...this.state,
      skip: this.state.take * this.state.step,
      step: this.state.step + steps,
    };

    return { skip: this.state.skip, take: this.state.take * steps, merge: this.state.skip > 0 };
  };

  public rollback = () => {
    this.state = this.prevState ?? this.state;
    this.prevState = undefined;
  };

  public reset: Reset = () => {
    this.prevState = undefined;
    this.state = this.initState();
  };

  public paged = () => this.state.take > 0

  // public getState = () => ({ step: this.step, skip: this.skip, take: this.take });
}

export default Pager;
