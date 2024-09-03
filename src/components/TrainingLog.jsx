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
  const [weeklyDistances, setWeeklyDistances] = useState({});


  const calculateWeeklyDistances = (events) => {
    const weeklyDistances = {};

    events.forEach((event) => {
      const weekStart = moment(event.start).startOf("week").format("YYYY-MM-DD");
      if (!weeklyDistances[weekStart]) {
        weeklyDistances[weekStart] = 0;
      }
      weeklyDistances[weekStart] += event.distance;
    });

    setWeeklyDistances(weeklyDistances);
  };

  const getPrevPostMonths = (date) => {
    let months = {
      prevMonth: date.getMonth(),
      currMonth: date.getMonth() + 1,
      postMonth: date.getMonth() + 2
    }
    let years = {
      prevMonthYear: date.getFullYear(),
      currMonthYear: date.getFullYear(),
      postMonthYear: date.getFullYear()
    }

    if (date.getMonth() == 0) {
      //January Edge Case
      months.prevMonth = 12;
      years.prevMonthYear -= 1;
    } 

    if (date.getMonth() == 11) {
      //Dec Edge Case
      months.postMonth = 1;
      years.postMonthYear += 1;
    } 
    
    const paddedMonths = Object.values(months).map((value) => {
      return(String(value).padStart(2,'0'));
    })

    const stringYears = Object.values(years).map((value) => {
      return(value.toString());
    })


    return {months:paddedMonths,years:stringYears};
  }

  const getCalendarEvents = async (year,month) => {
    const activities = await fetchActivitiesForMonth(year, month);
    
    const calendarEvents = activities.map((activity) => (
      {
      id: activity.id,
      description: activity.sport_type,
      title: `${activity.name} - ${(activity.distance / 1000).toFixed(2)}km` ,
      start: new Date(activity.start_date),
      end: new Date(activity.start_date).setSeconds(new Date(activity.start_date).getSeconds() + activity.elapsed_time),
      allDay: false,
      distance: activity.distance
    }));
    return calendarEvents;
  }


  const handleMonthChange = useCallback(
    async (date) => {
      let months = getPrevPostMonths(date).months;
      let years = getPrevPostMonths(date).years;
      const calendarEvents = await getCalendarEvents(years[1],months[1]);
      const calendarEvents1 = await getCalendarEvents(years[0],months[0]);
      const calendarEvents2 = await getCalendarEvents(years[2],months[2]);

      const prevMonthEvents = calendarEvents1.slice(calendarEvents1.length * 0.75,calendarEvents1.length);
      const postMonthEvents = calendarEvents2.slice(0,calendarEvents2.length * 0.25);

      setEvents([...calendarEvents,...calendarEvents1, ...calendarEvents2]);
      calculateWeeklyDistances([...prevMonthEvents,...calendarEvents, ...postMonthEvents]);
    },[]);

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
          onSelectEvent={(event) => alert(`Activity: ${event.distance}`)}
        />

      <h3>Weekly Distances</h3>
      <ul>
        {Object.entries(weeklyDistances).map(([weekStart, distance]) => (
          <li key={weekStart}>
            Week starting {weekStart}: {(distance / 1000).toFixed(2)} km
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
};

export default TrainingLog;