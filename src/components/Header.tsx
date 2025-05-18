import React from "react";
import { Link } from "react-router-dom";
import { User } from "../types";

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">Study Schedule Optimizer</h1>
        </div>

        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link to="/dashboard" className="hover:text-blue-200">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/tasks/new" className="hover:text-blue-200">
                Add Task
              </Link>
            </li>
            <li>
              <Link to="/schedules/new" className="hover:text-blue-200">
                Add Schedule
              </Link>
            </li>
            <li>
              <Link to="/energy/new" className="hover:text-blue-200">
                Set Energy Levels
              </Link>
            </li>
            <li>
              <Link to="/optimize" className="hover:text-blue-200">
                Optimize Schedule
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center">
          <span className="mr-2">{user.name}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
