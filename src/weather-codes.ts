export type WeatherCategory =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunderstorm'

export interface WeatherInfo {
  text: string
  category: WeatherCategory
}

export type ThemeKey =
  | 'clear-day'
  | 'clear-night'
  | 'partly-cloudy-day'
  | 'partly-cloudy-night'
  | 'cloudy-day'
  | 'cloudy-night'
  | 'fog'
  | 'drizzle-day'
  | 'drizzle-night'
  | 'rain-day'
  | 'rain-night'
  | 'snow-day'
  | 'snow-night'
  | 'thunderstorm-day'
  | 'thunderstorm-night'

const CODE_MAP: Record<number, WeatherInfo> = {
  0: { text: '晴', category: 'clear' },
  1: { text: '晴间多云', category: 'partly-cloudy' },
  2: { text: '多云', category: 'partly-cloudy' },
  3: { text: '阴', category: 'cloudy' },
  45: { text: '雾', category: 'fog' },
  48: { text: '雾凇', category: 'fog' },
  51: { text: '小雨', category: 'drizzle' },
  53: { text: '小雨', category: 'drizzle' },
  55: { text: '中雨', category: 'drizzle' },
  56: { text: '冻雨', category: 'drizzle' },
  57: { text: '冻雨', category: 'drizzle' },
  61: { text: '小雨', category: 'rain' },
  63: { text: '中雨', category: 'rain' },
  65: { text: '大雨', category: 'rain' },
  66: { text: '冻雨', category: 'rain' },
  67: { text: '冻雨', category: 'rain' },
  71: { text: '小雪', category: 'snow' },
  73: { text: '中雪', category: 'snow' },
  75: { text: '大雪', category: 'snow' },
  77: { text: '雪粒', category: 'snow' },
  80: { text: '阵雨', category: 'rain' },
  81: { text: '阵雨', category: 'rain' },
  82: { text: '暴雨', category: 'rain' },
  85: { text: '阵雪', category: 'snow' },
  86: { text: '阵雪', category: 'snow' },
  95: { text: '雷暴', category: 'thunderstorm' },
  96: { text: '雷暴', category: 'thunderstorm' },
  99: { text: '强雷暴', category: 'thunderstorm' }
}

export function getWeatherInfo(code: number): WeatherInfo {
  return CODE_MAP[code] ?? { text: '未知', category: 'cloudy' }
}

export function getThemeKey(category: WeatherCategory, isDay: boolean): ThemeKey {
  if (category === 'fog') return 'fog'
  const dn = isDay ? 'day' : 'night'
  return `${category}-${dn}` as ThemeKey
}
