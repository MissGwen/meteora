import { useEffect, useRef, useState } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import './styles/widget.css'
import './styles/gradients.css'
import './styles/animations.css'
import { getWeatherInfo, getThemeKey } from './weather-codes'
import { getIconSvg } from './icons'
import { api, type CityEntry, type WeatherData, type WidgetConfig } from './api'

const GEAR_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'

function formatHour(iso: string, index: number): string {
  if (index === 0) return '现在'
  const m = iso.match(/T(\d{2}):/)
  return m ? `${parseInt(m[1], 10)}时` : ''
}
function formatDay(index: number): string {
  if (index === 0) return '今天'
  if (index === 1) return '明天'
  if (index === 2) return '后天'
  return ''
}

export default function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [cityName, setCityName] = useState('定位中…')
  const [theme, setTheme] = useState('')
  const [opacity, setOpacity] = useState(1)
  const [cities, setCities] = useState<CityEntry[]>([])
  const [currentCity, setCurrentCity] = useState<CityEntry | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CityEntry[]>([])
  const [hint, setHint] = useState('输入城市名以搜索')
  const [autostart, setAutostart] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentCityRef = useRef<CityEntry | null>(null)

  useEffect(() => {
    currentCityRef.current = currentCity
  }, [currentCity])

  const loadWeather = async (city: CityEntry) => {
    setCurrentCity(city)
    currentCityRef.current = city
    setCityName(city.name)
    setLoading(true)
    setError(null)
    try {
      const data = await api.fetchWeather(city.lat, city.lon)
      setWeather(data)
      setTheme(getThemeKey(getWeatherInfo(data.current.weatherCode).category, data.current.isDay))
    } catch {
      setError('获取天气失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const blockMenu = (e: MouseEvent) => e.preventDefault()
    window.addEventListener('contextmenu', blockMenu)
    return () => window.removeEventListener('contextmenu', blockMenu)
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined
    void (async () => {
      const cfg: WidgetConfig = await api.getConfig()
      setCities(cfg.cities)
      setOpacity(cfg.opacity)
      const found = cfg.cities.find((c) => c.id === cfg.currentCityId)
      if (found) {
        await loadWeather(found)
      } else {
        const loc = await api.ipLocate()
        if (loc) {
          await loadWeather({ id: 'auto', name: loc.name, lat: loc.lat, lon: loc.lon })
        } else {
          setError('无法定位')
          setLoading(false)
        }
      }
      timer = setInterval(() => {
        const c = currentCityRef.current
        if (c) void loadWeather(c)
      }, Math.max(1, cfg.refreshInterval) * 60 * 1000)
    })()
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [])

  const openSearch = () => {
    setSearchOpen(true)
    void api.setSearchState(true)
    setTimeout(() => document.getElementById('search-input')?.focus(), 50)
  }
  const closeSearch = () => {
    setSearchOpen(false)
    setQuery('')
    setResults([])
    setHint('输入城市名以搜索')
    void api.setSearchState(false)
  }
  const openSettings = async () => {
    setSettingsOpen(true)
    void api.setSearchState(true)
    try {
      setAutostart(await api.autostart.isEnabled())
    } catch {
      /* ignore */
    }
  }
  const closeSettings = () => {
    setSettingsOpen(false)
    void api.setSearchState(false)
  }

  useEffect(() => {
    if (!searchOpen) return
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (!query.trim()) {
      setResults([])
      setHint('输入城市名以搜索')
      return
    }
    setHint('搜索中…')
    searchTimer.current = setTimeout(async () => {
      try {
        const r = await api.searchCity(query.trim())
        setResults(r)
        setHint(r.length ? '' : '未找到城市')
      } catch {
        setHint('搜索失败')
      }
    }, 350)
  }, [query, searchOpen])

  const selectCity = async (r: CityEntry) => {
    const city: CityEntry = { id: r.id, name: r.name, admin1: r.admin1, country: r.country, lat: r.lat, lon: r.lon }
    const cfg = await api.addCity(city)
    setCities(cfg.cities)
    closeSearch()
    await loadWeather(city)
  }

  const switchCity = async (c: CityEntry) => {
    void api.setCurrentCity(c.id)
    closeSettings()
    await loadWeather(c)
  }

  const changeOpacity = async (v: number) => {
    setOpacity(v)
    void api.setOpacity(v)
  }

  const toggleAutostart = async () => {
    const next = !autostart
    setAutostart(next)
    try {
      if (next) await api.autostart.enable()
      else await api.autostart.disable()
      setAutostart(await api.autostart.isEnabled())
    } catch {
      setAutostart(!next)
    }
  }

  const info = weather ? getWeatherInfo(weather.current.weatherCode) : null

  const onCardMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    const t = e.target as HTMLElement
    if (t.closest('[data-no-drag]')) return
    void getCurrentWindow().startDragging()
  }

  return (
    <div className={`card theme-${theme}`} id="card" style={{ opacity }} onMouseDown={onCardMouseDown}>
      <div className="scene">
        <div className="sun-glow" />
        <div className="stars" />
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="rain-layer" />
        <div className="snow-layer" />
      </div>

      <div className="content">
        {loading ? (
          <div className="state">
            <div className="spinner" />
            <span>加载中…</span>
          </div>
        ) : error ? (
          <div className="state">
            <span>{error}</span>
            <span style={{ fontSize: 11, opacity: 0.6 }}>点右上角齿轮搜索城市</span>
          </div>
        ) : weather && info ? (
          <>
            <div className="header">
              <span className="city" data-no-drag onClick={openSearch}>
                {cityName}
              </span>
              <span className="icon-main" dangerouslySetInnerHTML={{ __html: getIconSvg(info.category, weather.current.isDay) }} />
            </div>
            <div className="temp">
              <span>{Math.round(weather.current.temperature)}</span>
              <span className="deg">°</span>
            </div>
            <div className="condition">{info.text}</div>
            <div className="hilow">
              <span>H:{Math.round(weather.today.maxTemp)}°</span>
              <span>L:{Math.round(weather.today.minTemp)}°</span>
            </div>
            <div className="meta">
              体感 {Math.round(weather.current.apparentTemperature)}° · 湿度 {weather.current.humidity}% · {Math.round(weather.current.windSpeed)}km/h
            </div>
            <div className="hourly">
              {weather.hourly.map((h, i) => {
                const hi = getWeatherInfo(h.weatherCode)
                return (
                  <div className="hour" key={i}>
                    <span className="h-time">{formatHour(h.time, i)}</span>
                    <span className="h-icon" dangerouslySetInnerHTML={{ __html: getIconSvg(hi.category, h.isDay) }} />
                    <span className="h-temp">{Math.round(h.temperature)}°</span>
                  </div>
                )
              })}
            </div>
            <div className="daily">
              {weather.daily.slice(0, 3).map((d, i) => {
                const di = getWeatherInfo(d.weatherCode)
                return (
                  <div className="day" key={i}>
                    <span className="d-name">{formatDay(i)}</span>
                    <span className="d-icon" dangerouslySetInnerHTML={{ __html: getIconSvg(di.category, true) }} />
                    <span className="d-hi">{Math.round(d.maxTemp)}°</span>
                    <span className="d-lo">{Math.round(d.minTemp)}°</span>
                  </div>
                )
              })}
            </div>
            <div className="credit">Open-Meteo</div>
          </>
        ) : null}
      </div>

      <div className="gear" data-no-drag onClick={openSettings} dangerouslySetInnerHTML={{ __html: GEAR_SVG }} />

      {/* Search overlay */}
      <div className={`overlay${searchOpen ? ' open' : ''}`} data-no-drag>
        <div className="ov-header">
          <span>搜索城市</span>
          <span className="ov-close" onClick={closeSearch}>✕</span>
        </div>
        <input
          id="search-input"
          className="search-input"
          placeholder="搜索城市…"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="search-results">
          {results.map((r) => (
            <div className="search-item" key={r.id} onClick={() => void selectCity(r)}>
              <span>{r.name}</span>
              <span className="si-sub">{r.admin1 || r.country || ''}</span>
            </div>
          ))}
        </div>
        {hint ? <div className="search-hint">{hint}</div> : null}
      </div>

      {/* Settings overlay */}
      <div className={`overlay${settingsOpen ? ' open' : ''}`} data-no-drag>
        <div className="ov-header">
          <span>设置</span>
          <span className="ov-close" onClick={closeSettings}>✕</span>
        </div>
        <div className="ov-body">
          <div className="ov-item" onClick={() => { closeSettings(); if (currentCity) void loadWeather(currentCity) }}>↻ 刷新天气</div>
          <div className="ov-item" onClick={() => { closeSettings(); openSearch() }}>🔍 搜索城市</div>
          <div className="ov-label">切换城市</div>
          <div className="ov-list">
            {cities.length === 0 ? (
              <div className="ov-empty">暂无保存的城市</div>
            ) : (
              cities.map((c) => (
                <div
                  className={`ov-city${c.id === currentCity?.id ? ' active' : ''}`}
                  key={c.id}
                  onClick={() => void switchCity(c)}
                >
                  {c.name}
                </div>
              ))
            )}
          </div>
          <div className="ov-label">透明度</div>
          <div className="opacity-row">
            <input
              type="range"
              className="op-slider"
              min={0.5}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => void changeOpacity(parseFloat(e.target.value))}
            />
            <span className="op-value">{Math.round(opacity * 100)}%</span>
          </div>
          <div className="ov-toggle-row" onClick={() => void toggleAutostart()}>
            <span>开机自启</span>
            <div className={`toggle${autostart ? ' on' : ''}`}>
              <div className="toggle-knob" />
            </div>
          </div>
          <div className="ov-item" onClick={() => void api.showAbout()}>ℹ 关于</div>
          <div className="ov-item danger" onClick={() => void api.quit()}>退出</div>
        </div>
      </div>
    </div>
  )
}
