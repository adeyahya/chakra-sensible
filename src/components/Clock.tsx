import { Flex, Box, Text, forwardRef } from "@chakra-ui/react";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import format from "date-fns/format";
import setMinutes from "date-fns/setMinutes";
import setHours from "date-fns/setHours";
import { HOURS, MINUTES } from "src/constant";

type Props = {
  value?: Date | null;
  onChange: (d: Date) => void;
};

const Clock = (props: Props) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const scrollerHoursRef = useRef<HTMLDivElement>(null);
  const scrollerMinutesRef = useRef<HTMLDivElement>(null);
  const unitRef = useRef<HTMLDivElement>(null);

  const activeHour = useMemo(
    () => (props.value ? format(props.value, "HH") : "-1"),
    [props.value]
  );
  const activeMinute = useMemo(
    () => (props.value ? format(props.value, "mm") : "-1"),
    [props.value]
  );

  const handleChangeHour = (d: string) => {
    if (!props.value) return;
    props.onChange(setHours(props.value, parseInt(d)));
  };

  const handleChangeMinute = (d: string) => {
    if (!props.value) return;
    props.onChange(setMinutes(props.value, parseInt(d)));
  };

  useEffect(() => {
    if (!unitRef.current) return;
    if (scrollerMinutesRef.current) {
      const unitHeight = unitRef.current.getBoundingClientRect().height;
      const offset = parseInt(activeMinute);
      scrollerMinutesRef.current.scrollTo({
        top: offset * unitHeight,
        behavior: "smooth",
      });
    }
  }, [activeMinute, props.value]);

  useEffect(() => {
    if (!unitRef.current) return;
    if (scrollerHoursRef.current) {
      const unitHeight = unitRef.current.getBoundingClientRect().height;
      const offset = parseInt(activeHour);
      scrollerHoursRef.current.scrollTo({
        top: offset * unitHeight,
        behavior: "smooth",
      });
    }
  }, [activeHour, props.value]);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const height = outer.parentElement?.getBoundingClientRect().height ?? 0;
    if (scrollerHoursRef.current)
      scrollerHoursRef.current.style.height = `${height}px`;
    if (scrollerMinutesRef.current)
      scrollerMinutesRef.current.style.height = `${height}px`;
  }, []);

  return (
    <Flex
      ml="3"
      borderColor="gray.100"
      borderLeftWidth="1px"
      flexDir="row"
      ref={outerRef}
    >
      <Flex
        ref={scrollerHoursRef}
        borderColor="gray.100"
        borderRightWidth="1px"
        flexDir="column"
        overflowY="scroll"
        h="0px"
        css={{
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {HOURS.map((hour) => (
          <Unit
            ref={unitRef}
            onChange={handleChangeHour}
            isActive={hour === activeHour}
            value={hour}
            key={hour}
          />
        ))}
      </Flex>
      <Flex
        ref={scrollerMinutesRef}
        flexDir="column"
        overflowY="scroll"
        h="0px"
        css={{
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {MINUTES.map((minute) => (
          <Unit
            onChange={handleChangeMinute}
            isActive={minute === activeMinute}
            value={minute}
            key={minute}
          />
        ))}
      </Flex>
    </Flex>
  );
};

const Unit = forwardRef(
  (
    props: { value: string; isActive?: boolean; onChange: (d: string) => void },
    ref
  ) => {
    const handleClick = () => {
      props.onChange(props.value);
    };

    return (
      <Box
        ref={ref}
        onClick={handleClick}
        px="3"
        py="1"
        cursor="pointer"
        bg={props.isActive ? "blue.200" : undefined}
        _hover={props.isActive ? undefined : { bg: "gray.100" }}
      >
        <Text textAlign="center">{props.value}</Text>
      </Box>
    );
  }
);

export default Clock;
