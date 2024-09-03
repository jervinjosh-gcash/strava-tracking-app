import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { auth } from "./firebase";
import Login from "./components/Login";
import HomePage from "./components/HomePage";
import TrainingLog from "./components/TrainingLog";
import "./App.css";
import Navbar from "./components/Navbar";


const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <Router>
      <div className="main-page">
        {user ? (<Navbar user={user} onLogout={handleLogout}/> )
          : (<div></div>)}

        <Routes>
          <Route path="/" element={user ? (
          <div>
            <HomePage />
          </div>
        ) : (
          <Login onLoginSuccess={() => setUser(auth.currentUser)} />
        )} />
        
          <Route path="/training-log" element={user ? (
          <div>
            <TrainingLog />
          </div>
        ) : (
          <Login onLoginSuccess={() => setUser(auth.currentUser)} />
        )} />
        </Routes>
        
      </div>
    </Router>

  );
};

export default App;
