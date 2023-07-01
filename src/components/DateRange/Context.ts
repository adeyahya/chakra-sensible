import { createContext } from "react";

export type Value = Date | null;
export type Focus = "start" | "end" | null;
export type Selection = {
  start: Value;
  end: Value;
};
export interface AppContextType {
  focused: Focus;
  selection: Selection;
  viewing: Date;
  isHovered: boolean;
  hovering: Date | null;
  colorScheme: string;
}

export const AppContext = createContext<AppContextType>({
  focused: null,
  hovering: null,
  viewing: new Date(),
  selection: { start: null, end: null },
  isHovered: false,
  colorScheme: "blue",
});
