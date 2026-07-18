import { useEffect, useState, useRef } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Auth from './pages/Auth'
import Diary from './pages/Diary'
import Products from './pages/Products'
import Profile from './pages/Profile'
import Analytics from './pages/Analytics'
import Layout from './components/Layout'
import SplashScreen from './components/SplashScreen'
import LiquidBackground from './components/LiquidBackground'
import { ThemeProvider, useTheme } from './components/ThemeProvider'
import SnowBackground from './components/SnowBackground'
import CharcoalBackground from './components/CharcoalBackground'

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

  const [displayLocation, setDisplayLocation] = useState(location)
  const [stage, setStage] = useState("in")

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setStage("out")
    }
  }, [location, displayLocation])

  const onTransitionEnd = () => {
    if (stage === "out") {
      setDisplayLocation(location)

      requestAnimationFrame(() => {
        setStage("in")
      })
    }
  }

  return (
    <div
      onTransitionEnd={onTransitionEnd}
      style={{
        background: 'transparent',
        minHeight: '100vh',
        transform:
          stage === "out"
            ? "translateX(-4%)"
            : "translateX(0)",
        opacity: stage === "out" ? 0 : 1,
        transition:
          "transform .24s cubic-bezier(.22,1,.36,1), opacity .24s ease",
        willChange: "transform, opacity"
      }}
    >
      <Routes location={displayLocation}>
        <Route path="/" element={<Diary session={session} />} />
        <Route path="/products" element={<Products session={session} />} />
        <Route path="/analytics" element={<Analytics session={session} />} />
        <Route path="/profile" element={<Profile session={session} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

function AppContent() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()

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
      height: '100vh', background: 'var(--color-bg)' }}>
      <div style={{ fontSize: 32, animation: 'pulse 1.5s infinite' }}>🥗</div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )

  if (!session) return <Auth />

  return (
    <>
      {theme === 'charcoal' ? <CharcoalBackground /> : <SnowBackground />}
      <Layout>
        <AnimatedRoutes session={session} />
      </Layout>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}