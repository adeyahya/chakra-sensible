/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
import format from "date-fns/format";

import Weeks from "./Weeks";
import Clock from "./DateRange/Clock";
import { DateRangeProps } from "./DateRange/DateRange";
import { AppContext, AppContextType } from "./DateRange/Context";
import { proxy, useSnapshot } from "valtio";
import { onSelect } from "./DateRange/utils";
import InputDate from "./DateRange/InputDate";
import Day from "./DateRange/Day";

export const DateTimeRange = (props: DateRangeProps) => {
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
  } = useLilius({
    numberOfMonths: 1,
  });
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
      format: "yyyy-MM-dd'T'HH:mm",
      type: "datetime-local",
      viewing: viewing,
    })
  ).current;
  const snap = useSnapshot(state);
  const { selection, focused } = snap;

  useEffect(() => {
    state.viewing = viewing;
    if (props.colorScheme) state.colorScheme = props.colorScheme;
  }, [viewing, state, props]);

  useEffect(() => {
    if (!onChange) return;
    onChange([selection.start, selection.end]);
  }, [onChange, selection]);

  useEffect(() => {
    if (
      props.value?.[0] &&
      props.value[0].getTime() !== selection.start?.getTime()
    ) {
      state.selection.start = props.value[0];
    }
    if (
      props.value?.[1] &&
      props.value[1].getTime() !== selection.end?.getTime()
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
    if (focused === null) state.focused = "start";
  };

  const isOpen = focused !== null;
  const currentValue =
    focused === "start"
      ? selection.start
      : focused === "end"
      ? selection.end
      : null;

  return (
    <AppContext.Provider value={state}>
      {focused && (
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
                <Clock value={currentValue} onChange={onSelect(state)(snap)} />
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
