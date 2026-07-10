import {
  IconActivityMin, IconActivityLight, IconActivityMedium, IconActivityHigh, IconActivityMax,
  IconGoalLoss, IconGoalMaintain, IconGoalGain,
  IconMale, IconFemale
} from '../components/Icons'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { setUnsaved } from '../components/Layout'

const ACTIVITY = [
  { key: 'min', label: 'Минимальный', Icon: IconActivityMin, desc: 'Сидячий образ жизни' },
  { key: 'light', label: 'Лёгкий', Icon: IconActivityLight, desc: 'Прогулки 1–3 раза в неделю' },
  { key: 'medium', label: 'Средний', Icon: IconActivityMedium, desc: 'Тренировки 3–5 раз в неделю' },
  { key: 'high', label: 'Высокий', Icon: IconActivityHigh, desc: 'Тренировки 6–7 раз в неделю' },
  { key: 'max', label: 'Очень высокий', Icon: IconActivityMax, desc: 'Профессиональный спорт' },
]

const GOALS = [
  { key: 'loss', label: 'Похудение', Icon: IconGoalLoss },
  { key: 'maintain', label: 'Поддержание', Icon: IconGoalMaintain },
  { key: 'gain', label: 'Набор массы', Icon: IconGoalGain },
]

const calcNorm = (f) => {
  if (!f.age || !f.height || !f.weight) return { cal: 0, protein: 0, fat: 0, carbs: 0 }
  const bmr = f.gender === 'male'
    ? 10 * +f.weight + 6.25 * +f.height - 5 * +f.age + 5
    : 10 * +f.weight + 6.25 * +f.height - 5 * +f.age - 161
  const kMap = { min: 1.2, light: 1.375, medium: 1.55, high: 1.725, max: 1.9 }
  let cal = bmr * (kMap[f.activity_level] || 1.55)
  if (f.goal === 'loss') cal -= 500
  if (f.goal === 'gain') cal += 300
  return {
    cal: Math.round(cal),
    protein: Math.round(+f.weight * 2),
    fat: Math.round(cal * 0.25 / 9),
    carbs: Math.round(cal * 0.5 / 4)
  }
}

const fadeStyle = (delay = 0) => ({
  animation: `fadeInUp 0.25s ease forwards`,
  animationDelay: `${delay}ms`,
  opacity: 0,
})

