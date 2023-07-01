import { Flex, Text, Button, BoxProps } from "@chakra-ui/react";
import { useLilius } from "use-lilius";
import addMonths from "date-fns/addMonths";
import format from "date-fns/format";

import { AppContext } from "./Context";
import Header from "./Header";
import Body from "./Body";
import Wrapper from "./Wrapper";
import { BaseProps } from "./interface";
import useLogic from "./useLogic";

export type DateRangeProps = BoxProps & BaseProps;
export const DateRange = (props: DateRangeProps) => {
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
  const [state] = useLogic(viewing, setViewing, props);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { value, max, min, defaultValue, onChange, colorScheme, ...rest } =
    props;

  return (
    <AppContext.Provider value={state}>
      <Wrapper {...rest}>
        <Header
          onNextMonth={viewNextMonth}
          onPrevMonth={viewPreviousMonth}
          onNextYear={viewNextYear}
          onPrevYear={viewPreviousYear}
        >
          <Text textAlign="center" flex="1">
            {format(viewing, "MMM yyyy")}
          </Text>
          <Text textAlign="center" flex="1">
            {format(addMonths(viewing, 1), "MMM yyyy")}
          </Text>
        </Header>
        <Body calendar={calendar} />
        <Flex flexDir="row" mt={4} borderTopWidth="1px" borderColor="gray.100">
          <Button variant="link" mt={3} mb={1} size="sm" onClick={viewToday}>
            Today
          </Button>
        </Flex>
      </Wrapper>
    </AppContext.Provider>
  );
};
