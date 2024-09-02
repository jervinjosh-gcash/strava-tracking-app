import { uploadAthleteData , uploadAthleteStats, uploadAthleteActivities } from "./firebaseService";

// src/services/stravaService.js
const STRAVA_API_URL = "https://www.strava.com/api/v3";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";


export async function fetchStravaAccessToken(refreshToken, clientId, clientSecret) {
  try {
    const response = await fetch(STRAVA_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error fetching access token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error fetching Strava access token:", error);
    throw error;
  }
}

export async function fetchAthleteData(accessToken) {
  try {
    const response = await fetch(`${STRAVA_API_URL}/athlete`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching athlete data: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching athlete data:", error);
    throw error;
  }
}

export async function fetchActivities(accessToken) {
  try {
    const response = await fetch(`${STRAVA_API_URL}/athlete/activities`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching activities: ${response.statusText}`);
    }
    console.log(response.json)
    return response.json();
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
}

export async function fetchAthleteStats(accessToken,athleteId) {
  try {
    const response = await fetch(`${STRAVA_API_URL}/athletes/${athleteId}/stats`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching athlete data: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching athlete data:", error);
    throw error;
  }
}

export async function fetchAndUploadAthleteData(accessToken) {
  try {
    const response = await fetch(`${STRAVA_API_URL}/athlete`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) throw new Error(`Error fetching athlete data: ${response.statusText}`);
    const athleteData = await response.json();
    await uploadAthleteData(athleteData);
  } catch (error) {
    console.error("Error fetching and uploading athlete data:", error);
  }
}

export async function fetchAndUploadAthleteStats(accessToken,athleteId) {
  try {
    const response = await fetch(`${STRAVA_API_URL}/athletes/${athleteId}/stats`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) throw new Error(`Error fetching athlete stats: ${response.statusText}`);
    const athleteStats = await response.json();
    await uploadAthleteStats(athleteStats);
  } catch (error) {
    console.error("Error fetching and uploading athlete stats:", error);
  }
}

export async function fetchAndUploadAthleteActivitiesByDate(accessToken,time_updated){
  try {
    const response = await fetch(`${STRAVA_API_URL}/athlete/activities?per_page=?after=${time_updated}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const activities = await response.json();
    await uploadAthleteActivities(activities);
    
  } catch (error) {
    console.log("Error fetching and uploading athlete activities:", error);
  }
}

export async function fetchAndUploadAthleteActivities(accessToken) {
  let page = 1;
  const perPage = 200;
  let allActivities = [];

  try {
    while (true) {
      const response = await fetch(`${STRAVA_API_URL}/athlete/activities?per_page=${perPage}&page=${page}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const activities = await response.json();

      if (response.status !== 200 || !activities) {
        console.error('Failed to fetch activities from Strava API', response);
        break;
      }

      allActivities = allActivities.concat(activities);

      if (activities.length < perPage) {
        break;
      } else {
        page += 1;
      }
    }
    await uploadAthleteActivities(allActivities);
  } catch (error) {
    console.error("Error fetching and uploading athlete activities:", error);
  }
};