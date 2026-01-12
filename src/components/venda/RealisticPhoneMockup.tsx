import { ReactNode } from 'react';

interface RealisticPhoneMockupProps {
  children: ReactNode;
}

const RealisticPhoneMockup = ({ children }: RealisticPhoneMockupProps) => {
  return (
    <div className="relative w-full max-w-[300px] mx-auto">
      {/* Outer phone frame - space gray/graphite */}
      <div className="relative bg-gradient-to-b from-[#2d2d2d] via-[#1a1a1a] to-[#2d2d2d] rounded-[48px] p-[3px] shadow-2xl shadow-black/50">
        {/* Inner bezel */}
        <div className="bg-gradient-to-b from-[#1c1c1c] to-[#0a0a0a] rounded-[45px] p-[10px]">
          {/* Screen container */}
          <div className="relative bg-black rounded-[38px] overflow-hidden">
            {/* Dynamic Island */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
              <div className="bg-black rounded-full w-[90px] h-[28px] flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#1a1a1a] border border-[#333] mr-1" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
              </div>
            </div>

            {/* Screen content */}
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </div>

        {/* Side buttons - Volume */}
        <div className="absolute left-[-3px] top-[100px] w-[3px] h-[30px] bg-gradient-to-r from-[#1a1a1a] to-[#333] rounded-l" />
        <div className="absolute left-[-3px] top-[140px] w-[3px] h-[50px] bg-gradient-to-r from-[#1a1a1a] to-[#333] rounded-l" />
        <div className="absolute left-[-3px] top-[200px] w-[3px] h-[50px] bg-gradient-to-r from-[#1a1a1a] to-[#333] rounded-l" />

        {/* Side button - Power */}
        <div className="absolute right-[-3px] top-[150px] w-[3px] h-[70px] bg-gradient-to-l from-[#1a1a1a] to-[#333] rounded-r" />

        {/* Subtle reflections */}
        <div className="absolute inset-0 rounded-[48px] bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 rounded-b-[48px] bg-gradient-to-t from-white/[0.02] to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default RealisticPhoneMockup;
