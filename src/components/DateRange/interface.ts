export type BaseProps = {
  value?: (Date | null)[];
  defaultValue?: (Date | null)[];
  onChange?: (d: (Date | null)[]) => void;
  min?: Date;
  max?: Date;
  colorScheme?: string;
};
