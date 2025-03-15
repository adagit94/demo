import { useCallback, useEffect, useRef } from "react";
import { Trigger, useDropdownStore } from "stores/dropdownStore";
import { getOnOutsideClick, verifyAvailableSpace, verifyOverlap } from "utils/domUtils";
import "./Dropdown.scss";

export const Dropdown = () => {
  const { id, owner, trigger, children, left, top, width, height, buttonType, hide, clickable } = useDropdownStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const onOutsideClick = useCallback(getOnOutsideClick(), [])
  const onOutsideClick = useCallback(
    (e: MouseEvent) => {
      if (!id) return;

      const triggerOverlap = verifyOverlap({x: e.clientX, y: e.clientY}, () => getTriggerEl(trigger));

      if (
        triggerRect &&
        e.clientX >= triggerRect.left &&
        e.clientX <= triggerRect.right &&
        e.clientY >= triggerRect.top &&
        e.clientY <= triggerRect.bottom
      ) {
        return;
      }

      const dropdownRect = dropdownRef.current?.getBoundingClientRect();

      if (dropdownRect) {
        if (
          e.clientX >= dropdownRect.left &&
          e.clientX <= dropdownRect.right &&
          e.clientY >= dropdownRect.top &&
          e.clientY <= dropdownRect.bottom
        ) {
          return;
        }
      }

      hide(id);
    },
    [hide, id, trigger, clickable],
  );

  useEffect(() => {
    if (!children || !dropdownRef.current) return;

    const {
      top: newTop,
      left: newLeft,
      width: newWidth,
      height: newHeight,
    } = verifyAvailableSpace({
      reference: getTriggerEl(trigger) ?? undefined,
      container: owner,
      content: dropdownRef.current,
    });

    useDropdownStore.setState((s) => {
      return {
        top: newTop !== undefined ? newTop : s.top,
        left: newLeft !== undefined ? newLeft : s.left,
        width: newWidth !== undefined ? newWidth : s.width,
        height: newHeight !== undefined ? newHeight : s.height,
      };
    });
  }, [children, owner, trigger]);

  useEffect(() => {
    const onScroll = (e: Event) => {
      e.target !== dropdownRef.current && hide();
    };

    document.addEventListener("click", onOutsideClick);
    document.addEventListener("scroll", onScroll, true);

    return () => {
      document.removeEventListener("click", onOutsideClick);
      document.removeEventListener("scroll", onScroll);
    };
  }, [hide, onOutsideClick]);

  if (children) {
    return (
      <div ref={dropdownRef} className={`dropdown ${buttonType}Button`} style={{ left, top, width, height }}>
        {children}
      </div>
    );
  }

  return null;
};

export const getTriggerEl = (trigger: Trigger) => (typeof trigger === "function" ? trigger() : trigger);
