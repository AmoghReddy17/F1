import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import TelemetryLab from './pages/TelemetryLab';
import Standings from './pages/Standings';
import RaceHub from './pages/RaceHub';
import DriverProfile from './pages/DriverProfile';

// 🏁 1. Import your central config
import { API_BASE } from './config';

const AppContent = () => {
  const [nextRace, setNextRace] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const syncStatus = async () => {
      try {
        // 🏁 2. Use API_BASE for the status pill
        const res = await axios.get(`${API_BASE}/api/next-race`);
        const race = res.data;
        setNextRace(race);

        const raceDate = new Date(race.date).toDateString();
        const today = new Date().toDateString();
        setIsLive(raceDate === today);
      } catch (err) {
        console.error("Status Sync Failed", err);
      }
    };

    syncStatus();
  }, []);

  // Helper to highlight active nav links
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-600 selection:text-white">
      
      {/* 🏁 GLOBAL NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-[1000] bg-black/40 backdrop-blur-2xl border-b border-white/5 h-20 flex items-center px-10 shadow-2xl">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-10">
            <Link to="/" className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-2 group">
              <span className="bg-red-600 px-2.5 py-0.5 rounded transform group-hover:skew-x-[-12deg] transition-transform duration-300">F1</span> 
              <span className="group-hover:text-red-600 transition-colors">PRO</span>
            </Link>
            
            <div className="h-6 w-[1px] bg-white/10" />
            
            <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.3em]">
              <Link to="/" className={`${isActive('/') ? 'text-red-600' : 'text-gray-500 hover:text-white'} transition-all`}>Dashboard</Link>
              <Link to="/calendar" className={`${isActive('/calendar') ? 'text-red-600' : 'text-gray-500 hover:text-white'} transition-all`}>Calendar</Link>
              <Link to="/standings" className={`${isActive('/standings') ? 'text-red-600' : 'text-gray-500 hover:text-white'} transition-all`}>Standings</Link>
              <Link to="/telemetry" className={`${isActive('/telemetry') ? 'text-red-600' : 'text-gray-500 hover:text-white'} transition-all`}>Telemetry Lab</Link>
            </div>
          </div>

          {/* 🏁 DYNAMIC STATUS PILL */}
          <div className="flex items-center gap-4 bg-white/5 px-5 py-2 rounded-2xl border border-white/5 hover:border-white/10 transition-all cursor-default">
            <div className="relative flex">
               <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-600 animate-ping' : 'bg-green-500'}`} />
               <div className={`absolute inset-0 w-2 h-2 rounded-full ${isLive ? 'bg-red-600' : 'bg-green-500'} opacity-50`} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              {nextRace ? (
                <>
                  {nextRace.raceName.split(' ')[0]} GP <span className={isLive ? 'text-red-600' : 'text-green-500'}>{isLive ? 'LIVE' : 'UPCOMING'}</span>
                </>
              ) : 'INITIALIZING DATA...'}
            </span>
          </div>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <div className="animate-in fade-in duration-700">
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

      {/* 🏁 SCANLINE OVERLAY: Adds a technical broadcast feel */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
    </div>
  );
}

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;