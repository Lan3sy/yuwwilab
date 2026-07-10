import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const PRAISES = [
  'Ты молодец!', 'Отличная работа сегодня!', 'Ты сделал это!', 'Горжусь тобой!',
  'Ещё один шаг к цели!', 'Сила растёт с каждой тренировкой!', 'Ты сильнее, чем был вчера!',
  'Так держать!', 'Невероятная дисциплина!', 'Твоё тело скажет спасибо!',
  'Ты справился на отлично!', 'Каждая тренировка приближает к цели!', 'Ты вложился в себя сегодня!',
  'Прогресс — это твоя заслуга!', 'Ты становишься лучше день ото дня!', 'Вот это выносливость!',
  'Респект за упорство!', 'Твои усилия того стоят!', 'Сегодня ты победил лень!',
  'Ты на верном пути!', 'Мышцы уже говорят спасибо!', 'Ты вдохновляешь!',
  'Отличный результат!', 'Ты выложился на полную!', 'Это было мощно!',
  'Твоя воля впечатляет!', 'Ты держишь слово перед собой!', 'Красавчик!',
  'Железная дисциплина!', 'Ты сегодня герой!', 'Ещё одна победа над собой!',
  'Твой прогресс заметен!', 'Ты справляешься лучше многих!', 'Вперёд к новым высотам!',
  'Ты доказал себе, что можешь!', 'Отличная самоотдача!', 'Ты заслужил отдых!',
  'Сильное тело — сильный дух!', 'Ты не сдался — и это главное!', 'Твоя энергия впечатляет!',
  'Ты выбрал себя сегодня!', 'Каждый повтор приближал к цели!', 'Ты преодолел себя!',
  'Это была отличная тренировка!', 'Ты растёшь с каждым днём!', 'Твой результат говорит сам за себя!',
  'Ты справился, несмотря ни на что!', 'Продолжай в том же духе!', 'Такие тренировки меняют жизнь!',
  'Ты инвестируешь в лучшую версию себя!', 'Ты сегодня показал характер!', 'Отличная концентрация!',
  'Твой прогресс — это твоя суперсила!', 'Ты справился как чемпион!', 'Работа сделана на совесть!',
  'Ты на шаг ближе к своей цели!', 'Твоя сила воли на высоте!', 'Ты сделал важный вклад в себя!',
  'Ты не просто тренировался — ты рос!', 'Гордись собой — ты это заслужил!', 'Великолепная тренировка!'
]

const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
const DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const CATEGORIES = [
  { key: 'chest', label: 'Грудь' },
  { key: 'back', label: 'Спина' },
  { key: 'legs', label: 'Ноги' },
  { key: 'shoulders', label: 'Плечи' },
  { key: 'arms', label: 'Руки' },
  { key: 'core', label: 'Кор' },
  { key: 'cardio', label: 'Кардио' },
]

const SET_DURATION_MIN = 3 // среднее время на подход с отдыхом

const estimateExerciseMinutes = (sets) => (sets || 3) * SET_DURATION_MIN

const calcExerciseCalories = (met, bodyWeightKg, sets) => {
  const minutes = estimateExerciseMinutes(sets)
  return met * (bodyWeightKg || 70) * (minutes / 60)
}

