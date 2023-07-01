import { useEffect, useRef } from "react";
import {
  Stack,
  HStack,
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  IconButton,
  Flex,
  Text,
  Button,
  BoxProps,
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
import addMonths from "date-fns/addMonths";
import format from "date-fns/format";
import { proxy, useSnapshot } from "valtio";

import { AppContext, AppContextType } from "./Context";
import Weeks from "../Weeks";
import Day from "./Day";
import InputDate from "./InputDate";

export type DateRangeProps = BoxProps & {
  value?: (Date | null)[];
  defaultValue?: (Date | null)[];
  onChange?: (d: (Date | null)[]) => void;
  min?: Date;
  max?: Date;
  colorScheme?: string;
};
export const DateRange = (props: DateRangeProps) => {
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
  const {
    calendar,
    viewing,
    viewNextMonth,
    viewPreviousMonth,
    viewNextYear,
    viewPreviousYear,
    viewToday,
    setViewing,
  } = useLilius({
    numberOfMonths: 2,
  });
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
      format: "yyyy-MM-dd",
      type: "date",
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

  const time = viewing.getTime();

  const handleClear = () => {
    state.selection.start = null;
    state.selection.end = null;
  };

  const handleOpen = () => {
    if (snap.focused === null) state.focused = "start";
  };

  const isOpen = snap.focused !== null;

  return (
    <AppContext.Provider value={state}>
      {snap.focused && (
        <Box
          onClick={() => (state.focused = null)}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
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
              <Flex
                flexDir="row"
                mt={4}
                borderTopWidth="1px"
                borderColor="gray.100"
              >
                <Button
                  variant="link"
                  mt={3}
                  mb={1}
                  size="sm"
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
