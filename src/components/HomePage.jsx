import React, { useEffect, useState } from "react";
import { fetchStravaCredentials, fetchAthleteData, fetchAthleteStats, uploadTimeUpdated, fetchTimeUpdated } from "../services/firebaseService";
import "../styles/HomePage.css";
import { fetchAndUploadAthleteActivities, fetchAndUploadAthleteData, fetchAndUploadAthleteStats, fetchAndUploadAthleteActivitiesByDate } from "../services/stravaService";


const HomePage = () => {
  const [athleteData, setAthleteData] = useState(null);
  const [athleteStats, setAthleteStats] = useState(null);
  const [unixTime, setUnixTime] = useState(new Date());
  const [readableTime, setReadableTime] = useState(null);


  const fetchAndUpload = async () => {
    const credentials = await fetchStravaCredentials();
    const newUnixTime = Math.floor(Date.now() / 1000);
    const newTime = new Date();
    setUnixTime(newUnixTime);
    setReadableTime(newTime.toLocaleString());
    const fetchedTime = await fetchTimeUpdated();
    if (credentials) {
      fetchAndUploadAthleteData(credentials.stravaAccessToken);
      fetchAndUploadAthleteStats(credentials.stravaAccessToken,athleteData.id);
      fetchAndUploadAthleteActivitiesByDate(credentials.stravaAccessToken, fetchedTime.unix_time_updated);
      uploadTimeUpdated(readableTime,unixTime);
      
    }
  };

  const getAthleteInfo = async () => {
    try {
      const data = await fetchAthleteData();
      const stats = await fetchAthleteStats();

      setAthleteData(data);
      setAthleteStats(stats);
    } catch (error) {
      console.error("Error fetching athlete info:", error);
    }
  };

  useEffect(() => {


    getAthleteInfo();
  }, []);
  

  return (
    <div className="home-page">
      
      {athleteData ? (
        <div className="athlete-data">
          <div className="hero-page">



            <div className="hero-page-content">
              <div className="greeting-box">
              <div className="profile-pic-box">
              <img className="profile-pic" src={athleteData.profile_medium}></img>
            </div>
                <h2>Welcome {athleteData.firstname} {athleteData.lastname}</h2>
                <h3>Here's a summary of your recent activities.</h3>
                <h4>Data Last Updated: {readableTime}</h4>
              </div>

              <div className="recent-activity-box">
                <div className="recent-activity">
                  <div className="recent-activity-header">
                    <p>Swim</p>
                  </div>
                  <div className="recent-activity-body">
                    <p>Total Activities: {athleteStats.recent_swim_totals.count}</p>
                    <p>Total Distance: {(athleteStats.recent_swim_totals.distance / 1000).toFixed(1)}km</p>
                    <p>Total Time: {(athleteStats.recent_swim_totals.elapsed_time / 3600 ).toFixed(2)}hrs</p>
                  </div>

                </div>
                <div className="recent-activity">
                  <div className="recent-activity-header">
                    <p>Ride</p>
                  </div>
                  <div className="recent-activity-body">
                    <p>Total Activities: {athleteStats.recent_ride_totals.count}</p>
                    <p>Total Distance: {(athleteStats.recent_ride_totals.distance / 1000).toFixed(1)}km</p>
                    <p>Total Time: {(athleteStats.recent_ride_totals.elapsed_time / 3600 ).toFixed(2)}hrs</p>
                  </div>

                </div>
                <div className="recent-activity">
                  <div className="recent-activity-header">
                    <p>Run</p>
                  </div>
                  <div className="recent-activity-body">
                    <p>Total Activities: {athleteStats.recent_run_totals.count}</p>
                    <p>Total Distance: {(athleteStats.recent_run_totals.distance / 1000).toFixed(1)}km</p>
                    <p>Total Time: {(athleteStats.recent_run_totals.elapsed_time / 3600 ).toFixed(2)}hrs</p>
                  </div>

                </div>
              </div>
              
              <div className="update-button-box"  onClick={fetchAndUpload}>
                <img className="update-button" src="../src/assets/update-arrows.svg"></img>
              </div>
            </div>

          </div>
          <div className="stats-page">
          <p>Total Rides: {athleteStats.all_ride_totals.count}</p>
          <p>Total Runs: {athleteStats.all_run_totals.count}</p>
          <p>Total Swims: {athleteStats.all_swim_totals.count}</p>
          </div>

        </div>
      ) : (
        <p>Loading athlete data...</p>
      )}
    </div>
  );
};

export default HomePage;