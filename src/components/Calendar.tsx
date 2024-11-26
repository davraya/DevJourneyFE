import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Box } from "@chakra-ui/react";

export const CalendarComponent = () => {
  // Get today's date
  const today = new Date();

  return (
    <Box
      sx={{
        ".react-calendar": {
          backgroundColor: "gray.800", // Dark background
          color: "white", // Text color
          borderRadius: "8px",
          padding: "16px",
          boxShadow: "lg",
        },
        ".react-calendar__navigation button": {
          color: "white",
          background: "transparent",
          border: "none",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
        },
        ".react-calendar__tile": {
          background: "transparent",
          color: "white",
          borderRadius: "4px",
          transition: "all 0.2s ease-in-out",
        },
        ".react-calendar__tile--now": {
          background: "blue.500", // Highlight for today
          color: "white",
          fontWeight: "bold",
        },
        ".react-calendar__tile--active": {
          background: "blue.600", // Highlight for selected day
          color: "white",
          fontWeight: "bold",
        },
        ".react-calendar__tile:hover": {
          background: "blue.700", // Hover effect
          color: "white",
        },
      }}
    >
      <Calendar value={today} />
    </Box>
  );
};
