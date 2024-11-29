import React, { useState } from "react";
import {
  CircularProgress,
  CircularProgressLabel,
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  useToast,
} from "@chakra-ui/react";
import { updateActual } from "../api/api"; // Import the updateActual function

interface ProgressCircleProps {
  current: number;
  total: number;
  label: string;
  goalType: string;
  userId: string;
  goalId: string;
}

const ProgressCircle = ({ current, total, label, goalType, userId, goalId }: ProgressCircleProps) => {
  const [progress, setProgress] = useState({ current, total });
  const toast = useToast();

  const updateProgress = async (increment: number) => {
    try {
      const response = await updateActual(userId, goalId, goalType, increment);
      console.log("Increment response:", response);
      if (response.success) {
        setProgress({ ...progress, current: response.updatedValue! });
      } else {
        toast({
          title: "Error",
          description: response.message,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right"
        });
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right"

      });
    }
  };

  const handleIncrease = () => {
    updateProgress(1);
  };

  const handleDecrease = () => {
    updateProgress(-1);
  };

  return (
    <VStack spacing="1">
      <CircularProgress
        value={(progress.current / progress.total) * 100}
        size="90px"
        color="blue.500"
        thickness="8px"
      >
        <CircularProgressLabel>
          <Box textAlign="center" fontSize="md" fontWeight="bold">
            <HStack spacing="1" justifyContent="center" alignItems="center">
              <Input
                width="25px"
                onChange={(e) =>
                  setProgress({ ...progress, current: Math.min(+e.target.value, progress.total) })
                }
                textAlign="center"
                variant="unstyled"
                border="1px solid"
                borderColor="gray.300"
                value={progress.current}
              />
              <Text fontSize="15px">/{progress.total}</Text>
            </HStack>
          </Box>
        </CircularProgressLabel>
      </CircularProgress>

      <Box textAlign="center" fontSize="md">
        <Text>{label}</Text>
      </Box>             

      <HStack spacing="4">
        <Button size="xs" onClick={handleDecrease} fontSize={20} width="30px" height="30px">
          -
        </Button>
        <Button size="xs" onClick={handleIncrease} fontSize={20} width="30px" height="30px">
          +
        </Button>
      </HStack>
    </VStack>
  );
};

export default ProgressCircle;
