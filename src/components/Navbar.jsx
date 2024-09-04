import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = ({user, onLogout}) => {

  const handleLogOutButton = () => {
    if (user) {
      onLogout();
    }
  }
  return (
    <div className="navbar">
      <img className="navbar-icon" src="/icon.svg" alt="Stravee Icon"></img>
      <nav>
        <NavLink to="/" className="nav-link">
          Home
        </NavLink>
        <NavLink to="/training-log" className="nav-link">
          Training Log
        </NavLink>
      </nav>
      <button className="logout-button" onClick={handleLogOutButton}>Log-out</button>
    </div>

  );
};

export default Navbar;