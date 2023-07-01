import { ChakraProvider, Container, Stack } from "@chakra-ui/react";
import { DateRange, DateTimeRange } from ".";

const App = () => {
  return (
    <Container minH="100vh">
      <Stack>
        <DateRange colorScheme="pink" />
        <DateTimeRange />
      </Stack>
    </Container>
  );
};

const Wrapper = () => {
  return (
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
};

export default Wrapper;
