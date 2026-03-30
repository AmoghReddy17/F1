import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, ShieldCheck, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TEAM_CONFIG } from '../utils/teamsconfig';
import { DriverAvatar } from '../components/DriverAvatar';
// 🏁 IMPORT CONFIG
import { API_BASE } from '../config';

const Standings = () => {
  const [activeTab, setActiveTab] = useState<'drivers' | 'constructors'>('drivers');
  const [driverStandings, setDriverStandings] = useState<any[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dRes, cRes] = await Promise.all([
          axios.get(`${API_BASE}/api/standings/2026`),
          axios.get(`${API_BASE}/api/constructorStandings/2026`) 
        ]);
        
        const dList = dRes.data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
        const cList = cRes.data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
        
        setDriverStandings(dList);
        setConstructorStandings(cList);
        setSelectedId(dList[0].Driver.driverId);
      } catch (err) {
        console.error("Data synchronization failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isDrivers = activeTab === 'drivers';
  const currentList = isDrivers ? driverStandings : constructorStandings;
  
  const selectedItem = currentList.find(item => 
    isDrivers ? item.Driver.driverId === selectedId : item.Constructor.constructorId === selectedId
  );

  const teamName = isDrivers ? selectedItem?.Constructors[0].name : selectedItem?.Constructor.name;
  const config = Object.entries(TEAM_CONFIG).find(([k]) => teamName?.includes(k))?.[1] || { color: '#444', logo: 'default.png' };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#050505]">
       <div className="w-16 h-16 border-4 border-white/5 border-t-red-600 rounded-full animate-spin mb-4" />
       <p className="text-red-600 font-black italic uppercase tracking-[0.4em] animate-pulse">Syncing 2026 Grid...</p>
    </div>
  );

  return (
    <div className="max-w-[1700px] mx-auto p-10 pt-32 h-screen flex flex-col">
      
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter">World <span className="text-red-600">Standings</span></h1>
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-2xl">
          <button onClick={() => { setActiveTab('drivers'); setSelectedId(driverStandings[0].Driver.driverId); }} 
            className={`px-10 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isDrivers ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:text-white'}`}>Drivers</button>
          <button onClick={() => { setActiveTab('constructors'); setSelectedId(constructorStandings[0].Constructor.constructorId); }} 
            className={`px-10 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isDrivers ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:text-white'}`}>Constructors</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1 min-h-0">
        
        {/* RANKINGS LIST */}
        <div className="lg:col-span-7 overflow-y-auto pr-4 space-y-3 custom-scrollbar pb-10">
          {currentList.map((item) => {
            const name = isDrivers ? item.Driver.familyName : item.Constructor.name;
            const subText = isDrivers ? item.Constructors[0].name : "2026 Chassis Program";
            const teamIdentifier = isDrivers ? item.Constructors[0].name : item.Constructor.name;
            const itemConfig = Object.entries(TEAM_CONFIG).find(([key]) => teamIdentifier.includes(key))?.[1] || { color: '#444', logo: 'default.png' };
            const isSelected = isDrivers ? item.Driver.driverId === selectedId : item.Constructor.constructorId === selectedId;

            return (
              <div 
                key={isDrivers ? item.Driver.driverId : item.Constructor.constructorId}
                onClick={() => setSelectedId(isDrivers ? item.Driver.driverId : item.Constructor.constructorId)}
                className={`group flex items-center gap-6 p-5 rounded-3xl border transition-all cursor-pointer ${isSelected ? 'bg-white/10 scale-[1.02]' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'}`}
                style={{ borderColor: isSelected ? itemConfig.color : 'rgba(255,255,255,0.05)' }}
              >
                <span className="text-2xl font-black italic opacity-10 w-10">{item.position}</span>
                <div className="w-1.5 h-12 rounded-full" style={{ backgroundColor: itemConfig.color }} />
                
                {isDrivers ? (
                  <div className="relative z-10">
                    <DriverAvatar code={item.Driver.code} isSelected={isSelected} teamColor={itemConfig.color} size="w-14 h-14" />
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center border border-white/10 overflow-hidden">
                    <img src={`/logos/${itemConfig.logo}`} className="h-8 opacity-90 object-contain" alt={teamIdentifier} />
                  </div>
                )}

                <div className="flex-1">
                  <p className="text-2xl font-black uppercase italic tracking-tighter leading-none group-hover:text-red-600 transition-colors">
                    {name}
                  </p>
                  <p className="text-[10px] font-black text-gray-600 uppercase mt-2 tracking-widest leading-none">{subText}</p>
                  
                  <div className="h-1 w-full bg-white/5 rounded-full mt-4 overflow-hidden">
                    <div className="h-full transition-all duration-1000 ease-out" 
                      style={{ width: `${(parseInt(item.points) / parseInt(currentList[0].points)) * 100}%`, backgroundColor: itemConfig.color }} 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-3xl font-black italic leading-none tabular-nums">{item.points}</p>
                    <p className="text-[9px] font-black text-gray-700 uppercase mt-1">Points</p>
                  </div>
                  {isDrivers && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/2026/${item.Driver.code}`);
                      }}
                      className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:border-red-600 transition-all shadow-xl"
                    >
                      <ChevronRight size={20} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* SPOTLIGHT HERO CARD */}
        <div className="lg:col-span-5 h-full pb-10">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-[4rem] p-12 h-full relative overflow-hidden flex flex-col justify-between shadow-2xl">
            
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -right-20 top-0 w-[500px] h-[500px] opacity-20 blur-[120px] rounded-full transition-all duration-1000" style={{ backgroundColor: config.color }} />
              <img 
                src={isDrivers ? `/Drivers/${selectedItem?.Driver.code}.png` : `/logos/${config.logo}`} 
                className={`absolute -right-20 ${isDrivers ? 'top-0 h-full' : 'bottom-0 h-[70%] p-20'} opacity-[0.2] grayscale group-hover:grayscale-0 transition-all duration-1000 [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]`}
                style={{ objectFit: 'contain', objectPosition: 'top' }}
                alt=""
              />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-10 bg-white/5 w-fit px-6 py-2.5 rounded-full border border-white/10 backdrop-blur-xl">
                {isDrivers ? <Trophy size={16} className="text-yellow-500" /> : <ShieldCheck size={16} className="text-blue-500" />}
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
                  {isDrivers ? 'Athlete Spotlight' : 'Chassis Intelligence'}
                </span>
              </div>
              
              <h2 className="text-[8rem] font-black italic uppercase tracking-tighter leading-[0.75] mb-6">
                {isDrivers ? selectedItem?.Driver.familyName : selectedItem?.Constructor.name}
              </h2>

              {isDrivers && (
                <button 
                  onClick={() => navigate(`/profile/2026/${selectedItem?.Driver.code}`)}
                  className="group flex items-center gap-4 bg-red-600 hover:bg-red-700 text-white px-8 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(220,38,38,0.3)] transition-all active:scale-95"
                >
                  Analyze Driver DNA <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6 relative z-10">
              <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">{isDrivers ? 'Grand Prix Wins' : 'Program Wins'}</span>
                <p className="text-6xl font-black italic mt-3 tabular-nums">{selectedItem?.wins || '0'}</p>
              </div>

              <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                  {selectedId === currentList[0]?.Driver?.driverId || selectedId === currentList[0]?.Constructor?.constructorId ? 'Lead Margin' : 'Gap to Lead'}
                </span>
                <p className="text-6xl font-black italic mt-3 tabular-nums">
                  {selectedId === currentList[0]?.Driver?.driverId || selectedId === currentList[0]?.Constructor?.constructorId 
                    ? `+${parseInt(currentList[0].points) - (parseInt(currentList[1]?.points) || 0)}`
                    : `-${parseInt(currentList[0].points) - parseInt(selectedItem?.points || 0)}`}
                  <span className="text-sm not-italic text-gray-700 ml-2">PTS</span>
                </p>
              </div>

              <div className="bg-white/5 p-10 rounded-[3rem] border-2 col-span-2 shadow-2xl flex items-center justify-between" style={{ borderColor: `${config.color}33` }}>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">World Ranking</span>
                  <p className="text-7xl font-black italic mt-2" style={{ color: config.color }}>P{selectedItem?.position}</p>
                </div>
                <img src={`/logos/${config.logo}`} className="h-16 opacity-10 grayscale invert" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Standings;