export default function Profile({ session }) {
  const [form, setForm] = useState({
    name: '', age: '', gender: 'male',
    height: '', weight: '', activity_level: 'medium', goal: 'maintain'
  })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [error, setError] = useState('')
  const profileExists = useRef(false)

  useEffect(() => {
    supabase.from('profiles').select('*').eq('id', session.user.id).single()
      .then(({ data }) => {
        if (data) {
          profileExists.current = true
          setForm({
            name: data.name || '',
            age: data.age || '',
            gender: data.gender || 'male',
            height: data.height || '',
            weight: data.weight || '',
            activity_level: data.activity_level || 'medium',
            goal: data.goal || 'maintain',
          })
        }
      })
  }, [])

  useEffect(() => { return () => setUnsaved(false) }, [])

  const updateForm = (updates) => {
    setForm(prev => ({ ...prev, ...updates }))
    setHasChanges(true)
    setUnsaved(true, 'данные профиля')
  }

  const save = async () => {
    setSaving(true)
    setError('')
    const norm = calcNorm(form)
    const payload = {
      id: session.user.id,
      name: form.name,
      age: +form.age || 0,
      gender: form.gender,
      height: +form.height || 0,
      weight: +form.weight || 0,
      activity_level: form.activity_level,
      goal: form.goal,
      cal_goal: norm.cal || 2000,
      protein_goal: norm.protein || 150,
      fat_goal: norm.fat || 67,
      carbs_goal: norm.carbs || 250,
    }

    let result
    if (profileExists.current) {
      result = await supabase.from('profiles').update(payload).eq('id', session.user.id)
    } else {
      result = await supabase.from('profiles').insert(payload)
      if (!result.error) profileExists.current = true
    }

    setSaving(false)
    if (result.error) {
      setError('Ошибка сохранения: ' + result.error.message)
    } else {
      setUnsaved(false)
      setHasChanges(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  const norm = calcNorm(form)

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: '#f9f9f9',
    border: '1.5px solid #ebebeb', borderRadius: 12, color: '#111',
    fontSize: 15, boxSizing: 'border-box', outline: 'none'
  }

  return (
    <div style={{ padding: '24px 20px', background: '#e8e8ea', minHeight: '100vh' }}>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Заголовок */}
      <div style={{ ...fadeStyle(0), display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: 0 }}>Профиль</h2>
          <p style={{ fontSize: 13, color: '#888', margin: '2px 0 0' }}>Личные данные и настройки</p>
        </div>
        {hasChanges && !saved && (
          <span style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b',
            background: '#fef3c7', padding: '4px 10px', borderRadius: 20,
            border: '1px solid #fde68a' }}>● Не сохранено</span>
        )}
        {saved && (
          <span style={{ fontSize: 11, fontWeight: 600, color: '#10b981',
            background: '#d1fae5', padding: '4px 10px', borderRadius: 20,
            border: '1px solid #a7f3d0' }}>✓ Сохранено</span>
        )}
      </div>

      {/* Личные данные */}
      <div style={{ ...fadeStyle(60), background: '#fff', borderRadius: 16, padding: 20,
        marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 16 }}>Личные данные</p>

        <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block',
          marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Имя</label>
        <input value={form.name} onChange={e => updateForm({ name: e.target.value })}
          placeholder="Твоё имя" style={{ ...inputStyle, marginBottom: 14 }}/>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
          {[['age', 'Возраст', 'лет'], ['height', 'Рост', 'см'], ['weight', 'Вес', 'кг']].map(([key, label, unit]) => (
            <div key={key}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block',
                marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
              <div style={{ position: 'relative' }}>
                <input type="number" value={form[key]}
                  onChange={e => updateForm({ [key]: e.target.value })}
                  placeholder="0"
                  style={{ ...inputStyle, paddingRight: 28 }}/>
                <span style={{ position: 'absolute', right: 10, top: '50%',
                  transform: 'translateY(-50%)', fontSize: 11, color: '#aaa' }}>{unit}</span>
              </div>
            </div>
          ))}
        </div>

        <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block',
          marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Пол</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['male', 'Мужской', IconMale], ['female', 'Женский', IconFemale]].map(([v, l, Icon]) => (
            <button key={v} onClick={() => updateForm({ gender: v })} style={{
              flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
              border: form.gender === v ? '1.5px solid #111' : '1.5px solid #ebebeb',
              background: form.gender === v ? '#111' : '#fff',
              color: form.gender === v ? '#fff' : '#555',
              fontSize: 13, fontWeight: 600, transition: 'all 0.18s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Icon size={16} color={form.gender === v ? '#fff' : '#555'} />
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Активность */}
      <div style={{ ...fadeStyle(120), background: '#fff', borderRadius: 16, padding: 20,
        marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 14 }}>Уровень активности</p>
        {ACTIVITY.map(a => (
          <button key={a.key} onClick={() => updateForm({ activity_level: a.key })} style={{
            width: '100%', padding: '14px 16px', borderRadius: 12, marginBottom: 8,
            border: form.activity_level === a.key ? '1.5px solid #111' : '1.5px solid #ebebeb',
            background: form.activity_level === a.key ? '#111' : '#fff',
            color: form.activity_level === a.key ? '#fff' : '#333',
            cursor: 'pointer', transition: 'all 0.18s', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 12 }}>
            <a.Icon size={20} color={form.activity_level === a.key ? '#fff' : '#333'} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{a.label}</p>
              <p style={{ fontSize: 11, margin: 0,
                color: form.activity_level === a.key ? 'rgba(255,255,255,0.6)' : '#999' }}>{a.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Цель */}
      <div style={{ ...fadeStyle(180), background: '#fff', borderRadius: 16, padding: 20,
        marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 14 }}>Цель</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {GOALS.map(g => (
            <button key={g.key} onClick={() => updateForm({ goal: g.key })} style={{
              flex: 1, padding: '14px 8px', borderRadius: 12, cursor: 'pointer',
              border: form.goal === g.key ? '1.5px solid #111' : '1.5px solid #ebebeb',
              background: form.goal === g.key ? '#111' : '#fff',
              color: form.goal === g.key ? '#fff' : '#555',
              transition: 'all 0.18s', textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ marginBottom: 4 }}>
                <g.Icon size={20} color={form.goal === g.key ? '#fff' : '#555'} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 600 }}>{g.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Норма */}
      {norm.cal > 0 && (
        <div style={{ ...fadeStyle(240), background: '#fff', borderRadius: 16, padding: 20,
          marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 14 }}>Твоя суточная норма</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['Калории', norm.cal, 'ккал', '#6366f1'],
              ['Белки', norm.protein, 'г', '#3b82f6'],
              ['Жиры', norm.fat, 'г', '#f59e0b'],
              ['Углеводы', norm.carbs, 'г', '#8b5cf6']].map(([l, v, u, c]) => (
              <div key={l} style={{ background: '#f9f9f9', borderRadius: 12,
                padding: 14, borderLeft: `3px solid ${c}` }}>
                <p style={{ fontSize: 11, color: '#888', margin: '0 0 4px',
                  fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0 }}>
                  {v} <span style={{ fontSize: 12, color: '#aaa', fontWeight: 400 }}>{u}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div style={{ ...fadeStyle(280), background: '#fff0f0', border: '1px solid #ffcccc',
          borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <p style={{ color: '#ff4444', fontSize: 13, margin: 0 }}>{error}</p>
        </div>
      )}

      <div style={fadeStyle(300)}>
        <button onClick={save} disabled={saving} style={{
          width: '100%', padding: 16, background: saving ? '#888' : '#111',
          border: 'none', borderRadius: 14, color: '#fff',
          fontSize: 16, fontWeight: 700, cursor: saving ? 'default' : 'pointer',
          transition: 'all 0.18s', marginBottom: 10 }}>
          {saving ? 'Сохранение...' : saved ? '✓ Сохранено!' : 'Сохранить изменения'}
        </button>

        <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}
          style={{ width: '100%', padding: 14, background: 'none',
            border: '1.5px solid #ff4444', borderRadius: 14, color: '#ff4444',
            fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Выйти из аккаунта
        </button>

        <div style={{ height: 20 }}/>
      </div>
    </div>
  )
}