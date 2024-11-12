import React from 'react';
import { ChakraProvider, Box } from "@chakra-ui/react";
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import theme from './theme';
import HomeScreen from './screens/HomeScreen';
import AboutScreen from './screens/AboutScreen';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Box bg="gray.900" color="white" minHeight="100vh">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/about" element={<AboutScreen />} />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;
