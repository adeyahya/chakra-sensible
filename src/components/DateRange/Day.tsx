import { memo, useContext, useMemo } from "react";
import { useSnapshot } from "valtio";
import { format } from "date-fns";
import { Box } from "@chakra-ui/react";

import { AppContext } from "./Context";
import { isDayEq, inRange } from "../../utils";
import { inScope, inHoverRange, onSelect } from "./utils";

const Day = memo(
  ({ day, segment }: { day: Date; segment: "start" | "end" }) => {
    const state = useContext(AppContext);
    const snap = useSnapshot(state);

    const handleHover = (d: Date) => {
      state.isHovered = true;
      state.hovering = d;
    };

    const handleLeave = () => {
      state.isHovered = false;
    };

    const isSelected = useMemo(
      () =>
        isDayEq(snap.selection.start, day) || isDayEq(snap.selection.end, day),
      [day, snap.selection.end, snap.selection.start]
    );

    const isInSelectionRange = useMemo(() => {
      if (!snap.selection.start || !snap.selection.end) return false;
      return inRange(day, snap.selection.start, snap.selection.end);
    }, [day, snap.selection.end, snap.selection.start]);

    const isInScope = inScope(segment)(day)(snap);

    const isToday = useMemo(() => {
      return format(day, "ddMMyy") === format(new Date(), "ddMMyy");
    }, [day]);

    const isDisabled = useMemo(() => {
      if (snap.max && day.getTime() > snap.max.getTime()) return true;
      if (snap.min && day.getTime() < snap.min.getTime()) return true;
      if (!snap.selection.start && !snap.selection.end) return false;
      if (snap.selection.start && snap.focused === "end") {
        return day.getTime() < snap.selection.start.getTime();
      }
      if (snap.selection.end && snap.focused === "start") {
        return day.getTime() > snap.selection.end.getTime();
      }
      return false;
    }, [day, snap.selection, snap.max, snap.min, snap.focused]);

    const bg = useMemo(() => {
      if (!isInScope) return undefined;
      if (isDisabled) return undefined;
      if (isSelected) return `${snap.colorScheme}.300`;
      if (snap.isHovered && inHoverRange(snap)(day))
        return `${snap.colorScheme}.100`;
      if (isInSelectionRange) return `${snap.colorScheme}.100`;
      return undefined;
    }, [day, isDisabled, isInScope, isInSelectionRange, isSelected, snap]);

    return (
      <Box
        flex={1}
        px={2}
        py={1}
        fontSize="sm"
        _hover={
          isInScope && !isSelected && !isDisabled
            ? { bg: "gray.100" }
            : undefined
        }
        cursor="pointer"
        textAlign="center"
        bg={bg}
        onMouseEnter={isInScope ? () => handleHover(day) : undefined}
        onMouseLeave={handleLeave}
        onClick={() => !isDisabled && onSelect(state)(snap)(day)}
        fontWeight={isToday ? "bold" : undefined}
        color={isDisabled ? "gray.300" : isInScope ? "gray.800" : "gray.300"}
      >
        {day.getDate()}
      </Box>
    );
  }
);

export default Day;
