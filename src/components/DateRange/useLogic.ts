import { useRef, useEffect } from "react";
import { proxy, useSnapshot } from "valtio";

import { AppContextType } from "./Context";
import { BaseProps } from "./interface";

const useLogic = (
  viewing: Date,
  setViewing: (d: Date) => void,
  props: BaseProps,
  isDateTime?: boolean
) => {
  const { value, defaultValue, onChange, colorScheme = "blue" } = props;
  const viewed = useRef(false);
  const state = useRef(
    proxy<AppContextType>({
      focused: null,
      hovering: null,
      selection: {
        start: value?.[0] ?? defaultValue?.[0] ?? null,
        end: value?.[1] ?? defaultValue?.[1] ?? null,
      },
      isHovered: false,
      colorScheme: colorScheme ?? "blue",
      format: isDateTime ? "yyyy-MM-dd'T'HH:mm" : "yyyy-MM-dd",
      type: isDateTime ? "datetime-local" : "date",
      viewing: viewing,
    })
  ).current;
  const snap = useSnapshot(state);

  useEffect(() => {
    state.viewing = viewing;
    if (props.colorScheme) state.colorScheme = props.colorScheme;
    if (props.max) state.max = props.max;
    if (props.min) state.min = props.min;
    if (!viewed.current && props.value?.[0]) {
      setViewing(props.value[0]);
      viewed.current = true;
    }
  }, [viewing, state, props, setViewing]);

  useEffect(() => {
    if (!onChange) return;
    onChange([snap.selection.start, snap.selection.end]);
  }, [onChange, snap.selection]);

  useEffect(() => {
    if (props.value?.[0] === null && snap.selection.start !== null)
      state.selection.start = null;
    if (props.value?.[1] === null && snap.selection.end !== null)
      state.selection.end = null;

    if (
      props.value &&
      props.value[0] &&
      props.value[0].getTime() !== snap.selection.start?.getTime()
    ) {
      state.selection.start = props.value[0];
    }
    if (
      props.value &&
      props.value[1] &&
      props.value[1].getTime() !== snap.selection.end?.getTime()
    ) {
      state.selection.end = props.value[1];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value]);

  return [state, snap] as const;
};

export default useLogic;
