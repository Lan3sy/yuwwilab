import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const fadeStyle = (delay = 0) => ({
  animation: `fadeIn 0.25s ease forwards`,
  animationDelay: `${delay}ms`,
  opacity: 0,
})

function FadeCard({ delay = 0, children, style = {} }) {
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
    <div ref={ref} style={{
      ...style,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(10px)',
      transition: visible ? `opacity 0.25s ease ${delay}ms, transform 0.25s ease ${delay}ms` : 'none',
    }}>
      {children}
    </div>
  )
}

export default function Products({ session }) {
  const [products, setProducts] = useState([])
  const [meals, setMeals] = useState([])
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('all')
  const [form, setForm] = useState({ name: '', calories: 0, protein: 0, fat: 0, carbs: 0 })
  const [addToDiary, setAddToDiary] = useState(null)
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [weight, setWeight] = useState(100)
  const [addingDiary, setAddingDiary] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { load(); loadMeals() }, [])

  const load = async () => {
    const { data } = await supabase.from('products').select('*')
      .eq('user_id', session.user.id).order('created_at', { ascending: false })
    setProducts(data || [])
  }

  const loadMeals = async () => {
    const { data } = await supabase.from('meal_types').select('*')
      .eq('user_id', session.user.id).order('sort_order')
    setMeals(data || [])
  }

  const save = async () => {
    if (!form.name) return
    setSaving(true)
    await supabase.from('products').insert({ ...form, user_id: session.user.id })
    setSaving(false)
    setShowAdd(false)
    setForm({ name: '', calories: 0, protein: 0, fat: 0, carbs: 0 })
    load()
  }

  const remove = async (id) => {
    await supabase.from('products').delete().eq('id', id)
    load()
  }

  const toggleFav = async (id, val) => {
    await supabase.from('products').update({ is_favorite: !val }).eq('id', id)
    load()
  }

  const openAddToDiary = (product) => {
    setAddToDiary(product)
    setSelectedMeal(meals[0]?.id || null)
    setWeight(100)
  }

  const confirmAddToDiary = async () => {
    if (!addToDiary || !selectedMeal || !weight) return
    setAddingDiary(true)
    const k = weight / 100
    const meal = meals.find(m => m.id === selectedMeal)
    await supabase.from('diary').insert({
      user_id: session.user.id,
      date: today,
      meal_type: meal?.name || '',
      meal_type_id: selectedMeal,
      product_id: addToDiary.id,
      product_name: addToDiary.name,
      weight,
      calories: Math.round(addToDiary.calories * k * 10) / 10,
      protein: Math.round(addToDiary.protein * k * 10) / 10,
      fat: Math.round(addToDiary.fat * k * 10) / 10,
      carbs: Math.round(addToDiary.carbs * k * 10) / 10,
    })
    setAddingDiary(false)
    setAddToDiary(null)
  }

  const filtered = products
    .filter(p => tab === 'fav' ? p.is_favorite : true)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  const computed = addToDiary ? {
    cal: Math.round(addToDiary.calories * weight / 100 * 10) / 10,
    protein: Math.round(addToDiary.protein * weight / 100 * 10) / 10,
    fat: Math.round(addToDiary.fat * weight / 100 * 10) / 10,
    carbs: Math.round(addToDiary.carbs * weight / 100 * 10) / 10,
  } : null

  return (
    <div style={{ padding: '24px 20px', background: '#e8e8ea', minHeight: '100vh' }}>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ ...fadeStyle(0), display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: 0 }}>Продукты</h2>
          <p style={{ fontSize: 13, color: '#888', margin: '2px 0 0' }}>{products.length} продуктов</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          background: '#111', border: 'none', borderRadius: 12,
          color: '#fff', fontWeight: 600, padding: '10px 18px', fontSize: 14, cursor: 'pointer' }}>
          + Новый
        </button>
      </div>

      <div style={fadeStyle(50)}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Поиск продукта..."
          style={{ width: '100%', padding: '12px 16px', background: '#fff',
            border: '1.5px solid #ebebeb', borderRadius: 12, color: '#111',
            marginBottom: 12, boxSizing: 'border-box', fontSize: 14, outline: 'none' }} />

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[['all', 'Все'], ['fav', '⭐ Избранное']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '8px 16px', borderRadius: 20, border: 'none', fontSize: 13,
              background: tab === key ? '#111' : '#fff',
              color: tab === key ? '#fff' : '#555',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>{label}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div style={{ ...fadeStyle(100), textAlign: 'center', padding: 40, color: '#ccc' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🥗</p>
          <p style={{ fontSize: 14 }}>Продуктов не найдено</p>
        </div>
      )}

      {filtered.map((p, index) => (
        <FadeCard key={p.id} delay={index * 40} style={{
          background: '#fff', borderRadius: 14, padding: '14px 16px',
          marginBottom: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <p style={{ fontWeight: 600, color: '#111', margin: '0 0 3px', fontSize: 14 }}>{p.name}</p>
              <p style={{ color: '#aaa', fontSize: 12, margin: 0 }}>
                {p.calories} ккал · Б{p.protein} Ж{p.fat} У{p.carbs} (на 100г)
              </p>
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button onClick={() => toggleFav(p.id, p.is_favorite)} style={{
                background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: 6,
                transition: 'transform 0.15s' }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.2)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
                {p.is_favorite ? '⭐' : '☆'}
              </button>
            </div>
          </div>
          <button onClick={() => openAddToDiary(p)} style={{
            width: '100%', padding: 10, background: '#f4f4f4', border: 'none',
            borderRadius: 10, color: '#111', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            + Добавить в рацион
          </button>
        </FadeCard>
      ))}

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'flex-end', zIndex: 200 }}
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0',
            padding: 24, width: '100%', maxWidth: 480, margin: '0 auto',
            animation: 'fadeIn 0.2s ease forwards' }}>
            <div style={{ width: 36, height: 4, background: '#e5e5e5', borderRadius: 2, margin: '0 auto 20px' }}/>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 4 }}>Новый продукт</h3>
            <p style={{ fontSize: 13, color: '#aaa', marginBottom: 20 }}>Данные на 100г продукта</p>

            {[['name', 'Название', 'text'], ['calories', 'Калории (ккал)', 'number'],
              ['protein', 'Белки (г)', 'number'], ['fat', 'Жиры (г)', 'number'],
              ['carbs', 'Углеводы (г)', 'number']].map(([key, label, type]) => (
              <div key={key} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block',
                  marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
                <input type={type} placeholder={type === 'number' ? '0' : 'Например: Куриная грудка'}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: type === 'number' ? +e.target.value : e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', background: '#f9f9f9',
                    border: '1.5px solid #ebebeb', borderRadius: 10, color: '#111',
                    fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
              </div>
            ))}

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowAdd(false)} style={{
                flex: 1, padding: 14, background: '#f4f4f4', border: 'none',
                borderRadius: 12, color: '#555', fontWeight: 600, cursor: 'pointer' }}>Отмена</button>
              <button onClick={save} disabled={saving || !form.name} style={{
                flex: 2, padding: 14, background: form.name ? '#111' : '#e5e5e5', border: 'none',
                borderRadius: 12, color: form.name ? '#fff' : '#aaa',
                fontWeight: 700, cursor: form.name ? 'pointer' : 'default' }}>
                {saving ? 'Сохранение...' : 'Добавить продукт'}
              </button>
            </div>
          </div>
        </div>
      )}

      {addToDiary && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'flex-end', zIndex: 200 }}
          onClick={e => e.target === e.currentTarget && setAddToDiary(null)}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0',
            padding: 24, width: '100%', maxWidth: 480, margin: '0 auto',
            animation: 'fadeIn 0.2s ease forwards' }}>
            <div style={{ width: 36, height: 4, background: '#e5e5e5', borderRadius: 2, margin: '0 auto 16px' }}/>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 4 }}>Добавить в рацион</h3>
            <p style={{ fontSize: 13, color: '#aaa', marginBottom: 20 }}>{addToDiary.name}</p>

            <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block',
              marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Приём пищи</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {meals.map(m => (
                <button key={m.id} onClick={() => setSelectedMeal(m.id)} style={{
                  padding: '8px 14px', borderRadius: 20, border: 'none', fontSize: 13,
                  fontWeight: 600, cursor: 'pointer',
                  background: selectedMeal === m.id ? '#111' : '#f4f4f4',
                  color: selectedMeal === m.id ? '#fff' : '#555' }}>
                  {m.icon} {m.name}
                </button>
              ))}
            </div>

            <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block',
              marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Вес (г)</label>
            <input type="number" value={weight || ''}
              onChange={e => setWeight(e.target.value === '' ? '' : +e.target.value)}
              onFocus={e => e.target.select()}
              style={{ width: '100%', padding: '14px 16px', background: '#f9f9f9',
                border: '1.5px solid #ebebeb', borderRadius: 12, color: '#111',
                fontSize: 20, fontWeight: 700, boxSizing: 'border-box', outline: 'none',
                marginBottom: 16, textAlign: 'center' }}/>

            {computed && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[['Ккал', computed.cal], ['Б', computed.protein], ['Ж', computed.fat], ['У', computed.carbs]].map(([l, v]) => (
                  <div key={l} style={{ background: '#f9f9f9', borderRadius: 8, padding: 8, textAlign: 'center' }}>
                    <p style={{ fontSize: 10, color: '#aaa', margin: '0 0 2px' }}>{l}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>{v}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setAddToDiary(null)} style={{
                flex: 1, padding: 14, background: '#f4f4f4', border: 'none',
                borderRadius: 12, color: '#555', fontWeight: 600, cursor: 'pointer' }}>Отмена</button>
              <button onClick={confirmAddToDiary} disabled={addingDiary || !selectedMeal} style={{
                flex: 2, padding: 14, background: '#111', border: 'none',
                borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {addingDiary ? 'Добавление...' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}