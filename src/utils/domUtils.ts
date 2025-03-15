type GetElement<T extends HTMLElement = HTMLElement> = () => T | undefined;

export const getOnOutsideClick = <T extends HTMLElement = HTMLElement>(getters: GetElement<T> | GetElement<T>[], f: (e: MouseEvent) => void) => (e: MouseEvent) => {
  if (!verifyOverlap(getters, { x: e.clientX, y: e.clientY })) {
    f(e);
  }
};

export const verifyOverlap = <T extends HTMLElement = HTMLElement>(
  getters: GetElement<T> | GetElement<T>[],
  coords: { x: number; y: number },
) => {
  return (Array.isArray(getters) ? getters : [getters]).some((getEl) => {
    const elRect = getEl()?.getBoundingClientRect();

    return (
      elRect &&
      coords.x >= elRect.left &&
      coords.x <= elRect.right &&
      coords.y >= elRect.top &&
      coords.y <= elRect.bottom
    );
  });
};

/**
 * @description Function computes coordinates and dimensions in available space for both axes in case overflow should follow. Only modified values are returned.
 * @param getters reference getters for elements relative to which content is positioned; content - rectangle being shown; container - rectangle that enclose available space; reference - element that serves as reference for displayed content (some trigger for example)
 * @returns coordinates and dimensions that were changed - top, left, width, height
 */
export const verifyAvailableSpace = (getters: { content: GetElement; container?: GetElement; reference?: GetElement }) => {
  const referenceRect = getters.reference?.()?.getBoundingClientRect();
  const containerRect = (getters.container?.() ?? document.documentElement).getBoundingClientRect();
  const contentRect = getters.content()?.getBoundingClientRect();

  let top, left;
  let width, height;

  if (contentRect && contentRect.right > containerRect.right) {
    left = Math.max((referenceRect?.left ?? containerRect.right) - (contentRect.right - containerRect.right), 0);
  }

  if (contentRect && contentRect.bottom > containerRect.bottom) {
    const upperSpace = Math.max((referenceRect?.top ?? contentRect.top) - containerRect.top, 0);
    const bottomSpace = referenceRect ? Math.max(containerRect.bottom - referenceRect.bottom, 0) : 0;

    if (upperSpace > bottomSpace) {
      height = Math.min(contentRect.height, upperSpace);
      top = (referenceRect?.top ?? containerRect.bottom) - height;
    } else {
      height = bottomSpace;
    }
  }

  return { top, left, width, height };
};
