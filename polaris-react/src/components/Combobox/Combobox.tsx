import React, {useState, useCallback, useMemo, Children, useRef} from 'react';

import {Popover, PopoverPublicAPI} from '../Popover';
import type {PopoverProps} from '../Popover';
import type {TextFieldProps} from '../TextField';
import type {ListboxProps} from '../Listbox';
import {
  ComboboxTextFieldContext,
  ComboboxTextFieldType,
  ComboboxListboxContext,
  ComboboxListboxType,
  ComboboxListboxOptionType,
  ComboboxListboxOptionContext,
} from '../../utilities/combobox';

import styles from './Combobox.scss';
import {TextField} from './components';

export interface ComboboxProps {
  /** The text field component to activate the Popover */
  activator: React.ReactElement<TextFieldProps>;
  /** Allows more than one option to be selected */
  allowMultiple?: boolean;
  /** The content to display inside the popover */
  children?: React.ReactElement<ListboxProps> | null;
  /** The preferred direction to open the popover */
  preferredPosition?: PopoverProps['preferredPosition'];
  /** Callback fired when the bottom of the popover content is reached */
  onScrolledToBottom?(): void;
}

export function Combobox({
  activator,
  allowMultiple,
  children,
  preferredPosition = 'below',
  onScrolledToBottom,
}: ComboboxProps) {
  const [popoverActive, setPopoverActive] = useState(false);
  const [activeOptionId, setActiveOptionId] = useState<string>();
  const [textFieldLabelId, setTextFieldLabelId] = useState<string>();
  const [listboxId, setListboxId] = useState<string>();
  const [textFieldFocused, setTextFieldFocused] = useState<boolean>(false);
  const [disableCloseOnSelect, setDisableCloseOnSelect] = useState(false);
  const shouldOpen = Boolean(!popoverActive && Children.count(children) > 0);
  const ref = useRef<PopoverPublicAPI | null>(null);

  const handleClose = useCallback(() => {
    // only deactive popover if not creating a new option
    if (!disableCloseOnSelect) {
      setPopoverActive(false);
    }

    setActiveOptionId(undefined);
  }, [disableCloseOnSelect]);

  const handleOpen = useCallback(() => {
    setPopoverActive(true);
    setActiveOptionId(undefined);
  }, []);

  const onOptionSelected = useCallback(() => {
    if (!allowMultiple) {
      handleClose();
      return;
    } else {
      setDisableCloseOnSelect(true);
      setActiveOptionId(undefined);
    }

    ref.current?.forceUpdatePosition();
  }, [allowMultiple, handleClose, setDisableCloseOnSelect]);

  const handleFocus = useCallback(() => {
    if (shouldOpen) {
      handleOpen();
    }
  }, [shouldOpen, handleOpen]);

  const handleChange = useCallback(() => {
    if (shouldOpen) {
      handleOpen();
    }
  }, [shouldOpen, handleOpen]);

  const handleBlur = useCallback(() => {
    setDisableCloseOnSelect(false);
    if (popoverActive) {
      handleClose();
    }
  }, [popoverActive, handleClose, setDisableCloseOnSelect]);

  const textFieldContextValue: ComboboxTextFieldType = useMemo(
    () => ({
      activeOptionId,
      expanded: popoverActive,
      listboxId,
      setTextFieldFocused,
      setTextFieldLabelId,
      onTextFieldFocus: handleFocus,
      onTextFieldChange: handleChange,
      onTextFieldBlur: handleBlur,
    }),
    [
      activeOptionId,
      popoverActive,
      listboxId,
      setTextFieldFocused,
      setTextFieldLabelId,
      handleFocus,
      handleChange,
      handleBlur,
    ],
  );

  const listboxOptionContextValue: ComboboxListboxOptionType = useMemo(
    () => ({
      allowMultiple,
    }),
    [allowMultiple],
  );

  const listboxContextValue: ComboboxListboxType = useMemo(
    () => ({
      listboxId,
      textFieldLabelId,
      textFieldFocused,
      onOptionSelected,
      setActiveOptionId,
      setListboxId,
      onKeyToBottom: onScrolledToBottom,
    }),
    [
      listboxId,
      textFieldLabelId,
      textFieldFocused,
      onOptionSelected,
      setActiveOptionId,
      setListboxId,
      onScrolledToBottom,
    ],
  );

  return (
    <Popover
      ref={ref}
      active={popoverActive}
      onClose={handleClose}
      activator={
        <ComboboxTextFieldContext.Provider value={textFieldContextValue}>
          {activator}
        </ComboboxTextFieldContext.Provider>
      }
      autofocusTarget="none"
      preventFocusOnClose
      fullWidth
      preferInputActivator={false}
      preferredPosition={preferredPosition}
    >
      <Popover.Pane onScrolledToBottom={onScrolledToBottom}>
        {Children.count(children) > 0 ? (
          <ComboboxListboxContext.Provider value={listboxContextValue}>
            <ComboboxListboxOptionContext.Provider
              value={listboxOptionContextValue}
            >
              <div className={styles.Listbox}>{children}</div>
            </ComboboxListboxOptionContext.Provider>
          </ComboboxListboxContext.Provider>
        ) : null}
      </Popover.Pane>
    </Popover>
  );
}

Combobox.TextField = TextField;
