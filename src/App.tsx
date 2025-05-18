import { useState } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import EnergyLevelForm from "./components/EnergyLevelForm";
import Header from "./components/Header";
import OptimizationResult from "./components/OptimizationResult";
import ScheduleForm from "./components/ScheduleForm";
import TaskForm from "./components/TaskForm";
import { User } from "./types";

// In a real application, this would come from an authentication system
const DEFAULT_USER: User = {
  id: 1,
  name: "John Doe",
  email: "john.doe@example.com",
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
            <Route path="/dashboard" element={<Dashboard userId={currentUser.id.toString()} />} />
            <Route path="/tasks/new" element={<TaskForm userId={currentUser.id} />} />
            <Route path="/tasks/:id/edit" element={<TaskForm userId={currentUser.id} />} />
            <Route path="/schedules/new" element={<ScheduleForm userId={currentUser.id} />} />
            <Route path="/schedules/:id/edit" element={<ScheduleForm userId={currentUser.id} />} />
            <Route path="/energy/new" element={<EnergyLevelForm userId={currentUser.id} />} />
            <Route path="/energy/:id/edit" element={<EnergyLevelForm userId={currentUser.id} />} />
            <Route path="/optimize" element={<OptimizationResult userId={currentUser.id} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
