import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';
import { 
  Zap, Activity, MapPin, Calendar as CalendarIcon, 
  ChevronDown, Check, Users, Scale, Search
} from 'lucide-react';

import { DriverAvatar } from '../components/DriverAvatar';
import { TrackMap } from '../components/TrackMap';
import { TEAM_CONFIG } from '../utils/teamsconfig';
import { CIRCUIT_PATHS } from '../utils/circuitGeometry';
// 🏁 IMPORT CONFIG
import { API_BASE } from '../config';

const CustomTooltip = ({ active, payload, driver1, driver2, isComparing, getColor }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const speed1 = payload[0]?.value || 0;
    const speed2 = isComparing ? (payload[1]?.value || 0) : null;
    const gap = data.gap; 
    const distance = (data.Distance / 1000).toFixed(2);

    return (
      <div className="bg-[#0a0a0a] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl z-[200]">
        <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2 gap-10">
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Track Position</span>
          <span className="text-[10px] font-black text-white">{distance} KM</span>
        </div>
        
        {isComparing && (
          <div className="mb-4 p-2 bg-white/5 rounded-xl flex justify-between items-center">
            <span className="text-[9px] font-black uppercase text-gray-400">Time Gap</span>
            <span className={`text-xs font-black italic ${gap > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {gap > 0 ? `+${gap.toFixed(3)}s` : `${gap.toFixed(3)}s`}
            </span>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor(driver1) }} />
              <span className="text-[10px] font-black uppercase text-white/80">{driver1}</span>
            </div>
            <span className="text-xs font-black italic tabular-nums">{speed1.toFixed(1)} <span className="text-[8px] not-italic opacity-40">KM/H</span></span>
          </div>

          {isComparing && speed2 !== null && (
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor(driver2) }} />
                <span className="text-[10px] font-black uppercase text-white/80">{driver2}</span>
              </div>
              <span className="text-xs font-black italic tabular-nums">{speed2.toFixed(1)} <span className="text-[8px] not-italic opacity-40">KM/H</span></span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const TelemetryLab = () => {
  const [year, setYear] = useState(2026);
  const [round, setRound] = useState(1);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [driversList, setDriversList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoverProgress, setHoverProgress] = useState(0);

  const [driver1, setDriver1] = useState("ANT");
  const [driver2, setDriver2] = useState("RUS");
  const [telemetry1, setTelemetry1] = useState<any[]>([]);
  const [telemetry2, setTelemetry2] = useState<any[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isRoundOpen, setIsRoundOpen] = useState(false);
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  
  const dropRef1 = useRef<HTMLDivElement>(null);
  const dropRef2 = useRef<HTMLDivElement>(null);
  const roundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 🏁 USE API_BASE
        const [calRes, standRes] = await Promise.all([
          axios.get(`${API_BASE}/api/calendar/${year}`),
          axios.get(`${API_BASE}/api/standings/${year}`)
        ]);
        setCalendar(calRes.data.MRData.RaceTable.Races);
        setDriversList(standRes.data.MRData.StandingsTable.StandingsLists[0].DriverStandings);
      } catch (err) { console.error(err); }
    };
    fetchInitialData();
  }, [year]);

  useEffect(() => {
    const fetchAllTelemetry = async () => {
      setLoading(true);
      try {
        // 🏁 USE API_BASE
        const res1 = await axios.get(`${API_BASE}/api/telemetry/${year}/${round}/${driver1}`);
        setTelemetry1(res1.data);
        if (isComparing) {
          const res2 = await axios.get(`${API_BASE}/api/telemetry/${year}/${round}/${driver2}`);
          setTelemetry2(res2.data);
        } else {
          setTelemetry2([]);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAllTelemetry();
  }, [year, round, driver1, driver2, isComparing]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropRef1.current && !dropRef1.current.contains(e.target as Node)) setIsOpen1(false);
      if (dropRef2.current && !dropRef2.current.contains(e.target as Node)) setIsOpen2(false);
      if (roundRef.current && !roundRef.current.contains(e.target as Node)) setIsRoundOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const getColor = (code: string) => {
    const driver = driversList.find(d => d.Driver.code === code);
    const teamName = driver?.Constructors[0]?.name || "";
    const team = Object.entries(TEAM_CONFIG).find(([k]) => teamName.includes(k))?.[1];
    return team?.color || "#FFF";
  };

  const filteredDrivers1 = driversList.filter(d => 
    d.Driver.familyName.toLowerCase().includes(search1.toLowerCase())
  );
  const filteredDrivers2 = driversList.filter(d => 
    d.Driver.familyName.toLowerCase().includes(search2.toLowerCase())
  );

  const baseTelemetry = telemetry1.length >= telemetry2.length ? telemetry1 : telemetry2;
  const processedData = useMemo(() => {
    let time1 = 0; let time2 = 0;
    return baseTelemetry.map((p, i) => {
      const p1 = telemetry1[i]; const p2 = telemetry2[i]; const prev = baseTelemetry[i - 1];
      if (prev) {
        const distDelta = p.Distance - prev.Distance;
        if (p1) time1 += distDelta / (p1.Speed / 3.6 || 1);
        if (isComparing && p2) time2 += distDelta / (p2.Speed / 3.6 || 1);
      }
      return {
        Distance: p.Distance,
        [driver1]: p1 ? p1.Speed : null,
        [driver2]: isComparing && p2 ? p2.Speed : null,
        gap: isComparing ? (time1 - time2) : 0
      };
    });
  }, [baseTelemetry, telemetry1, telemetry2, driver1, driver2, isComparing]);

  const sectorSize = Math.floor(processedData.length / 3);
  const getSectorWinner = (data: any[]) => {
    if (!data || data.length === 0) return null;
    const v1 = data.reduce((acc, p) => acc + (p[driver1] || 0), 0) / data.length;
    const v2 = data.reduce((acc, p) => acc + (p[driver2] || 0), 0) / data.length;
    return v1 > v2 
      ? { code: driver1, color: getColor(driver1), diff: (v1 - v2).toFixed(1) } 
      : { code: driver2, color: getColor(driver2), diff: (v2 - v1).toFixed(1) };
  };

  const winners = isComparing && processedData.length > 0 ? [
    getSectorWinner(processedData.slice(0, sectorSize)),
    getSectorWinner(processedData.slice(sectorSize, sectorSize * 2)),
    getSectorWinner(processedData.slice(sectorSize * 2))
  ] : [];

  const currentGP = calendar.find(r => parseInt(r.round) === round);
  const activeTrackPath = CIRCUIT_PATHS[currentGP?.raceName] || CIRCUIT_PATHS["Australian Grand Prix"];
  const top1 = telemetry1.length > 0 ? Math.max(...telemetry1.map(t => t.Speed)) : 0;
  
  const aiInsight = isComparing ? 
    `${winners.filter(w => w?.code === driver1).length >= 2 ? driver1 : driver2} holds the technical advantage, specifically in the high-speed sectors.` 
    : `Analyzing ${driver1}'s solo performance profile for ${currentGP?.raceName}.`;

  return (
    <div className="max-w-[1700px] mx-auto px-10 pt-32 pb-10 min-h-screen flex flex-col">
      
      <nav className="sticky top-24 z-[100] flex items-center justify-between mb-10 bg-[#0a0a0a]/95 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4">
             <Activity className="text-red-600 animate-pulse" size={24} />
             <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Telemetry <span className="text-red-600">Lab</span></h1>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          
          <div className="flex gap-8 items-center">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase text-gray-500 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/5">
              <CalendarIcon size={14} className="text-red-600" />
              <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="bg-transparent outline-none cursor-pointer hover:text-white appearance-none pr-4">
                <option value={2026} className="bg-[#111]">2026 Season</option>
                <option value={2025} className="bg-[#111]">2025 Season</option>
              </select>
            </div>

            <div className="relative" ref={roundRef}>
              <button onClick={() => setIsRoundOpen(!isRoundOpen)} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/80 bg-white/5 px-6 py-2.5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                <MapPin size={14} className="text-red-600" />
                {currentGP ? currentGP.raceName : "Syncing..."}
                <ChevronDown size={14} className={`transition-transform ${isRoundOpen ? 'rotate-180' : ''}`} />
              </button>
              {isRoundOpen && (
                <div className="absolute top-full mt-4 left-0 w-[320px] bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden z-[500] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="max-h-[400px] overflow-y-auto p-3 custom-scrollbar">
                    {calendar.map((race) => (
                      <div key={race.round} onClick={() => { setRound(parseInt(race.round)); setIsRoundOpen(false); }} className={`flex items-center justify-between px-6 py-4 rounded-2xl cursor-pointer transition-all mb-1 ${round === parseInt(race.round) ? 'bg-red-600 text-white' : 'hover:bg-white/5 text-gray-400'}`}>
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] font-black uppercase opacity-60">Round {race.round}</span>
                          <span className="text-[11px] font-bold uppercase tracking-tight">{race.raceName}</span>
                        </div>
                        {round === parseInt(race.round) && <Check size={14} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <button onClick={() => setIsComparing(!isComparing)} className={`flex items-center gap-4 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${isComparing ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-600/20' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}>
          <Users size={16} />
          {isComparing ? 'Dual Trace Online' : 'Comparative Analysis'}
        </button>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 flex-1 min-h-0">
        
        {/* SIDEBAR */}
        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar pb-10">
          
          <div className="relative" ref={dropRef1}>
            <button onClick={() => setIsOpen1(!isOpen1)} className={`w-full flex items-center gap-5 bg-white/[0.02] border p-6 rounded-[2.5rem] transition-all hover:bg-white/[0.04] ${isOpen1 ? 'border-red-600/50 shadow-2xl' : 'border-white/5'}`}>
              <DriverAvatar code={driver1} size="w-16 h-16" isSelected teamColor={getColor(driver1)} />
              <div className="text-left flex-1">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">Primary Feed</p>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-black italic uppercase tracking-tighter leading-none">
                    {driversList.find(d => d.Driver.code === driver1)?.Driver.familyName || driver1}
                  </p>
                  <ChevronDown size={18} className={`text-gray-700 transition-transform ${isOpen1 ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </button>

            {isOpen1 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-[#0d0d0d] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden z-[500] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-white/5 flex items-center gap-3">
                  <Search size={16} className="text-gray-600" />
                  <input autoFocus placeholder="Filter Grid..." className="bg-transparent w-full text-[11px] font-black uppercase tracking-widest outline-none text-white" onChange={e => setSearch1(e.target.value)} />
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                  {filteredDrivers1.map(d => (
                    <div key={d.Driver.driverId} onClick={() => { setDriver1(d.Driver.code); setIsOpen1(false); setSearch1(""); }} className="flex items-center justify-between px-6 py-4 hover:bg-white/5 rounded-2xl cursor-pointer border-b border-white/[0.02] last:border-0 group transition-all">
                      <div className="flex items-center gap-5">
                        <div className="w-1 h-8 rounded-full" style={{ backgroundColor: getColor(d.Driver.code) }} />
                        <div>
                          <p className={`text-base font-black uppercase italic tracking-tighter ${driver1 === d.Driver.code ? 'text-red-500' : 'text-gray-300 group-hover:text-white'}`}>{d.Driver.familyName}</p>
                          <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">{d.Constructors[0].name}</p>
                        </div>
                      </div>
                      {driver1 === d.Driver.code && <Check size={16} className="text-red-600" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isComparing && (
            <div className="relative animate-in slide-in-from-left duration-500" ref={dropRef2}>
              <button onClick={() => setIsOpen2(!isOpen2)} className={`w-full flex items-center gap-5 bg-white/[0.02] border p-6 rounded-[2.5rem] transition-all hover:bg-white/[0.04] ${isOpen2 ? 'border-blue-600/50 shadow-2xl' : 'border-blue-600/10'}`}>
                <DriverAvatar code={driver2} size="w-16 h-16" isSelected teamColor={getColor(driver2)} />
                <div className="text-left flex-1">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Comparison Feed</p>
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-black italic uppercase tracking-tighter leading-none">
                      {driversList.find(d => d.Driver.code === driver2)?.Driver.familyName || driver2}
                    </p>
                    <ChevronDown size={18} className={`text-gray-700 transition-transform ${isOpen2 ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </button>

              {isOpen2 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-[#0d0d0d] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden z-[500] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-5 border-b border-white/5 flex items-center gap-3">
                    <Search size={16} className="text-gray-600" />
                    <input autoFocus placeholder="Filter Grid..." className="bg-transparent w-full text-[11px] font-black uppercase tracking-widest outline-none text-white" onChange={e => setSearch2(e.target.value)} />
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                    {filteredDrivers2.map(d => (
                      <div key={d.Driver.driverId} onClick={() => { setDriver2(d.Driver.code); setIsOpen2(false); setSearch2(""); }} className="flex items-center justify-between px-6 py-4 hover:bg-white/5 rounded-2xl cursor-pointer border-b border-white/[0.02] last:border-0 group transition-all">
                        <div className="flex items-center gap-5">
                          <div className="w-1 h-8 rounded-full" style={{ backgroundColor: getColor(d.Driver.code) }} />
                          <div>
                            <p className={`text-base font-black uppercase italic tracking-tighter ${driver2 === d.Driver.code ? 'text-blue-500' : 'text-gray-300 group-hover:text-white'}`}>{d.Driver.familyName}</p>
                            <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">{d.Constructors[0].name}</p>
                          </div>
                        </div>
                        {driver2 === d.Driver.code && <Check size={16} className="text-blue-600" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] shadow-xl">
            <div className="flex items-center gap-3 mb-5 opacity-40"><Zap size={16} className="text-green-500" /><span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none">Max Velocity</span></div>
            <p className="text-6xl font-black italic text-green-500 tabular-nums tracking-tighter leading-none">
              {top1 > 0 ? top1.toFixed(1) : "---"} <span className="text-xs font-black text-white uppercase not-italic ml-1 opacity-20">km/h</span>
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[3rem] h-[380px] flex flex-col overflow-hidden shadow-xl">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-4 pl-4 pt-4 leading-none">Circuit Profiling</span>
            <TrackMap path={activeTrackPath} progress={hoverProgress} color={getColor(driver1)} />
          </div>

          {isComparing && winners.length > 0 && (
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[3rem] space-y-5 shadow-xl animate-in zoom-in duration-500">
              <div className="flex items-center gap-3 mb-2 pb-4 border-b border-white/5">
                <Scale size={18} className="text-red-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 leading-none">Sector Advantage</span>
              </div>
              {winners.map((w, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:bg-white/[0.05] transition-all">
                  <span className="text-xs font-black text-gray-700 italic uppercase">S{i+1}</span>
                  <div className="flex items-center gap-5">
                    <span className="text-xs font-black uppercase tracking-tighter" style={{ color: w?.color }}>{w?.code}</span>
                    <span className="text-base font-black italic text-white tabular-nums">+{w?.diff} <span className="text-[8px] opacity-20 not-italic">KM/H</span></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-gradient-to-br from-red-600/10 to-transparent border border-red-600/20 p-8 rounded-[3rem] relative overflow-hidden group shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_#dc2626]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 leading-none">Telemetry Insight</span>
            </div>
            <p className="text-sm font-black leading-relaxed text-gray-400 italic tracking-tight">"{aiInsight}"</p>
          </div>
        </div>

        {/* CHART AREA */}
        <div className="lg:col-span-3 bg-[#0a0a0a] border border-white/10 p-12 rounded-[5rem] relative overflow-hidden flex flex-col shadow-2xl">
          {loading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-[150] flex flex-col items-center justify-center">
               <div className="w-12 h-12 border-4 border-white/5 border-t-red-600 rounded-full animate-spin mb-4" />
               <span className="text-red-600 font-black italic uppercase tracking-[0.4em] animate-pulse">Syncing Telemetry...</span>
            </div>
          )}
          
          <div className="flex-1 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={processedData} 
                onMouseMove={(e: any) => {
                  if (e && e.activeTooltipIndex !== undefined) setHoverProgress(e.activeTooltipIndex / (processedData.length - 1));
                }} 
                onMouseLeave={() => setHoverProgress(0)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="Distance" hide />
                <YAxis stroke="#333" fontSize={11} domain={['auto', 'auto']} tickFormatter={(v) => `${v}k`} />
                <Tooltip content={<CustomTooltip driver1={driver1} driver2={driver2} isComparing={isComparing} getColor={getColor} />} cursor={{ stroke: '#ffffff11', strokeWidth: 1 }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                <Line type="monotone" dataKey={driver1} stroke={getColor(driver1)} strokeWidth={isComparing ? 2 : 5} dot={false} animationDuration={1500} activeDot={{ r: 5, strokeWidth: 0 }} />
                {isComparing && (
                  <Line type="monotone" dataKey={driver2} stroke={getColor(driver2)} strokeWidth={2} strokeDasharray="6 6" dot={false} animationDuration={1500} activeDot={{ r: 5, strokeWidth: 0 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelemetryLab;