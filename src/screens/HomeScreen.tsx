import React, {useEffect, useState} from 'react';
import { Box, Spinner, Button, HStack, VStack } from '@chakra-ui/react';
import LinkC from '../components/LinkC';
import {fetchUserWeeklyGoals, createWeeklyGoals} from '../api/goals';
import { WeeklyGoalsResponse } from '../types/WeeklyGoalsResponse';
import  GoalStack from '../components/GoalStack';
import Journal from '../components/Journal';
import { CalendarComponent } from '../components/Calendar';
import { WeeklyJournalResponse } from '../types/WeeklyJournalResponse';

import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { fetchJournal, saveJournal, updateEntry } from "../redux/journalSlice";


const HomeScreen = () => {
  const jwtToken = useSelector((state: RootState) => state.app.jwtToken);
  const userId =  useSelector((state: RootState) => state.user.userId);


  const dispatch = useDispatch<AppDispatch>();
  const { journal, isSaving, error } = useSelector((state: RootState) => state.journal);

  const [goalMetrics, setGoalMetrics] = useState<WeeklyGoalsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  console.log('jwtToken:', jwtToken);
  console.log('userId:', userId);

  useEffect(() => {
    const fetchGoalMetrics = async () => {
      try {
        if (!jwtToken) {
          throw new Error("JWT token is missing");
        }
        const data = await fetchUserWeeklyGoals(userId, jwtToken);
        setGoalMetrics(data);
      } catch (err) {
        console.error('Error fetching weekly goals:', err);
        // setError((err as Error).message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    const createGoalMetrics = async () => {
      try {
        if (!jwtToken) {
          throw new Error("JWT token is missing");
        }
        const data = await createWeeklyGoals(userId, jwtToken);
        setGoalMetrics(data);
      } catch (err) {
        console.error('Error fetching weekly goals:', err);
        // setError((err as Error).message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGoalMetrics();
    if(!goalMetrics) {
      createGoalMetrics();
    }
    // dispatch(fetchJournal(userId));
  }, [dispatch]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <VStack spacing={100}>
      <HStack justify="center" spacing={38}>
        <CalendarComponent />
        <Box display="flex" flexDirection="column"  alignItems="center" paddingTop="40px" maxW="800px">
          {goalMetrics ? (
            <GoalStack goals={goalMetrics} />
          ): 
          <Button onClick={() => console.log('No goal metrics')}>No goal metrics</Button>}

          {journal? (
            <Journal journal={journal} />
          ):
          <Button onClick={() => console.log('No journal')}>No journal</Button>
            }
        </Box>

        
      </HStack>
      
      <LinkC to="/about">Go to About</LinkC>

      
      
    </VStack>
    
  );
};

export default HomeScreen;
