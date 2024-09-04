import React, { useEffect, useState } from "react";
import { fetchStravaCredentials, fetchAthleteData, fetchAthleteStats, uploadTimeUpdated, fetchTimeUpdated, fetchActivitiesForMonth } from "../services/firebaseService";
import "../styles/HomePage.css";
import { fetchAndUploadAthleteActivities, fetchAndUploadAthleteData, fetchAndUploadAthleteStats, fetchAndUploadAthleteActivitiesByDate } from "../services/stravaService";
import { format } from "date-fns";


const HomePage = () => {
  const [athleteData, setAthleteData] = useState(null);
  const [athleteStats, setAthleteStats] = useState(null);
  const [unixTime, setUnixTime] = useState(new Date());
  const [readableTime, setReadableTime] = useState(null);
  const [recentActivities, setRecentActivities] = useState(null);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return format(date, "EEEE, MMMM d, yyyy, h:mm a");
  };

  const initialUpload = async () => {
    const credentials = await fetchStravaCredentials();
    const data = await fetchAthleteData();
    if (credentials) {
      fetchAndUploadAthleteData(credentials.stravaAccessToken);

      fetchAndUploadAthleteStats(credentials.stravaAccessToken,data.id);
      fetchAndUploadAthleteActivities(credentials.stravaAccessToken);
      
    }
  }


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
    getRecentActivities();
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

  const getTimeUpdated = async () => {
    try{
      const fetchedTime = await fetchTimeUpdated();

      setReadableTime(fetchedTime.time_updated);
      setUnixTime(fetchedTime.unix_time_updated);
    } catch (error) {
      console.error("Error fetching readable time: ", error);
    }
  }

  const getRecentActivities = async () => {
    try{
      let allActivities = [];
      let currMonth = (new Date()).getMonth() + 1;
      let currYear = (new Date()).getFullYear();
      const activities = await fetchActivitiesForMonth(currYear.toString(),String(currMonth).padStart(2,'0'));
      allActivities = [...activities];
      let count = 1;
      while (allActivities.length <= 10) {
        currMonth -= count;
        if (currMonth == 1){
          currYear -= count;
        }
        
        const extraActivities = await fetchActivitiesForMonth(currYear.toString(),String(currMonth).padStart(2,'0'));
        allActivities = [...extraActivities,...allActivities,];
      }
      
      setRecentActivities((allActivities.slice(allActivities.length - 10, allActivities.length)).reverse());
    } catch (error){
      console.error("Error fetching Recent Activities: ", error)
    }
  }

  useEffect(() => {
    //initialUpload();
    getRecentActivities();
    getTimeUpdated();
    getAthleteInfo();

  }, []);





  const ShowRecentActivities = () => {
    
    return (   
      <div>        
        <h3>Recent Activities</h3>
        {
        recentActivities.map((activity) => (
          <div className="activity-box" key={activity.id}>
            <div className="activity-title">
              {activity.name}
            </div>
            <div className="activity-date">
              {formatDate(activity.start_date)}
            </div>
            <div className="activity-details">
               {activity.type} &middot; {(activity.distance / 1000).toFixed(2)}km &middot; {(activity.elapsed_time/60).toFixed(0)}mins
            </div>
            
            
          </div>
        ))
      }
      </div>

      );

  };
  

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
                              
              <div className="update-button-box"  >
                <button onClick={fetchAndUpload}> Refresh Athlete Data</button>
              </div>
              </div>

              <div className="recent-activity-box">
                <div className="recent-activity swim">
                  <div className="recent-activity-header">
                    <p>Swim</p>
                  </div>
                  <div className="recent-activity-body">
                    <p>Total Activities: {athleteStats.recent_swim_totals.count}</p>
                    <p>Total Distance: {(athleteStats.recent_swim_totals.distance / 1000).toFixed(1)}km</p>
                    <p>Total Time: {(athleteStats.recent_swim_totals.elapsed_time / 3600 ).toFixed(2)}hrs</p>
                  </div>

                </div>
                <div className="recent-activity ride">
                  <div className="recent-activity-header">
                    <p>Ride</p>
                  </div>
                  <div className="recent-activity-body">
                    <p>Total Activities: {athleteStats.recent_ride_totals.count}</p>
                    <p>Total Distance: {(athleteStats.recent_ride_totals.distance / 1000).toFixed(1)}km</p>
                    <p>Total Time: {(athleteStats.recent_ride_totals.elapsed_time / 3600 ).toFixed(2)}hrs</p>
                  </div>

                </div>
                <div className="recent-activity run">
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

            </div>
          </div>

          <div className="recent-activity-page">
            <ShowRecentActivities />
          </div>

          <div className="stats-page">
            <div className="all-time-stats-box">
              <h4>All Time Stats</h4>
              <div className="all-time-stats swim">
                <div className="stats-header">
                  <h5>Swims</h5>
                </div>
                
                <p>Total Activities: {athleteStats.all_swim_totals.count}</p>
                <p>Total Distance: {(athleteStats.all_swim_totals.distance/ 1000).toFixed(1)}km</p>
                <p>Total Time: {(athleteStats.all_swim_totals.elapsed_time / 3600 ).toFixed(2)}hrs</p>
              </div>
              <div className="all-time-stats ride">
              <div className="stats-header">
                  <h5>Ride</h5>
                </div>
                <p>Total Activities: {athleteStats.all_ride_totals.count}</p>
                <p>Total Distance: {(athleteStats.all_ride_totals.distance/ 1000).toFixed(1)}km</p>
                <p>Total Time: {(athleteStats.all_ride_totals.elapsed_time / 3600 ).toFixed(2)}hrs</p>
              </div>
              <div className="all-time-stats run">
              <div className="stats-header">
                  <h5>Run</h5>
                </div>
                <p>Total Activities: {athleteStats.all_run_totals.count}</p>
                <p>Total Distance: {(athleteStats.all_run_totals.distance/ 1000).toFixed(1)}km</p>
                <p>Total Time: {(athleteStats.all_run_totals.elapsed_time / 3600 ).toFixed(2)}hrs</p>
              </div>
            </div>

            <div className="ytd-stats-box">
              <h4>Year-to-Date Stats</h4>
              
              <div className="ytd-stats swim">
              <div className="stats-header">
                  <h5>Swims</h5>
                </div>
                <p>Total Activities: {athleteStats.ytd_swim_totals.count}</p>
                <p>Total Distance: {(athleteStats.ytd_swim_totals.distance/ 1000).toFixed(1)}km</p>
                <p>Total Time: {(athleteStats.ytd_swim_totals.elapsed_time / 3600 ).toFixed(2)}hrs</p>
              </div>
              <div className="ytd-stats ride">
              <div className="stats-header">
                  <h5>Ride</h5>
                </div>
                <p>Total Activities: {athleteStats.ytd_ride_totals.count}</p>
                <p>Total Distance: {(athleteStats.ytd_ride_totals.distance/ 1000).toFixed(1)}km</p>
                <p>Total Time: {(athleteStats.ytd_ride_totals.elapsed_time / 3600 ).toFixed(2)}hrs</p>
              </div>
              <div className="ytd-stats run">
              <div className="stats-header">
                  <h5>Run</h5>
                </div>
                <p>Total Activities: {athleteStats.ytd_run_totals.count}</p>
                <p>Total Distance: {(athleteStats.ytd_run_totals.distance/ 1000).toFixed(1)}km</p>
                <p>Total Time: {(athleteStats.ytd_run_totals.elapsed_time / 3600 ).toFixed(2)}hrs</p>
              </div>
            </div>

          </div>


        </div>
      ) : (
        <p>Loading athlete data...</p>
      )}
    </div>
  );
};

export default HomePage;