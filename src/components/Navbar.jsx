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
      <NavLink to="/" exact className="nav-link" activeClassName="active">
        Home
      </NavLink>
      <NavLink to="/training-log" className="nav-link" activeClassName="active">
        Training Log
      </NavLink>
      <button onClick={handleLogOutButton}>Log-out</button>
    </nav>
  );
};

export default Navbar;