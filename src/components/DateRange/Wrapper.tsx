import { useContext, memo } from "react";
import { AppContext } from "./Context";
import { useSnapshot } from "valtio";
import {
  ArrowForwardIcon,
  CalendarIcon,
  SmallCloseIcon,
} from "@chakra-ui/icons";
import {
  Popover,
  PopoverTrigger,
  HStack,
  IconButton,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Box,
  BoxProps,
} from "@chakra-ui/react";
import InputDate from "./InputDate";

const Wrapper = memo(({ children, ...rest }: BoxProps) => {
  const state = useContext(AppContext);
  const snap = useSnapshot(state);
  const isOpen = snap.focused !== null;

  const handleClear = () => {
    state.selection.start = null;
    state.selection.end = null;
  };

  return (
    <>
      {snap.focused && (
        <Box
          onClick={() => (state.focused = null)}
          w="100vw"
          h="100vh"
          position="fixed"
          top="0"
          left="0"
          zIndex={998}
        />
      )}
      <Popover isLazy isOpen={isOpen}>
        <Box
          onClick={(e) => {
            e.stopPropagation();
          }}
          w="full"
          position="relative"
          zIndex={isOpen ? 999 : 0}
        >
          <PopoverTrigger>
            <HStack
              w="full"
              borderRadius="md"
              borderColor="gray.200"
              borderStyle="solid"
              borderWidth="1px"
              {...rest}
            >
              <InputDate name="start" />
              <ArrowForwardIcon color="gray.300" />
              <InputDate name="end" />
              <Box position="relative" mr="1" role="group">
                <CalendarIcon
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  color="gray.500"
                  _groupHover={{ display: "none" }}
                />
                <IconButton
                  opacity={0.2}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  _hover={{ opacity: 1 }}
                  size="xs"
                  variant="unstyled"
                  aria-label="clear"
                  icon={<SmallCloseIcon color="gray.600" />}
                />
              </Box>
            </HStack>
          </PopoverTrigger>
          <PopoverContent w="full">
            <PopoverArrow />
            <PopoverBody>{children}</PopoverBody>
          </PopoverContent>
        </Box>
      </Popover>
    </>
  );
});

export default Wrapper;
