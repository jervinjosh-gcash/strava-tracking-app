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



const TrainingLog = (user) => {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weeklyDistances, setWeeklyDistances] = useState({});


  const calculateWeeklyDistances = (event,date) => {
    console.log("getting weekly distance");
    const weeklyDistances = {};

    const startOfMonth = moment(date).startOf('month');
    const endOfMonth = moment(date).endOf('month');

    const endOfPrevMonth = moment(date).subtract(1, 'months').endOf('month');
    const lastWeekOfPrevMonth = endOfPrevMonth.startOf('week');


    const startOfNextMonth = moment(date).add(1, 'months').startOf('month');
    const firstWeekOfNextMonth = startOfNextMonth.startOf('week');

    // Filter events based on the weeks of interest
    const filteredEvents = event.filter((event) => {
      const eventDate = moment(event.start);
      const eventWeekStart = moment(eventDate).startOf('week');

      const withinCurrentMonth =
        eventWeekStart.isSameOrAfter(startOfMonth) && eventWeekStart.isSameOrBefore(endOfMonth);

      const isLastWeekOfPrevMonth = eventWeekStart.isSame(lastWeekOfPrevMonth, 'week');

      const isFirstWeekOfNextMonth = eventWeekStart.isSame(firstWeekOfNextMonth, 'week');

      return withinCurrentMonth || isLastWeekOfPrevMonth || isFirstWeekOfNextMonth;
    });


    filteredEvents.forEach((event) => {
      const weekStart = moment(event.start).startOf('week').format('YYYY-MM-DD');
      if (!weeklyDistances[weekStart]) {
        weeklyDistances[weekStart] = 0;
      }
      weeklyDistances[weekStart] += event.distance;
    });

    setWeeklyDistances(weeklyDistances);
  };

  const getPrevNextMonths = (date) => {
    let months = {
      prevMonth: date.getMonth(),
      currMonth: date.getMonth() + 1,
      nextMonth: date.getMonth() + 2
    }
    let years = {
      prevMonthYear: date.getFullYear(),
      currMonthYear: date.getFullYear(),
      nextMonthYear: date.getFullYear()
    }

    if (date.getMonth() == 0) {
      //January Edge Case
      months.prevMonth = 12;
      years.prevMonthYear -= 1;
    } 

    if (date.getMonth() == 11) {
      //Dec Edge Case
      months.nextMonth = 1;
      years.nextMonthYear += 1;
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
      if (!user) {
        console.log("logging-out");
        return;
      }
      let months = getPrevNextMonths(date).months;
      let years = getPrevNextMonths(date).years;
      const calendarEvents = await getCalendarEvents(years[1],months[1]);
      const calendarEvents1 = await getCalendarEvents(years[0],months[0]);
      const calendarEvents2 = await getCalendarEvents(years[2],months[2]);

      console.log("Getting events");
      setEvents([...calendarEvents,...calendarEvents1, ...calendarEvents2]);
      calculateWeeklyDistances([...calendarEvents1,...calendarEvents, ...calendarEvents2],date);
    },[user]);

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
        backgroundColor = "#ffebee";
        break;
      case "ride":
        backgroundColor = "#fff9c4";
        break;
      case "swim":
        backgroundColor = "#e0f7fa";
        break;
      default:
        backgroundColor = "#efebe9"; 
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