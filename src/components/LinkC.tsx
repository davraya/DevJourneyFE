import React from "react";
import { Link as ChakraLink } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

interface LinkCProps {
  to: string;
  children: React.ReactNode;
}

const LinkC = ({ to, children }: LinkCProps) => {
  return (
    <ChakraLink as={RouterLink} to={to} color="teal.500" fontWeight="bold">
      {children}
    </ChakraLink>
  );
};

export default LinkC;
