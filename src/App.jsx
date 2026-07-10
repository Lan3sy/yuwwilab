import { useEffect, useState, useRef } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Auth from './pages/Auth'
import Diary from './pages/Diary'
import Products from './pages/Products'
import Profile from './pages/Profile'
import Analytics from './pages/Analytics'
import Layout from './components/Layout'

const ROUTES = ['/', '/products', '/analytics', '/profile']

function PageContent({ pathname, session }) {
  return (
    <Routes location={{ pathname }}>
      <Route path="/" element={<Diary session={session} />} />
      <Route path="/products" element={<Products session={session} />} />
      <Route path="/analytics" element={<Analytics session={session} />} />
      <Route path="/profile" element={<Profile session={session} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function AnimatedRoutes({ session }) {
  const location = useLocation()
  const prevPath = useRef(location.pathname)
  const [current, setCurrent] = useState(location.pathname)
  const [direction, setDirection] = useState(1)
  const [phase, setPhase] = useState('idle')

  useEffect(() => {
    if (location.pathname === current) return

    const prevIndex = ROUTES.indexOf(prevPath.current)
    const nextIndex = ROUTES.indexOf(location.pathname)
    const dir = nextIndex >= prevIndex ? 1 : -1
    setDirection(dir)
    prevPath.current = location.pathname

    setPhase('out')
    const t1 = setTimeout(() => {
      setCurrent(location.pathname)
      setPhase('in')
      const t2 = setTimeout(() => setPhase('settle'), 20)
      return () => clearTimeout(t2)
    }, 140)
    return () => clearTimeout(t1)
  }, [location])

  useEffect(() => {
    if (phase === 'settle') {
      const t = setTimeout(() => setPhase('idle'), 280)
      return () => clearTimeout(t)
    }
  }, [phase])

  // Во время idle — НИКАКИХ transform/filter/willChange,
  // иначе они создают containing block для position:fixed и ломают модалки
  if (phase === 'idle') {
    return <PageContent pathname={current} session={session} />
  }

  const animStyle = {
    out: {
      transform: `translateX(${direction * -4}%)`,
      filter: 'blur(3px)',
      opacity: 0,
      transition: 'transform 0.14s ease, filter 0.14s ease, opacity 0.14s ease',
    },
    in: {
      transform: `translateX(${direction * 4}%)`,
      filter: 'blur(3px)',
      opacity: 0,
      transition: 'none',
    },
    settle: {
      transform: 'translateX(0)',
      filter: 'blur(0px)',
      opacity: 1,
      transition: 'transform 0.26s cubic-bezier(0.22, 1, 0.36, 1), filter 0.26s ease, opacity 0.26s ease',
    },
  }[phase]

  return (
    <div style={animStyle}>
      <PageContent pathname={current} session={session} />
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#e8e8ea' }}>
      <div style={{ fontSize: 32, animation: 'pulse 1.5s infinite' }}>🥗</div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )

  if (!session) return <Auth />

  return (
    <Layout>
      <AnimatedRoutes session={session} />
    </Layout>
  )
}