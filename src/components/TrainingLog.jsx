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
      const month1 = String(date.getMonth() ).padStart(2, '0');
      const month2 = String(date.getMonth() + 2).padStart(2, '0');

      const activities2 = await fetchActivitiesForMonth(year, month2);
      const activities1 = await fetchActivitiesForMonth(year, month1);
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

      const calendarEvents1 = activities1.map((activity) => (
        {
        id: activity.id,
        description: activity.sport_type,
        title: `${activity.name} - ${(activity.distance / 1000).toFixed(2)}km` ,
        start: new Date(activity.start_date),
        end: new Date(activity.start_date).setSeconds(new Date(activity.start_date).getSeconds() + activity.elapsed_time),
        allDay: false,
      }));

      const calendarEvents2 = activities2.map((activity) => (
        {
        id: activity.id,
        description: activity.sport_type,
        title: `${activity.name} - ${(activity.distance / 1000).toFixed(2)}km` ,
        start: new Date(activity.start_date),
        end: new Date(activity.start_date).setSeconds(new Date(activity.start_date).getSeconds() + activity.elapsed_time),
        allDay: false,
      }));
      setEvents([...calendarEvents,...calendarEvents1, ...calendarEvents2]);
      
    },
    []
  );

  useEffect(() => {
    handleMonthChange(currentDate);
  }, [currentDate]);


  const handleNavigate = (date) => {
    setCurrentDate(date);
    handleMonthChange(date);
  };

  return (
    <div>
      <h2>Training Log</h2>
      <div>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ 
            height: "1000px",
            width: "1500px",
           }}
          onNavigate={handleNavigate}
          defaultView="month"
        />
      </div>
    </div>
  );
};

export default TrainingLog;