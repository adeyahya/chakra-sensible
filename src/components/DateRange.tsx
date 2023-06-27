import { useCallback, useState, createContext, ChangeEvent } from "react";
import {
  Stack,
  HStack,
  Box,
  Input,
  useBoolean,
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

interface ContextType {
  focused: "start" | "end" | null;
  hovering: Date | null;
  inHoverRange: (d: Date) => boolean;
  onSelect: (d: Date) => void;
}

const AppContext = createContext<ContextType>({
  focused: null,
  hovering: null,
  inHoverRange: () => false,
  onSelect: () => null,
});

const DateRange = () => {
  const [selected, setSelected] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [isHovered, setHover] = useBoolean(false);
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

  const inHoverRange = (d: Date) => {
    if (selected[0] === null) return false;
    if (selected[1]) return false;
    if (!hovering) return false;

    return inRange(d, selected[0], hovering);
  };

  const handleSelect = (d: Date) => {
    setSelected((prev) => {
      if (!prev[0]) return [d, prev[1]];
      return [prev[0], d];
    });
  };

  const handleHover = (d: Date) => {
    setHovering(d);
    setHover.on();
  };

  const handleLeave = () => {
    setHover.off();
  };

  const handleInputChange =
    (index: 0 | 1) => (e: ChangeEvent<HTMLInputElement>) => {
      const targetDate = parse(e.currentTarget.value, "yyyy-MM-dd", new Date());
      setSelected((prev) => {
        if (index === 0) return [targetDate, prev[1]];
        return [prev[0], targetDate];
      });

      console.log(selected);
    };

  return (
    <AppContext.Provider
      value={{
        focused: null,
        hovering,
        inHoverRange,
        onSelect: handleSelect,
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
              <InputDate onChange={handleInputChange(0)} />
              <InputDate onChange={handleInputChange(1)} />
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
                          <Box
                            key={`${time}-${midx}-${widx}-${day.getTime()}`}
                            flex={1}
                            px={2}
                            py={1}
                            fontSize="sm"
                            _hover={{ bg: "gray.100" }}
                            cursor="pointer"
                            textAlign="center"
                            bg={
                              isHovered && inHoverRange(day)
                                ? "blue.100"
                                : undefined
                            }
                            onMouseEnter={() => handleHover(day)}
                            onMouseLeave={handleLeave}
                            onClick={() => handleSelect(day)}
                            color={isInScope(day) ? "gray.800" : "gray.300"}
                          >
                            {day.getDate()}
                          </Box>
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

const InputDate = (props: Pick<InputProps, "onChange" | "value">) => {
  return (
    <Input
      variant="unstyled"
      borderRadius="none"
      px="2"
      py="1"
      type="date"
      borderBottomWidth="2px"
      borderColor="transparent"
      borderStyle="solid"
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
