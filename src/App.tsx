import React from 'react';
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { ChakraProvider, Box } from "@chakra-ui/react";
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
// import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

import theme from './theme';
import HomeScreen from './screens/HomeScreen';
import AboutScreen from './screens/AboutScreen';
import LoginScreen from './screens/LoginScreen';
import { useDispatch } from 'react-redux';
import { login } from "./redux/appSlice";


function App() {
  // const dispatch = useDispatch();

//   const handleLogin = () => {
//     dispatch(login());
// };

  return (
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <Router>
          <Box bg="gray.900" color="white" minHeight="100vh">
            <Routes>
              <Route path="/" element={<LoginScreen />} />
              <Route path="/home" element={<HomeScreen />} />
              <Route path="/about" element={<AboutScreen />} />
            </Routes>
          </Box>
        </Router>
      </ChakraProvider>
    </Provider>
  );
}

export default App;