export default function WorkoutManager({ session, profile, onClose, onLogged }) {
  const [tab, setTab] = useState('plan') // plan | today | programs | library
  const [plan, setPlan] = useState({}) // { 0: {title, exercises: []}, ... }
  const [selectedDay, setSelectedDay] = useState(0)
  const [exercisesDb, setExercisesDb] = useState([])
  const [templates, setTemplates] = useState([])
  const [userPrograms, setUserPrograms] = useState([])
  const [programDetails, setProgramDetails] = useState({}) // programId -> {dayOfWeek: {...}}
  const [saving, setSaving] = useState(false)

  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerCategory, setPickerCategory] = useState('chest')
  const [pickerSearch, setPickerSearch] = useState('')

  const [showSaveProgram, setShowSaveProgram] = useState(false)
  const [newProgramName, setNewProgramName] = useState('')

  const [todayLog, setTodayLog] = useState(null)
  const [logs, setLogs] = useState([])

  const [quickAddDay, setQuickAddDay] = useState(null)
  const [doneMap, setDoneMap] = useState({})
  const [finished, setFinished] = useState(null)

  const todayDow = (new Date().getDay() + 6) % 7
  const todayDate = new Date().toISOString().split('T')[0]

  useEffect(() => {
    loadPlan()
    loadExercises()
    loadPrograms()
    loadTodayLog()
    loadLogs()
  }, [])
  useEffect(() => {
    const ex = plan[todayDow]?.exercises || []
    const initial = {}
    ex.forEach((_, i) => { initial[i] = true })
    setDoneMap(initial)
  }, [plan, todayDow])
  const loadPlan = async () => {
    const { data } = await supabase.from('workout_plan').select('*').eq('user_id', session.user.id)
    const map = {}
    ;(data || []).forEach(p => { map[p.day_of_week] = p })
    setPlan(map)
  }

  const loadExercises = async () => {
    const { data } = await supabase.from('exercises').select('*').order('name')
    setExercisesDb(data || [])
  }

  const loadPrograms = async () => {
    const { data: temp } = await supabase.from('workout_programs').select('*').eq('is_template', true).order('name')
    const { data: mine } = await supabase.from('workout_programs').select('*')
      .eq('user_id', session.user.id).eq('is_template', false).order('created_at', { ascending: false })
    setTemplates(temp || [])
    setUserPrograms(mine || [])
  }

  const loadProgramDetail = async (programId) => {
    if (programDetails[programId]) return programDetails[programId]
    const { data: days } = await supabase.from('program_days').select('*').eq('program_id', programId)
    const dayIds = (days || []).map(d => d.id)
    let exList = []
    if (dayIds.length) {
      const { data } = await supabase.from('program_day_exercises')
        .select('*, exercise:exercises(*)').in('program_day_id', dayIds).order('sort_order')
      exList = data || []
    }
    const detail = {}
    ;(days || []).forEach(d => {
      detail[d.day_of_week] = {
        title: d.title,
        exercises: exList.filter(e => e.program_day_id === d.id).map(e => ({
          exercise_id: e.exercise_id,
          name: e.exercise?.name || '',
          met: e.exercise?.met || 4,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight || 0,
        }))
      }
    })
    setProgramDetails(prev => ({ ...prev, [programId]: detail }))
    return detail
  }

  const loadTodayLog = async () => {
    const { data } = await supabase.from('workout_logs').select('*')
      .eq('user_id', session.user.id).eq('date', todayDate).maybeSingle()
    setTodayLog(data || null)
  }

  const loadLogs = async () => {
    const from = new Date(); from.setDate(from.getDate() - 27)
    const { data } = await supabase.from('workout_logs').select('*')
      .eq('user_id', session.user.id).gte('date', from.toISOString().split('T')[0])
      .order('date', { ascending: false })
    setLogs(data || [])
  }

  // ---- Редактирование плана ----
  const savePlanDay = async (dayIndex, newExercises, newTitle) => {
    const existing = plan[dayIndex]
    const payload = {
      user_id: session.user.id,
      day_of_week: dayIndex,
      title: newTitle !== undefined ? newTitle : (existing?.title || ''),
      exercises: newExercises !== undefined ? newExercises : (existing?.exercises || []),
    }
    if (existing) {
      await supabase.from('workout_plan').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('workout_plan').insert(payload)
    }
    loadPlan()
  }

  const addExerciseToDay = (dayIndex, exercise) => {
    const current = plan[dayIndex]?.exercises || []
    const updated = [...current, {
      exercise_id: exercise.id, name: exercise.name, met: exercise.met,
      sets: 3, reps: '8-12', weight: 0
    }]
    savePlanDay(dayIndex, updated)
    setPickerOpen(false)
  }

  const updateExerciseField = (dayIndex, exIndex, field, value) => {
    const current = [...(plan[dayIndex]?.exercises || [])]
    current[exIndex] = { ...current[exIndex], [field]: value }
    setPlan({ ...plan, [dayIndex]: { ...plan[dayIndex], exercises: current } })
  }

  const commitExerciseField = (dayIndex) => {
    savePlanDay(dayIndex, plan[dayIndex]?.exercises || [])
  }

  const removeExerciseFromDay = (dayIndex, exIndex) => {
    const current = (plan[dayIndex]?.exercises || []).filter((_, i) => i !== exIndex)
    savePlanDay(dayIndex, current)
  }

  const updateDayTitle = (dayIndex, title) => {
    setPlan({ ...plan, [dayIndex]: { ...plan[dayIndex], title } })
  }

  const commitDayTitle = (dayIndex) => {
    savePlanDay(dayIndex, undefined, plan[dayIndex]?.title || '')
  }

  const clearDay = async (dayIndex) => {
    const existing = plan[dayIndex]
    if (existing) await supabase.from('workout_plan').delete().eq('id', existing.id)
    loadPlan()
  }

  // ---- Программы ----
  const applyProgram = async (program) => {
    setSaving(true)
    const detail = await loadProgramDetail(program.id)
    for (const [dow, dayData] of Object.entries(detail)) {
      await savePlanDay(Number(dow), dayData.exercises, dayData.title)
    }
    await supabase.from('workout_settings').upsert({
      user_id: session.user.id, active_program_id: program.id, updated_at: new Date().toISOString()
    })
    setSaving(false)
    setTab('plan')
  }

  const saveCurrentPlanAsProgram = async () => {
    if (!newProgramName.trim()) return
    setSaving(true)
    const { data: prog } = await supabase.from('workout_programs').insert({
      user_id: session.user.id, is_template: false, name: newProgramName, description: ''
    }).select().single()

    for (const [dow, dayData] of Object.entries(plan)) {
      if (!dayData.title && (!dayData.exercises || dayData.exercises.length === 0)) continue
      const { data: pd } = await supabase.from('program_days').insert({
        program_id: prog.id, day_of_week: Number(dow), title: dayData.title || ''
      }).select().single()

      for (let i = 0; i < (dayData.exercises || []).length; i++) {
        const ex = dayData.exercises[i]
        await supabase.from('program_day_exercises').insert({
          program_day_id: pd.id, exercise_id: ex.exercise_id,
          sets: ex.sets, reps: ex.reps, weight: ex.weight, sort_order: i
        })
      }
    }
    setSaving(false)
    setShowSaveProgram(false)
    setNewProgramName('')
    loadPrograms()
  }

  const deleteUserProgram = async (id) => {
    await supabase.from('workout_programs').delete().eq('id', id)
    loadPrograms()
  }

  // ---- Логирование тренировки ----
  const logWorkout = async (dayIndex) => {
    setSaving(true)
    const dayPlan = plan[dayIndex]
    const allExercises = dayPlan?.exercises || []
    const exercises = allExercises.filter((_, i) => doneMap[i])
    const bodyWeight = profile?.weight || 70
    let totalMinutes = 0
    let totalCal = 0
    exercises.forEach(ex => {
      const min = estimateExerciseMinutes(ex.sets)
      totalMinutes += min
      totalCal += calcExerciseCalories(ex.met, bodyWeight, ex.sets)
    })
    const payload = {
      user_id: session.user.id, date: todayDate,
      title: dayPlan?.title || 'Тренировка',
      duration_minutes: Math.round(totalMinutes),
      calories_burned: Math.round(totalCal),
      exercises: exercises,
    }
    if (todayLog) {
      await supabase.from('workout_logs').update(payload).eq('id', todayLog.id)
    } else {
      await supabase.from('workout_logs').insert(payload)
    }
    setSaving(false)
    loadTodayLog(); loadLogs()
    if (onLogged) onLogged()
  }
  const finishWorkout = async () => {
    await logWorkout(todayDow)
    const praise = PRAISES[Math.floor(Math.random() * PRAISES.length)]
    setFinished(praise)
  }
  const removeTodayLog = async () => {
    if (!todayLog) return
    await supabase.from('workout_logs').delete().eq('id', todayLog.id)
    setTodayLog(null)
    loadLogs()
    if (onLogged) onLogged()
  }

  const filteredExercises = exercisesDb
    .filter(e => e.category === pickerCategory)
    .filter(e => e.name.toLowerCase().includes(pickerSearch.toLowerCase()))

  const todayPlan = plan[todayDow]
  const todayExercises = todayPlan?.exercises || []
  const doneExercises = todayExercises.filter((_, i) => doneMap[i])
  const todayEstimate = doneExercises.reduce((acc, ex) => {
    const min = estimateExerciseMinutes(ex.sets)
    return {
      minutes: acc.minutes + min,
      cal: acc.cal + calcExerciseCalories(ex.met, profile?.weight, ex.sets)
    }
  }, { minutes: 0, cal: 0 })

