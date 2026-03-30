import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, ShieldCheck, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TEAM_CONFIG } from '../utils/teamsconfig';
import { DriverAvatar } from '../components/DriverAvatar';

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
          axios.get('http://localhost:8000/api/standings/2026'),
          axios.get('http://localhost:8000/api/constructorStandings/2026') 
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

  if (loading) return <div className="h-screen flex items-center justify-center text-red-600 font-black italic animate-pulse">SYNCING 2026 DATA...</div>;

  return (
    <div className="max-w-[1700px] mx-auto p-10 h-screen flex flex-col">
      
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">World <span className="text-red-600">Standings</span></h1>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button onClick={() => { setActiveTab('drivers'); setSelectedId(driverStandings[0].Driver.driverId); }} 
            className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isDrivers ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>Drivers</button>
          <button onClick={() => { setActiveTab('constructors'); setSelectedId(constructorStandings[0].Constructor.constructorId); }} 
            className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isDrivers ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>Teams</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1 min-h-0">
        
        {/* RANKINGS LIST */}
        <div className="lg:col-span-7 overflow-y-auto pr-4 space-y-3 custom-scrollbar">
          {currentList.map((item) => {
            const name = isDrivers ? item.Driver.familyName : item.Constructor.name;
            const subText = isDrivers ? item.Constructors[0].name : "2026 Chassis Program";
            const teamIdentifier = isDrivers ? item.Constructors[0].name : item.Constructor.name;
            const itemConfig = Object.entries(TEAM_CONFIG).find(([key]) => teamIdentifier.includes(key))?.[1] || { color: '#444', logo: 'default.png' };
            const isSelected = isDrivers ? item.Driver.driverId === selectedId : item.Constructor.constructorId === selectedId;

            return (
              <div 
                key={isDrivers ? item.Driver.driverId : item.Constructor.constructorId}
                // FIXED: Clicking row only updates the card on the right
                onClick={() => setSelectedId(isDrivers ? item.Driver.driverId : item.Constructor.constructorId)}
                className={`group flex items-center gap-6 p-4 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'bg-white/10' : 'bg-white/[0.02] border-white/5'}`}
                style={{ borderColor: isSelected ? itemConfig.color : 'rgba(255,255,255,0.05)' }}
              >
                <span className="text-xl font-black italic opacity-10 w-8">{item.position}</span>
                <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: itemConfig.color }} />
                
                {isDrivers ? (
                  <div className="relative z-10">
                    <DriverAvatar code={item.Driver.code} isSelected={isSelected} teamColor={itemConfig.color} />
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center border border-white/10 overflow-hidden">
                    <img src={`/logos/${itemConfig.logo}`} className="h-8 opacity-90 object-contain" alt={teamIdentifier} />
                  </div>
                )}

                <div className="flex-1">
                  {/* CLEANED: Removed the onClick from name to prevent accidental teleporting */}
                  <p className="text-xl font-black uppercase italic tracking-tighter leading-none">
                    {name}
                  </p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mt-1 tracking-widest leading-none">{subText}</p>
                  
                  <div className="h-1.5 w-full bg-white/5 rounded-full mt-3 overflow-hidden">
                    <div className="h-full transition-all duration-1000 ease-out" 
                      style={{ width: `${(parseInt(item.points) / parseInt(currentList[0].points)) * 100}%`, backgroundColor: itemConfig.color }} 
                    />
                  </div>
                </div>

                {/* 🏁 ADDED: Direct Jump Button on hover for power users */}
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-3xl font-black italic leading-none">{item.points}</p>
                    <p className="text-[8px] font-bold text-gray-500 uppercase mt-1">Points</p>
                  </div>
                  {isDrivers && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // 🛑 Prevents changing the spotlight card
                        navigate(`/profile/2026/${item.Driver.code}`);
                      }}
                      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:border-red-600 transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* SPOTLIGHT HERO CARD */}
        <div className="lg:col-span-5 h-full">
          <div className="bg-white/[0.02] border border-white/10 rounded-[4rem] p-12 h-full relative overflow-hidden flex flex-col justify-between">
            
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -right-20 top-0 w-96 h-96 opacity-20 blur-[100px] rounded-full" style={{ backgroundColor: config.color }} />
              <img 
                src={isDrivers ? `/Drivers/${selectedItem?.Driver.code}.png` : `/logos/${config.logo}`} 
                className={`absolute -right-20 ${isDrivers ? 'top-0 h-full' : 'bottom-0 h-96'} opacity-[0.25] grayscale transition-all duration-700 [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]`}
                style={{ objectFit: 'contain', objectPosition: 'top' }}
                alt=""
              />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8 bg-white/5 w-fit px-5 py-2 rounded-full border border-white/10">
                {isDrivers ? <Trophy size={14} className="text-yellow-500" /> : <ShieldCheck size={14} className="text-blue-500" />}
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {isDrivers ? 'Championship Leader' : 'Constructor Profile'}
                </span>
              </div>
              <h2 className="text-8xl font-black italic uppercase tracking-tighter leading-[0.8]">
                {isDrivers ? selectedItem?.Driver.familyName : selectedItem?.Constructor.name}
              </h2>

              {/* PRIMARY GATEWAY: The only major button to go to the profile */}
              {isDrivers && (
                <button 
                  onClick={() => navigate(`/profile/2026/${selectedItem?.Driver.code}`)}
                  className="mt-6 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(220,38,38,0.3)] transition-all"
                >
                  View Performance Profile <ChevronRight size={14} />
                </button>
              )}

              <p className="text-lg font-bold text-gray-500 uppercase tracking-[0.4em] mt-6">
                {isDrivers ? selectedItem?.Constructors[0].name : `${selectedItem?.Constructor?.nationality} Engineering`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-5 relative z-10">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">{isDrivers ? 'Total Wins' : 'Team Wins'}</span>
                <p className="text-5xl font-black italic mt-2">{selectedItem?.wins || '0'}</p>
              </div>

              <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">
                  {selectedId === currentList[0]?.Driver?.driverId || selectedId === currentList[0]?.Constructor?.constructorId ? 'Lead Margin' : 'Gap to P1'}
                </span>
                <p className="text-5xl font-black italic mt-2 text-white">
                  {selectedId === currentList[0]?.Driver?.driverId || selectedId === currentList[0]?.Constructor?.constructorId 
                    ? `+${parseInt(currentList[0].points) - parseInt(currentList[1].points)}`
                    : `-${parseInt(currentList[0].points) - parseInt(selectedItem?.points || 0)}`}
                  <span className="text-xs not-italic text-gray-500 ml-2">PTS</span>
                </p>
              </div>

              <div className="bg-white/10 p-6 rounded-3xl border border-white/10 col-span-2 shadow-inner" style={{ borderColor: `${config.color}44` }}>
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Current Standing</span>
                <p className="text-5xl font-black italic mt-2" style={{ color: config.color }}>P{selectedItem?.position}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Standings;