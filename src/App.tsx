import { ChakraProvider, Container } from "@chakra-ui/react";
import { DateRange } from ".";

const App = () => {
  return (
    <Container minH="100vh">
      <DateRange />
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
