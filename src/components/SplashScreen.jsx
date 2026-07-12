import { useEffect, useState } from 'react'

export default function SplashScreen({ onFinish }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), 2000)
    const t2 = setTimeout(() => onFinish(), 2500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onFinish])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0a0a0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', zIndex: 9999,
      opacity: exiting ? 0 : 1,
      transform: exiting ? 'scale(1.03)' : 'scale(1)',
      filter: exiting ? 'blur(6px)' : 'blur(0px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease, filter 0.5s ease',
    }}>
      <style>{`
        @keyframes appear {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes glowPulse {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes waveMove {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes liquidRise {
          0%   { transform: translateY(170px); }
          75%  { transform: translateY(0px); }
          85%  { transform: translateY(6px); }
          92%  { transform: translateY(-2px); }
          100% { transform: translateY(0px); }
        }
        @keyframes bubbleUp {
          0%   { transform: translateY(0) scale(1); opacity: 0; }
          15%  { opacity: 0.8; }
          85%  { opacity: 0.5; }
          100% { transform: translateY(-140px) scale(0.6); opacity: 0; }
        }
        @keyframes wordFade {
          from { opacity: 0; letter-spacing: 2px; }
          to   { opacity: 1; letter-spacing: 0.5px; }
        }
      `}</style>

      <div style={{ position: 'relative', width: 160, height: 200,
        animation: 'appear 0.4s ease forwards', opacity: 0 }}>

        {/* Мягкое свечение позади колбы */}
        <div style={{
          position: 'absolute', inset: '-40px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%)',
          animation: 'glowPulse 0.6s ease 1.9s forwards', opacity: 0,
          filter: 'blur(4px)',
        }}/>

        <svg viewBox="0 0 160 200" width="160" height="200" style={{ position: 'relative', overflow: 'visible' }}>
          <defs>
            <clipPath id="flaskClip">
              <path d="M65,10 L65,60 L18,168 Q18,178 28,178 L132,178 Q142,178 142,168 L95,60 L95,10 Z"/>
            </clipPath>
            <linearGradient id="liquidGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff"/>
              <stop offset="100%" stopColor="#cfd4d8"/>
            </linearGradient>
          </defs>

          {/* Контур колбы */}
          <path d="M65,10 L65,60 L18,168 Q18,178 28,178 L132,178 Q142,178 142,168 L95,60 L95,10"
            fill="none" stroke="#ffffff" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round"
            style={{
              filter: 'drop-shadow(0 0 0px rgba(255,255,255,0))',
              animation: 'glowPulse 0.01s',
            }}/>
          <path d="M65,10 L65,60 L18,168 Q18,178 28,178 L132,178 Q142,178 142,168 L95,60 L95,10"
            fill="none" stroke="#ffffff" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round"
            opacity="0"
            style={{
              filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))',
              animation: 'glowPulse 0.5s ease 1.9s forwards',
            }}/>

          {/* Жидкость, ограниченная формой колбы */}
          <g clipPath="url(#flaskClip)">
            <g style={{ animation: 'liquidRise 1.4s cubic-bezier(0.34, 1.1, 0.4, 1) 0.4s forwards',
              transform: 'translateY(170px)' }}>

              {/* Волнистая поверхность (двойная ширина, зациклена) */}
              <g style={{ animation: 'waveMove 2.2s linear infinite' }}>
                <path d="M0,90 
                  Q10,84 20,90 T40,90 T60,90 T80,90 T100,90 T120,90 T140,90 T160,90
                  L160,200 L0,200 Z" fill="url(#liquidGradient)"/>
                <path d="M160,90 
                  Q170,84 180,90 T200,90 T220,90 T240,90 T260,90 T280,90 T300,90 T320,90
                  L320,200 L160,200 Z" fill="url(#liquidGradient)"/>
              </g>

              {/* Пузырьки */}
              {[
                { x: 60, delay: 0.6, size: 4 },
                { x: 85, delay: 1.0, size: 3 },
                { x: 70, delay: 1.4, size: 5 },
                { x: 95, delay: 0.8, size: 3 },
                { x: 55, delay: 1.6, size: 4 },
              ].map((b, i) => (
                <circle key={i} cx={b.x} cy="130" r={b.size}
                  fill="rgba(255,255,255,0.6)"
                  style={{
                    transformOrigin: `${b.x}px 130px`,
                    animation: `bubbleUp 1.6s ease-in ${b.delay}s infinite`,
                    opacity: 0,
                  }}/>
              ))}
            </g>
          </g>
        </svg>
      </div>

      <div style={{
        marginTop: 18, fontFamily: "'Baloo 2', sans-serif", fontWeight: 700,
        fontSize: 26, color: '#fff', opacity: 0,
        animation: 'wordFade 0.5s ease 0.3s forwards',
        textShadow: '0 0 0px rgba(255,255,255,0)',
      }}>
        <span style={{
          display: 'inline-block',
          animation: 'glowPulse 0.5s ease 1.9s forwards',
          textShadow: '0 0 16px rgba(255,255,255,0.5)',
        }}>
          yuwwiiab
        </span>
      </div>
    </div>
  )
}