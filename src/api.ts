import { invoke } from '@tauri-apps/api/core'
import { enable, disable, isEnabled } from '@tauri-apps/plugin-autostart'

export interface CityEntry {
  id: string
  name: string
  admin1?: string
  country?: string
  lat: number
  lon: number
}

export interface Position {
  x: number
  y: number
}

export interface WidgetConfig {
  cities: CityEntry[]
  currentCityId: string | null
  position: Position | null
  opacity: number
  refreshInterval: number
}

export interface CurrentWeather {
  temperature: number
  apparentTemperature: number
  humidity: number
  windSpeed: number
  weatherCode: number
  isDay: boolean
}

export interface DailyEntry {
  date: string
  weatherCode: number
  maxTemp: number
  minTemp: number
}

export interface HourlyEntry {
  time: string
  temperature: number
  weatherCode: number
  isDay: boolean
}

export interface WeatherData {
  current: CurrentWeather
  today: DailyEntry
  hourly: HourlyEntry[]
  daily: DailyEntry[]
}

export interface IpLocation {
  lat: number
  lon: number
  name: string
}

export const api = {
  fetchWeather: (lat: number, lon: number) =>
    invoke<WeatherData>('fetch_weather', { lat, lon }),
  ipLocate: () => invoke<IpLocation | null>('ip_locate'),
  geolocate: () => invoke<IpLocation | null>('geolocate'),
  searchCity: (name: string) => invoke<CityEntry[]>('search_city', { name }),
  getConfig: () => invoke<WidgetConfig>('get_config'),
  addCity: (city: CityEntry) => invoke<WidgetConfig>('add_city', { city }),
  removeCity: (id: string) => invoke<WidgetConfig>('remove_city', { id }),
  setCurrentCity: (id: string) => invoke<void>('set_current_city', { id }),
  setOpacity: (opacity: number) => invoke<void>('set_opacity', { opacity }),
  setSearchState: (open: boolean) => invoke<void>('set_search_state', { open }),
  showAbout: () => invoke<void>('show_about'),
  quit: () => invoke<void>('quit'),
  autostart: { enable, disable, isEnabled }
}
