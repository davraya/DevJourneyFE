import React from 'react';
import { Box, Heading, Text } from "@chakra-ui/react";
import { Link } from 'react-router-dom';

const AboutScreen = () => {
  return (
    <Box textAlign="center">
      <Heading>About Screen</Heading>
      <Text>This is the About Screen.</Text>
      <Link to="/">Go to Home</Link>
    </Box>
  );
};

export default AboutScreen;
