import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/Navbar.css"; // Import the CSS file for styling

const Navbar = ({user, onLogout}) => {
  const handleLogOutButton = () => {
    if (user) {
      onLogout();
    }
  }
  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-link">
        Home
      </NavLink>
      <NavLink to="/training-log" className="nav-link">
        Training Log
      </NavLink>
      <button onClick={handleLogOutButton}>Log-out</button>
    </nav>
  );
};

export default Navbar;