import React, { useEffect, useState, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { fetchActivitiesForMonth } from "../services/firebaseService";
import "../styles/CalendarStyles.css";
import "../styles/TrainingLog.css"
// import { fetchActivities, fetchAndUploadAthleteActivities } from "../services/stravaService";
import "react-big-calendar/lib/css/react-big-calendar.css";


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
      title: `${activity.type} - ${(activity.distance / 1000).toFixed(2)}km` ,
      start: new Date(activity.start_date),
      end: new Date(activity.start_date).setSeconds(new Date(activity.start_date).getSeconds() + activity.elapsed_time),
      name: activity.name,
      allDay: false,
      distance: activity.distance,
      type: activity.type,
      elapsed_time: (activity.elapsed_time / 3600).toFixed(2),
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

  // Function to customize event styles
  const eventStyleGetter = (event) => {
    let backgroundColor = "#efebe9"; // Default color for "other" type

    switch (event.type.toLowerCase()) {
      case "run":
        backgroundColor = "#ffebee"; // Light Red
        break;
      case "ride":
        backgroundColor = "#fff9c4"; // Light Yellow
        break;
      case "swim":
        backgroundColor = "#e0f7fa"; // Light Blue
        break;
      default:
        backgroundColor = "#efebe9"; // Light Brown
    }

    return {
      style: {
        backgroundColor,
        borderLeft: `5px solid ${backgroundColor}`,
        color: "#333",
        borderRadius: "4px",
        padding: "2px 5px",
      },
    };
  };

  

  return (
    <div className="training-log-page">
      <h2>Training Log</h2>
      <div className="calendar-box">
        
        <Calendar
          localizer={localizer}
          events={events.map(event => ({
            ...event,
            className: `rbc-event ${event.type.toLowerCase()}`
          }))}
          startAccessor="start"
          endAccessor="end"
          onNavigate={handleNavigate}
          defaultView="month"
          onSelectEvent={(event) => alert(`${event.name} - ${event.elapsed_time}hrs`)}
          eventPropGetter={eventStyleGetter}
        />

      </div>
      <div className="weekly-volume-box">
        <div className="weekly-volume-header">
          <h3>Weekly Volume</h3>
        </div>
        {Object.entries(weeklyDistances).map(([weekStart, distance]) => (
          <div className="weekly-volume" key={weekStart}>
            <div className="week-start">
              Week starting {weekStart}: 
            </div>
            <div className="week-mileage">
              {(distance / 1000).toFixed(2)} km
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainingLog;