// Единый набор иконок в минималистичном стиле приложения

export const IconCalendar = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="16" rx="3" stroke={color} strokeWidth="1.8"/>
    <path d="M8 3v4M16 3v4M3 10h18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="8" cy="14" r="1.2" fill={color}/>
    <circle cx="12" cy="14" r="1.2" fill={color}/>
    <circle cx="16" cy="14" r="1.2" fill={color}/>
  </svg>
)

export const IconDiary = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 3h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"
      stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M15 3v5h5" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M8 12h8M8 16h5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconProducts = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 8h16l-1.5 11.5a2 2 0 01-2 1.5H7.5a2 2 0 01-2-1.5L4 8z"
      stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M8 8V6a4 4 0 018 0v2" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconAnalytics = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 20V10M11 20V4M18 20v-7" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M3 20h18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconProfile = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="3.5" stroke={color} strokeWidth="1.8"/>
    <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconSettings = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8"/>
    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
      stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

// Приёмы пищи — базовые
export const IconBreakfast = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="13" r="8" stroke={color} strokeWidth="1.8"/>
    <path d="M8 5.5c1-1.5 2.5-2.5 4-2.5s3 1 4 2.5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M9 13h6M9 16h4" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconLunch = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 11a8 8 0 0116 0v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-1z" stroke={color} strokeWidth="1.8"/>
    <path d="M12 3v2M3 20h18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconDinner = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M7 2v8M4 2v5a3 3 0 003 3v11M7 10a3 3 0 003-3V2"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 2c-2 0-3 3-3 6s1 4 3 4v10" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const IconSnack = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 21c4-1 7-5 7-9a7 7 0 00-14 0c0 4 3 8 7 9z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M12 3c1 1 1.5 2 1.5 3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

// Дополнительные варианты для новых пользовательских приёмов пищи (ротация)
export const IconMealAlt1 = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="4" y="4" width="16" height="16" rx="4" stroke={color} strokeWidth="1.8"/>
    <path d="M9 12h6M12 9v6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconMealAlt2 = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2l2.6 6.5L21 9l-5 4.3L17.5 21 12 17l-5.5 4L8 13.3 3 9l6.4-.5L12 2z"
      stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
  </svg>
)

export const IconMealAlt3 = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.8"/>
    <path d="M12 8v4l3 2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const IconMealAlt4 = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 8l8-5 8 5-8 5-8-5z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
    <path d="M4 8v8l8 5 8-5V8" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
  </svg>
)

// Массив для ротации иконок новых приёмов пищи
export const MEAL_ICON_POOL = [
  IconMealAlt1, IconMealAlt2, IconMealAlt3, IconMealAlt4,
  IconBreakfast, IconLunch, IconDinner, IconSnack
]

// Уровни активности
export const IconActivityMin = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="6" r="2.2" stroke={color} strokeWidth="1.6"/>
    <path d="M9 21v-6l-2-2 1-5 4 1 4-1 1 5-2 2v6" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
    <path d="M4 21h16" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)

export const IconActivityLight = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="9" cy="4.5" r="2" stroke={color} strokeWidth="1.6"/>
    <path d="M6 21l2-8-2-2 1-4 3.5 1 2-1.5M13 21l2-6 3 2" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const IconActivityMedium = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="14" cy="4.5" r="2" stroke={color} strokeWidth="1.6"/>
    <path d="M6 21l3-6-2-4 3-3 2 3h3l2 5-2 5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const IconActivityHigh = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="4" r="2" stroke={color} strokeWidth="1.6"/>
    <path d="M6 10l3-2 3 2 3-2 3 2M8 8v13M16 8v13" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const IconActivityMax = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
  </svg>
)

// Цели
export const IconGoalLoss = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 8l7 7 3-3 6 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 18h5v-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const IconGoalMaintain = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 3v3M12 18v3M4 12h3M17 12h3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.8"/>
    <circle cx="12" cy="12" r="1.5" fill={color}/>
  </svg>
)

export const IconGoalGain = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 16l7-7 3 3 6-6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 6h5v5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// Пол
export const IconMale = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="10" cy="14" r="6" stroke={color} strokeWidth="1.8"/>
    <path d="M14.5 9.5L20 4M20 4h-5M20 4v5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const IconFemale = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="9" r="6" stroke={color} strokeWidth="1.8"/>
    <path d="M12 15v7M9 19h6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)