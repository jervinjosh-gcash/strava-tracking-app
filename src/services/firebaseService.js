import { collection, doc, getDoc, setDoc, writeBatch, getDocs, query } from "firebase/firestore";
import { auth, db } from "../firebase";
import { fetchActivities, fetchStravaAccessToken } from "./stravaService";
import firebase from "firebase/compat/app";

export async function fetchStravaCredentials() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User is not authenticated.");
  }

  const userRef = doc(db, "users", user.uid);
  try {
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const { stravaClientId, stravaClientSecret, stravaRefreshToken } = userDoc.data();

      // Fetch a new access token using the refresh token
      const accessToken = await fetchStravaAccessToken(stravaRefreshToken, stravaClientId, stravaClientSecret);
      return { stravaClientId, stravaClientSecret, stravaRefreshToken, stravaAccessToken: accessToken };
    } else {
      console.error("No user data found.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching Strava credentials:", error);
    return null;
  }
}

export async function uploadAthleteData(athleteData) {
  const user = auth.currentUser;
  try {
    const athleteRef = doc(db, "users", user.uid, "athlete", "profile");
    await setDoc(athleteRef, athleteData);
    console.log("Athlete data uploaded successfully");
  } catch (error) {
    console.error("Error uploading athlete data:", error);
  }
}

export async function uploadAthleteStats(athleteStats) {
  const user = auth.currentUser;
  try {
    const statsRef = doc(db, "users", user.uid, "athlete", "stats");
    await setDoc(statsRef, athleteStats);
    console.log("Athlete stats uploaded successfully");
  } catch (error) {
    console.error("Error uploading athlete stats:", error);
  }
}

export async function uploadAthleteActivities(athleteActivities){
  const user = auth.currentUser;
  try {
    
    const batch = writeBatch(db);
    athleteActivities.forEach((activity) => {
      const startDate = new Date(activity.start_date);
      const year = startDate.getUTCFullYear().toString();
      const month = String(startDate.getUTCMonth() + 1).padStart(2,'0');

      const athleteRef = doc(db, "users", user.uid, "athlete", "all_activities", year, month, "activities", activity.id.toString());
      batch.set(athleteRef, activity);
    });
    await batch.commit();
    console.log('Activities stored successfully');
  } catch (error) {
    console.error('Error fetching or storing activities:', error);
  }

}

export async function fetchAthleteData() {
  const user = auth.currentUser;
  try {
    const athleteRef = doc(db, "users", user.uid, "athlete", "profile");
    const docSnap = await getDoc(athleteRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching athlete data:", error);
    throw error;
  }
}

export async function fetchAthleteStats() {
  const user = auth.currentUser;
  try {
    const statsRef = doc(db, "users", user.uid, "athlete", "stats");
    const docSnap = await getDoc(statsRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching athlete stats:", error);
    throw error;
  }
}

export async function fetchActivitiesForMonth(year,month) {
  const user = auth.currentUser;
  try {
    const athleteRef = collection(db, "users", user.uid, "athlete", "all_activities", year, month, "activities");

    const snapshot = await getDocs(query(athleteRef));

    const activities = snapshot.docs.map((doc) => doc.data());
    
    return activities;
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }


}