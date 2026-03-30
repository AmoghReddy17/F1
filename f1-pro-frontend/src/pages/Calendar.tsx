import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, MapPin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 1. Import

const Calendar = () => {
  const [races, setRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // 2. Initialize

  useEffect(() => {
    axios.get('http://localhost:8000/api/calendar/2026')
      .then(res => {
        setRaces(res.data.MRData.RaceTable.Races);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="w-12 h-12 border-4 border-t-red-600 border-white/10 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto p-10">
      <header className="mb-12">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter">
          2026 <span className="text-red-600">Schedule</span>
        </h1>
        <p className="text-gray-500 mt-4 uppercase tracking-[0.3em] text-[10px] font-bold">
          Official FIA Formula One World Championship
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {races.map((race) => {
          const isPast = new Date(race.date) < new Date();
          
          return (
            <div 
              key={race.round}
              className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-8 hover:bg-white/[0.06] hover:border-white/20 transition-all group cursor-pointer relative overflow-hidden"
            >
              <span className="absolute -right-4 -bottom-4 text-9xl font-black italic opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                {race.round}
              </span>

              <div className="flex justify-between items-start mb-6">
                <div className="bg-red-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Round {race.round}
                </div>
                {isPast ? (
                   <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                     Completed <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                   </span>
                ) : (
                   <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1 animate-pulse">
                     Upcoming <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                   </span>
                )}
              </div>

              <h3 className="text-2xl font-black italic uppercase leading-tight mb-2">
                {race.raceName.replace('Grand Prix', '')}
                <span className="text-red-600"> GP</span>
              </h3>

              <div className="space-y-3 mt-6">
                <div className="flex items-center gap-3 text-gray-400">
                  <MapPin size={14} className="text-red-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">{race.Circuit.Location.locality}, {race.Circuit.Location.country}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <CalendarIcon size={14} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {new Date(race.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* 3. Updated Button Logic */}
              <button 
                onClick={(e) => {
                    e.stopPropagation(); // Prevents clicking the card background from doubling up
                    navigate(`/race-hub/2026/${race.round}`);
                }}
                className="mt-8 w-full py-4 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] group-hover:bg-white group-hover:text-black transition-all flex items-center justify-center gap-2"
              >
                {isPast ? 'View Results' : 'Race Insights'} <ChevronRight size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;