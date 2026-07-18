export default function SnowBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden',
      background: 'linear-gradient(180deg, #FDFDF6 0%, #F8F8EF 30%, #F2F2E6 55%, #EAEADD 80%, #E7E7DD 100%)' }}>
      <style>{`
        @keyframes cloudDrift1 { 0%{transform:translateX(-5%) translateY(0)} 50%{transform:translateX(5%) translateY(2%)} 100%{transform:translateX(-5%) translateY(0)} }
        @keyframes cloudDrift2 { 0%{transform:translateX(3%)} 50%{transform:translateX(-6%)} 100%{transform:translateX(3%)} }
        @keyframes cloudDrift3 { 0%{transform:translateX(-2%)} 50%{transform:translateX(4%)} 100%{transform:translateX(-2%)} }
        @keyframes sunGlow { 0%,100%{opacity:0.7} 50%{opacity:1} }
        @keyframes sunRays { 0%,100%{opacity:0.25; transform:scale(1)} 50%{opacity:0.4; transform:scale(1.04)} }
      `}</style>

      {/* Солнце — яркая точка как в референсе, чуть правее центра */}
      <div style={{ position: 'absolute', top: '16%', left: '68%', width: '6vw', height: '6vw',
        background: 'radial-gradient(circle, rgba(255,255,252,1) 0%, rgba(255,250,235,0.9) 40%, transparent 75%)',
        filter: 'blur(6px)', animation: 'sunGlow 10s ease-in-out infinite', borderRadius: '50%' }}/>
      {/* Ореол вокруг солнца */}
      <div style={{ position: 'absolute', top: '6%', left: '55%', width: '32vw', height: '32vh',
        background: 'radial-gradient(circle, rgba(255,253,240,0.55) 0%, rgba(255,250,230,0.2) 45%, transparent 72%)',
        filter: 'blur(40px)', animation: 'sunRays 16s ease-in-out infinite' }}/>
      {/* Широкое рассеянное сияние по всему верху */}
      <div style={{ position: 'absolute', top: '-10%', left: '30%', width: '80vw', height: '50vh',
        background: 'radial-gradient(circle, rgba(255,255,250,0.4) 0%, transparent 70%)',
        filter: 'blur(80px)', animation: 'sunGlow 20s ease-in-out infinite 2s' }}/>

      {/* Горный хребет — многослойный, туманный как в референсе */}
      <svg viewBox="0 0 400 300" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '58%' }}>
        <defs>
          <linearGradient id="mtnFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5F5EB"/>
            <stop offset="100%" stopColor="#ECECDF"/>
          </linearGradient>
          <linearGradient id="mtnMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EEEEE1"/>
            <stop offset="100%" stopColor="#DFDFD0"/>
          </linearGradient>
          <linearGradient id="mtnNear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E6E6D9"/>
            <stop offset="100%" stopColor="#D3D3C2"/>
          </linearGradient>
        </defs>
        {/* дальний туманный хребет */}
        <polygon points="0,300 0,220 50,160 100,200 150,140 210,190 270,120 330,180 400,160 400,300"
          fill="url(#mtnFar)" opacity="0.55"/>
        {/* средний хребет с острыми пиками (как центральная гора в референсе) */}
        <polygon points="0,300 0,250 80,170 130,140 175,190 220,100 260,150 300,80 340,170 400,130 400,300"
          fill="url(#mtnMid)" opacity="0.8"/>
        {/* ближний резкий хребет */}
        <polygon points="0,300 0,270 100,190 160,230 210,150 250,200 300,110 350,190 400,170 400,300"
          fill="url(#mtnNear)" opacity="0.95"/>
        {/* снежные блики на пиках, освещённые солнцем справа */}
        <polygon points="220,100 235,80 250,105 235,115" fill="rgba(255,255,252,0.85)"/>
        <polygon points="300,80 315,58 332,85 315,95" fill="rgba(255,255,252,0.95)"/>
        <polygon points="260,150 272,132 285,155 272,163" fill="rgba(255,255,250,0.6)"/>
      </svg>

      {/* Дрейфующий туман в долине */}
      <div style={{ position: 'absolute', top: '38%', width: '175%', left: '-38%', height: '18%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,250,0.7), transparent)',
        filter: 'blur(45px)', animation: 'cloudDrift1 36s ease-in-out infinite' }}/>
      <div style={{ position: 'absolute', top: '48%', width: '165%', left: '-28%', height: '14%',
        background: 'linear-gradient(90deg, transparent, rgba(231,231,221,0.75), transparent)',
        filter: 'blur(50px)', animation: 'cloudDrift2 44s ease-in-out infinite' }}/>
      <div style={{ position: 'absolute', top: '10%', width: '150%', left: '-20%', height: '22%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,250,0.5), transparent)',
        filter: 'blur(50px)', animation: 'cloudDrift3 40s ease-in-out infinite' }}/>

      {/* Мягкая виньетка для глубины */}
      <div style={{ position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 65% 30%, transparent 40%, rgba(190,190,170,0.15) 100%)' }}/>
    </div>
  )
}