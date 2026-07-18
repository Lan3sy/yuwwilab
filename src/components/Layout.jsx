import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useRef, useLayoutEffect } from 'react'
import { IconDiary, IconProducts, IconAnalytics, IconProfile } from './Icons'

export const unsavedChanges = { current: false, label: '' }

export function setUnsaved(val, label = 'изменения') {
  unsavedChanges.current = val
  unsavedChanges.label = label
}

const NAV_ITEMS = [
  { path: '/', Icon: IconDiary, label: 'Дневник' },
  { path: '/products', Icon: IconProducts, label: 'Продукты' },
  { path: '/analytics', Icon: IconAnalytics, label: 'Аналитика' },
  { path: '/profile', Icon: IconProfile, label: 'Профиль' },
]

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [dialog, setDialog] = useState(null)
  const navRef = useRef(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const itemRefs = useRef([])

  useLayoutEffect(() => {
    const activeIndex = NAV_ITEMS.findIndex(t => t.path === location.pathname)
    if (activeIndex === -1) return
    const el = itemRefs.current[activeIndex]
    const nav = navRef.current
    if (!el || !nav) return
    const navRect = nav.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    setIndicatorStyle({
      left: elRect.left - navRect.left,
      width: elRect.width,
    })
  }, [location.pathname])

  const handleNav = (path) => {
    if (path === location.pathname) return
    if (unsavedChanges.current) {
      setDialog({ to: path })
    } else {
      navigate(path)
    }
  }

  return (
    <div style={{ paddingBottom: 80, background: 'transparent', minHeight: '100vh' }}>
      {children}

      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, zIndex: 100,
        padding: '8px 12px calc(8px + env(safe-area-inset-bottom))',
        boxSizing: 'border-box',
      }}>
        <nav ref={navRef} className="glass-nav" style={{
          borderRadius: 20,
          display: 'flex', justifyContent: 'space-around',
          padding: '8px 4px',
          position: 'relative',
          overflow: 'hidden',
        }}>

          {/* Скользящий индикатор */}
          <div style={{
            position: 'absolute',
            top: 6, bottom: 6,
            left: indicatorStyle.left + 4,
            width: indicatorStyle.width - 8,
            background: 'var(--color-card)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            transition: 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s ease, background 0.3s ease',
            pointerEvents: 'none',
          }}/>

          {NAV_ITEMS.map((t, i) => {
            const active = location.pathname === t.path
            return (
              <button
                key={t.path}
                ref={el => itemRefs.current[i] = el}
                onClick={() => handleNav(t.path)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 2,
                  padding: '6px 18px', borderRadius: 14,
                  color: active ? 'var(--color-text)' : 'var(--color-text-secondary)',
                  fontSize: 10, fontWeight: active ? 700 : 500,
                  transition: 'color 0.2s',
                  position: 'relative', zIndex: 1,
                  minWidth: 60,
                }}>
                <span style={{
                  display: 'flex',
                  transform: active ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.18s'
                }}>
                  <t.Icon size={22} color={active ? 'var(--color-text)' : 'var(--color-text-secondary)'} />
                </span>
                {t.label}
              </button>
            )
          })}
        </nav>
      </div>

      {dialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999, padding: 24 }}>
          <div className="glass-sheet" style={{ borderRadius: 24, padding: 28,
            width: '100%', maxWidth: 340 }}>
            <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8, textAlign: 'center' }}>
              Несохранённые изменения
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 1.5 }}>
              Есть несохранённые {unsavedChanges.label}. Если уйдёшь — они потеряются.
            </p>
            <button onClick={() => { unsavedChanges.current = false; navigate(dialog.to); setDialog(null) }}
              className="glass-button"
              style={{ width: '100%', padding: 14, borderRadius: 14,
                color: 'var(--color-error)', fontWeight: 700, fontSize: 14,
                marginBottom: 8, cursor: 'pointer' }}>
              Уйти без сохранения
            </button>
            <button onClick={() => setDialog(null)}
              className="glass-button-dark"
              style={{ width: '100%', padding: 14, borderRadius: 14,
                fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Остаться и сохранить
            </button>
          </div>
        </div>
      )}
    </div>
  )
}