import { memo } from "react";
import { HStack, Box } from "@chakra-ui/react";

const Weeks = memo(() => (
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
));

export default Weeks;
