import { uploadAthleteData , uploadAthleteStats } from "./firebaseService";

// src/services/stravaService.js
const STRAVA_API_URL = "https://www.strava.com/api/v3";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";

// Fetch a new access token using the refresh token
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

// Fetch athlete data using the access token
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

// Fetch activities using the access token
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

