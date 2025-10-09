import React, {useEffect, useState} from 'react';
import Journal from '../components/Journal';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { JournalResponse } from '../types/JournalResponse';
import { fetchJournal, addEntry } from '../api/journals';
import { setJournal as setJournalStore } from "../redux/journalSlice";
import "./HomeScreen.css";


const HomeScreen = () => {
  const dispatch = useDispatch();
  const jwtToken = useSelector((state: RootState) => state.app.jwtToken);
  const userId =  useSelector((state: RootState) => state.user.userId);
  const cachedJournal = useSelector((state: RootState) => state.journal.journal);


  
  const [journal, setJournal] = useState<JournalResponse | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{title: string, status: 'success' | 'error'} | null>(null);

  const showToast = (title: string, status: 'success' | 'error') => {
    setToastMessage({ title, status });
    setTimeout(() => setToastMessage(null), 3000);
  };

   useEffect(() => {
   const runAsync = async () => {
     if (!jwtToken || !userId) return;
     if (cachedJournal) {
       setJournal(cachedJournal);
       return;
     }
     const userJournal = await fetchJournal(userId, jwtToken);
     setJournal(userJournal);
     dispatch(setJournalStore(userJournal));
   };
   runAsync();
 }, [jwtToken, userId, cachedJournal, dispatch]);

 // Update local journal state when Redux store changes
 useEffect(() => {
   if (cachedJournal) {
     setJournal(cachedJournal);
   }
 }, [cachedJournal]);

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
      showToast("Journal entry added", "success");
      return fetchJournal(userId, jwtToken);
    })
    .then((updatedJournal) => {
      if (updatedJournal) {
        setJournal(updatedJournal);
        dispatch(setJournalStore(updatedJournal));
      }
    })
    .catch((error) => {
      console.error("Error adding new entry:", error);
      showToast("Failed to add entry", "error");
    });
};




  return (
    <div className="home-screen">
      <Journal journal={journal} selectedEntryId={selectedEntryId} onAddEntry={handleAddEntry} />
      
      {/* Toast */}
      {toastMessage && (
        <div className="toast-container">
          <div className={`toast ${toastMessage.status}`}>
            {toastMessage.title}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
