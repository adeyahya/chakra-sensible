/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { InputProps, Input } from "@chakra-ui/react";
import { format } from "date-fns";
import { ChangeEvent, memo, useContext, useMemo } from "react";
import { useSnapshot } from "valtio";

import { safeParse } from "../../utils";
import { AppContext } from "./Context";

const InputDate = memo(
  (
    props: Pick<InputProps, "onChange" | "value"> & {
      name: "start" | "end";
    }
  ) => {
    const state = useContext(AppContext);
    const {
      selection,
      colorScheme,
      focused,
      max,
      min,
      format: dateFormat,
      type: inputType,
    } = useSnapshot(state);

    const handleFocus = () => {
      state.focused = props.name;
    };
    const value = useMemo(() => {
      if (!selection[props.name]) return "";
      return format(selection[props.name]!, dateFormat);
    }, [props.name, selection, dateFormat]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.currentTarget.value;
      if (!val) return;
      const parsed = safeParse(val, dateFormat);
      if (!parsed) return;

      /**
       * min max validation
       */
      if (max && parsed.getTime() > max.getTime()) return;
      if (min && parsed.getTime() < min.getTime()) return;

      /**
       * prevent update end to be earlier than start and
       * prevent update start later than end
       */
      if (
        selection.start &&
        props.name === "end" &&
        parsed.getTime() <= selection.start.getTime()
      )
        return;

      if (
        selection.end &&
        props.name === "start" &&
        parsed.getTime() >= selection.end.getTime()
      )
        return;

      state.selection[props.name] = parsed;
    };

    return (
      <Input
        flex="1"
        variant="unstyled"
        borderRadius="none"
        px="2"
        py="1"
        type={inputType}
        borderBottomWidth="2px"
        borderStyle="solid"
        onChange={handleChange}
        value={value}
        onFocus={handleFocus}
        borderColor={
          focused === props.name ? `${colorScheme}.500` : "transparent"
        }
        _focus={{
          borderColor: `${colorScheme}.500`,
        }}
        _active={{
          borderColor: `${colorScheme}.500`,
        }}
        size="md"
        css={{
          "&::-webkit-calendar-picker-indicator": {
            display: "none",
          },
        }}
        {...props}
      />
    );
  }
);

export default InputDate;
