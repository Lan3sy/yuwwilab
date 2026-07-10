import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xvcneltfnirvlsdeunxs.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Y25lbHRmbmlydmxzZGV1bnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMDEyNjksImV4cCI6MjA5Nzc3NzI2OX0.qAb87kXP4WU8uiI_pxST73cjaUk3z3rkdFYMhnQcOK4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  }
})