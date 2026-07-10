import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home({ session }) {
  const [profile, setProfile] = useState(null)
  const [todayStats, setTodayStats] = useState({ cal: 0, protein: 0, fat: 0, carbs: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([loadProfile(), loadToday()]).then(() => setLoading(false))
  }, [])

  const loadProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
    setProfile(data)
  }

  const loadToday = async () => {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase.from('diary').select('*').eq('user_id', session.user.id).eq('date', today)
    if (data) {
      setTodayStats(data.reduce((acc, item) => ({
        cal: acc.cal + (item.calories || 0),
        protein: acc.protein + (item.protein || 0),
        fat: acc.fat + (item.fat || 0),
        carbs: acc.carbs + (item.carbs || 0),
      }), { cal: 0, protein: 0, fat: 0, carbs: 0 }))
    }
  }

  const calGoal = profile?.cal_goal || 2000
  const progress = Math.min((todayStats.cal / calGoal) * 100, 100)
  const remaining = Math.max(calGoal - todayStats.cal, 0)

  const macros = [
    { label: 'Белки', value: todayStats.protein, goal: profile?.protein_goal || 150, color: '#3b82f6' },
    { label: 'Жиры', value: todayStats.fat, goal: profile?.fat_goal || 67, color: '#f59e0b' },
    { label: 'Углеводы', value: todayStats.carbs, goal: profile?.carbs_goal || 250, color: '#8b5cf6' },
  ]

  if (loading) return (
    <div style={{ padding: 24, background: '#f7f7f8', minHeight: '100vh' }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ background: '#ebebeb', borderRadius: 16, height: 80, marginBottom: 12,
          animation: 'pulse 1.5s infinite' }} />
      ))}
    </div>
  )

  return (
    <div style={{ padding: '24px 20px', background: '#f7f7f8', minHeight: '100vh' }}>

      {/* Приветствие */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: '0 0 2px' }}>
          Привет{profile?.name ? `, ${profile.name}` : ''}! 👋
        </h2>
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
          {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Калории */}
      <div style={{ background: '#fff', borderRadius: 20, padding: 24, marginBottom: 16,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 16,
          textTransform: 'uppercase', letterSpacing: '0.06em' }}>Калории сегодня</p>

        <svg width="160" height="160" viewBox="0 0 160 160" style={{ display: 'block', margin: '0 auto 16px' }}>
          <circle cx="80" cy="80" r="65" fill="none" stroke="#f0f0f0" strokeWidth="10"/>
          <circle cx="80" cy="80" r="65" fill="none" stroke="#111" strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 65}`}
            strokeDashoffset={`${2 * Math.PI * 65 * (1 - progress / 100)}`}
            strokeLinecap="round" transform="rotate(-90 80 80)"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}/>
          <text x="80" y="70" textAnchor="middle" fill="#111" fontSize="30" fontWeight="700">
            {Math.round(todayStats.cal)}
          </text>
          <text x="80" y="88" textAnchor="middle" fill="#aaa" fontSize="12">съедено</text>
          <text x="80" y="108" textAnchor="middle" fill="#888" fontSize="12">
            осталось {Math.round(remaining)}
          </text>
        </svg>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: 0 }}>{calGoal}</p>
            <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>цель</p>
          </div>
          <div style={{ width: 1, background: '#ebebeb' }}/>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: 0 }}>{Math.round(progress)}%</p>
            <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>выполнено</p>
          </div>
        </div>
      </div>

      {/* КБЖУ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {macros.map(item => {
          const pct = Math.min(item.value / item.goal * 100, 100)
          return (
            <div key={item.label} style={{ background: '#fff', borderRadius: 16, padding: 14,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#888', margin: '0 0 6px',
                textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '0 0 2px' }}>
                {Math.round(item.value)}
              </p>
              <p style={{ fontSize: 10, color: '#bbb', margin: '0 0 8px' }}>из {item.goal}г</p>
              <div style={{ background: '#f0f0f0', borderRadius: 4, height: 3 }}>
                <div style={{ background: item.color, borderRadius: 4, height: 3,
                  width: `${pct}%`, transition: 'width 0.6s ease' }}/>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}