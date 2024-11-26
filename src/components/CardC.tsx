import React from 'react';
import {
  Text,
  Card,
  CardHeader,
  CardBody,
  Box,
  StackDivider,
  Stack,
  Heading
} from '@chakra-ui/react';

const CardC = () => {
  return (
    <Card width="90%" maxWidth="400px" boxShadow="lg" p="4">
      <CardHeader>
        <Heading size="md" textAlign="center">Your Dashboard</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase">
              Summary
            </Heading>
            <Text pt="2" fontSize="sm">
              View a summary of all your clients over the last month.
            </Text>
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase">
              Analysis
            </Heading>
            <Text pt="2" fontSize="sm">
              See a detailed analysis of all your business clients.
            </Text>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default CardC;
