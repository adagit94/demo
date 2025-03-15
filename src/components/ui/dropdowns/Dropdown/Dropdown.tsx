import { memo, useCallback, useEffect, useRef } from "react";
import { Trigger, useDropdownStore } from "stores/dropdownStore";
import { getOnOutsideClick, verifyAvailableSpace } from "utils/domUtils";
import "./Dropdown.scss";

function Dropdown() {
  const { id, owner, trigger, children, left, top, width, height, buttonType, hide, clickable } = useDropdownStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onOutsideClick = useCallback(
    getOnOutsideClick([() => getTriggerEl(trigger), () => dropdownRef.current], () => hide(id)),
    [trigger, dropdownRef, id],
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
    const onClick = (e: MouseEvent) => onOutsideClick(e);
    const onScroll = (e: Event) => {
      if (e.target !== dropdownRef.current) hide(id);
    };

    if (id) {
      document.addEventListener("click", onClick);
      document.addEventListener("scroll", onScroll, true);
    }

    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("scroll", onScroll);
    };
  }, [id, hide, onOutsideClick]);

  if (children) {
    return (
      <div ref={dropdownRef} className={`dropdown ${buttonType}Button`} style={{ left, top, width, height }}>
        {children}
      </div>
    );
  }

  return null;
}

export const getTriggerEl = (trigger: Trigger) => (typeof trigger === "function" ? trigger() : trigger);

export default memo(Dropdown)
