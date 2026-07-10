import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Prism from '../components/Prism'
import {
  IconActivityMin, IconActivityLight, IconActivityMedium, IconActivityHigh, IconActivityMax,
  IconGoalLoss, IconGoalMaintain, IconGoalGain,
  IconMale, IconFemale, IconProducts
} from '../components/Icons'

const STEPS = ['account', 'personal', 'activity', 'goal']

const ACTIVITY_LEVELS = [
  { key: 'min', label: 'Минимальный', Icon: IconActivityMin, desc: 'Сидячий образ жизни, офисная работа' },
  { key: 'light', label: 'Лёгкий', Icon: IconActivityLight, desc: 'Лёгкие прогулки 1–3 раза в неделю' },
  { key: 'medium', label: 'Средний', Icon: IconActivityMedium, desc: 'Тренировки 3–5 раз в неделю' },
  { key: 'high', label: 'Высокий', Icon: IconActivityHigh, desc: 'Тренировки 6–7 раз в неделю' },
  { key: 'max', label: 'Очень высокий', Icon: IconActivityMax, desc: 'Профессиональный спорт' },
]

const GOALS = [
  { key: 'loss', Icon: IconGoalLoss, label: 'Похудение', desc: 'Дефицит −500 ккал от нормы' },
  { key: 'maintain', Icon: IconGoalMaintain, label: 'Поддержание', desc: 'Питание точно по норме' },
  { key: 'gain', Icon: IconGoalGain, label: 'Набор массы', desc: 'Профицит +300 ккал от нормы' },
]

const calcNorm = (form) => {
  const { age, gender, height, weight, activity_level, goal } = form
  if (!age || !height || !weight) return { cal: 0, protein: 0, fat: 0, carbs: 0 }
  const bmr = gender === 'male'
    ? 10 * +weight + 6.25 * +height - 5 * +age + 5
    : 10 * +weight + 6.25 * +height - 5 * +age - 161
  const kMap = { min: 1.2, light: 1.375, medium: 1.55, high: 1.725, max: 1.9 }
  let cal = bmr * (kMap[activity_level] || 1.55)
  if (goal === 'loss') cal -= 500
  if (goal === 'gain') cal += 300
  return {
    cal: Math.round(cal),
    protein: Math.round(+weight * 2),
    fat: Math.round(cal * 0.25 / 9),
    carbs: Math.round(cal * 0.5 / 4)
  }
}

const PrismBg = () => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
    <Prism
      animationType="rotate"
      timeScale={0.3}
      height={3.5}
      baseWidth={5.5}
      scale={3.6}
      hueShift={0}
      colorFrequency={1}
      noise={0}
      glow={0.6}
      transparent={true}
    />
  </div>
)

