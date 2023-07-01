/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  useCallback,
  useState,
  createContext,
  ChangeEvent,
  useContext,
  useMemo,
  useEffect,
} from "react";
import {
  Stack,
  HStack,
  Box,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  InputProps,
  IconButton,
  Flex,
  Text,
  Button,
  BoxProps,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import {
  ArrowRightIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ArrowForwardIcon,
  SmallCloseIcon,
  CalendarIcon,
} from "@chakra-ui/icons";
import { useLilius } from "use-lilius";
import startOfMonth from "date-fns/startOfMonth";
import startOfDay from "date-fns/startOfDay";
import endOfMonth from "date-fns/endOfMonth";
import addMonths from "date-fns/addMonths";
import format from "date-fns/format";
import formatISO from "date-fns/formatISO";
import { isDayEq, safeParse } from "../utils";

import Weeks from "./Weeks";
import Clock from "./Clock";

type Value = Date | null;
type Focus = "start" | "end" | null;
type Selection = {
  start: Value;
  end: Value;
};
interface ContextType {
  focused: Focus;
  selection: Selection;
  isHovered: boolean;
  hovering: Date | null;
  colorScheme: string;
  inRange: (date: Date, min: Date, max: Date) => boolean;
  inScope: (segment: "start" | "end") => (d: Date) => boolean;
  setHovering: (d: Date | null) => void;
  setHover: (d: boolean) => void;
  setSelection: React.Dispatch<React.SetStateAction<Selection>>;
  inHoverRange: (d: Date) => boolean;
  onSelect: (d: Date) => void;
  setFocused: (d: Focus) => void;
}

const AppContext = createContext<ContextType>({
  focused: null,
  hovering: null,
  selection: { start: null, end: null },
  isHovered: false,
  colorScheme: "blue",
  inRange: () => false,
  inScope: () => () => false,
  setHovering: () => null,
  setHover: () => null,
  setSelection: () => null,
  inHoverRange: () => false,
  onSelect: () => null,
  setFocused: () => null,
});

export type DateTimeRangeProps = BoxProps & {
  value?: [Value, Value];
  defaultValue?: [Value, Value];
  onChange?: (d: [Value, Value]) => void;
  min?: Date;
  max?: Date;
  colorScheme?: string;
};
export const DateTimeRange = (props: DateTimeRangeProps) => {
  const {
    value,
    defaultValue,
    onChange,
    colorScheme = "blue",
    min,
    max,
    children,
    ...rest
  } = props;
  const [focused, setFocused] = useState<Focus>(null);
  const [selection, setSelection] = useState<Selection>({
    start: defaultValue?.[0] ?? value?.[0] ?? null,
    end: defaultValue?.[1] ?? value?.[1] ?? null,
  });
  const [isHovered, setHover] = useState<boolean>(false);
  const [hovering, setHovering] = useState<Date | null>(null);
  const {
    calendar,
    viewing,
    inRange,
    viewNextMonth,
    viewPreviousMonth,
    viewNextYear,
    viewPreviousYear,
    viewToday,
  } = useLilius({
    numberOfMonths: 1,
  });

  useEffect(() => {
    if (!onChange) return;
    onChange([selection.start, selection.end]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection, onChange]);

  const time = viewing.getTime();

  const handleClear = () => setSelection({ start: null, end: null });

  const inScope = useCallback(
    (segment: "start" | "end") => (d: Date) => {
      const month = segment === "start" ? viewing : addMonths(viewing, 1);
      return inRange(d, startOfMonth(month), endOfMonth(month));
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
    },
    [focused]
  );

  const handleOpen = () => {
    if (focused === null) setFocused("start");
  };

  const isOpen = focused !== null;
  const currentValue =
    focused === "start"
      ? selection.start
      : focused === "end"
      ? selection.end
      : null;

  return (
    <AppContext.Provider
      value={{
        colorScheme,
        inRange,
        inScope,
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
      {focused && (
        <Box
          onClick={() => setFocused(null)}
          w="100vw"
          h="100vh"
          position="fixed"
          top="0"
          left="0"
          zIndex={998}
        />
      )}
      <Popover isLazy isOpen={isOpen}>
        <Box
          onClick={(e) => {
            e.stopPropagation();
          }}
          w="full"
          position="relative"
          zIndex={isOpen ? 999 : 1}
        >
          <PopoverTrigger>
            <HStack
              onClick={handleOpen}
              w="full"
              borderRadius="md"
              borderColor="gray.200"
              borderStyle="solid"
              borderWidth="1px"
              {...rest}
            >
              <InputDate name="start" />
              <ArrowForwardIcon color="gray.300" />
              <InputDate name="end" />
              <Box position="relative" mr="1" role="group">
                <CalendarIcon
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  color="gray.500"
                  _groupHover={{ display: "none" }}
                />
                <IconButton
                  opacity={0.2}
                  onClick={handleClear}
                  _hover={{ opacity: 1 }}
                  size="xs"
                  variant="unstyled"
                  aria-label="clear"
                  icon={<SmallCloseIcon color="gray.600" />}
                />
              </Box>
            </HStack>
          </PopoverTrigger>
          <PopoverContent w="full">
            <PopoverArrow />
            <PopoverBody pr="0">
              <Flex flexDir="row">
                <Box>
                  <Flex pb="3" w="full" flexDir="row" align="center">
                    <Flex flexDir="row" align="center">
                      <IconButton
                        onClick={viewPreviousYear}
                        size="xs"
                        variant="ghost"
                        aria-label="prev-year"
                        icon={<ArrowLeftIcon color="gray.500" w="2" h="2" />}
                      />
                      <IconButton
                        onClick={viewPreviousMonth}
                        size="xs"
                        variant="ghost"
                        aria-label="prev-month"
                        icon={<ChevronLeftIcon color="gray.500" />}
                      />
                    </Flex>
                    <Text textAlign="center" flex="1">
                      {format(viewing, "MMM yyyy")}
                    </Text>
                    <Flex>
                      <IconButton
                        onClick={viewNextMonth}
                        size="xs"
                        variant="ghost"
                        aria-label="next-month"
                        icon={<ChevronRightIcon color="gray.500" />}
                      />
                      <IconButton
                        onClick={viewNextYear}
                        size="xs"
                        variant="ghost"
                        aria-label="next-year"
                        icon={<ArrowRightIcon color="gray.500" w="2" h="2" />}
                      />
                    </Flex>
                  </Flex>
                  <Flex flexDir="row">
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
                                  segment={midx === 0 ? "start" : "end"}
                                  key={`${time}-${midx}-${widx}-${day.getTime()}`}
                                  day={day}
                                />
                              ))}
                            </HStack>
                          ))}
                        </Stack>
                      ))}
                    </HStack>
                  </Flex>
                </Box>
                <Clock value={currentValue} onChange={onSelect} />
              </Flex>
              <Flex flexDir="row">
                <Button
                  mt={3}
                  ml={2}
                  mb={1}
                  size="sm"
                  variant="link"
                  onClick={viewToday}
                >
                  Today
                </Button>
              </Flex>
            </PopoverBody>
          </PopoverContent>
        </Box>
      </Popover>
    </AppContext.Provider>
  );
};

