import { Box, Flex, Text, Button } from "@chakra-ui/react";
import { useLilius } from "use-lilius";
import format from "date-fns/format";

import Clock from "./Clock";
import { DateRangeProps } from "./DateRange";
import { AppContext } from "./Context";
import { onSelect } from "./utils";
import Header from "./Header";
import Wrapper from "./Wrapper";
import Body from "./Body";
import useLogic from "./useLogic";

export const DateTimeRange = (props: DateRangeProps) => {
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
    numberOfMonths: 1,
    viewing: props.value?.[0] ?? undefined,
  });
  const [state, snap] = useLogic(viewing, setViewing, props, true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { value, max, min, defaultValue, onChange, colorScheme, ...rest } =
    props;

  const handleNext = () => {
    if (snap.focused === "start") return (state.focused = "end");
    if (snap.focused === "end") return (state.focused = null);
  };

  const currentValue =
    snap.focused === "start"
      ? snap.selection.start
      : snap.focused === "end"
      ? snap.selection.end
      : null;

  return (
    <AppContext.Provider value={state}>
      <Wrapper {...rest}>
        <Flex flexDir="row">
          <Box>
            <Header
              onNextMonth={viewNextMonth}
              onPrevMonth={viewPreviousMonth}
              onNextYear={viewNextYear}
              onPrevYear={viewPreviousYear}
            >
              <Text textAlign="center" flex="1">
                {format(viewing, "MMM yyyy")}
              </Text>
            </Header>
            <Body calendar={calendar} />
          </Box>
          <Clock value={currentValue} onChange={onSelect(state)(snap)} />
        </Flex>
        <Flex
          mt={4}
          borderTopWidth="1px"
          borderColor="gray.100"
          justify="space-between"
          flexDir="row"
        >
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
          <Button
            mt={3}
            mr={4}
            mb={1}
            size="sm"
            variant="link"
            onClick={handleNext}
          >
            Next
          </Button>
        </Flex>
      </Wrapper>
    </AppContext.Provider>
  );
};
