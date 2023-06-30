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
  PopoverArrow,
  PopoverBody,
  InputProps,
  IconButton,
  Flex,
  Text,
  Button,
} from "@chakra-ui/react";
import {
  ArrowRightIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ArrowForwardIcon,
  SmallCloseIcon,
} from "@chakra-ui/icons";
import { useLilius } from "use-lilius";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";
import addMonths from "date-fns/addMonths";
import parse from "date-fns/parse";
import format from "date-fns/format";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isValidDate = (maybeDate: any) =>
  Object.prototype.toString.call(maybeDate) === "[object Date]";

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
  inRange: () => false,
  inScope: () => () => false,
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
    numberOfMonths: 2,
  });
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
      setFocused((prev) => {
        if (prev === "end") {
          if (selection.start) return null;
          return "start";
        }
        if (prev === "start") return "end";
        return "start";
      });
    },
    [focused, selection]
  );

  const handleOpen = () => {
    if (focused === null) setFocused("start");
  };

  return (
    <AppContext.Provider
      value={{
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
      <Popover isOpen={focused !== null}>
        <Box
          onClick={(e) => {
            e.stopPropagation();
          }}
          w="full"
          position="relative"
          zIndex={999}
        >
          <PopoverTrigger>
            <HStack
              onClick={handleOpen}
              w="full"
              borderRadius="md"
              borderColor="gray.200"
              borderStyle="solid"
              borderWidth="1px"
            >
              <InputDate name="start" />
              <ArrowForwardIcon color="gray.300" />
              <InputDate name="end" />
              <IconButton
                opacity={0.2}
                onClick={handleClear}
                _hover={{ opacity: 1 }}
                mr="1"
                size="xs"
                variant="unstyled"
                aria-label="clear"
                icon={<SmallCloseIcon color="gray.600" />}
              />
            </HStack>
          </PopoverTrigger>
          <PopoverContent w="full">
            <PopoverArrow />
            <PopoverBody>
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
                <Text textAlign="center" flex="1">
                  {format(addMonths(viewing, 1), "MMM yyyy")}
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
              <Flex flexDir="row">
                <Button mt={3} mb={1} size="sm" onClick={viewToday}>
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
  } = useContext(AppContext);

  const handleHover = (d: Date) => {
    setHovering(d);
    setHover(true);
  };

  const handleLeave = () => {
    setHover(false);
  };

  const isSelected =
    selection.start?.getTime() === day.getTime() ||
    selection.end?.getTime() === day.getTime();

  const isInSelectionRange = useMemo(() => {
    if (!selection.start || !selection.end) return false;
    return inRange(day, selection.start, selection.end);
  }, [selection, inRange, day]);

  const isInScope = inScope(segment)(day);

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
      bg={
        isDisabled
          ? "gray.100"
          : !isInScope
          ? undefined
          : isSelected
          ? "blue.300"
          : (isHovered && inHoverRange(day)) || isInSelectionRange
          ? "blue.100"
          : undefined
      }
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
  const { setFocused, selection, setSelection, focused } =
    useContext(AppContext);

  const handleFocus = () => {
    setFocused(props.name);
  };
  const value = useMemo(() => {
    if (!selection[props.name]) return "";
    return format(selection[props.name]!, "yyyy-MM-dd");
  }, [selection, props.name]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value;
    if (!val) return;
    const parsed = parse(val, "yyyy-MM-dd", new Date());
    if (!isValidDate(parsed)) return;
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
      type="date"
      borderBottomWidth="2px"
      borderStyle="solid"
      onChange={handleChange}
      value={value}
      onFocus={handleFocus}
      borderColor={focused === props.name ? "blue.500" : "transparent"}
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
