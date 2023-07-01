import endOfDay from "date-fns/endOfDay";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfDay from "date-fns/startOfDay";

export const isDayEq = (d1: Date | null, d2: Date | null) => {
  if (!d1) return false;
  if (!d2) return false;
  return format(d1, "dd/MM/yyyy") === format(d2, "dd/MM/yyyy");
};

export const safeParse = (dateString: string, f: string): Date | null => {
  try {
    const d = parse(dateString, f, new Date());
    if (isNaN(d.getTime())) throw {};
    return d;
  } catch (error) {
    return null;
  }
};

export const inRange = (d: Date, min: Date, max: Date) => {
  const targetTime = d.getTime();
  const minTime = startOfDay(min).getTime();
  const maxTime = endOfDay(max).getTime();
  return targetTime < maxTime && targetTime > minTime;
};