export default function Auth() {
  const [step, setStep] = useState(0)
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [form, setForm] = useState({
    name: '', age: '', height: '', weight: '',
    gender: 'male', activity_level: 'medium', goal: 'maintain'
  })

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Неверный email или пароль')
    setLoading(false)
  }

  const handleRegister = async () => {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    const norm = calcNorm(form)
    await supabase.from('profiles').insert({
      id: data.user.id,
      name: form.name,
      age: +form.age,
      gender: form.gender,
      height: +form.height,
      weight: +form.weight,
      activity_level: form.activity_level,
      goal: form.goal,
      cal_goal: norm.cal || 2000,
      protein_goal: norm.protein || 150,
      fat_goal: norm.fat || 67,
      carbs_goal: norm.carbs || 250,
    })
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12, color: '#fff',
    fontSize: 15, boxSizing: 'border-box', outline: 'none',
    marginBottom: 12,
    backdropFilter: 'blur(4px)',
  }

  const cardStyle = {
    background: 'rgba(10,10,10,0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: 20, padding: 24,
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  }

  const labelStyle = {
    fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
    display: 'block', marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: '0.06em'
  }

  const btnPrimary = {
    width: '100%', padding: 14, background: '#fff',
    border: 'none', borderRadius: 12, color: '#000',
    fontSize: 15, fontWeight: 700, cursor: 'pointer',
    transition: 'opacity 0.18s', marginBottom: 10
  }

  const btnSecondary = {
    width: '100%', padding: 12, background: 'none',
    border: 'none', color: 'rgba(255,255,255,0.4)',
    fontSize: 13, cursor: 'pointer'
  }

  const chipStyle = (active) => ({
    flex: 1, padding: '12px 8px', borderRadius: 10, cursor: 'pointer',
    border: active ? '1.5px solid rgba(255,255,255,0.8)' : '1.5px solid rgba(255,255,255,0.1)',
    background: active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
    color: active ? '#fff' : 'rgba(255,255,255,0.4)',
    fontSize: 13, fontWeight: 600, transition: 'all 0.18s', textAlign: 'center'
  })

  // Экран входа
  if (isLogin) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24,
      background: '#000000', position: 'relative', overflow: 'hidden' }}>

      <PrismBg />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
            <IconProducts size={48} color="#fff" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 0 6px',
            letterSpacing: '-0.5px' }}>КБЖУ</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>Дневник питания</p>
        </div>

        <div style={cardStyle}>
          <label style={labelStyle}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" type="email" style={inputStyle}/>

          <label style={labelStyle}>Пароль</label>
          <input value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••" type="password" style={{ ...inputStyle, marginBottom: 16 }}/>

          {error && (
            <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
              <p style={{ color: '#ff6b6b', fontSize: 13, margin: 0 }}>{error}</p>
            </div>
          )}

          <button onClick={handleLogin} disabled={loading}
            style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }}>
            {loading ? '...' : 'Войти'}
          </button>

          <button onClick={() => { setIsLogin(false); setStep(0) }} style={btnSecondary}>
            Нет аккаунта? <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Зарегистрироваться</span>
          </button>
        </div>
      </div>
    </div>
  )

  // Экран регистрации
  return (
    <div style={{ minHeight: '100vh', background: '#000000', padding: '24px 20px',
      maxWidth: 480, margin: '0 auto', position: 'relative', overflow: 'hidden' }}>

      <PrismBg />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Прогресс */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, marginTop: 16 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2,
              background: i <= step ? '#fff' : 'rgba(255,255,255,0.15)',
              transition: 'background 0.3s' }}/>
          ))}
        </div>

        <div style={cardStyle}>

          {/* Шаг 0 */}
          {step === 0 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Создай аккаунт</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 24 }}>
                Данные синхронизируются на всех устройствах
              </p>

              <label style={labelStyle}>Имя</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Твоё имя" style={inputStyle}/>

              <label style={labelStyle}>Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" type="email" style={inputStyle}/>

              <label style={labelStyle}>Пароль</label>
              <input value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Минимум 6 символов" type="password"
                style={{ ...inputStyle, marginBottom: 16 }}/>

              {error && (
                <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
                  borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                  <p style={{ color: '#ff6b6b', fontSize: 13, margin: 0 }}>{error}</p>
                </div>
              )}

              <button onClick={() => {
                if (!email || !password || password.length < 6) {
                  setError('Заполни все поля. Пароль минимум 6 символов')
                  return
                }
                setError(''); setStep(1)
              }} style={btnPrimary}>Далее →</button>

              <button onClick={() => setIsLogin(true)} style={btnSecondary}>
                Уже есть аккаунт? <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Войти</span>
              </button>
            </div>
          )}

          {/* Шаг 1 */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>О себе</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 24 }}>
                Нужно для расчёта нормы КБЖУ
              </p>

              <label style={labelStyle}>Пол</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[['male', 'Мужской', IconMale], ['female', 'Женский', IconFemale]].map(([v, l, Icon]) => (
                  <button key={v} onClick={() => setForm({ ...form, gender: v })}
                    style={{ ...chipStyle(form.gender === v), display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 6 }}>
                    <Icon size={16} color={form.gender === v ? '#fff' : 'rgba(255,255,255,0.4)'} />
                    {l}
                  </button>
                ))}
              </div>

              {[['age', 'Возраст', 'лет'], ['height', 'Рост', 'см'], ['weight', 'Вес', 'кг']].map(([key, label, unit]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <input type="number" value={form[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      placeholder="0"
                      style={{ ...inputStyle, marginBottom: 0, paddingRight: 40 }}/>
                    <span style={{ position: 'absolute', right: 14, top: '50%',
                      transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)',
                      fontSize: 13 }}>{unit}</span>
                  </div>
                </div>
              ))}

              {error && <p style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 12 }}>{error}</p>}

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => setStep(0)} style={{
                  flex: 1, padding: 14, background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                  color: 'rgba(255,255,255,0.6)', fontWeight: 600, cursor: 'pointer' }}>← Назад</button>
                <button onClick={() => {
                  if (!form.age || !form.height || !form.weight) {
                    setError('Заполни все поля'); return
                  }
                  setError(''); setStep(2)
                }} style={{ flex: 2, padding: 14, background: '#fff', border: 'none',
                  borderRadius: 12, color: '#000', fontWeight: 700, cursor: 'pointer' }}>Далее →</button>
              </div>
            </div>
          )}

          {/* Шаг 2 */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Активность</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 20 }}>
                Выбери подходящий уровень
              </p>

              {ACTIVITY_LEVELS.map(a => (
                <button key={a.key} onClick={() => setForm({ ...form, activity_level: a.key })}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 12,
                    border: form.activity_level === a.key
                      ? '1.5px solid rgba(255,255,255,0.8)'
                      : '1.5px solid rgba(255,255,255,0.08)',
                    background: form.activity_level === a.key
                      ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                    marginBottom: 8, textAlign: 'left', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.18s' }}>
                  <a.Icon size={22} color={form.activity_level === a.key ? '#fff' : 'rgba(255,255,255,0.5)'} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 }}>{a.label}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{a.desc}</p>
                  </div>
                </button>
              ))}

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button onClick={() => setStep(1)} style={{
                  flex: 1, padding: 14, background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                  color: 'rgba(255,255,255,0.6)', fontWeight: 600, cursor: 'pointer' }}>← Назад</button>
                <button onClick={() => setStep(3)} style={{
                  flex: 2, padding: 14, background: '#fff', border: 'none',
                  borderRadius: 12, color: '#000', fontWeight: 700, cursor: 'pointer' }}>Далее →</button>
              </div>
            </div>
          )}

          {/* Шаг 3 */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Твоя цель</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 20 }}>
                Рассчитаем норму калорий
              </p>

              {GOALS.map(g => (
                <button key={g.key} onClick={() => setForm({ ...form, goal: g.key })}
                  style={{ width: '100%', padding: '18px 16px', borderRadius: 12,
                    border: form.goal === g.key
                      ? '1.5px solid rgba(255,255,255,0.8)'
                      : '1.5px solid rgba(255,255,255,0.08)',
                    background: form.goal === g.key
                      ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                    marginBottom: 10, textAlign: 'left', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.18s' }}>
                  <g.Icon size={26} color={form.goal === g.key ? '#fff' : 'rgba(255,255,255,0.5)'} />
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>{g.label}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{g.desc}</p>
                  </div>
                </button>
              ))}

              {form.age && form.weight && form.height && (() => {
                const norm = calcNorm(form)
                return norm.cal > 0 ? (
                  <div style={{ background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14, padding: 16, margin: '16px 0' }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12,
                      marginBottom: 12, fontWeight: 600, textTransform: 'uppercase',
                      letterSpacing: '0.06em' }}>Твоя норма</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[['Калории', norm.cal, 'ккал'], ['Белки', norm.protein, 'г'],
                        ['Жиры', norm.fat, 'г'], ['Углеводы', norm.carbs, 'г']].map(([l, v, u]) => (
                        <div key={l} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 10 }}>
                          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, margin: '0 0 2px',
                            textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</p>
                          <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>
                            {v} <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{u}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null
              })()}

              {error && <p style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 12 }}>{error}</p>}

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setStep(2)} style={{
                  flex: 1, padding: 14, background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                  color: 'rgba(255,255,255,0.6)', fontWeight: 600, cursor: 'pointer' }}>← Назад</button>
                <button onClick={handleRegister} disabled={loading} style={{
                  flex: 2, padding: 14, background: '#fff', border: 'none',
                  borderRadius: 12, color: '#000', fontWeight: 700,
                  cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? '...' : '🎉 Готово!'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}