import { IPageCursor } from "data/dataManagment/DataManagmentTypes";

type Cursor = Partial<{ prevPage: string; nextPage: string }>
type AdvanceInfo = { currentPage: string; nextPage: string };
type PagerState = { lastCursor: Cursor; take: number };
type PagerSettings = Partial<Pick<PagerState, "take">>;

class CursorPager implements IPageCursor {

}

// close: (state?: Partial<OffsetPagerState>) => {
        
// },