import React from "react";
import { CircularProgress, CircularProgressLabel } from "@chakra-ui/react";

interface ProgressCircleProps {
  value: number;
  label: string;
}

const ProgressCircle = ({ value, label }: ProgressCircleProps) => {
  
  return (
    <CircularProgress value={value} size="120px">
      <CircularProgressLabel>{label}</CircularProgressLabel>
    </CircularProgress>
  );
};

export default ProgressCircle;
