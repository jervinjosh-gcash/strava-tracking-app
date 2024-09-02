import React, { useEffect, useState, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { fetchActivitiesForMonth } from "../services/firebaseService";
import "../styles/CalendarStyles.css";
// import { fetchActivities, fetchAndUploadAthleteActivities } from "../services/stravaService";

const localizer = momentLocalizer(moment);

const TrainingLog = () => {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());



  const handleMonthChange = useCallback(
    async (date) => {
      const year = date.getFullYear().toString();
      const month = String(date.getMonth() + 1).padStart(2, '0');

      const activities = await fetchActivitiesForMonth(year, month);

      const calendarEvents = activities.map((activity) => (
        {
        id: activity.id,
        description: activity.sport_type,
        title: `${activity.name} - ${(activity.distance / 1000).toFixed(2)}km` ,
        start: new Date(activity.start_date),
        end: new Date(activity.start_date).setSeconds(new Date(activity.start_date).getSeconds() + activity.elapsed_time),
        allDay: false,
      }));

      setEvents(calendarEvents);
    },
    []
  );

  useEffect(() => {
    handleMonthChange(currentDate);
  }, [handleMonthChange, currentDate]);


  const handleNavigate = (date) => {
    setCurrentDate(date);
    handleMonthChange(date);
  };

  return (
    <div>
      <h2>Training Log</h2>
      <div style={{ height: "600px" }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ 
            height: "100%",
            minWidth: "1000px",
           }}
          onNavigate={handleNavigate}
          defaultView="month"
        />
      </div>
    </div>
  );
};

export default TrainingLog;