import { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, MapPin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Calendar = () => {
  const [races, setRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🏁 1. DYNAMIC API CONFIGURATION
  // This looks for your .env variable first, then falls back to localhost for your dev work.
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    // 🏁 2. UPDATED ENDPOINT
    axios.get(`${API_BASE}/api/calendar/2026`)
      .then(res => {
        setRaces(res.data.MRData.RaceTable.Races);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setLoading(false);
      });
  }, [API_BASE]);

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-white/5 rounded-full" />
        <div className="absolute top-0 w-16 h-16 border-4 border-t-red-600 border-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto p-10 pt-28">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Live Season Feed</span>
        </div>
        <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
          2026 <span className="text-red-600">Schedule</span>
        </h1>
        <p className="text-gray-500 mt-4 uppercase tracking-[0.3em] text-[11px] font-bold opacity-60">
          Official FIA Formula One World Championship
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {races.map((race) => {
          const isPast = new Date(race.date) < new Date();
          
          return (
            <div 
              key={race.round}
              onClick={() => navigate(`/race-hub/2026/${race.round}`)}
              className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.06] hover:border-red-600/30 transition-all group cursor-pointer relative overflow-hidden"
            >
              {/* Massive Round Watermark */}
              <span className="absolute -right-4 -bottom-6 text-[10rem] font-black italic opacity-[0.02] group-hover:opacity-[0.04] transition-all duration-700 select-none">
                {race.round}
              </span>

              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="bg-red-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-red-600/20">
                  Round {race.round}
                </div>
                {isPast ? (
                   <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                     Completed <div className="w-1 h-1 bg-gray-500 rounded-full" />
                   </span>
                ) : (
                   <span className="text-[9px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/10 animate-pulse">
                     Upcoming <div className="w-1 h-1 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]" />
                   </span>
                )}
              </div>

              <div className="relative z-10">
                <h3 className="text-3xl font-black italic uppercase leading-none mb-1 group-hover:text-red-600 transition-colors">
                  {race.raceName.replace('Grand Prix', '')}
                </h3>
                <span className="text-xl font-black italic uppercase text-white/20 tracking-tighter">Grand Prix</span>
              </div>

              <div className="space-y-4 mt-8 relative z-10 border-t border-white/5 pt-6">
                <div className="flex items-center gap-4 text-gray-400 group-hover:text-white transition-colors">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <MapPin size={14} className="text-red-600" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest leading-none">
                    {race.Circuit.Location.locality} <br />
                    <span className="text-[9px] text-gray-600 group-hover:text-gray-400">{race.Circuit.Location.country}</span>
                  </span>
                </div>
                <div className="flex items-center gap-4 text-gray-400 group-hover:text-white transition-colors">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <CalendarIcon size={14} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    {new Date(race.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="mt-10 relative z-10 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <div className="w-full py-4 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-2xl shadow-white/10">
                  {isPast ? 'Analyze Results' : 'Race Intelligence'} <ChevronRight size={14} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;