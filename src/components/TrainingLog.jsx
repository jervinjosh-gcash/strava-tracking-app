import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { fetchStravaCredentials } from "../services/firebaseService";
import { fetchActivities } from "../services/stravaService";

const localizer = momentLocalizer(moment);

const TrainingLog = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchActivitiesFromAPI = async () => {
      try {
        const credentials = await fetchStravaCredentials();
        if (credentials) {
          const data = await fetchActivities(credentials.stravaAccessToken);
          const formattedEvents = data.map(activity => ({
            title: activity.name,
            start: new Date(activity.start_date),
            end: new Date(activity.start_date),
          }));
          setEvents(formattedEvents);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    fetchActivitiesFromAPI();
  }, []);

  return (
    <div>
      <h2>Training Log</h2>
      <div style={{ height: "600px" }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
        />
      </div>
    </div>
  );
};

export default TrainingLog;