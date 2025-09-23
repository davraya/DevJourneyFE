import React, {useEffect, useState} from 'react';
import { Box, VStack } from '@chakra-ui/react';
// import LinkC from '../components/LinkC';
import Journal from '../components/Journal';
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { JournalResponse } from '../types/JournalResponse';
import { fetchJournal, addEntry } from '../api/journals';


const HomeScreen = () => {
  const jwtToken = useSelector((state: RootState) => state.app.jwtToken);
  const userId =  useSelector((state: RootState) => state.user.userId);


  
  const [journal, setJournal] = useState<JournalResponse | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);


  // useEffect(() => {
  //   const runAsync = async () => {
  //     if (!jwtToken) return;

  //     const goals = await fetchUserWeeklyGoals(userId, jwtToken);

  //     if (!goals) {
  //       // No goals found, create new
  //       const newGoals = await createWeeklyGoals(userId, jwtToken);
  //       setGoalMetrics(newGoals);
  //     } else {
  //       setGoalMetrics(goals);
  //     }

  //     setLoading(false);
  //   };

  //   runAsync();
  // }, [dispatch]);

   useEffect(() => {
    const runAsync = async () => {
      if (!jwtToken) return;

      const userJournal = await fetchJournal(userId, jwtToken);

      setJournal(userJournal);
    };

    runAsync();
  }, [jwtToken, userId]);

  const handleAddEntry = () => {
  if (!jwtToken) {
    console.error("JWT token missing. User may not be logged in.");
    return;
  }

  const now = new Date();
  const tzOffsetMin = now.getTimezoneOffset();
  const sign = tzOffsetMin > 0 ? "-" : "+";
  const pad = (n: number) => `${Math.floor(Math.abs(n))}`.padStart(2, '0');
  const hours = pad(tzOffsetMin / 60);
  const minutes = pad(tzOffsetMin % 60);
  const isoLocal = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${String(now.getMilliseconds()).padStart(3,'0')}${sign}${hours}:${minutes}`;
  addEntry(userId, jwtToken, "", isoLocal, "Untitled")
    .then((newEntry) => {
      console.log("New entry added:", newEntry);
      setSelectedEntryId(newEntry.id);
      // Refresh the journal to update the whole page state
      return fetchJournal(userId, jwtToken);
    })
    .then((updatedJournal) => {
      if (updatedJournal) {
        setJournal(updatedJournal);
      }
    })
    .catch((error) => {
      console.error("Error adding new entry:", error);
    });
};




  // if (loading) {
  //   return (
  //     <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
  //       <Spinner size="xl" />
  //     </Box>
  //   );
  // }

  return (
    <VStack spacing={2} alignSelf="stretch" width="100%" height="100vh" overflow="hidden">
      <Box width="100%" pl={{ base: 4, md: 6 }} pr={{ base: 4, md: 6 }} height="100%">
        {/* <CalendarComponent /> */}
        {/* <Box display="flex" flexDirection="column"  alignItems="center" paddingTop="40px" maxW="800px">
          {goalMetrics ? (
            <GoalStack goals={goalMetrics} />
          ): 
          <Button onClick={() => console.log('No goal metrics')}>No goal metrics</Button>}

          
        </Box> */}
        <Journal journal={journal} selectedEntryId={selectedEntryId} onAddEntry={handleAddEntry} />        
      </Box>
       
      
      {/* <LinkC to="/about">Go to About</LinkC> */}

      
      
    </VStack>
    
  );
};

export default HomeScreen;
