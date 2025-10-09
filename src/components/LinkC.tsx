import React from "react";
import { NavLink } from "react-router-dom";
import "./LinkC.css";

interface LinkCProps {
  to: string;
  children: React.ReactNode;
}

const LinkC = ({ to, children }: LinkCProps) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        isActive ? "nav-link active" : "nav-link"
      }
    >
      {children}
    </NavLink>
  );
};

export default LinkC;
