import { memo } from "react";
import { HStack, Stack } from "@chakra-ui/react";
import Weeks from "../Weeks";
import Day from "./Day";

type Props = {
  calendar: Date[][][];
};

const Body = memo(({ calendar }: Props) => {
  return (
    <HStack align="start" spacing="6">
      {calendar.map((months, midx) => (
        <Stack key={midx}>
          <Weeks />
          {months.map((weeks, widx) => (
            <HStack spacing="0" flex={1} key={`${midx}-${widx}`}>
              {weeks.map((day) => (
                <Day
                  segment={midx === 0 ? "start" : "end"}
                  key={`${midx}-${widx}-${day.getTime()}`}
                  day={day}
                />
              ))}
            </HStack>
          ))}
        </Stack>
      ))}
    </HStack>
  );
});

export default Body;
