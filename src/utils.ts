import { format } from "date-fns";

export const isDayEq = (d1: Date | null, d2: Date | null) => {
  if (!d1) return false;
  if (!d2) return false;
  return format(d1, "dd/MM/yyyy") === format(d2, "dd/MM/yyyy");
};
