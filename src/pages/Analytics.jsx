import { useEffect, useState, useRef, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useTheme } from '../components/ThemeProvider'

const METRICS = [
  { key: 'cal', label: 'Калории', unit: 'ккал', color: 'var(--color-primary)' },
  { key: 'protein', label: 'Белки', unit: 'г', color: '#3b82f6' },
  { key: 'fat', label: 'Жиры', unit: 'г', color: '#f59e0b' },
  { key: 'carbs', label: 'Углеводы', unit: 'г', color: '#8b5cf6' },
]

function FadeCard({ delay = 0, children, style = {}, className = '' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={className} style={{
      ...style,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(10px)',
      transition: visible
        ? `opacity 0.25s ease ${delay}ms, transform 0.25s ease ${delay}ms`
        : 'none',
    }}>
      {children}
    </div>
  )
}

export default function Analytics({ session }) {
  const [rawData, setRawData] = useState([])
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()

  useEffect(() => {
    const load = async () => {
      const from = new Date()
      from.setDate(from.getDate() - 6)
      const { data } = await supabase.from('diary').select('date, calories, protein, fat, carbs')
        .eq('user_id', session.user.id)
        .gte('date', from.toISOString().split('T')[0])
        .order('date')

      setRawData(data || [])
      setLoading(false)
    }
    load()
  }, [session.user.id])

  // Мемоизируем обработку данных — пересчитывается только когда rawData меняется
  const data = useMemo(() => {
    const grouped = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      grouped[key] = { date: key, cal: 0, protein: 0, fat: 0, carbs: 0 }
    }
    rawData.forEach(item => {
      if (grouped[item.date]) {
        grouped[item.date].cal += item.calories || 0
        grouped[item.date].protein += item.protein || 0
        grouped[item.date].fat += item.fat || 0
        grouped[item.date].carbs += item.carbs || 0
      }
    })
    return Object.values(grouped).map(d => ({
      ...d,
      label: new Date(d.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      cal: Math.round(d.cal),
      protein: Math.round(d.protein),
      fat: Math.round(d.fat),
      carbs: Math.round(d.carbs),
    }))
  }, [rawData])

  const avg = (key) => {
    const filled = data.filter(d => d[key] > 0)
    if (!filled.length) return 0
    return Math.round(filled.reduce((s, d) => s + d[key], 0) / filled.length)
  }

  const axisColor = theme === 'charcoal' ? '#75767a' : '#bbb'
  const tooltipBg = theme === 'charcoal' ? '#2a2b2e' : '#fff'
  const tooltipText = theme === 'charcoal' ? '#e8e9eb' : '#111'

  const CustomTooltip = ({ active, payload, label, unit }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: tooltipBg, border: '1px solid var(--color-border)', borderRadius: 10,
          padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: '0 0 2px' }}>{label}</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: tooltipText, margin: 0 }}>
            {payload[0].value} {unit}
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) return (
    <div style={{ padding: 24, minHeight: '100vh' }}>
      {[1,2,3,4].map(i => (
        <div key={i} className="glass-card" style={{ height: 160, marginBottom: 12,
          animation: 'pulse 1.5s infinite' }}/>
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  )

  return (
    <div style={{ padding: '24px 20px', minHeight: '100vh' }}>

      <div style={{ opacity: 1, animation: 'fadeInUp 0.25s ease forwards', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Аналитика</h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>Последние 7 дней</p>
      </div>

      {METRICS.map((metric, index) => (
        <FadeCard key={metric.key} delay={index * 80} className="glass-card" style={{
          padding: 20, marginBottom: 12
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', margin: '0 0 4px',
                textTransform: 'uppercase', letterSpacing: '0.06em' }}>{metric.label}</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                {avg(metric.key)}
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 400 }}> {metric.unit}</span>
              </p>
              <p style={{ fontSize: 11, color: 'var(--color-text-disabled)', margin: '2px 0 0' }}>среднее в день</p>
            </div>
            <div style={{ background: 'var(--color-surface)', borderRadius: 10, padding: '6px 10px' }}>
              <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: 0, fontWeight: 600 }}>7 дней</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={data} barSize={20}>
              <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 10 }}
                axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip content={<CustomTooltip unit={metric.unit}/>}/>
              <Bar dataKey={metric.key} fill={metric.color} radius={[4, 4, 0, 0]} fillOpacity={0.85}/>
            </BarChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={50}>
            <LineChart data={data}>
              <Line type="monotone" dataKey={metric.key} stroke={metric.color}
                strokeWidth={2} dot={false} strokeOpacity={0.4}/>
            </LineChart>
          </ResponsiveContainer>
        </FadeCard>
      ))}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}