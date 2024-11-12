import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Text, 
  Card, 
  CardHeader, 
  CardBody, 
  Box, 
  VStack, 
  StackDivider, 
  Stack,
  Heading 
} from '@chakra-ui/react';
import ProgressCircle from '../components/ProgressCircle';
import TabsC from '../components/TabsC';
import {fetchRoot} from '../api/api';



const HomeScreen = () => {

  const [data, setData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchRoot();
        setData(result.name);
      } catch (err) {
        console.log(err);
      } finally {
        
      }
    };
    
    console.log('fetching data');
    loadData();
  }, []);



  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">

      <VStack spacing="8" align="center">
        <TabsC />

        <ProgressCircle value={50} label="5/10" />

        <Card width="90%" maxWidth="400px" boxShadow="lg" p="4">
          <CardHeader>
            <Heading size="md" textAlign="center">{data}</Heading>
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

        <Link to="/about">Go to About</Link>
      </VStack>
    </Box>
  );
};

export default HomeScreen;
