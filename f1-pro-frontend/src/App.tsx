import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import TelemetryLab from './pages/TelemetryLab';
import Standings from './pages/Standings';
import RaceHub from './pages/RaceHub';
import DriverProfile from './pages/DriverProfile';

const App = () => {
  const [nextRace, setNextRace] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const syncStatus = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/next-race');
        const race = res.data;
        setNextRace(race);

        // Simple check: If the race date is today, show as "Live"
        const raceDate = new Date(race.date).toDateString();
        const today = new Date().toDateString();
        setIsLive(raceDate === today);
      } catch (err) {
        console.error("Status Sync Failed", err);
      }
    };

    syncStatus();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#050505] text-white font-sans">
        {/* GLOBAL NAVIGATION */}
        <nav className="fixed top-0 left-0 right-0 z-[1000] bg-black/60 backdrop-blur-xl border-b border-white/5 h-20 flex items-center px-10">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-2">
                <span className="bg-red-600 px-2 rounded">F1</span> PRO
              </Link>
              <div className="h-6 w-[1px] bg-white/10" />
              <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                <Link to="/" className="hover:text-red-500 transition-colors">Dashboard</Link>
                <Link to="/calendar" className="hover:text-red-500 transition-colors">Calendar</Link>
                <Link to="/standings" className="hover:text-red-500 transition-colors">Standings</Link>
                <Link to="/telemetry" className="hover:text-red-500 transition-colors">Telemetry Lab</Link>
              </div>
            </div>

            {/* 🏁 DYNAMIC STATUS PILL */}
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-red-600 animate-ping' : 'bg-green-500'}`} />
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                {nextRace ? `${nextRace.raceName.split(' ')[0]} GP ${isLive ? 'Live' : 'Upcoming'}` : 'Syncing...'}
              </span>
            </div>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <div className="pt-20"> {/* Added padding to prevent content from hiding under fixed nav */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/telemetry" element={<TelemetryLab />} />
            <Route path="/telemetry/:year/:round" element={<TelemetryLab />} />
            <Route path="/race-hub/:year/:round" element={<RaceHub />} />
            <Route path="/profile/:year/:driverCode" element={<DriverProfile />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;