const Day = ({ day, segment }: { day: Date; segment: "start" | "end" }) => {
  const {
    onSelect,
    inHoverRange,
    setHovering,
    setHover,
    isHovered,
    inScope,
    selection,
    focused,
    inRange,
    colorScheme,
  } = useContext(AppContext);

  const handleHover = (d: Date) => {
    setHovering(d);
    setHover(true);
  };

  const handleLeave = () => {
    setHover(false);
  };

  const isSelected = useMemo(
    () => isDayEq(selection.start, day) || isDayEq(selection.end, day),
    [day, selection.end, selection.start]
  );

  const isInSelectionRange = useMemo(() => {
    if (!selection.start || !selection.end) return false;
    return inRange(day, selection.start, selection.end);
  }, [selection, inRange, day]);

  const isInScope = useMemo(
    () => inScope(segment)(day),
    [segment, day, inScope]
  );

  const isToday = useMemo(() => {
    return format(day, "ddMMyy") === format(new Date(), "ddMMyy");
  }, [day]);

  const isDisabled = useMemo(() => {
    if (!selection.start && !selection.end) return false;
    if (selection.start && focused === "end") {
      return day.getTime() < selection.start.getTime();
    }
    if (selection.end && focused === "start") {
      return day.getTime() > selection.end.getTime();
    }
    return false;
  }, [day, focused, selection.end, selection.start]);

  const bg = useMemo(() => {
    if (!isInScope) return undefined;
    if (isDisabled) return "gray.100";
    if (isSelected) return `${colorScheme}.300`;
    if (isHovered && inHoverRange(day)) return `${colorScheme}.100`;
    if (isInSelectionRange) return `${colorScheme}.100`;
    return undefined;
  }, [
    colorScheme,
    day,
    inHoverRange,
    isDisabled,
    isHovered,
    isInSelectionRange,
    isSelected,
    isInScope,
  ]);

  return (
    <Box
      flex={1}
      px={2}
      py={1}
      fontSize="sm"
      _hover={
        isInScope && !isSelected && !isDisabled ? { bg: "gray.100" } : undefined
      }
      cursor="pointer"
      textAlign="center"
      bg={bg}
      onMouseEnter={isInScope ? () => handleHover(day) : undefined}
      onMouseLeave={handleLeave}
      onClick={() => !isDisabled && onSelect(day)}
      fontWeight={isToday ? "bold" : undefined}
      color={isInScope ? "gray.800" : "gray.300"}
    >
      {day.getDate()}
    </Box>
  );
};

const InputDate = (
  props: Pick<InputProps, "onChange" | "value"> & {
    name: "start" | "end";
  }
) => {
  const { setFocused, selection, setSelection, focused, colorScheme } =
    useContext(AppContext);

  const handleFocus = () => {
    setFocused(props.name);
  };
  const value = useMemo(() => {
    if (!selection[props.name]) return "";
    return format(selection[props.name]!, "yyyy-MM-dd'T'HH:mm");
  }, [selection, props.name]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value;
    if (!val) return;
    const parsed = safeParse(val, "yyyy-MM-dd'T'HH:mm");
    if (!parsed) return;

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

    setSelection((prev) => {
      return Object.assign({}, prev, { [props.name]: parsed });
    });
  };

  return (
    <Input
      flex="1"
      variant="unstyled"
      borderRadius="none"
      px="2"
      py="1"
      type="datetime-local"
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
};