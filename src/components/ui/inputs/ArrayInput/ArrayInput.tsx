import { LegacyRef, memo, useCallback, useEffect, useMemo, useRef } from "react";
import { InputPropsBase } from "components/ui/inputs/InputTypes";

type ArrayInputPropsBase<T, U> = InputPropsBase<T> & {
    items: U[];
    // autosort?: boolean;
}

export type ArrayInputProps<T, U> = ArrayInputPropsBase<T, U> & {
  renderItem: (item: U) => React.ReactNode;
  renderSelectedItem: (value: T, index?: number) => React.ReactNode;
  searchKey?: keyof U & string;
  multiselection?: boolean;
};

function ArrayInput<T, U>(props: ArrayInputProps<T, U>) {
  const {
    dropdownInputRef,
    dropdownRef,
    isDropdownVisible,
    toggleDropdown,
    hideDropdown,
    top: dropdownTop,
    height: dropdownHeight,
  } = usePanelDropdown();

  const { searchResults, searchValue, setSearchValue } = useSearch({
    items,
    searchKeyOrFunc: searchKey,
    autosort,
  });

  const searchInputRef = useRef<HTMLInputElement>();

  const getSelectedValues = useCallback(
    (value: T | undefined, defaultValue: T | undefined) => {
      const v = value ?? defaultValue;

      if (v === undefined) return;

      if (multiselection) {
        return (
          <div className="array-edit__selection array-edit__selection--multi">
            {Array.isArray(v) &&
              v.map((_v, i) => {
                const content = renderSelectedItem(v, i);

                return (
                  content && (
                    <div key={i} className="array-edit__selection-item--multi">
                      {mode === Mode.Edit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();

                            deleteSelectedItemFromList(i);
                          }}
                          className="edit-clear-btn"
                        />
                      )}

                      {content}
                    </div>
                  )
                );
              })}
          </div>
        );
      } else {
        return <div className="array-edit__selection">{renderSelectedItem(v)}</div>;
      }
    },
    [multiselection, renderSelectedItem, deleteSelectedItemFromList, mode],
  );

  const renderValueEdit = useCallback(
    (value: T | undefined, defaultValue: T | undefined) => {
      return (
        <>
          <div
            className={`array-edit__selection`}
            onClick={!commonProps.valueL || mode === Mode.Edit ? toggleDropdown : undefined}
          >
            {getSelectedValues(value, defaultValue)}

            {(!commonProps.valueL || mode === Mode.Edit) && isDropdownVisible && (
              <i className="dx-icon dx-icon-simple-arrow-up-abra txt3 abra-icon" />
            )}

            {(!commonProps.valueL || mode === Mode.Edit) && !isDropdownVisible && (
              <i className="dx-icon dx-icon-simple-arrow-down-abra txt1 abra-icon" />
            )}
          </div>

          {isDropdownVisible && (
            <div
              className="array-edit__list"
              style={{
                top: dropdownTop ?? dropdownInputRef.current?.offsetHeight ?? 0,
                height: dropdownHeight,
              }}
              ref={dropdownRef as LegacyRef<HTMLDivElement> | undefined}
            >
              <div>
                <input
                  ref={searchInputRef as LegacyRef<HTMLInputElement>}
                  type={"text"}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />

                {searchResults?.map((item, i) => {
                  return (
                    <div key={i} className="array-edit__item" onClick={hideDropdown}>
                      {renderItem(item)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      );
    },
    [
      getSelectedValues,
      isDropdownVisible,
      dropdownRef,
      dropdownInputRef,
      searchResults,
      searchValue,
      setSearchValue,
      renderItem,
      hideDropdown,
      toggleDropdown,
      commonProps.valueL,
      dropdownTop,
      dropdownHeight,
      mode,
    ],
  );

  useEffect(() => {
    if (isDropdownVisible) {
      searchInputRef.current?.focus();
    } else {
      setSearchValue("");
    }
  }, [isDropdownVisible, setSearchValue]);

  return (
    <div className="array-input" ref={dropdownInputRef as LegacyRef<HTMLDivElement> | undefined}>
      <InputTemplate<T> {...commonProps} renderValueEdit={renderValueEdit} />
    </div>
  );
};

export default memo(ArrayInput) as typeof ArrayInput;

type ObjectArrayInputProps<T, U> = ArrayInputPropsBase<T, U> & {
  displayKey: keyof U & string;
  valueKey: keyof U & string;
  searchKey?: keyof U & string;
};

export const ObjectArrayInput = <T, U extends Record<string, any>>(props: ObjectArrayInputProps<T, U>) => {
  const exprVal = useRootStore((s) => props.valueL && R.view(props.valueL, s));

  const renderItem = (item: U) => {
    const displayValue = item[props.displayKey];

    return (
      <div
        onClick={() => {
          props.valueL && changeVal<T>(props.valueL, item[props.valueKey]);
          props.onChange?.(item[props.valueKey]);
        }}
      >
        {displayValue}
      </div>
    );
  };

  const renderSelectedItem = (value: T) => {
    return props.items.find((item) => item[props.valueKey] === value)?.[props.displayKey] ?? "";
  };

  const valueMaps: ValueMaps | undefined = useMemo(
    () =>
      props.valueL &&
      props.items.map((item) => ({
        value: item[props.valueKey],
        display: item[props.displayKey],
      })),
    [props.valueL, props.valueKey, props.displayKey, props.items],
  );

  useEffect(() => {
    const v = props.valueL ? exprVal?.val : props.value;

    if (v === undefined) return;

    const includedInOptions = props.items.some((item) => item[props.valueKey] === v);

    if (includedInOptions) return;

    props.valueL && useRootStore.setState(R.set(R.compose(props.valueL, R.lensProp("val")), undefined));
    props.onChange?.(undefined);
    // list only specific values from an object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value, props.valueL, props.valueKey, props.items, props.onChange, exprVal?.val]);

  return (
    <ArrayInput<T, U>
      {...props}
      searchKey={props.searchKey ?? props.displayKey}
      valueMaps={valueMaps}
      renderItem={renderItem}
      renderSelectedItem={renderSelectedItem}
    />
  );
};

type PrimitiveArrayInputProps<T> = ArrayInputPropsBase<T, T>

export const PrimitiveArrayInput = <T extends PrimitiveValue | undefined>(props: PrimitiveArrayInputProps<T>) => {
  const exprVal = useRootStore((s) => props.valueL && R.view(props.valueL, s));

  const renderItem = (item: T) => {
    return (
      <div
        onClick={() => {
          props.valueL && changeVal(props.valueL, item);
          props.onChange?.(item);
        }}
      >
        {item}
      </div>
    );
  };

  const renderSelectedItem = (item: T | undefined) => item ?? "";

  useEffect(() => {
    const v = props.valueL ? exprVal?.val : props.value;

    if (v === undefined) return;

    const includedInOptions = props.items.includes(v);

    if (includedInOptions) return;

    props.valueL && useRootStore.setState(R.set(R.compose(props.valueL, R.lensProp("val")), undefined));
    props.onChange?.(undefined);
    // list only specific values from an object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exprVal?.val, props.valueL, props.items, props.onChange, props.value]);

  return <ArrayInput<T, T> {...props} renderItem={renderItem} renderSelectedItem={renderSelectedItem} />;
};
