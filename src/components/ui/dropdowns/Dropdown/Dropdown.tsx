import { useCallback, useEffect, useRef } from "react"

import "styles/global.scss"
import "styles/ui/_buttons.scss"
import "./Dropdown.scss"
import { Trigger, useDropdownStore } from "stores/dropdownStore"
import { verifyAvailableSpace } from "utils/domUtils/domUtils"

export const Dropdown = () => {
    const { id, owner, trigger, children, left, top, width, height, buttonType, hide, clickable } =
        useDropdownStore()
    const myRef = useRef<HTMLDivElement>(null)

    const onOutsideClick = useCallback(
        (ev: MouseEvent) => {
            if (!id) return

            const triggerRect = getTriggerEl(trigger)?.getBoundingClientRect()

            if (triggerRect) {
                if (
                    triggerRect.left === 0 &&
                    triggerRect.right === 0 &&
                    triggerRect.top === 0 &&
                    triggerRect.bottom === 0
                ) {
                    return
                }

                if (
                    ev.clientX >= triggerRect.left &&
                    ev.clientX <= triggerRect.right &&
                    ev.clientY >= triggerRect.top &&
                    ev.clientY <= triggerRect.bottom
                ) {
                    return
                }
            }

            if (!clickable) {
                const dropdownRect = myRef.current?.getBoundingClientRect()

                if (dropdownRect) {
                    if (
                        dropdownRect.left === 0 &&
                        dropdownRect.right === 0 &&
                        dropdownRect.top === 0 &&
                        dropdownRect.bottom === 0
                    ) {
                        return
                    }

                    if (
                        ev.clientX >= dropdownRect.left &&
                        ev.clientX <= dropdownRect.right &&
                        ev.clientY >= dropdownRect.top &&
                        ev.clientY <= dropdownRect.bottom
                    ) {
                        return
                    }
                }
            }

            hide(id)
        },
        [hide, id, trigger, clickable]
    )

    useEffect(() => {
        if (!children || !myRef.current) return

        const {
            top: newTop,
            left: newLeft,
            width: newWidth,
            height: newHeight,
        } = verifyAvailableSpace({
            reference: getTriggerEl(trigger) ?? undefined,
            container: owner,
            content: myRef.current,
        })

        useDropdownStore.setState((s) => {
            return {
                top: newTop !== undefined ? newTop : s.top,
                left: newLeft !== undefined ? newLeft : s.left,
                width: newWidth !== undefined ? newWidth : s.width,
                height: newHeight !== undefined ? newHeight : s.height,
            }
        })
    }, [children, owner, trigger])

    useEffect(() => {
        const onScroll = (e: Event) => {
            e.target !== myRef.current && hide()
        }

        document.addEventListener("click", onOutsideClick)
        document.addEventListener("scroll", onScroll, true)

        return () => {
            document.removeEventListener("click", onOutsideClick)
            document.removeEventListener("scroll", onScroll)
        }
    }, [hide, onOutsideClick])

    if (children) {
        return (
            <div
                ref={myRef}
                className={`dropdown ${buttonType}Button`}
                style={{ left, top, width, height }}
            >
                {children}
            </div>
        )
    }

    return null
}

export const getTriggerEl = (trigger: Trigger) =>
    typeof trigger === "function" ? trigger() : trigger
