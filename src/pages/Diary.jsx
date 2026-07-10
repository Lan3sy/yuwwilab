import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { IconCalendar, IconSettings, MEAL_ICON_POOL } from '../components/Icons'
import WorkoutManager from '../components/WorkoutManager'

const IconWorkout = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6.5 9.5v5M17.5 9.5v5M2 10.5v3M22 10.5v3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M6.5 12h11" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <rect x="4" y="8" width="2.5" height="8" rx="1" stroke={color} strokeWidth="1.8"/>
    <rect x="17.5" y="8" width="2.5" height="8" rx="1" stroke={color} strokeWidth="1.8"/>
  </svg>
)

const formatDate = (date) => date.toISOString().split('T')[0]

const dayLabel = (date) => {
  const today = formatDate(new Date())
  const yesterday = formatDate(new Date(Date.now() - 86400000))
  const d = formatDate(date)
  if (d === today) return 'Сегодня'
  if (d === yesterday) return 'Вчера'
  return date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
}

const lerp = (a, b, t) => Math.round(a + (b - a) * t)

const getProgressColor = (pct) => {
  if (pct <= 0) return { stroke: 'rgb(248,180,180)', text: 'rgb(220,100,100)' }
  if (pct <= 20) return { stroke: 'rgb(248,180,180)', text: 'rgb(220,100,100)' }
  if (pct <= 50) {
    const t = (pct - 20) / 30
    return {
      stroke: `rgb(${lerp(248,255,t)},${lerp(180,200,t)},${lerp(180,130,t)})`,
      text: `rgb(${lerp(220,230,t)},${lerp(100,140,t)},${lerp(100,60,t)})`
    }
  }
  if (pct <= 80) {
    const t = (pct - 50) / 30
    return {
      stroke: `rgb(${lerp(255,160,t)},${lerp(200,220,t)},${lerp(130,170,t)})`,
      text: `rgb(${lerp(230,80,t)},${lerp(140,180,t)},${lerp(60,100,t)})`
    }
  }
  if (pct <= 100) return { stroke: 'rgb(160,220,170)', text: 'rgb(80,180,100)' }
  const t = Math.min((pct - 100) / 30, 1)
  return {
    stroke: `rgb(${lerp(160,248,t)},${lerp(220,180,t)},${lerp(170,180,t)})`,
    text: `rgb(${lerp(80,220,t)},${lerp(180,100,t)},${lerp(100,100,t)})`
  }
}

const getCalendarDotColor = (pct) => {
  if (pct <= 0) return 'rgb(230,230,230)'
  if (pct <= 20) return 'rgb(248,180,180)'
  if (pct <= 50) {
    const t = (pct - 20) / 30
    return `rgb(${lerp(248,255,t)},${lerp(180,200,t)},${lerp(180,130,t)})`
  }
  if (pct <= 80) {
    const t = (pct - 50) / 30
    return `rgb(${lerp(255,160,t)},${lerp(200,220,t)},${lerp(130,170,t)})`
  }
  if (pct <= 100) return 'rgb(160,220,170)'
  const t = Math.min((pct - 100) / 30, 1)
  return `rgb(${lerp(160,248,t)},${lerp(220,180,t)},${lerp(170,180,t)})`
}

function useCountUp(target, duration = 600) {
  const [value, setValue] = useState(0)
  const prev = useRef(0)
  const raf = useRef(null)

  useEffect(() => {
    const start = prev.current
    const end = Math.round(target)
    const startTime = performance.now()

    if (raf.current) cancelAnimationFrame(raf.current)

    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(start + (end - start) * ease))
      if (progress < 1) {
        raf.current = requestAnimationFrame(tick)
      } else {
        prev.current = end
      }
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target])

  return value
}

function CountUp({ value, duration = 600 }) {
  const animated = useCountUp(value, duration)
  return <>{animated}</>
}

const fadeStyle = (delay = 0) => ({
  animation: `fadeIn 0.25s ease forwards`,
  animationDelay: `${delay}ms`,
  opacity: 0,
})

