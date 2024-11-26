import React, {useEffect, useState} from 'react';
import { Box, VStack, Spinner, Button, HStack } from '@chakra-ui/react';
import LinkC from '../components/LinkC';
import {fetchUserWeeklyGoals} from '../api/api';
import { WeeklyGoalsResponse } from '../types/WeeklyGoalsResponse';
import  GoalStack from '../components/GoalStack';
import Journal from '../components/Journal';
import { CalendarComponent } from '../components/Calendar';


const HomeScreen = () => {

  const userId = '67070e23eb54589c5995d33e'; // Hardcoded user ID

  const [goalMetrics, setGoalMetrics] = useState<WeeklyGoalsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchGoalMetrics = async () => {
      try {
        const data = await fetchUserWeeklyGoals(userId);
        setGoalMetrics(data);
      } catch (err) {
        console.error('Error fetching weekly goals:', err);
        setError((err as Error).message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchGoalMetrics();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }


  return (
    <>
      <HStack>
        <CalendarComponent />
        <Box display="flex" flexDirection="column"  alignItems="center" paddingTop="40px" maxW="800px">
          {goalMetrics ? (
            <GoalStack goals={goalMetrics} />
          ): 
          <Button onClick={() => console.log('No goal metrics')}>No goal metrics</Button>}
          
          <Journal />
        </Box>

        
      </HStack>
      
      <LinkC to="/about">Go to About</LinkC>

      
      
    </>
    
  );
};

export default HomeScreen;