const toggleDone = (i) => setDoneMap(prev => ({ ...prev, [i]: !prev[i] }))

  const plannedDaysCount = Object.values(plan).filter(d => d.exercises && d.exercises.length > 0).length
  const actualPerWeek = Math.round((logs.length / 4) * 10) / 10
  const totalBurned = logs.reduce((s, l) => s + (l.calories_burned || 0), 0)
  if (finished) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: 32, textAlign: 'center',
          maxWidth: 320, animation: 'popIn 0.3s ease' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 8 }}>{finished}</p>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>Тренировка успешно засчитана</p>
          <button onClick={onClose} style={{ width: '100%', padding: 14, background: '#111',
            border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            Отлично!
          </button>
        </div>
        <style>{`@keyframes popIn { from{transform:scale(0.8);opacity:0} to{transform:scale(1);opacity:1} }`}</style>
      </div>
    )
  }
  const inputStyle = {
    padding: '8px 10px', background: '#f9f9f9', border: '1.5px solid #ebebeb',
    borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box'
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end', zIndex: 300 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: '20px 20px 0 0',
        padding: 24, width: '100%', maxWidth: 480, margin: '0 auto',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

        <div style={{ width: 36, height: 4, background: '#e5e5e5', borderRadius: 2,
          margin: '0 auto 16px', flexShrink: 0 }}/>

        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexShrink: 0 }}>
          {[['plan', 'План'], ['today', 'Сегодня'], ['programs', 'Программы'], ['library', 'Библиотека']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: '8px 4px', borderRadius: 10, border: 'none',
              background: tab === key ? '#111' : '#f4f4f4',
              color: tab === key ? '#fff' : '#555',
              fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{label}</button>
          ))}
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>

          {/* ---- ПЛАН ---- */}
          {tab === 'plan' && (
            <div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                {DAYS_SHORT.map((d, i) => (
                  <button key={i} onClick={() => setSelectedDay(i)} style={{
                    padding: '8px 12px', borderRadius: 20, border: 'none',
                    background: selectedDay === i ? '#111' : '#f4f4f4',
                    color: selectedDay === i ? '#fff' : '#555',
                    fontWeight: 600, cursor: 'pointer', fontSize: 12, position: 'relative' }}>
                    {d}
                    {plan[i]?.exercises?.length > 0 && (
                      <span style={{ position: 'absolute', top: -2, right: -2,
                        width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }}/>
                    )}
                  </button>
                ))}
              </div>

              <input value={plan[selectedDay]?.title || ''}
                onChange={e => updateDayTitle(selectedDay, e.target.value)}
                onBlur={() => commitDayTitle(selectedDay)}
                placeholder={`Название дня (${DAYS[selectedDay]})`}
                style={{ ...inputStyle, width: '100%', marginBottom: 12, fontSize: 15, fontWeight: 600, padding: '10px 12px' }}/>

              {(plan[selectedDay]?.exercises || []).length === 0 && (
                <p style={{ textAlign: 'center', color: '#ccc', padding: '20px 0', fontSize: 13 }}>
                  День пуст. Добавь упражнения ниже
                </p>
              )}

              {(plan[selectedDay]?.exercises || []).map((ex, i) => (
                <div key={i} style={{ background: '#f9f9f9', borderRadius: 12, padding: 12, marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: 0 }}>{ex.name}</p>
                    <button onClick={() => removeExerciseFromDay(selectedDay, i)} style={{
                      background: 'none', border: 'none', color: '#ddd', fontSize: 18, cursor: 'pointer' }}>×</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                    <div>
                      <label style={{ fontSize: 9, color: '#aaa', textTransform: 'uppercase' }}>Подходы</label>
                      <input type="number" value={ex.sets}
                        onChange={e => updateExerciseField(selectedDay, i, 'sets', +e.target.value)}
                        onBlur={() => commitExerciseField(selectedDay)}
                        style={{ ...inputStyle, width: '100%' }}/>
                    </div>
                    <div>
                      <label style={{ fontSize: 9, color: '#aaa', textTransform: 'uppercase' }}>Повторы</label>
                      <input value={ex.reps}
                        onChange={e => updateExerciseField(selectedDay, i, 'reps', e.target.value)}
                        onBlur={() => commitExerciseField(selectedDay)}
                        style={{ ...inputStyle, width: '100%' }}/>
                    </div>
                    <div>
                      <label style={{ fontSize: 9, color: '#aaa', textTransform: 'uppercase' }}>Вес (кг)</label>
                      <input type="number" value={ex.weight}
                        onChange={e => updateExerciseField(selectedDay, i, 'weight', +e.target.value)}
                        onBlur={() => commitExerciseField(selectedDay)}
                        style={{ ...inputStyle, width: '100%' }}/>
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={() => { setQuickAddDay(selectedDay); setPickerOpen(true) }} style={{
                width: '100%', padding: 12, background: '#f4f4f4', border: 'none',
                borderRadius: 10, color: '#111', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginBottom: 16 }}>
                + Добавить упражнение
              </button>

              {(plan[selectedDay]?.exercises || []).length > 0 && (
                <button onClick={() => clearDay(selectedDay)} style={{
                  width: '100%', padding: 10, background: 'none', border: '1.5px solid #ffcccc',
                  borderRadius: 10, color: '#ff4444', fontWeight: 600, fontSize: 12, cursor: 'pointer', marginBottom: 12 }}>
                  Очистить день
                </button>
              )}

              <button onClick={() => setShowSaveProgram(true)} style={{
                width: '100%', padding: 12, background: 'none', border: '1.5px solid #ebebeb',
                borderRadius: 10, color: '#555', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                💾 Сохранить план как программу
              </button>
            </div>
          )}

          {/* ---- СЕГОДНЯ ---- */}
          {tab === 'today' && (
            <div>
              <div style={{ background: '#f9f9f9', borderRadius: 14, padding: 16, marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: '#888', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase' }}>
                  {DAYS[todayDow]}
                </p>
                {todayExercises.length > 0 ? (
                  <>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: '0 0 10px' }}>
                      {todayPlan.title || 'Тренировка'}
                    </p>
                    {todayExercises.map((ex, i) => (
                      <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!doneMap[i]} onChange={() => toggleDone(i)}
                          style={{ width: 16, height: 16, accentColor: '#111', cursor: 'pointer' }}/>
                        <span style={{ fontSize: 13, color: doneMap[i] ? '#111' : '#aaa',
                          textDecoration: doneMap[i] ? 'none' : 'line-through' }}>
                          {ex.name} — {ex.sets}×{ex.reps}{ex.weight > 0 ? ` @ ${ex.weight}кг` : ''}
                        </span>
                      </label>
                    ))}
                  </>
                ) : (
                  <p style={{ fontSize: 13, color: '#aaa' }}>На сегодня плана нет — настрой его во вкладке "План"</p>
                )}
              </div>

              {todayExercises.length > 0 && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                    <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 14 }}>
                      <p style={{ fontSize: 11, color: '#888', margin: '0 0 4px', textTransform: 'uppercase' }}>Время</p>
                      <p style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>
                        ~{Math.round(todayEstimate.minutes)} <span style={{ fontSize: 12, color: '#aaa' }}>мин</span>
                      </p>
                    </div>
                    <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 14 }}>
                      <p style={{ fontSize: 11, color: '#888', margin: '0 0 4px', textTransform: 'uppercase' }}>Сожжётся</p>
                      <p style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>
                        ~{Math.round(todayEstimate.cal)} <span style={{ fontSize: 12, color: '#aaa' }}>ккал</span>
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    {todayLog && (
                      <button onClick={removeTodayLog} style={{
                        flex: 1, padding: 14, background: 'none', border: '1.5px solid #ffcccc',
                        borderRadius: 12, color: '#ff4444', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                        Отменить
                      </button>
                    )}
                    <button onClick={finishWorkout} disabled={saving} style={{
                      flex: 2, padding: 14, background: '#111', border: 'none',
                      borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                      {saving ? 'Сохранение...' : 'Закончить тренировку'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ---- ПРОГРАММЫ ---- */}
          {tab === 'programs' && (
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 10 }}>Готовые программы</p>
              {templates.map(t => (
                <ProgramCard key={t.id} program={t} onApply={() => applyProgram(t)}
                  onExpand={() => loadProgramDetail(t.id)} detail={programDetails[t.id]} saving={saving}/>
              ))}

              {userPrograms.length > 0 && (
                <>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111', marginTop: 20, marginBottom: 10 }}>
                    Мои программы
                  </p>
                  {userPrograms.map(p => (
                    <ProgramCard key={p.id} program={p} onApply={() => applyProgram(p)}
                      onExpand={() => loadProgramDetail(p.id)} detail={programDetails[p.id]}
                      onDelete={() => deleteUserProgram(p.id)} saving={saving}/>
                  ))}
                </>
              )}
            </div>
          )}

          {/* ---- БИБЛИОТЕКА (просмотр) ---- */}
          {tab === 'library' && (
            <div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                {CATEGORIES.map(c => (
                  <button key={c.key} onClick={() => setPickerCategory(c.key)} style={{
                    padding: '6px 12px', borderRadius: 20, border: 'none',
                    background: pickerCategory === c.key ? '#111' : '#f4f4f4',
                    color: pickerCategory === c.key ? '#fff' : '#555',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{c.label}</button>
                ))}
              </div>
              {exercisesDb.filter(e => e.category === pickerCategory).map(ex => (
                <div key={ex.id} style={{ background: '#f9f9f9', borderRadius: 10, padding: '10px 14px',
                  marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: '0 0 2px' }}>{ex.name}</p>
                    <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>{ex.equipment}</p>
                  </div>
                  <p style={{ fontSize: 11, color: '#888', margin: 0, alignSelf: 'center' }}>MET {ex.met}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Аналитика внизу на вкладке "Программы" */}
        {tab === 'programs' && logs.length > 0 && (
          <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 14, margin: '12px 0', flexShrink: 0 }}>
            <p style={{ fontSize: 11, color: '#888', margin: '0 0 6px', textTransform: 'uppercase' }}>За 4 недели</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#555' }}>{actualPerWeek} трен/нед</span>
              <span style={{ fontSize: 13, color: '#555' }}>{totalBurned} ккал сожжено</span>
            </div>
          </div>
        )}

        <button onClick={onClose} style={{
          width: '100%', padding: 14, background: '#f4f4f4', border: 'none',
          borderRadius: 12, color: '#555', fontWeight: 600, cursor: 'pointer', marginTop: 12, flexShrink: 0 }}>
          Закрыть
        </button>
      </div>

      {/* Модалка выбора упражнения */}
      {pickerOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'flex-end', zIndex: 310 }}
          onClick={e => e.target === e.currentTarget && setPickerOpen(false)}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0',
            padding: 24, width: '100%', maxWidth: 480, margin: '0 auto', maxHeight: '80vh',
            display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: 36, height: 4, background: '#e5e5e5', borderRadius: 2, margin: '0 auto 16px' }}/>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Выбери упражнение</h3>

            <input value={pickerSearch} onChange={e => setPickerSearch(e.target.value)}
              placeholder="Поиск..." style={{ ...inputStyle, width: '100%', marginBottom: 10, padding: '10px 12px' }}/>

            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <button key={c.key} onClick={() => setPickerCategory(c.key)} style={{
                  padding: '6px 12px', borderRadius: 20, border: 'none',
                  background: pickerCategory === c.key ? '#111' : '#f4f4f4',
                  color: pickerCategory === c.key ? '#fff' : '#555',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{c.label}</button>
              ))}
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filteredExercises.map(ex => (
                <button key={ex.id} onClick={() => addExerciseToDay(quickAddDay, ex)} style={{
                  width: '100%', padding: '10px 14px', background: '#f9f9f9', border: 'none',
                  borderRadius: 10, marginBottom: 6, textAlign: 'left', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{ex.name}</span>
                  <span style={{ fontSize: 11, color: '#aaa' }}>{ex.equipment}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Модалка сохранения программы */}
      {showSaveProgram && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 320, padding: 24 }}
          onClick={e => e.target === e.currentTarget && setShowSaveProgram(false)}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 340 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Название программы</h3>
            <input value={newProgramName} onChange={e => setNewProgramName(e.target.value)}
              placeholder="Например: Моя программа" autoFocus
              style={{ ...inputStyle, width: '100%', marginBottom: 16, padding: '12px 14px', fontSize: 14 }}/>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowSaveProgram(false)} style={{
                flex: 1, padding: 12, background: '#f4f4f4', border: 'none',
                borderRadius: 10, color: '#555', fontWeight: 600, cursor: 'pointer' }}>Отмена</button>
              <button onClick={saveCurrentPlanAsProgram} disabled={saving} style={{
                flex: 1, padding: 12, background: '#111', border: 'none',
                borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                {saving ? '...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProgramCard({ program, onApply, onExpand, detail, onDelete, saving }) {
  const [expanded, setExpanded] = useState(false)

  const toggle = () => {
    if (!expanded) onExpand()
    setExpanded(!expanded)
  }

  return (
    <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 14, marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={toggle} style={{ background: 'none', border: 'none', textAlign: 'left', flex: 1, cursor: 'pointer' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: '0 0 2px' }}>{program.name}</p>
          <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>{program.description}</p>
        </button>
        {onDelete && (
          <button onClick={onDelete} style={{ background: 'none', border: 'none', color: '#ddd', fontSize: 18, cursor: 'pointer' }}>×</button>
        )}
      </div>

      {expanded && detail && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #eee' }}>
          {Object.entries(detail).map(([dow, d]) => (
            <div key={dow} style={{ marginBottom: 6 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#555', margin: '0 0 2px' }}>
                {DAYS_SHORT[dow]}: {d.title}
              </p>
              <p style={{ fontSize: 11, color: '#999', margin: 0 }}>
                {d.exercises.map(e => e.name).join(', ')}
              </p>
            </div>
          ))}
        </div>
      )}

      <button onClick={onApply} disabled={saving} style={{
        width: '100%', padding: 10, background: '#111', border: 'none',
        borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer', marginTop: 8 }}>
        {saving ? '...' : 'Применить эту программу'}
      </button>
    </div>
  )
}