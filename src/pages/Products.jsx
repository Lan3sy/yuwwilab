import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const PAGE_SIZE = 40

const fadeStyle = (delay = 0) => ({
  animation: `fadeIn 0.25s ease forwards`,
  animationDelay: `${delay}ms`,
  opacity: 0,
})

function FadeCard({ delay = 0, children, style = {}, className = '' }) {
  return (
    <div className={className} style={{ ...style, animation: `fadeIn 0.2s ease ${Math.min(delay, 300)}ms forwards`, opacity: 0 }}>
      {children}
    </div>
  )
}

export default function Products({ session }) {
  const [products, setProducts] = useState([])
  const [meals, setMeals] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [tab, setTab] = useState('all')
  const [form, setForm] = useState({ name: '', calories: 0, protein: 0, fat: 0, carbs: 0 })
  const [addToDiary, setAddToDiary] = useState(null)
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [weight, setWeight] = useState(100)
  const [addingDiary, setAddingDiary] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const pageRef = useRef(0)

  // Debounce поиска — не долбим базу на каждой букве
  // Debounce поиска — не долбим базу на каждой букве
useEffect(() => {
  const t = setTimeout(() => setDebouncedSearch(search), 400)
  return () => clearTimeout(t)
}, [search])

// Переводим запрос на несколько языков для мультиязычного поиска
const [searchVariants, setSearchVariants] = useState([])

useEffect(() => {
  if (!debouncedSearch.trim()) {
    setSearchVariants([])
    return
  }

  let cancelled = false

  const translate = async (text, targetLang) => {
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|${targetLang}`
      )
      const data = await res.json()
      return data?.responseData?.translatedText?.toLowerCase() || null
    } catch {
      return null
    }
  }

  const run = async () => {
    const langs = ['ru', 'en', 'de', 'es']
    const results = await Promise.all(langs.map(l => translate(debouncedSearch, l)))
    if (cancelled) return
    const variants = Array.from(new Set([
      debouncedSearch.toLowerCase(),
      ...results.filter(Boolean)
    ]))
    setSearchVariants(variants)
  }

  run()
  return () => { cancelled = true }
}, [debouncedSearch])

  // Перезагружаем список при смене поиска или вкладки
  useEffect(() => {
  pageRef.current = 0
  setHasMore(true)
  // ждём перевод (searchVariants), но не блокируем поиск при пустом запросе
  if (!debouncedSearch.trim() || searchVariants.length > 0) {
    loadPage(true)
  }
}, [debouncedSearch, tab, searchVariants])

  useEffect(() => { loadMeals() }, [])

  const loadPage = async (reset = false) => {
  if (reset) setLoading(true)
  else setLoadingMore(true)

  const page = reset ? 0 : pageRef.current
  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase.from('products')
    .select('*', { count: 'exact' })
    .order(debouncedSearch ? 'name' : 'created_at', { ascending: !!debouncedSearch })
    .range(from, to)

  if (debouncedSearch) {
    const variants = searchVariants.length ? searchVariants : [debouncedSearch]
    const orFilter = variants.map(v => `name.ilike.%${v}%`).join(',')
    query = query.or(orFilter)
  }
  if (tab === 'fav') query = query.eq('is_favorite', true)

  const { data, count, error } = await query
  console.log('count =', count)
  console.log('loaded =', data?.length)
    if (error) {
      console.error(error)
    } else {
      setProducts(prev => reset ? (data || []) : [...prev, ...(data || [])])
      setTotalCount(count || 0)
      setHasMore((data || []).length === PAGE_SIZE)
      pageRef.current = page + 1
    }
    setLoading(false)
    setLoadingMore(false)
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
    pageRef.current = 0
    loadPage(true)
  }

  const toggleFav = async (id, val) => {
    await supabase.from('products').update({ is_favorite: !val }).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_favorite: !val } : p))
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

  const computed = addToDiary ? {
    cal: Math.round(addToDiary.calories * weight / 100 * 10) / 10,
    protein: Math.round(addToDiary.protein * weight / 100 * 10) / 10,
    fat: Math.round(addToDiary.fat * weight / 100 * 10) / 10,
    carbs: Math.round(addToDiary.carbs * weight / 100 * 10) / 10,
  } : null

  const inputBase = {
    width: '100%', padding: '11px 14px', background: 'var(--color-surface)',
    border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text)',
    fontSize: 14, boxSizing: 'border-box', outline: 'none', backdropFilter: 'blur(8px)'
  }

  return (
    <div style={{ padding: '24px 20px', paddingBottom: 100, minHeight: '100vh' }}>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ ...fadeStyle(0), display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Продукты</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
            {totalCount} продуктов
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="glass-button-dark" style={{
          padding: '10px 18px', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
          + Новый
        </button>
      </div>

      <div style={fadeStyle(50)}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Поиск продукта..."
          style={{ ...inputBase, marginBottom: 12, padding: '12px 16px', borderRadius: 12 }} />

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[['all', 'Все'], ['fav', '⭐ Избранное']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} className={tab === key ? 'glass-button-dark' : 'glass-button'} style={{
              padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <div style={{ fontSize: 24, animation: 'pulse 1.2s infinite' }}>⏳</div>
          <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }`}</style>
        </div>
      )}

      {!loading && products.length === 0 && (
        <div style={{ ...fadeStyle(100), textAlign: 'center', padding: 40, color: 'var(--color-text-disabled)' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🥗</p>
          <p style={{ fontSize: 14 }}>Продуктов не найдено</p>
        </div>
      )}

      {products.map((p, index) => (
        <FadeCard key={p.id} delay={Math.min(index, 8) * 30} className="glass-card" style={{
          padding: '14px 16px', marginBottom: 8, borderRadius: 16
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--color-text)', margin: '0 0 3px', fontSize: 14 }}>{p.name}</p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 12, margin: 0 }}>
                {p.calories} ккал · Б{p.protein} Ж{p.fat} У{p.carbs} (на 100г)
              </p>
            </div>
            <button onClick={() => toggleFav(p.id, p.is_favorite)} style={{
              background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: 6 }}>
              {p.is_favorite ? '⭐' : '☆'}
            </button>
          </div>
          <button onClick={() => openAddToDiary(p)} className="glass-button" style={{
            width: '100%', padding: 10, borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            + Добавить в рацион
          </button>
        </FadeCard>
      ))}

      {hasMore && !loading && (
        <button onClick={() => loadPage(false)} disabled={loadingMore} className="glass-button" style={{
          width: '100%', padding: 14, borderRadius: 12, fontWeight: 600, fontSize: 13,
          cursor: 'pointer', marginTop: 8 }}>
          {loadingMore ? 'Загрузка...' : 'Показать ещё'}
        </button>
      )}

      {/* Модалка нового продукта */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, height: '100dvh', background: 'rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'flex-end', zIndex: 200 }}
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="glass-sheet" style={{ padding: 24, width: '100%', maxWidth: 480, margin: '0 auto',
            maxHeight: '85dvh', overflowY: 'auto', animation: 'fadeIn 0.2s ease forwards' }}>
            <div style={{ width: 36, height: 4, background: 'var(--color-border)', borderRadius: 2, margin: '0 auto 20px' }}/>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>Новый продукт</h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 20 }}>Данные на 100г продукта</p>

            {[['name', 'Название', 'text'], ['calories', 'Калории (ккал)', 'number'],
              ['protein', 'Белки (г)', 'number'], ['fat', 'Жиры (г)', 'number'],
              ['carbs', 'Углеводы (г)', 'number']].map(([key, label, type]) => (
              <div key={key} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block',
                  marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
                <input type={type} placeholder={type === 'number' ? '0' : 'Например: Куриная грудка'}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: type === 'number' ? +e.target.value : e.target.value })}
                  style={inputBase} />
              </div>
            ))}

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowAdd(false)} className="glass-button" style={{
                flex: 1, padding: 14, borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>Отмена</button>
              <button onClick={save} disabled={saving || !form.name} className="glass-button-dark" style={{
                flex: 2, padding: 14, borderRadius: 12, fontWeight: 700,
                cursor: form.name ? 'pointer' : 'default', opacity: form.name ? 1 : 0.5 }}>
                {saving ? 'Сохранение...' : 'Добавить продукт'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка добавления в рацион */}
      {addToDiary && (
        <div style={{ position: 'fixed', inset: 0, height: '100dvh', background: 'rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'flex-end', zIndex: 200 }}
          onClick={e => e.target === e.currentTarget && setAddToDiary(null)}>
          <div className="glass-sheet" style={{ padding: 24, width: '100%', maxWidth: 480, margin: '0 auto',
            animation: 'fadeIn 0.2s ease forwards' }}>
            <div style={{ width: 36, height: 4, background: 'var(--color-border)', borderRadius: 2, margin: '0 auto 16px' }}/>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>Добавить в рацион</h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 20 }}>{addToDiary.name}</p>

            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block',
              marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Приём пищи</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {meals.map(m => (
                <button key={m.id} onClick={() => setSelectedMeal(m.id)}
                  className={selectedMeal === m.id ? 'glass-button-dark' : 'glass-button'} style={{
                  padding: '8px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {m.name}
                </button>
              ))}
            </div>

            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block',
              marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Вес (г)</label>
            <input type="number" value={weight || ''}
              onChange={e => setWeight(e.target.value === '' ? '' : +e.target.value)}
              onFocus={e => e.target.select()}
              style={{ ...inputBase, padding: '14px 16px', borderRadius: 12,
                fontSize: 20, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}/>

            {computed && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[['Ккал', computed.cal], ['Б', computed.protein], ['Ж', computed.fat], ['У', computed.carbs]].map(([l, v]) => (
                  <div key={l} style={{ background: 'var(--color-card)', borderRadius: 10, padding: 8, textAlign: 'center' }}>
                    <p style={{ fontSize: 10, color: 'var(--color-text-secondary)', margin: '0 0 2px' }}>{l}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>{v}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setAddToDiary(null)} className="glass-button" style={{
                flex: 1, padding: 14, borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>Отмена</button>
              <button onClick={confirmAddToDiary} disabled={addingDiary || !selectedMeal} className="glass-button-dark" style={{
                flex: 2, padding: 14, borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>
                {addingDiary ? 'Добавление...' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}