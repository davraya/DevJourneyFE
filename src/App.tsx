import React from 'react';
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { ChakraProvider, Box, HStack, Button, Spacer } from "@chakra-ui/react";
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

import theme from './theme';
import HomeScreen from './screens/HomeScreen';
import InterviewsScreen from './screens/InterviewsScreen';
import LoginScreen from './screens/LoginScreen';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from "./redux/appSlice";
import { RootState } from './redux/store';
import LinkC from "./components/LinkC";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const jwtToken = useSelector((state: RootState) => state.app.jwtToken);
  if (!jwtToken) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppInner() {
  const dispatch = useDispatch();
  const jwtToken = useSelector((state: RootState) => state.app.jwtToken);
  return (
    <Router>
      <Box bg="gray.900" color="white" minHeight="100vh" display="flex" flexDirection="column">
        <HStack px={4} py={2} borderBottom="1px" borderColor="gray.700" alignItems="center">
          <Box fontWeight="bold">Dev Journey</Box>
          <Spacer />
          {jwtToken && (
            <HStack spacing={6}>
              <LinkC to="/home">Journal</LinkC>
              <LinkC to="/interviews">Interviews</LinkC>
            </HStack>
          )}
          <Spacer />
          {jwtToken && (
            <Button size="sm" onClick={() => dispatch(logout())}>Logout</Button>
          )}
        </HStack>
        <Box flex="1" overflowY="hidden">
          <Routes>
            <Route path="/" element={<LoginScreen />} />
            <Route path="/home" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
            <Route path="/interviews" element={<ProtectedRoute><InterviewsScreen /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to={jwtToken ? "/home" : "/"} replace />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <AppInner />
      </ChakraProvider>
    </Provider>
  );
}

export default App;
