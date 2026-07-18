export default function LiquidBackground() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden',
      background: 'linear-gradient(180deg, #f7f7f9 0%, #f2f2f5 100%)',
    }}>
      <style>{`
        @keyframes blobMove1 {
          0%   { transform: translate(-10%, -10%) scale(1); }
          33%  { transform: translate(10%, 5%) scale(1.15); }
          66%  { transform: translate(-5%, 15%) scale(0.95); }
          100% { transform: translate(-10%, -10%) scale(1); }
        }
        @keyframes blobMove2 {
          0%   { transform: translate(10%, 10%) scale(1); }
          33%  { transform: translate(-15%, -5%) scale(1.2); }
          66%  { transform: translate(5%, -15%) scale(0.9); }
          100% { transform: translate(10%, 10%) scale(1); }
        }
        @keyframes blobMove3 {
          0%   { transform: translate(0%, 0%) scale(1); }
          50%  { transform: translate(-10%, 10%) scale(1.25); }
          100% { transform: translate(0%, 0%) scale(1); }
        }
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.55;
          will-change: transform;
        }
      `}</style>

      <div className="blob" style={{
        width: '60vw', height: '60vw', top: '-15%', left: '-10%',
        background: 'radial-gradient(circle, #ffffff 0%, #e9ecf2 60%, transparent 75%)',
        animation: 'blobMove1 32s ease-in-out infinite',
      }}/>
      <div className="blob" style={{
        width: '55vw', height: '55vw', bottom: '-20%', right: '-15%',
        background: 'radial-gradient(circle, #eef0f7 0%, #dfe3ee 55%, transparent 75%)',
        animation: 'blobMove2 38s ease-in-out infinite',
      }}/>
      <div className="blob" style={{
        width: '45vw', height: '45vw', top: '30%', left: '30%',
        background: 'radial-gradient(circle, #f3eef7 0%, #e6e0ee 55%, transparent 75%)',
        animation: 'blobMove3 28s ease-in-out infinite',
      }}/>
      <div className="blob" style={{
        width: '40vw', height: '40vw', top: '5%', right: '10%',
        background: 'radial-gradient(circle, #eef4f7 0%, #dfe8ee 55%, transparent 75%)',
        animation: 'blobMove1 26s ease-in-out infinite reverse',
      }}/>
    </div>
  )
}