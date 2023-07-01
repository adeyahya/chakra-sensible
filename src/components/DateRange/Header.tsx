import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
} from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";

type Props = {
  children?: React.ReactNode;
  onPrevYear: () => void;
  onNextYear: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};
const Header = ({
  children,
  onPrevYear,
  onNextYear,
  onPrevMonth,
  onNextMonth,
}: Props) => {
  return (
    <Flex pb="3" w="full" flexDir="row" align="center">
      <Flex flexDir="row" align="center">
        <IconButton
          onClick={onPrevYear}
          size="xs"
          variant="ghost"
          aria-label="prev-year"
          icon={<ArrowLeftIcon color="gray.500" w="2" h="2" />}
        />
        <IconButton
          onClick={onPrevMonth}
          size="xs"
          variant="ghost"
          aria-label="prev-month"
          icon={<ChevronLeftIcon color="gray.500" />}
        />
      </Flex>
      {children}
      <Flex>
        <IconButton
          onClick={onNextMonth}
          size="xs"
          variant="ghost"
          aria-label="next-month"
          icon={<ChevronRightIcon color="gray.500" />}
        />
        <IconButton
          onClick={onNextYear}
          size="xs"
          variant="ghost"
          aria-label="next-year"
          icon={<ArrowRightIcon color="gray.500" w="2" h="2" />}
        />
      </Flex>
    </Flex>
  );
};

export default Header;
