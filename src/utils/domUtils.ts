export const getOnOutsideClick =
    <T extends (e?: MouseEvent) => void>(
        elRef: React.MutableRefObject<HTMLDivElement | undefined>,
        func: T,
        outterElements?: Element | null | undefined | (Element | null | undefined)[]
    ) =>
    (e: MouseEvent) => {
        const boundingRect = elRef?.current?.getBoundingClientRect()

        if (boundingRect) {
            if (
                boundingRect.left === 0 &&
                boundingRect.right === 0 &&
                boundingRect.top === 0 &&
                boundingRect.bottom === 0
            ) {
                return
            }
        }

        if (
            !verifyOverlap({ x: e.clientX, y: e.clientY }, elRef.current) ||
            verifyOverlap({ x: e.clientX, y: e.clientY }, outterElements)
        ) {
            func(e)
        }
    }

export const verifyOverlap = (
    coords: { x: number; y: number },
    els: Element | null | undefined | (Element | null | undefined)[]
) => {
    return (Array.isArray(els) ? els : [els]).some((el) => {
        const elRect = el?.getBoundingClientRect()

        return (
            elRect &&
            coords.x >= elRect.left &&
            coords.x <= elRect.right &&
            coords.y >= elRect.top &&
            coords.y <= elRect.bottom
        )
    })
}

/**
 * @description Function computes coordinates and dimensions in available space for both axes in case overflow should follow. Only modified values are returned.
 * @param elements reference - element relative to which content is positioned; content - rectangle being shown; container - rectangle that enclose available space
 * @returns coordinates and dimensions that were changed - top, left, width, height
 */
export const verifyAvailableSpace = (elements: {
    content: Element
    container?: Element
    reference?: Element
}) => {
    const referenceRect = elements.reference?.getBoundingClientRect()
    const contentRect = elements.content.getBoundingClientRect()
    const containerRect = (elements.container ?? document.documentElement).getBoundingClientRect()

    let top, left
    let width, height

    if (contentRect.right > containerRect.right) {
        left = Math.max(
            (referenceRect?.left ?? containerRect.right) -
                (contentRect.right - containerRect.right),
            0
        )
    }

    if (contentRect.bottom > containerRect.bottom) {
        const upperSpace = Math.max((referenceRect?.top ?? contentRect.top) - containerRect.top, 0)
        const bottomSpace = referenceRect
            ? Math.max(containerRect.bottom - referenceRect.bottom, 0)
            : 0

        if (upperSpace > bottomSpace) {
            height = Math.min(contentRect.height, upperSpace)
            top = (referenceRect?.top ?? containerRect.bottom) - height
        } else {
            height = bottomSpace
        }
    }

    return { top, left, width, height }
}