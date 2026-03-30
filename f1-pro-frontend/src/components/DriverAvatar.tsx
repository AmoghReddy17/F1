interface AvatarProps {
  code: string;
  size?: string;
  isSelected?: boolean;
  teamColor?: string;
}

export const DriverAvatar = ({ code, size = "w-14 h-14", isSelected, teamColor }: AvatarProps) => (
  <div 
    /* 🏁 KEEPING IT CONTAINED: overflow-hidden is mandatory here */
    className={`${size} rounded-full border-2 overflow-hidden bg-[#0a0a0a] relative flex-shrink-0 transition-all duration-500`}
    style={{ 
      borderColor: isSelected ? teamColor : 'rgba(255,255,255,0.1)',
      boxShadow: isSelected ? `0 0 20px ${teamColor}66` : 'none',
      transform: isSelected ? 'scale(1.05)' : 'scale(1)'
    }}
  >
    
    <img 
      src={`/Drivers/${code}.png`} 
      alt={code}
      /* 🏁 THE "HEADSHOT" CALIBRATION: 
         - scale-[5.2]: Deep zoom to cut out the torso and focus on the portrait.
         - origin-[center_10%]: Anchors the zoom at the very top of the file (the head).
         - object-top: Ensures we don't drift toward the feet.
      */
      className="w-full h-full object-cover scale-[2.8] origin-[center_0%] object-top transition-all duration-500"
      onError={(e) => { 
        const target = e.currentTarget;
        if (target.src.endsWith('.png')) {
          target.src = target.src.replace('.png', '.jpg');
        } else {
          target.src = '/Drivers/default.png';
        }
      }} 
    />
    
    {/* High-end glass reflection */}
    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
  </div>
);