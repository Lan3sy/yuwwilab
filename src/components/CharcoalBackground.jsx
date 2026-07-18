export default function CharcoalBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden',
      background: 'linear-gradient(180deg, #08090a 0%, #101113 30%, #17181b 55%, #1c1d20 80%, #1e1f22 100%)' }}>
      <style>{`
        @keyframes cloudDrift1 { 0%{transform:translateX(-6%) translateY(0)} 50%{transform:translateX(6%) translateY(2%)} 100%{transform:translateX(-6%) translateY(0)} }
        @keyframes cloudDrift2 { 0%{transform:translateX(4%)} 50%{transform:translateX(-8%)} 100%{transform:translateX(4%)} }
        @keyframes cloudDrift3 { 0%{transform:translateX(-3%)} 50%{transform:translateX(5%)} 100%{transform:translateX(-3%)} }
        @keyframes lightPulse { 0%,100%{opacity:0.5} 50%{opacity:0.8} }
        @keyframes lightPulseSlow { 0%,100%{opacity:0.3} 50%{opacity:0.55} }
        @keyframes waveShift1 { 0%{transform:translateX(-5%)} 100%{transform:translateX(5%)} }
        @keyframes waveShift2 { 0%{transform:translateX(4%)} 100%{transform:translateX(-4%)} }
        @keyframes grainShift { 0%{transform:translate(0,0)} 100%{transform:translate(-4%,-4%)} }
      `}</style>

      {/* Разрыв в тучах — главный источник света, справа как в референсе */}
      <div style={{ position: 'absolute', top: '14%', left: '62%', width: '38vw', height: '32vh',
        background: 'radial-gradient(circle, rgba(220,222,228,0.75) 0%, rgba(190,193,200,0.35) 35%, rgba(160,163,170,0.12) 60%, transparent 78%)',
        filter: 'blur(50px)', animation: 'lightPulse 15s ease-in-out infinite' }}/>
      <div style={{ position: 'absolute', top: '18%', left: '66%', width: '16vw', height: '14vh',
        background: 'radial-gradient(circle, rgba(240,241,245,0.9) 0%, transparent 70%)',
        filter: 'blur(25px)', animation: 'lightPulse 11s ease-in-out infinite 1.5s' }}/>
      {/* Лучи вниз от разрыва */}
      <div style={{ position: 'absolute', top: '22%', left: '58%', width: '30vw', height: '40vh',
        background: 'linear-gradient(200deg, rgba(200,203,210,0.18) 0%, transparent 60%)',
        filter: 'blur(30px)', animation: 'lightPulseSlow 20s ease-in-out infinite' }}/>

      {/* Плотные грозовые тучи — тёмные массы */}
      <div style={{ position: 'absolute', top: '-8%', width: '175%', left: '-38%', height: '48%',
        background: 'radial-gradient(ellipse at 25% 30%, rgba(20,21,24,0.9) 0%, rgba(15,16,18,0.6) 45%, transparent 75%)',
        filter: 'blur(35px)', animation: 'cloudDrift1 46s ease-in-out infinite' }}/>
      <div style={{ position: 'absolute', top: '0%', width: '160%', left: '-30%', height: '38%',
        background: 'radial-gradient(ellipse at 65% 40%, rgba(35,37,41,0.55), transparent 65%)',
        filter: 'blur(55px)', animation: 'cloudDrift2 58s ease-in-out infinite' }}/>
      <div style={{ position: 'absolute', top: '10%', width: '150%', left: '-25%', height: '28%',
        background: 'linear-gradient(90deg, transparent, rgba(50,52,56,0.4), transparent)',
        filter: 'blur(45px)', animation: 'cloudDrift3 50s ease-in-out infinite' }}/>

      {/* Линия горизонта с тонким свечением */}
      <div style={{ position: 'absolute', top: '52%', left: 0, width: '100%', height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(200,203,210,0.3) 60%, rgba(230,232,236,0.5) 68%, rgba(200,203,210,0.2) 78%, transparent)',
        filter: 'blur(3px)' }}/>

      {/* Океан — многослойные волны */}
      <svg viewBox="0 0 400 230" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50%' }}>
        <defs>
          <linearGradient id="seaGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#26282c"/>
            <stop offset="100%" stopColor="#17181b"/>
          </linearGradient>
          <linearGradient id="seaGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1c1e21"/>
            <stop offset="100%" stopColor="#0e0f11"/>
          </linearGradient>
          <radialGradient id="seaReflect" cx="60%" cy="0%" r="60%">
            <stop offset="0%" stopColor="rgba(210,213,220,0.22)"/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="400" height="230" fill="url(#seaReflect)"/>
        <g style={{ animation: 'waveShift1 28s ease-in-out infinite alternate' }}>
          <path d="M0,55 Q40,40 80,55 T160,55 T240,55 T320,55 T400,55 L400,230 L0,230 Z"
            fill="url(#seaGrad1)" opacity="0.9"/>
        </g>
        <g style={{ animation: 'waveShift2 36s ease-in-out infinite alternate' }}>
          <path d="M0,90 Q50,72 100,90 T200,90 T300,90 T400,90 L400,230 L0,230 Z"
            fill="url(#seaGrad2)" opacity="0.95"/>
        </g>
        {/* блик света на воде, точно под разрывом в тучах */}
        <ellipse cx="248" cy="65" rx="55" ry="7" fill="rgba(210,213,220,0.18)" style={{ animation: 'lightPulse 10s ease-in-out infinite' }}/>
        <ellipse cx="248" cy="95" rx="80" ry="6" fill="rgba(200,203,210,0.1)" style={{ animation: 'lightPulse 13s ease-in-out infinite 1s' }}/>
      </svg>

      {/* Тонкая зерновая текстура для кинематографичности */}
      <div style={{ position: 'absolute', inset: '-10%', opacity: 0.025, mixBlendMode: 'overlay',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
        backgroundSize: '3px 3px', animation: 'grainShift 8s steps(4) infinite' }}/>

      {/* Виньетка */}
      <div style={{ position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 62% 35%, transparent 35%, rgba(0,0,0,0.5) 100%)' }}/>
    </div>
  )
}