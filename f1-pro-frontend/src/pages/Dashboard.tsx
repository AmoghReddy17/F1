import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Zap, Trophy, TrendingUp, ChevronRight, Wind } from 'lucide-react';
import { DriverAvatar } from '../components/DriverAvatar';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [topDrivers, setTopDrivers] = useState<any[]>([]);
  const [currentRace, setCurrentRace] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState("00D : 00H : 00M");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch current standings for the leaderboard
        const standingsRes = await axios.get('http://localhost:8000/api/standings/2026');
        setTopDrivers(standingsRes.data.MRData.StandingsTable.StandingsLists[0].DriverStandings.slice(0, 3));

        // 2. Fetch the Next/Current Race dynamically
        const raceRes = await axios.get('http://localhost:8000/api/next-race');
        const race = raceRes.data;
        setCurrentRace(race);

        // 3. Fetch Weather for that specific circuit location
        if (race.Circuit?.Location) {
          const { lat, long } = race.Circuit.Location;
          const weatherRes = await axios.get(`http://localhost:8000/api/weather/${lat}/${long}`);
          setWeather(weatherRes.data);
        }
      } catch (err) {
        console.error("Dashboard Sync Error:", err);
      }
    };

    fetchDashboardData();
  }, []);

  // 🏁 Countdown Timer Logic (Updated to target the currentRace date)
  useEffect(() => {
    if (!currentRace) return;

    // We target the race date. Note: Ergast API dates are Sunday race dates.
    const target = new Date(`${currentRace.date}T${currentRace.time || '15:00:00Z'}`);
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = target.getTime() - now;

      if (diff < 0) {
        setTimeLeft("RACE LIVE");
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      
      setTimeLeft(`${d}D : ${h}H : ${m}M`);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRace]);

  return (
    <div className="max-w-[1700px] mx-auto px-10 pt-24 pb-10 min-h-screen flex flex-col">
      
      {/* 🏎️ HERO SECTION: DYNAMIC GP FOCUS */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 relative bg-red-600 rounded-[3rem] p-12 overflow-hidden group shadow-2xl shadow-red-900/20">
          <div className="relative z-10">
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md w-fit px-4 py-1.5 rounded-full mb-6 border border-white/10">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Next Session Countdown</span>
            </div>
            
            {/* 🏁 DYNAMIC RACE TITLE */}
            <h2 className="text-7xl font-black italic uppercase tracking-tighter leading-none mb-4">
              {currentRace?.raceName.split(' ')[0]} <br /> 
              <span className="text-black/30">{currentRace?.raceName.split(' ').slice(1).join(' ')}</span>
            </h2>
            
            <p className="text-4xl font-mono font-black tracking-tighter opacity-90">{timeLeft}</p>
          </div>

          <Wind size={400} className="absolute -right-20 -bottom-20 text-white opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
        </div>

        {/* 🌦️ LIVE WEATHER SECTION */}
        <div className="bg-white/[0.03] border border-white/5 rounded-[3rem] p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
               <TrendingUp className="text-green-500" size={20} />
               <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-50">Track Conditions: {currentRace?.Circuit.Location.locality}</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-bold uppercase text-[10px]">Air Temp</span>
                <span className="text-2xl font-black italic">{weather?.air_temp || '--°C'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-bold uppercase text-[10px]">Track Temp</span>
                <span className="text-2xl font-black italic">{weather?.track_temp || '--°C'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-bold uppercase text-[10px]">Humidity</span>
                <span className="text-2xl font-black italic">{weather?.humidity || '--%'}</span>
              </div>
            </div>
          </div>
          <Link to="/calendar" className="mt-8 flex items-center justify-between bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-all group">
            <span className="text-[10px] font-black uppercase tracking-widest">Full Schedule</span>
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* 📊 DATA GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEADERBOARD PREVIEW */}
        <div className="lg:col-span-1 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Trophy size={14} className="text-yellow-500" /> Championship Leaders
            </h3>
            <Link to="/standings" className="text-[10px] font-bold text-red-500 hover:underline uppercase tracking-widest">View All</Link>
          </div>
          
          <div className="space-y-4">
            {topDrivers.map((d, i) => (
              <div key={d.Driver.driverId} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-black italic opacity-20">{i+1}</span>
                  <DriverAvatar code={d.Driver.code} size="w-10 h-10" />
                  <div>
                    <p className="text-sm font-black uppercase italic">{d.Driver.familyName}</p>
                    <p className="text-[8px] font-bold text-gray-500 uppercase">{d.Constructors[0].name}</p>
                  </div>
                </div>
                <p className="text-lg font-black italic">{d.points}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TECHNICAL INSIGHTS CARD */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden">
          <Zap size={100} className="absolute -right-5 -top-5 text-yellow-500 opacity-5 -rotate-12" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-yellow-500">
            2026 Technical Focus: {currentRace?.Circuit.circuitName.split(' ')[0]}
          </h3>
          <p className="text-2xl font-light leading-relaxed mb-8 max-w-2xl">
            "The 2026 power units face a unique challenge at {currentRace?.Circuit.Location.locality}. With hybrid recovery at an all-time high, energy management through the high-speed sectors will separate the podium from the pack."
          </p>
          <div className="flex gap-4">
            <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
              <span className="block text-[8px] font-bold text-gray-500 uppercase mb-1">Downforce Level</span>
              <span className="text-sm font-black italic uppercase">Track Optimized</span>
            </div>
            <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
              <span className="block text-[8px] font-bold text-gray-500 uppercase mb-1">Track Type</span>
              <span className="text-sm font-black italic uppercase">Permanent Circuit</span>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
};

export default Dashboard;