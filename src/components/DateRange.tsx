/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  useCallback,
  useState,
  createContext,
  ChangeEvent,
  useContext,
  useMemo,
} from "react";
import {
  Stack,
  HStack,
  Box,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  InputProps,
} from "@chakra-ui/react";
import { useLilius } from "use-lilius";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";
import addMonths from "date-fns/addMonths";
import parse from "date-fns/parse";
import format from "date-fns/format";

type Focus = "start" | "end" | null;
type Selection = {
  start: Date | null;
  end: Date | null;
};
interface ContextType {
  focused: Focus;
  selection: Selection;
  isHovered: boolean;
  hovering: Date | null;
  inRange: (date: Date, min: Date, max: Date) => boolean;
  isInScope: (d: Date) => boolean;
  setHovering: (d: Date | null) => void;
  setHover: (d: boolean) => void;
  setSelection: (d: Selection) => void;
  inHoverRange: (d: Date) => boolean;
  onSelect: (d: Date) => void;
  setFocused: (d: Focus) => void;
}

const AppContext = createContext<ContextType>({
  focused: null,
  hovering: null,
  selection: { start: null, end: null },
  isHovered: false,
  inRange: () => false,
  isInScope: () => false,
  setHovering: () => null,
  setHover: () => null,
  setSelection: () => null,
  inHoverRange: () => false,
  onSelect: () => null,
  setFocused: () => null,
});

const DateRange = () => {
  const [focused, setFocused] = useState<Focus>(null);
  const [selection, setSelection] = useState<Selection>({
    start: null,
    end: null,
  });
  const [isHovered, setHover] = useState<boolean>(false);
  const [hovering, setHovering] = useState<Date | null>(null);
  const { calendar, viewing, inRange } = useLilius({
    numberOfMonths: 2,
  });
  const time = viewing.getTime();

  const isInScope = useCallback(
    (d: Date) => {
      return inRange(
        d,
        startOfMonth(viewing),
        endOfMonth(addMonths(viewing, 1))
      );
    },
    [inRange, viewing]
  );

  const inHoverRange = useCallback(
    (d: Date) => {
      if (!hovering) return false;
      if (selection.start && focused === "end") {
        return inRange(d, selection.start, hovering);
      }
      if (selection.end && focused === "start") {
        return inRange(d, hovering, selection.end);
      }

      return false;
    },
    [hovering, inRange, selection, focused]
  );

  const onSelect = useCallback(
    (d: Date) => {
      setSelection((prev) => {
        if (!focused) return prev;
        return Object.assign({}, prev, { [focused]: d });
      });
      setFocused((prev) => {
        if (prev === "end") {
          if (selection.start) return null;
          return "start";
        }
        if (prev === "start") {
          if (selection.end) return null;
          return "end";
        }
        return "start";
      });
    },
    [focused, selection]
  );

  return (
    <AppContext.Provider
      value={{
        inRange,
        isInScope,
        isHovered,
        setHover,
        setHovering,
        selection,
        setSelection,
        focused,
        setFocused,
        hovering,
        inHoverRange,
        onSelect,
      }}
    >
      <Popover>
        <Box>
          <PopoverTrigger>
            <HStack
              borderRadius="md"
              borderColor="gray.200"
              borderStyle="solid"
              borderWidth="1px"
            >
              <InputDate name="start" />
              <InputDate name="end" />
            </HStack>
          </PopoverTrigger>
          <PopoverContent w="full">
            <PopoverBody>
              <HStack align="start" spacing="6">
                {calendar.map((months, midx) => (
                  <Stack key={`${time}-${midx}`}>
                    <Weeks />
                    {months.map((weeks, widx) => (
                      <HStack
                        spacing="0"
                        flex={1}
                        key={`${time}-${midx}-${widx}`}
                      >
                        {weeks.map((day) => (
                          <Day
                            key={`${time}-${midx}-${widx}-${day.getTime()}`}
                            day={day}
                          />
                        ))}
                      </HStack>
                    ))}
                  </Stack>
                ))}
              </HStack>
            </PopoverBody>
          </PopoverContent>
        </Box>
      </Popover>
    </AppContext.Provider>
  );
};

const Day = ({ day }: { day: Date }) => {
  const {
    onSelect,
    inHoverRange,
    setHovering,
    setHover,
    isHovered,
    isInScope,
    selection,
    inRange,
  } = useContext(AppContext);

  const handleHover = (d: Date) => {
    setHovering(d);
    setHover(true);
  };

  const handleLeave = () => {
    setHover(false);
  };

  const isSelected = selection.start === day || selection.end === day;
  const isInSelectionRange = useMemo(() => {
    if (!selection.start || !selection.end) return false;
    return inRange(day, selection.start, selection.end);
  }, [selection, inRange, day]);

  return (
    <Box
      flex={1}
      px={2}
      py={1}
      fontSize="sm"
      _hover={{ bg: "gray.100" }}
      cursor="pointer"
      textAlign="center"
      bg={
        isSelected
          ? "blue.300"
          : (isHovered && inHoverRange(day)) || isInSelectionRange
          ? "blue.100"
          : undefined
      }
      onMouseEnter={() => handleHover(day)}
      onMouseLeave={handleLeave}
      onClick={() => onSelect(day)}
      color={isInScope(day) ? "gray.800" : "gray.300"}
    >
      {day.getDate()}
    </Box>
  );
};

const Weeks = () => (
  <HStack>
    <Box textAlign="center" flex={1}>
      Su
    </Box>
    <Box textAlign="center" flex={1}>
      Mo
    </Box>
    <Box textAlign="center" flex={1}>
      Tu
    </Box>
    <Box textAlign="center" flex={1}>
      We
    </Box>
    <Box textAlign="center" flex={1}>
      Th
    </Box>
    <Box textAlign="center" flex={1}>
      Fr
    </Box>
    <Box textAlign="center" flex={1}>
      Sa
    </Box>
  </HStack>
);

const InputDate = (
  props: Pick<InputProps, "onChange" | "value"> & {
    name: "start" | "end";
  }
) => {
  const context = useContext(AppContext);

  const handleFocus = () => {
    context.setFocused(props.name);
  };
  const value = useMemo(() => {
    if (!context.selection[props.name]) return undefined;
    return format(context.selection[props.name]!, "yyyy-MM-dd");
  }, [context.selection, props.name]);

  return (
    <Input
      variant="unstyled"
      borderRadius="none"
      px="2"
      py="1"
      type="date"
      borderBottomWidth="2px"
      borderStyle="solid"
      value={value}
      onFocus={handleFocus}
      borderColor={context.focused === props.name ? "blue.500" : "transparent"}
      _focus={{
        borderColor: "blue.500",
      }}
      _active={{
        borderColor: "blue.500",
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
};

export default DateRange;