export default function Diary({ session }) {
  const [entries, setEntries] = useState([])
  const [meals, setMeals] = useState([])
  const [products, setProducts] = useState([])
  const [profile, setProfile] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [addingTo, setAddingTo] = useState(null)
  const [pickedProduct, setPickedProduct] = useState(null)
  const [weight, setWeight] = useState(100)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [showMealEditor, setShowMealEditor] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showWorkout, setShowWorkout] = useState(false)
  const [newMealName, setNewMealName] = useState('')
  const [calendarStats, setCalendarStats] = useState({})
  const [removingId, setRemovingId] = useState(null)
  const [removingMealId, setRemovingMealId] = useState(null)
  const [editingEntry, setEditingEntry] = useState(null)
  const [editWeight, setEditWeight] = useState(100)
  const [burnedToday, setBurnedToday] = useState(0)

  const dateStr = formatDate(selectedDate)
  const isToday = dateStr === formatDate(new Date())

  useEffect(() => { loadMeals(); loadProducts(); loadProfile() }, [])
  useEffect(() => { loadEntries(); loadBurned() }, [selectedDate])

  const loadMeals = async () => {
    const { data } = await supabase.from('meal_types').select('*')
      .eq('user_id', session.user.id).order('sort_order')
    setMeals(data || [])
  }

  const loadProducts = async () => {
    const { data } = await supabase.from('products').select('*')
      .eq('user_id', session.user.id).order('name')
    setProducts(data || [])
  }

  const loadProfile = async () => {
    const { data } = await supabase.from('profiles').select('*')
      .eq('id', session.user.id).single()
    setProfile(data)
  }

  const loadEntries = async () => {
    const { data } = await supabase.from('diary').select('*')
      .eq('user_id', session.user.id).eq('date', dateStr).order('created_at')
    setEntries(data || [])
  }

  const loadBurned = async () => {
    const { data } = await supabase.from('workout_logs').select('calories_burned')
      .eq('user_id', session.user.id).eq('date', dateStr).maybeSingle()
    setBurnedToday(data?.calories_burned || 0)
  }

  const loadCalendarStats = async () => {
    const from = new Date()
    from.setDate(from.getDate() - 29)
    const { data } = await supabase.from('diary').select('date, calories, protein, fat, carbs')
      .eq('user_id', session.user.id).gte('date', formatDate(from))
    if (!data) return
    const stats = {}
    data.forEach(e => {
      if (!stats[e.date]) stats[e.date] = { cal: 0, protein: 0, fat: 0, carbs: 0 }
      stats[e.date].cal += e.calories || 0
      stats[e.date].protein += e.protein || 0
      stats[e.date].fat += e.fat || 0
      stats[e.date].carbs += e.carbs || 0
    })
    Object.keys(stats).forEach(k => {
      stats[k].cal = Math.round(stats[k].cal)
      stats[k].protein = Math.round(stats[k].protein)
      stats[k].fat = Math.round(stats[k].fat)
      stats[k].carbs = Math.round(stats[k].carbs)
    })
    setCalendarStats(stats)
  }

  const goToPrevDay = () => {
    const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d)
  }
  const goToNextDay = () => {
    if (isToday) return
    const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d)
  }
  const goToDate = (date) => { setSelectedDate(date); setShowCalendar(false) }

  const openAddFor = (mealId) => {
    setAddingTo(mealId); setPickedProduct(null); setWeight(100); setSearch('')
  }

  const confirmAdd = async () => {
    if (!pickedProduct || !weight) return
    setSaving(true)
    const k = weight / 100
    await supabase.from('diary').insert({
      user_id: session.user.id, date: dateStr,
      meal_type: meals.find(m => m.id === addingTo)?.name || '',
      meal_type_id: addingTo,
      product_id: pickedProduct.id,
      product_name: pickedProduct.name, weight,
      calories: Math.round(pickedProduct.calories * k * 10) / 10,
      protein: Math.round(pickedProduct.protein * k * 10) / 10,
      fat: Math.round(pickedProduct.fat * k * 10) / 10,
      carbs: Math.round(pickedProduct.carbs * k * 10) / 10,
    })
    setSaving(false); setAddingTo(null); loadEntries()
  }

  const removeEntry = (id) => {
    setRemovingId(id)
    setTimeout(async () => {
      await supabase.from('diary').delete().eq('id', id)
      setRemovingId(null)
      loadEntries()
    }, 500)
  }

  const removeMeal = async (id) => {
    setRemovingMealId(id)
    setTimeout(async () => {
      await supabase.from('meal_types').delete().eq('id', id)
      setRemovingMealId(null)
      loadMeals()
    }, 500)
  }

  const openEdit = (entry) => {
    setEditingEntry(entry)
    setEditWeight(entry.weight)
  }

  const saveEdit = async () => {
    if (!editingEntry || !editWeight) return
    setSaving(true)
    const product = products.find(p => p.id === editingEntry.product_id)
    const k = editWeight / 100
    if (product) {
      await supabase.from('diary').update({
        weight: editWeight,
        calories: Math.round(product.calories * k * 10) / 10,
        protein: Math.round(product.protein * k * 10) / 10,
        fat: Math.round(product.fat * k * 10) / 10,
        carbs: Math.round(product.carbs * k * 10) / 10,
      }).eq('id', editingEntry.id)
    } else {
      const ratio = editWeight / editingEntry.weight
      await supabase.from('diary').update({
        weight: editWeight,
        calories: Math.round(editingEntry.calories * ratio * 10) / 10,
        protein: Math.round(editingEntry.protein * ratio * 10) / 10,
        fat: Math.round(editingEntry.fat * ratio * 10) / 10,
        carbs: Math.round(editingEntry.carbs * ratio * 10) / 10,
      }).eq('id', editingEntry.id)
    }
    setSaving(false); setEditingEntry(null); loadEntries()
  }

  const addMeal = async () => {
    if (!newMealName.trim()) return
    await supabase.from('meal_types').insert({
      user_id: session.user.id, name: newMealName, icon: '', sort_order: meals.length
    })
    setNewMealName(''); loadMeals()
  }

  const renameMeal = async (id, name) => {
    await supabase.from('meal_types').update({ name }).eq('id', id); loadMeals()
  }

  const moveMeal = async (index, dir) => {
    const newOrder = [...meals]
    const target = index + dir
    if (target < 0 || target >= newOrder.length) return
    ;[newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]]
    setMeals(newOrder)
    await Promise.all(newOrder.map((m, i) =>
      supabase.from('meal_types').update({ sort_order: i }).eq('id', m.id)
    ))
  }

  const grouped = meals.reduce((acc, meal) => {
    acc[meal.id] = entries.filter(e => e.meal_type_id === meal.id)
    return acc
  }, {})

  const totals = entries.reduce((acc, e) => ({
    cal: acc.cal + (e.calories || 0),
    protein: acc.protein + (e.protein || 0),
    fat: acc.fat + (e.fat || 0),
    carbs: acc.carbs + (e.carbs || 0),
  }), { cal: 0, protein: 0, fat: 0, carbs: 0 })

  const baseCalGoal = profile?.cal_goal || 2000
  const calGoal = baseCalGoal + burnedToday // норма увеличивается на сожжённые калории
  const rawProgress = (totals.cal / calGoal) * 100
  const progress = Math.min(rawProgress, 100)
  const remaining = Math.max(calGoal - totals.cal, 0)
  const { stroke: progressColor, text: progressTextColor } = getProgressColor(rawProgress)

  const macros = [
    { label: 'Белки', value: totals.protein, goal: profile?.protein_goal || 150, color: '#3b82f6' },
    { label: 'Жиры', value: totals.fat, goal: profile?.fat_goal || 67, color: '#f59e0b' },
    { label: 'Углеводы', value: totals.carbs, goal: profile?.carbs_goal || 250, color: '#8b5cf6' },
  ]

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()))

  const computed = pickedProduct ? {
    cal: Math.round(pickedProduct.calories * weight / 100 * 10) / 10,
    protein: Math.round(pickedProduct.protein * weight / 100 * 10) / 10,
    fat: Math.round(pickedProduct.fat * weight / 100 * 10) / 10,
    carbs: Math.round(pickedProduct.carbs * weight / 100 * 10) / 10,
  } : null

  const editProduct = editingEntry ? products.find(p => p.id === editingEntry.product_id) : null
  const editComputed = editingEntry && editWeight ? {
    cal: editProduct
      ? Math.round(editProduct.calories * editWeight / 100 * 10) / 10
      : Math.round(editingEntry.calories * editWeight / editingEntry.weight * 10) / 10,
    protein: editProduct
      ? Math.round(editProduct.protein * editWeight / 100 * 10) / 10
      : Math.round(editingEntry.protein * editWeight / editingEntry.weight * 10) / 10,
    fat: editProduct
      ? Math.round(editProduct.fat * editWeight / 100 * 10) / 10
      : Math.round(editingEntry.fat * editWeight / editingEntry.weight * 10) / 10,
    carbs: editProduct
      ? Math.round(editProduct.carbs * editWeight / 100 * 10) / 10
      : Math.round(editingEntry.carbs * editWeight / editingEntry.weight * 10) / 10,
  } : null

  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i); return d
  })

  return (
    <div style={{ padding: '24px 20px', background: '#e8e8ea', minHeight: '100vh' }}>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes crumble {
          0%   { opacity: 1; transform: scale(1) translateY(0); filter: blur(0px); }
          30%  { opacity: 0.7; transform: scale(0.97) translateY(2px); filter: blur(0.5px); }
          60%  { opacity: 0.3; transform: scale(0.93) translateY(6px); filter: blur(2px); }
          100% { opacity: 0; transform: scale(0.85) translateY(12px); filter: blur(4px); }
        }
        .entry-removing {
          animation: crumble 0.5s ease forwards !important;
          pointer-events: none;
          overflow: hidden;
        }
        .meal-removing {
          animation: crumble 0.5s ease forwards !important;
          pointer-events: none;
        }
      `}</style>

      {/* Заголовок */}
      <div style={{ ...fadeStyle(0), marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: 0 }}>Дневник</h2>
            <p style={{ fontSize: 13, color: '#888', margin: '2px 0 0' }}>{dayLabel(selectedDate)}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowWorkout(true)} style={{
              background: '#fff', border: '1.5px solid #ebebeb', borderRadius: 12,
              color: '#555', fontWeight: 600, padding: '10px 14px', fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconWorkout size={17} color="#555" />
            </button>
            <button onClick={() => setShowMealEditor(true)} style={{
              background: '#fff', border: '1.5px solid #ebebeb', borderRadius: 12,
              color: '#555', fontWeight: 600, padding: '10px 14px', fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconSettings size={17} color="#555" />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
          <button onClick={goToPrevDay} style={{
            background: '#fff', border: '1.5px solid #ebebeb', borderRadius: 10,
            width: 36, height: 36, fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>

          <button onClick={() => { setShowCalendar(true); loadCalendarStats() }} style={{
            flex: 1, background: '#fff', border: '1.5px solid #ebebeb', borderRadius: 10,
            padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#111',
            cursor: 'pointer', textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <IconCalendar size={16} color="#111" />
            {selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </button>

          <button onClick={goToNextDay} disabled={isToday} style={{
            background: isToday ? '#f4f4f4' : '#fff', border: '1.5px solid #ebebeb', borderRadius: 10,
            width: 36, height: 36, fontSize: 16, cursor: isToday ? 'default' : 'pointer',
            color: isToday ? '#ccc' : '#111',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>

          {!isToday && (
            <button onClick={() => setSelectedDate(new Date())} style={{
              background: '#111', border: 'none', borderRadius: 10,
              padding: '8px 12px', fontSize: 12, fontWeight: 600,
              color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' }}>Сегодня</button>
          )}
        </div>
      </div>

      {/* Прогресс калорий */}
      <div style={{ ...fadeStyle(60), background: '#fff', borderRadius: 20, padding: '20px 24px',
        marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#888', margin: '0 0 2px',
              textTransform: 'uppercase', letterSpacing: '0.06em' }}>Калории</p>
            <p style={{ fontSize: 32, fontWeight: 700, color: '#111', margin: 0 }}>
              <CountUp value={Math.round(totals.cal)} />
              <span style={{ fontSize: 14, color: '#aaa', fontWeight: 400 }}> / {calGoal}</span>
            </p>
            <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>
              {isToday
                ? <>осталось <CountUp value={Math.round(remaining)} /> ккал</>
                : <><CountUp value={Math.round(rawProgress)} />% от нормы</>
              }
            </p>
            {burnedToday > 0 && (
              <p style={{ fontSize: 11, color: '#4ade80', margin: '4px 0 0', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 4 }}>
                <IconWorkout size={12} color="#4ade80" /> +{burnedToday} ккал от тренировки
              </p>
            )}
          </div>
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="30" fill="none" stroke="#f0f0f0" strokeWidth="7"/>
            <circle cx="36" cy="36" r="30" fill="none" stroke={progressColor} strokeWidth="7"
              strokeDasharray={`${2 * Math.PI * 30}`}
              strokeDashoffset={`${2 * Math.PI * 30 * (1 - progress / 100)}`}
              strokeLinecap="round" transform="rotate(-90 36 36)"
              style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.6s ease' }}/>
            <text x="36" y="40" textAnchor="middle" fill={progressTextColor} fontSize="13" fontWeight="700">
              <CountUp value={Math.round(rawProgress)} />%
            </text>
          </svg>
        </div>
        <div style={{ background: '#f0f0f0', borderRadius: 6, height: 6 }}>
          <div style={{ background: progressColor, borderRadius: 6, height: 6,
            width: `${progress}%`, transition: 'width 0.6s ease, background 0.6s ease' }}/>
        </div>
      </div>

      {/* КБЖУ */}
      <div style={{ ...fadeStyle(120), display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
        {macros.map(item => (
          <div key={item.label} style={{ background: '#fff', borderRadius: 14, padding: 12,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#888', margin: '0 0 4px',
              textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: '0 0 2px' }}>
              <CountUp value={Math.round(item.value)} />
            </p>
            <p style={{ fontSize: 10, color: '#bbb', margin: '0 0 6px' }}>из {item.goal}г</p>
            <div style={{ background: '#f0f0f0', borderRadius: 3, height: 3 }}>
              <div style={{ background: item.color, borderRadius: 3, height: 3,
                width: `${Math.min(item.value / item.goal * 100, 100)}%`, transition: 'width 0.6s ease' }}/>
            </div>
          </div>
        ))}
      </div>

      {/* Приёмы пищи */}
      {meals.length === 0 && (
        <div style={{ ...fadeStyle(160), textAlign: 'center', padding: 40, color: '#ccc' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <IconSettings size={32} color="#ccc" />
          </div>
          <p style={{ fontSize: 14 }}>Нет приёмов пищи. Настрой их через шестерёнку</p>
        </div>
      )}

      {meals.map((meal, index) => {
        const items = grouped[meal.id] || []
        const mealCal = Math.round(items.reduce((s, e) => s + (e.calories || 0), 0))
        return (
          <div key={meal.id}
            className={removingMealId === meal.id ? 'meal-removing' : ''}
            style={{
              ...fadeStyle(160 + index * 50),
              background: '#fff', borderRadius: 16, marginBottom: 10,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden'
            }}>
            <div style={{ padding: '14px 16px', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {(() => {
                  const MealIcon = MEAL_ICON_POOL[index % MEAL_ICON_POOL.length]
                  return <MealIcon size={19} color="#333" />
                })()}
                <p style={{ fontWeight: 700, color: '#111', margin: 0, fontSize: 15 }}>{meal.name}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <p style={{ fontSize: 13, color: mealCal > 0 ? '#111' : '#ccc', fontWeight: 600, margin: 0 }}>
                  {mealCal > 0 ? <><CountUp value={mealCal} /> ккал</> : '—'}
                </p>
                {isToday && (
                  <button onClick={() => openAddFor(meal.id)} style={{
                    background: '#111', border: 'none', borderRadius: 8,
                    width: 28, height: 28, color: '#fff', fontSize: 16,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                )}
              </div>
            </div>

            {items.length === 0 ? (
              <p style={{ padding: '0 16px 14px', color: '#ccc', fontSize: 13, margin: 0 }}>Пусто</p>
            ) : (
              items.map(e => (
                <div key={e.id}
                  className={removingId === e.id ? 'entry-removing' : ''}
                  style={{ padding: '10px 16px', display: 'flex',
                    justifyContent: 'space-between', alignItems: 'center',
                    borderTop: '1px solid #f5f5f5',
                    cursor: isToday ? 'pointer' : 'default',
                    transition: 'background 0.15s' }}
                  onClick={() => isToday && openEdit(e)}
                  onMouseEnter={ev => { if (isToday) ev.currentTarget.style.background = '#fafafa' }}
                  onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 2px' }}>
                      {e.product_name}
                    </p>
                    <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>
                      {e.weight}г · Б{Math.round(e.protein)} Ж{Math.round(e.fat)} У{Math.round(e.carbs)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: 0 }}>
                      <CountUp value={Math.round(e.calories)} /> ккал
                    </p>
                    {isToday && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={ev => { ev.stopPropagation(); openEdit(e) }} style={{
                          background: '#f4f4f4', border: 'none', borderRadius: 6,
                          width: 26, height: 26, fontSize: 12, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✏️</button>
                        <button onClick={ev => { ev.stopPropagation(); removeEntry(e.id) }} style={{
                          background: 'none', border: 'none', color: '#ddd',
                          fontSize: 20, cursor: 'pointer', padding: 0, lineHeight: 1,
                          width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onMouseEnter={ev => ev.currentTarget.style.color = '#ff4444'}
                          onMouseLeave={ev => ev.currentTarget.style.color = '#ddd'}>×</button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )
      })}

      {/* Модалка тренировки */}
      {showWorkout && (
        <WorkoutManager
          session={session}
          profile={profile}
          onClose={() => setShowWorkout(false)}
          onLogged={() => { loadBurned(); loadCalendarStats() }}
        />
      )}

      {/* Модалка редактирования записи */}
      {editingEntry && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'flex-end', zIndex: 200 }}
          onClick={e => e.target === e.currentTarget && setEditingEntry(null)}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0',
            padding: 24, width: '100%', maxWidth: 480, margin: '0 auto',
            animation: 'fadeIn 0.2s ease forwards' }}>
            <div style={{ width: 36, height: 4, background: '#e5e5e5', borderRadius: 2, margin: '0 auto 20px' }}/>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 4 }}>Редактировать</h3>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>{editingEntry.product_name}</p>

            <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block',
              marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Вес (г)</label>
            <input type="number" value={editWeight || ''}
              onChange={e => setEditWeight(e.target.value === '' ? '' : +e.target.value)}
              onFocus={e => e.target.select()}
              autoFocus
              style={{ width: '100%', padding: '14px 16px', background: '#f9f9f9',
                border: '1.5px solid #ebebeb', borderRadius: 12, color: '#111',
                fontSize: 24, fontWeight: 700, boxSizing: 'border-box', outline: 'none',
                marginBottom: 16, textAlign: 'center' }}/>

            {editComputed && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
                {[['Ккал', editComputed.cal], ['Б', editComputed.protein],
                  ['Ж', editComputed.fat], ['У', editComputed.carbs]].map(([l, v]) => (
                  <div key={l} style={{ background: '#f9f9f9', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                    <p style={{ fontSize: 10, color: '#aaa', margin: '0 0 3px' }}>{l}</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0 }}>
                      <CountUp value={v} duration={300} />
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setEditingEntry(null); removeEntry(editingEntry.id) }} style={{
                flex: 1, padding: 14, background: 'none', border: '1.5px solid #ffcccc',
                borderRadius: 12, color: '#ff4444', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                Удалить
              </button>
              <button onClick={() => setEditingEntry(null)} style={{
                flex: 1, padding: 14, background: '#f4f4f4', border: 'none',
                borderRadius: 12, color: '#555', fontWeight: 600, cursor: 'pointer' }}>
                Отмена
              </button>
              <button onClick={saveEdit} disabled={saving} style={{
                flex: 2, padding: 14, background: '#111', border: 'none',
                borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Календарь */}
      {showCalendar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'flex-end', zIndex: 200 }}
          onClick={e => e.target === e.currentTarget && setShowCalendar(false)}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0',
            padding: 24, width: '100%', maxWidth: 480, margin: '0 auto',
            animation: 'fadeIn 0.2s ease forwards', maxHeight: '75vh', overflowY: 'auto' }}>
            <div style={{ width: 36, height: 4, background: '#e5e5e5', borderRadius: 2, margin: '0 auto 20px' }}/>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 8 }}>Выбери дату</h3>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              {[
                { color: 'rgb(248,180,180)', label: 'Мало' },
                { color: 'rgb(255,200,130)', label: 'Нормально' },
                { color: 'rgb(160,220,170)', label: 'Хорошо' },
                { color: 'rgb(248,180,180)', label: 'Много', border: true },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color,
                    boxShadow: item.border ? `0 0 0 1.5px rgb(220,100,100)` : 'none' }}/>
                  <span style={{ fontSize: 11, color: '#888' }}>{item.label}</span>
                </div>
              ))}
            </div>

            {calendarDays.map((day, i) => {
              const d = formatDate(day)
              const isSelected = d === dateStr
              const isT = d === formatDate(new Date())
              const stat = calendarStats[d]
              const calPct = stat && baseCalGoal > 0 ? (stat.cal / baseCalGoal) * 100 : 0
              const dotColor = stat ? getCalendarDotColor(calPct) : 'rgb(230,230,230)'
              const isOver = calPct > 100

              return (
                <button key={d} onClick={() => goToDate(new Date(day))} style={{
                  width: '100%', padding: '12px 16px', marginBottom: 6,
                  background: isSelected ? '#111' : '#f9f9f9',
                  border: isSelected ? 'none' : '1.5px solid #efefef',
                  borderRadius: 12, cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: isSelected ? 'rgba(255,255,255,0.4)' : dotColor,
                      boxShadow: !isSelected && stat ? `0 0 6px ${dotColor}` : 'none',
                      flexShrink: 0,
                      border: isOver && !isSelected ? '1.5px solid rgb(220,100,100)' : 'none',
                      transition: 'background 0.3s ease'
                    }}/>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 2px',
                        color: isSelected ? '#fff' : '#111' }}>
                        {isT ? 'Сегодня' : i === 1 ? 'Вчера' :
                          day.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                      {stat ? (
                        <p style={{ fontSize: 11, margin: 0,
                          color: isSelected ? 'rgba(255,255,255,0.6)' : '#aaa' }}>
                          {stat.cal} ккал · Б{stat.protein} Ж{stat.fat} У{stat.carbs}
                          {isOver && !isSelected &&
                            <span style={{ color: 'rgb(220,100,100)', marginLeft: 4 }}>↑</span>}
                        </p>
                      ) : (
                        <p style={{ fontSize: 11, margin: 0,
                          color: isSelected ? 'rgba(255,255,255,0.4)' : '#ccc' }}>
                          Ничего не записано
                        </p>
                      )}
                    </div>
                  </div>
                  {isSelected
                    ? <span style={{ color: '#fff', fontSize: 16 }}>✓</span>
                    : stat && (
                      <span style={{ fontSize: 11, fontWeight: 700,
                        color: getCalendarDotColor(calPct),
                        background: 'rgba(0,0,0,0.04)',
                        padding: '2px 7px', borderRadius: 20 }}>
                        {Math.round(calPct)}%
                      </span>
                    )
                  }
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Модалка добавления продукта */}
      {addingTo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'flex-end', zIndex: 200 }}
          onClick={e => e.target === e.currentTarget && setAddingTo(null)}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0',
            padding: 24, width: '100%', maxWidth: 480, margin: '0 auto', maxHeight: '85vh',
            display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease forwards' }}>
            <div style={{ width: 36, height: 4, background: '#e5e5e5', borderRadius: 2,
              margin: '0 auto 16px', flexShrink: 0 }}/>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 16, flexShrink: 0 }}>
              {pickedProduct ? 'Сколько грамм?' : 'Выбери продукт'}
            </h3>

            {!pickedProduct ? (
              <>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Поиск продукта..."
                  style={{ width: '100%', padding: '11px 14px', background: '#f9f9f9',
                    border: '1.5px solid #ebebeb', borderRadius: 10, color: '#111',
                    fontSize: 14, boxSizing: 'border-box', outline: 'none',
                    marginBottom: 12, flexShrink: 0 }}/>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {filteredProducts.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#ccc', padding: 20, fontSize: 13 }}>
                      Продуктов не найдено. Добавь их в разделе "Продукты"
                    </p>
                  )}
                  {filteredProducts.map(p => (
                    <button key={p.id} onClick={() => setPickedProduct(p)} style={{
                      width: '100%', padding: '12px 14px', background: '#f9f9f9',
                      border: 'none', borderRadius: 10, marginBottom: 6,
                      textAlign: 'left', cursor: 'pointer', display: 'flex',
                      justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{p.name}</span>
                      <span style={{ fontSize: 12, color: '#aaa' }}>{p.calories} ккал/100г</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div>
                <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 4px' }}>
                    {pickedProduct.name}
                  </p>
                  <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>
                    {pickedProduct.calories} ккал / 100г
                  </p>
                </div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block',
                  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Вес (г)</label>
                <input type="number" value={weight || ''}
                  onChange={e => setWeight(e.target.value === '' ? '' : +e.target.value)}
                  onFocus={e => e.target.select()}
                  autoFocus
                  style={{ width: '100%', padding: '14px 16px', background: '#f9f9f9',
                    border: '1.5px solid #ebebeb', borderRadius: 12, color: '#111',
                    fontSize: 20, fontWeight: 700, boxSizing: 'border-box', outline: 'none',
                    marginBottom: 16, textAlign: 'center' }}/>
                {computed && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                    {[['Ккал', computed.cal], ['Б', computed.protein], ['Ж', computed.fat], ['У', computed.carbs]].map(([l, v]) => (
                      <div key={l} style={{ background: '#f9f9f9', borderRadius: 8, padding: 8, textAlign: 'center' }}>
                        <p style={{ fontSize: 10, color: '#aaa', margin: '0 0 2px' }}>{l}</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>
                          <CountUp value={v} duration={300} />
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => setPickedProduct(null)} style={{
                  width: '100%', padding: 10, background: 'none', border: 'none',
                  color: '#888', fontSize: 13, marginBottom: 8, cursor: 'pointer' }}>
                  ← Выбрать другой продукт
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexShrink: 0 }}>
              <button onClick={() => setAddingTo(null)} style={{
                flex: 1, padding: 14, background: '#f4f4f4', border: 'none',
                borderRadius: 12, color: '#555', fontWeight: 600, cursor: 'pointer' }}>Отмена</button>
              {pickedProduct && (
                <button onClick={confirmAdd} disabled={saving} style={{
                  flex: 2, padding: 14, background: '#111', border: 'none',
                  borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                  {saving ? 'Добавление...' : 'Добавить'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Редактор приёмов пищи */}
      {showMealEditor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'flex-end', zIndex: 200 }}
          onClick={e => e.target === e.currentTarget && setShowMealEditor(false)}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0',
            padding: 24, width: '100%', maxWidth: 480, margin: '0 auto', maxHeight: '85vh',
            display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease forwards' }}>
            <div style={{ width: 36, height: 4, background: '#e5e5e5', borderRadius: 2,
              margin: '0 auto 16px', flexShrink: 0 }}/>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 16, flexShrink: 0 }}>
              Приёмы пищи
            </h3>
            <div style={{ overflowY: 'auto', flex: 1, marginBottom: 16 }}>
              {meals.map((meal, i) => (
                <div key={meal.id} style={{ display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <button onClick={() => moveMeal(i, -1)} disabled={i === 0} style={{
                      background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer',
                      color: i === 0 ? '#eee' : '#888', fontSize: 12, padding: 0 }}>▲</button>
                    <button onClick={() => moveMeal(i, 1)} disabled={i === meals.length - 1} style={{
                      background: 'none', border: 'none', cursor: i === meals.length - 1 ? 'default' : 'pointer',
                      color: i === meals.length - 1 ? '#eee' : '#888', fontSize: 12, padding: 0 }}>▼</button>
                  </div>
                  <input value={meal.name}
                    onChange={e => setMeals(meals.map(m => m.id === meal.id ? { ...m, name: e.target.value } : m))}
                    onBlur={e => renameMeal(meal.id, e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', background: '#f9f9f9',
                      border: '1.5px solid #ebebeb', borderRadius: 8, fontSize: 14, outline: 'none' }}/>
                  <button onClick={() => removeMeal(meal.id)} style={{
                    background: 'none', border: 'none', color: '#ddd', fontSize: 20,
                    cursor: 'pointer', padding: 4 }}
                    onMouseEnter={e => e.target.style.color = '#ff4444'}
                    onMouseLeave={e => e.target.style.color = '#ddd'}>×</button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <input value={newMealName} onChange={e => setNewMealName(e.target.value)}
                placeholder="Новый приём пищи..."
                onKeyDown={e => e.key === 'Enter' && addMeal()}
                style={{ flex: 1, padding: '11px 14px', background: '#f9f9f9',
                  border: '1.5px solid #ebebeb', borderRadius: 10, fontSize: 14, outline: 'none' }}/>
              <button onClick={addMeal} style={{
                padding: '11px 16px', background: '#111', border: 'none',
                borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>+</button>
            </div>
            <button onClick={() => setShowMealEditor(false)} style={{
              width: '100%', padding: 14, background: '#f4f4f4', border: 'none',
              borderRadius: 12, color: '#555', fontWeight: 600, cursor: 'pointer', marginTop: 16 }}>
              Готово
            </button>
          </div>
        </div>
      )}
    </div>
  )
}