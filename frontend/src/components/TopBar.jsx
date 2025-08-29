
import React from "react";

const TopBar = () => (
  <nav className="topbar">
    <div className="topbar-left">🔌 Some</div>
    <div className="topbar-center">
      <a href="#" className="active">Devices</a>
      <a href="#">Automations</a>
      <a href="#">Settings</a>
    </div>
    <div className="topbar-right">...</div>
  </nav>
);

export default TopBar;
