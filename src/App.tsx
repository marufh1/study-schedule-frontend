import { useState } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import EnergyLevelForm from "./components/EnergyLevelForm";
import Header from "./components/Header";
import OptimizationResult from "./components/OptimizationResult";
import ScheduleForm from "./components/ScheduleForm";
import ScheduleList from "./components/ScheduleList"; // Import the new component
import TaskForm from "./components/TaskForm";
import { User } from "./types";

// In a real application, this would come from an authentication system
const DEFAULT_USER: User = {
  _id: "682b4ff8a57030c45a7ad974",
  name: "Maruf Hossain",
  email: "maruf.mhb@gmail.com",
};

function App() {
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);

  return (
    <Router>
      <div className="app">
        <Header user={currentUser} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard userId={currentUser._id.toString()} />} />
            <Route path="/tasks/new" element={<TaskForm userId={currentUser._id} />} />
            <Route path="/tasks/:id/edit" element={<TaskForm userId={currentUser._id} />} />
            <Route path="/schedules" element={<ScheduleList userId={currentUser._id} />} /> {/* New route for listing schedules */}
            <Route path="/schedules/new" element={<ScheduleForm userId={currentUser._id} />} />
            <Route path="/schedules/:id/edit" element={<ScheduleForm userId={currentUser._id} />} />
            <Route path="/energy/new" element={<EnergyLevelForm userId={currentUser._id} />} />
            <Route path="/energy/:id/edit" element={<EnergyLevelForm userId={currentUser._id} />} />
            <Route path="/optimize" element={<OptimizationResult userId={currentUser._id} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
