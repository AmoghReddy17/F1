import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Timer, ChevronRight, Zap, Flag, Map } from 'lucide-react';
import { DriverAvatar } from '../components/DriverAvatar';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
// 🏁 IMPORT CONFIG
import { API_BASE } from '../config';

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
        // 🏁 USE API_BASE
        const res = await axios.get(`${API_BASE}/api/results/${year}/${round}`);
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
    <div className="max-w-[1400px] mx-auto p-10 pt-32 min-h-screen animate-in fade-in duration-1000">
      <nav className="mb-8 flex items-center justify-between">
        <button 
          onClick={() => navigate('/calendar')} 
          className="group flex items-center gap-3 text-gray-500 hover:text-white transition-all"
        >
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-red-600 group-hover:bg-red-600 transition-all">
            <ArrowLeft size={16} className="group-hover:text-white" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-red-600 transition-colors">Return to Calendar</span>
        </button>

        <div className="text-[10px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
          Season {year} / <span className="text-red-600">Race Analysis</span>
        </div>
      </nav>
      
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <Flag size={20} className="animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.4em]">Official Race Results</span>
          </div>
          <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
            {raceInfo?.raceName.replace('Grand Prix', '')} <span className="text-white/20">GP</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest mt-4 flex items-center gap-3 text-sm">
            <Map size={16} className="text-red-600" /> {raceInfo?.Circuit.circuitName} — <span className="text-white">{raceInfo?.Circuit.Location.locality}, {raceInfo?.Circuit.Location.country}</span>
          </p>
        </div>

        <button 
          onClick={() => navigate(`/telemetry/${year}/${round}`)}
          className="group bg-white text-black px-10 py-5 rounded-2xl font-black uppercase italic tracking-tighter flex items-center gap-4 hover:bg-red-600 hover:text-white transition-all shadow-2xl shadow-white/5 active:scale-95"
        >
          Enter Telemetry Lab
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[4rem] relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
              <Trophy size={280} />
            </div>
            
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600 mb-12 text-center">Grand Prix Podium</h2>
            
            <div className="flex flex-col md:flex-row items-center justify-around gap-16">
              {/* P2 */}
              <div className="flex flex-col items-center text-center order-2 md:order-1 opacity-70 scale-90">
                <div className="relative">
                  <div className="absolute inset-0 blur-2xl opacity-10 rounded-full bg-white" />
                  <DriverAvatar code={podium[1]?.Driver.code} size="w-28 h-28" isSelected teamColor="#999" />
                </div>
                <p className="text-xl font-black italic uppercase mt-6 tracking-tighter">{podium[1]?.Driver.familyName}</p>
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">P2 / SECOND</p>
              </div>

              {/* P1 */}
              <div className="flex flex-col items-center text-center order-1 md:order-2 group/winner">
                <div className="relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest shadow-xl shadow-yellow-500/20 z-20">Winner</div>
                  <div className="absolute inset-0 blur-3xl opacity-30 rounded-full bg-yellow-500 group-hover/winner:opacity-50 transition-opacity" />
                  <DriverAvatar code={podium[0]?.Driver.code} size="w-48 h-48" isSelected teamColor="#FFD700" />
                </div>
                <p className="text-4xl font-black italic uppercase mt-8 tracking-tighter">{podium[0]?.Driver.familyName}</p>
                <p className="text-xs font-black text-yellow-500 uppercase tracking-[0.3em] mt-3">{podium[0]?.Constructor.name}</p>
              </div>

              {/* P3 */}
              <div className="flex flex-col items-center text-center order-3 opacity-70 scale-90">
                <div className="relative">
                  <div className="absolute inset-0 blur-2xl opacity-10 rounded-full bg-[#CD7F32]" />
                  <DriverAvatar code={podium[2]?.Driver.code} size="w-28 h-28" isSelected teamColor="#CD7F32" />
                </div>
                <p className="text-xl font-black italic uppercase mt-6 tracking-tighter">{podium[2]?.Driver.familyName}</p>
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">P3 / THIRD</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-600/10 to-transparent border border-purple-600/20 p-8 rounded-[3rem] flex items-center justify-between group hover:bg-purple-600/5 transition-all">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-3 flex items-center gap-2">
                  <Timer size={14} /> Fastest Lap Performance
                </p>
                <p className="text-3xl font-black italic uppercase tracking-tighter leading-none">{fastestLap?.Driver.familyName}</p>
                <p className="text-2xl font-mono text-white/90 mt-2 italic">{fastestLap?.FastestLap.Time.time}</p>
              </div>
              <DriverAvatar code={fastestLap?.Driver.code} size="w-20 h-20" isSelected={false} teamColor="#A855F7" />
            </div>

            <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[3rem] flex items-center justify-between group hover:border-red-600/30 transition-all">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                  <Zap size={14} className="text-red-600" /> Winning Margin
                </p>
                <p className="text-3xl font-black italic uppercase tracking-tighter leading-none">Dominance</p>
                <p className="text-2xl font-mono text-green-500 mt-2 italic">+{podium[1]?.Time?.time || "---"}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl group-hover:rotate-12 transition-transform duration-500">
                <Trophy size={32} className="text-white/20" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0d0d0d] border border-white/5 rounded-[3.5rem] p-10 h-full flex flex-col shadow-2xl">
          <div className="flex items-center justify-between mb-10 px-2">
             <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600">Race Classification</h2>
             <span className="text-[10px] font-black text-white/20">TOP 10</span>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {results.slice(0, 10).map((r, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/[0.03] rounded-3xl hover:bg-red-600 group transition-all duration-300">
                <div className="flex items-center gap-5">
                  <span className="text-lg font-black italic w-6 text-gray-800 group-hover:text-white/20 transition-colors">{r.position}</span>
                  <div>
                    <p className="text-base font-black uppercase italic tracking-tighter leading-none group-hover:text-white">{r.Driver.familyName}</p>
                    <p className="text-[9px] font-black text-gray-600 uppercase mt-1.5 group-hover:text-white/60">{r.Constructor.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black italic leading-none group-hover:text-white">{r.points}</p>
                  <p className="text-[9px] font-black text-gray-700 uppercase mt-1 group-hover:text-white/40">PTS</p>
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