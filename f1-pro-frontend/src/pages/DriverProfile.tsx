import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Target, BarChart3, 
  Star, Zap, ArrowLeft
} from 'lucide-react';
import { DriverAvatar } from '../components/DriverAvatar';
// 🏁 IMPORT CONFIG
import { API_BASE } from '../config';

const DriverProfile = () => {
  const { driverCode = "VER", year = "2026" } = useParams();
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDriverData = async () => {
      setLoading(true);
      try {
        // 🏁 USE API_BASE
        const res = await axios.get(`${API_BASE}/api/driver-history/${year}/${driverCode}`);
        setHistory(res.data.history);
        setStats(res.data.stats);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchDriverData();
  }, [driverCode, year]);

  if (loading) return <div className="h-screen flex items-center justify-center text-red-600 font-black italic animate-pulse">LOADING PROFILE...</div>;

  return (
    <div className="max-w-[1500px] mx-auto p-10 pt-32 min-h-screen">
      <nav className="mb-10 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center gap-3 text-gray-500 hover:text-white transition-all"
        >
          <div className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/40 group-hover:bg-white/5 transition-all">
            <ArrowLeft size={18} />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] leading-none text-gray-600 group-hover:text-red-600">Back to Rankings</span>
            <span className="text-[8px] font-bold text-gray-800 uppercase mt-1 tracking-widest">Season {year} Statistics</span>
          </div>
        </button>

        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live Data Sync</span>
        </div>
      </nav>
      
      <div className="relative bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 mb-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none" 
             style={{ background: `linear-gradient(90deg, transparent, ${stats?.teamColor})` }} />
        
        <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="relative">
             <div className="absolute inset-0 blur-3xl opacity-20 rounded-full" style={{ backgroundColor: stats?.teamColor }} />
             <DriverAvatar code={driverCode} size="w-72 h-72" isSelected teamColor={stats?.teamColor} />
          </div>
          
          <div className="text-center lg:text-left flex-1">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
               <span className="bg-white/10 border border-white/5 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-white/70">
                 {stats?.teamName}
               </span>
               <span className="text-yellow-500 flex items-center gap-1 font-black text-[9px] uppercase tracking-[0.2em]">
                 <Star size={10} fill="currentColor"/> Factory Driver
               </span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-light uppercase tracking-[-0.02em] text-white/40 leading-none mb-1">
                {stats?.firstName}
              </h2>
              <h1 className="text-8xl font-black italic uppercase tracking-tighter leading-[0.85] text-white">
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
                  {stats?.lastName}
                </span>
              </h1>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-12 border-t border-white/5 pt-8">
              <div>
                <p className="text-[9px] font-black uppercase text-gray-500 tracking-[0.2em] mb-2">Season Points</p>
                <p className="text-4xl font-black italic tabular-nums">{stats?.totalPoints}</p>
              </div>
              <div className="hidden lg:block h-10 w-[1px] bg-white/10 self-center" />
              <div>
                <p className="text-[9px] font-black uppercase text-gray-500 tracking-[0.2em] mb-2">Podiums</p>
                <p className="text-4xl font-black italic tabular-nums">{stats?.podiums}</p>
              </div>
              <div className="hidden lg:block h-10 w-[1px] bg-white/10 self-center" />
              <div>
                <p className="text-[9px] font-black uppercase text-gray-500 tracking-[0.2em] mb-2">Grid Rank</p>
                <p className="text-4xl font-black italic text-red-600">P{stats?.rank}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-black/40 border border-white/10 rounded-[3.5rem] p-10 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter">Season Progression</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Championship Point Accumulation</p>
            </div>
            <TrendingUp className="text-gray-700" size={32} />
          </div>
          
          <div className="h-[400px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={stats?.teamColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={stats?.teamColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="roundName" stroke="#444" fontSize={10} tick={{ dy: 10 }} />
                <YAxis stroke="#444" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '20px', padding: '12px' }}
                  itemStyle={{ color: stats?.teamColor, fontWeight: '900', textTransform: 'uppercase', fontSize: '10px' }}
                  labelStyle={{ color: '#666', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="points" stroke={stats?.teamColor} strokeWidth={4} fillOpacity={1} fill="url(#colorPoints)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] flex items-center gap-6 group hover:bg-white/[0.05] transition-all">
            <div className="p-4 bg-green-500/10 rounded-2xl text-green-500 group-hover:scale-110 transition-transform"><Target size={24} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Avg. Finish</p>
              <p className="text-3xl font-black italic">P{stats?.avgFinish}</p>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] flex items-center gap-6 group hover:bg-white/[0.05] transition-all">
            <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform"><BarChart3 size={24} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Qualifying Win Ratio</p>
              <p className="text-3xl font-black italic">{stats?.qualiWinRatio}%</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-red-900 p-8 rounded-[2.5rem] shadow-2xl shadow-red-900/40 relative overflow-hidden group">
            <Zap className="absolute -right-4 -bottom-4 text-white/10 scale-150 group-hover:rotate-12 transition-transform duration-700" size={120} />
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Next Objective</p>
            <h3 className="text-2xl font-black italic uppercase text-white leading-tight">Close the gap to <br /> Championship Leader</h3>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-[9px] font-black px-3 py-1 bg-black/20 rounded-full text-white uppercase tracking-tighter shadow-lg">Distance: {stats?.gapToLeader} PTS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;