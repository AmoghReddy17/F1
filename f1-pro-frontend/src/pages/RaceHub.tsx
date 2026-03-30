import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Timer, ChevronRight, Zap, Flag, Map } from 'lucide-react';
import { DriverAvatar } from '../components/DriverAvatar';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const RaceHub = () => {
  const { year = "2026", round = "1" } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<any[]>([]);
  const [raceInfo, setRaceInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:8000/api/results/${year}/${round}`);
        const data = res.data.MRData.RaceTable.Races[0];
        setRaceInfo(data);
        setResults(data.Results);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchResults();
  }, [year, round]);
  useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') navigate('/calendar');
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [navigate]);

  if (loading) return <div className="h-screen flex items-center justify-center text-red-600 font-black italic animate-pulse">SYNCING RACE DATA...</div>;

  const podium = results.slice(0, 3);
  const fastestLap = results.find(r => r.FastestLap?.rank === "1");

  return (
    <div className="max-w-[1400px] mx-auto p-10 pt-28 min-h-screen animate-in fade-in duration-1000">
      {/* 🏁 NEW: Back Navigation Row */}
      <nav className="mb-8 flex items-center justify-between">
        <button 
          onClick={() => navigate('/calendar')} // Or use navigate(-1) to go back to the previous page
          className="group flex items-center gap-3 text-gray-500 hover:text-white transition-all"
        >
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-red-600 group-hover:bg-red-600 transition-all">
            <ArrowLeft size={16} className="group-hover:text-white" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Return to Calendar</span>
        </button>

        {/* Optional: Breadcrumbs */}
        <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
          Season 2026 / <span className="text-white/40">Race Hub</span>
        </div>
      </nav>
      
      {/* 🏁 HEADER: RACE IDENTITY */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <Flag size={20} />
            <span className="text-xs font-black uppercase tracking-[0.4em]">Official Race Results</span>
          </div>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
            {raceInfo?.raceName} <span className="text-white/20">{year}</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
            <Map size={14} /> {raceInfo?.Circuit.circuitName} — {raceInfo?.Circuit.Location.locality}, {raceInfo?.Circuit.Location.country}
          </p>
        </div>

        {/* DEEP DIVE BUTTON */}
        <button 
          onClick={() => navigate(`/telemetry/${year}/${round}`)}
          className="group bg-white text-black px-8 py-4 rounded-2xl font-black uppercase italic tracking-tighter flex items-center gap-4 hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-white/5"
        >
          Open Telemetry Lab
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* 🥇 THE PODIUM DISPLAY */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <Trophy size={200} />
            </div>
            
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-gray-500 mb-10">The Sunday Podium</h2>
            
            <div className="flex flex-col md:flex-row items-center justify-around gap-12">
              {/* P2 */}
              <div className="flex flex-col items-center text-center order-2 md:order-1 opacity-70 scale-90">
                <DriverAvatar code={podium[1]?.Driver.code} size="w-24 h-24" isSelected teamColor="#999" />
                <p className="text-lg font-black italic uppercase mt-4">{podium[1]?.Driver.familyName}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">P2 — SECOND</p>
              </div>

              {/* P1 - THE WINNER */}
              <div className="flex flex-col items-center text-center order-1 md:order-2">
                <div className="relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest animate-bounce">Winner</div>
                  <DriverAvatar code={podium[0]?.Driver.code} size="w-40 h-40" isSelected teamColor="#FFD700" />
                </div>
                <p className="text-3xl font-black italic uppercase mt-6">{podium[0]?.Driver.familyName}</p>
                <p className="text-xs font-bold text-yellow-500 uppercase tracking-[0.3em] mt-2">{podium[0]?.Constructor.name}</p>
              </div>

              {/* P3 */}
              <div className="flex flex-col items-center text-center order-3 opacity-70 scale-90">
                <DriverAvatar code={podium[2]?.Driver.code} size="w-24 h-24" isSelected teamColor="#CD7F32" />
                <p className="text-lg font-black italic uppercase mt-4">{podium[2]?.Driver.familyName}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">P3 — THIRD</p>
              </div>
            </div>
          </div>

          {/* ⏱️ KEY RACE STATS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FASTEST LAP CARD */}
            <div className="bg-gradient-to-br from-purple-600/20 to-transparent border border-purple-600/20 p-8 rounded-[2.5rem] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-2 flex items-center gap-2">
                  <Timer size={14} /> Fastest Lap
                </p>
                <p className="text-2xl font-black italic uppercase">{fastestLap?.Driver.familyName}</p>
                <p className="text-xl font-mono text-white/80 mt-1">{fastestLap?.FastestLap.Time.time}</p>
              </div>
              <DriverAvatar code={fastestLap?.Driver.code} size="w-16 h-16" isSelected={false} teamColor="#A855F7" />
            </div>

            {/* RACE WIN TIME */}
            <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                  <Zap size={14} /> Winning Gap
                </p>
                <p className="text-2xl font-black italic uppercase">Dominance</p>
                <p className="text-xl font-mono text-green-500 mt-1">+{podium[1]?.Time?.time || "Finished"}</p>
              </div>
              <Trophy size={40} className="text-white/10" />
            </div>
          </div>
        </div>

        {/* 📊 CLASSIFICATION TABLE (Top 10) */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 h-full flex flex-col">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-8 px-2">Classification</h2>
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {results.slice(0, 10).map((r, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all group">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black italic w-4 text-gray-600 group-hover:text-red-600">{r.position}</span>
                  <div>
                    <p className="text-sm font-black uppercase italic tracking-tighter leading-none">{r.Driver.familyName}</p>
                    <p className="text-[9px] font-bold text-gray-500 uppercase mt-1">{r.Constructor.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-white/80">{r.points} PTS</p>
                  <p className="text-[8px] font-bold text-gray-600 uppercase mt-0.5">{r.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RaceHub;