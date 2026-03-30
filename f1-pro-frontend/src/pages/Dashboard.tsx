import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Zap, Trophy, TrendingUp, ChevronRight, Wind, Timer, MapPin } from 'lucide-react';
import { DriverAvatar } from '../components/DriverAvatar';
import { Link } from 'react-router-dom';
// 🏁 1. Import your new config
import { API_BASE } from '../config'; 

const Dashboard = () => {
  const [topDrivers, setTopDrivers] = useState<any[]>([]);
  const [currentRace, setCurrentRace] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState("00D : 00H : 00M");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 🏁 2. Use API_BASE for all calls
        const [standingsRes, raceRes] = await Promise.all([
          axios.get(`${API_BASE}/api/standings/2026`),
          axios.get(`${API_BASE}/api/next-race`)
        ]);

        const standings = standingsRes.data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
        setTopDrivers(standings.slice(0, 3));

        const race = raceRes.data;
        setCurrentRace(race);

        if (race.Circuit?.Location) {
          const { lat, long } = race.Circuit.Location;
          const weatherRes = await axios.get(`${API_BASE}/api/weather/${lat}/${long}`);
          setWeather(weatherRes.data);
        }
      } catch (err) {
        console.error("Dashboard Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!currentRace) return;
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
      setTimeLeft(`${d.toString().padStart(2, '0')}D : ${h.toString().padStart(2, '0')}H : ${m.toString().padStart(2, '0')}M`);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRace]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#050505]">
       <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-white/5 border-t-red-600 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 animate-pulse">Syncing Global Feed...</p>
       </div>
    </div>
  );

  return (
    <div className="max-w-[1700px] mx-auto px-10 pt-32 pb-10 min-h-screen flex flex-col">
      
      {/* 🏎️ HERO SECTION: DYNAMIC GP FOCUS */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 relative bg-red-600 rounded-[3.5rem] p-12 overflow-hidden group shadow-2xl shadow-red-900/30 border border-white/10">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <Wind size={500} className="absolute -right-32 -bottom-32 text-black/10 rotate-12 group-hover:rotate-0 transition-transform duration-[2000ms]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md w-fit px-5 py-2 rounded-full mb-8 border border-white/10">
              <Timer size={14} className="text-white" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Event Countdown</span>
            </div>
            
            <h2 className="text-8xl font-black italic uppercase tracking-tighter leading-[0.8] mb-6">
              {currentRace?.raceName.split(' ')[0]} <br /> 
              <span className="text-black/20 drop-shadow-sm">
                {currentRace?.raceName.split(' ').slice(1).join(' ')}
              </span>
            </h2>
            
            <div className="flex items-baseline gap-4 mt-10">
               <p className="text-5xl font-mono font-black tracking-tighter text-white drop-shadow-lg">
                 {timeLeft}
               </p>
               <span className="text-[10px] font-black uppercase tracking-widest opacity-60">To Lights Out</span>
            </div>
          </div>
        </div>

        {/* 🌦️ LIVE TRACK CONDITIONS */}
        <div className="bg-white/[0.02] border border-white/5 rounded-[3.5rem] p-10 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
            <TrendingUp size={120} />
          </div>
          
          <div className="flex items-center gap-3 mb-10 border-b border-white/5 pb-6">
             <MapPin className="text-red-600" size={18} />
             <div>
               <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 leading-none mb-1">Current Circuit</h3>
               <p className="text-sm font-black uppercase italic">{currentRace?.Circuit.Location.locality}</p>
             </div>
          </div>

          <div className="space-y-8 flex-1">
            <div className="flex items-end justify-between">
              <span className="text-gray-500 font-black uppercase text-[9px] tracking-widest mb-1">Air Temp</span>
              <span className="text-4xl font-black italic tabular-nums">{weather?.air_temp || '24'} <span className="text-xs not-italic text-gray-600">°C</span></span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-gray-500 font-black uppercase text-[9px] tracking-widest mb-1">Track Temp</span>
              <span className="text-4xl font-black italic tabular-nums text-red-500">{weather?.track_temp || '38'} <span className="text-xs not-italic text-gray-600">°C</span></span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-gray-500 font-black uppercase text-[9px] tracking-widest mb-1">Humidity</span>
              <span className="text-4xl font-black italic tabular-nums">{weather?.humidity || '42'} <span className="text-xs not-italic text-gray-600">%</span></span>
            </div>
          </div>

          <Link to="/calendar" className="mt-10 flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-red-600 hover:text-white transition-all group shadow-xl">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Full 2026 Schedule</span>
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* 📊 DATA GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEADERBOARD PREVIEW */}
        <div className="lg:col-span-1 bg-white/[0.01] border border-white/5 rounded-[3rem] p-8 relative">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-white/50">
              <Trophy size={14} className="text-yellow-500" /> World Standings
            </h3>
            <Link to="/standings" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <ChevronRight size={16} className="text-red-600" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {topDrivers.map((d, i) => (
              <div key={d.Driver.driverId} className="flex items-center justify-between p-5 bg-white/[0.03] rounded-3xl border border-white/5 group hover:border-white/20 transition-all">
                <div className="flex items-center gap-5">
                  <span className={`text-xl font-black italic ${i === 0 ? 'text-yellow-500' : 'text-white/10'}`}>
                    {i + 1}
                  </span>
                  <DriverAvatar code={d.Driver.code} size="w-12 h-12" />
                  <div>
                    <p className="text-base font-black uppercase italic group-hover:text-red-600 transition-colors">{d.Driver.familyName}</p>
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">{d.Constructors[0].name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black italic tabular-nums leading-none">{d.points}</p>
                  <p className="text-[8px] font-bold text-gray-700 uppercase mt-1">PTS</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TECHNICAL INSIGHTS CARD */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-[3.5rem] p-12 relative overflow-hidden group">
          <Zap size={250} className="absolute -right-20 -top-20 text-red-600 opacity-[0.02] -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
          
          <div className="relative z-10 max-w-3xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-red-600 flex items-center gap-2">
              <div className="w-4 h-[1px] bg-red-600" /> 2026 Technical Bulletin
            </h3>
            <p className="text-3xl font-black italic leading-[1.1] uppercase tracking-tighter mb-10">
              "The 2026 power units face a unique challenge at {currentRace?.Circuit.Location.locality}. With hybrid recovery at an all-time high, <span className="text-white/20">energy management will separate the podium from the pack."</span>
            </p>
            
            <div className="flex gap-6">
              <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/5 backdrop-blur-md">
                <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2">Aero Config</span>
                <span className="text-sm font-black italic uppercase text-red-500">High Downforce</span>
              </div>
              <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/5 backdrop-blur-md">
                <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2">Track Surface</span>
                <span className="text-sm font-black italic uppercase text-white">Aggressive</span>
              </div>
              <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/5 backdrop-blur-md">
                <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2">Tire Stress</span>
                <span className="text-sm font-black italic uppercase text-white">Grade 4/5</span>
              </div>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
};

export default Dashboard;