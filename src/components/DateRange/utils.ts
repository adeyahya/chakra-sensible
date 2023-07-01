import startOfMonth from "date-fns/startOfMonth";
import addMonths from "date-fns/addMonths";
import endOfMonth from "date-fns/endOfMonth";

import { inRange } from "../../utils";
import { AppContextType } from "./Context";

export const inHoverRange = (snap: AppContextType) => (d: Date) => {
  if (!snap.hovering) return false;
  if (snap.selection.start && snap.focused === "end") {
    return inRange(d, snap.selection.start, snap.hovering);
  }
  if (snap.selection.end && snap.focused === "start") {
    return inRange(d, snap.hovering, snap.selection.end);
  }

  return false;
};

export const inScope =
  (segment: "start" | "end") => (d: Date) => (snap: AppContextType) => {
    const month =
      segment === "start" ? snap.viewing : addMonths(snap.viewing, 1);
    return inRange(d, startOfMonth(month), endOfMonth(month));
  };

export const onSelect =
  (state: AppContextType) => (snap: AppContextType) => (d: Date) => {
    if (snap.focused) {
      state.selection[snap.focused] = d;
    }
    if (snap.focused === "end") {
      if (snap.selection.start) {
        return (state.focused = null);
      }
      return (state.focused = "start");
    }
    if (snap.focused === "start") return (state.focused = "end");
    state.focused = "start";
  };
