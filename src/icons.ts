import type { WeatherCategory } from './weather-codes'

const sun = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="#fff"><circle cx="32" cy="32" r="11"/></g><g stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"><line x1="32" y1="8" x2="32" y2="15"/><line x1="32" y1="49" x2="32" y2="56"/><line x1="8" y1="32" x2="15" y2="32"/><line x1="49" y1="32" x2="56" y2="32"/><line x1="15" y1="15" x2="20" y2="20"/><line x1="44" y1="44" x2="49" y2="49"/><line x1="49" y1="15" x2="44" y2="20"/><line x1="20" y1="44" x2="15" y2="49"/></g></svg>`

const moon = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M42 8a24 24 0 1 0 14 44 18 18 0 0 1-14-44z" fill="#fff"/></svg>`

const cloud = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="#fff"><circle cx="24" cy="36" r="11"/><circle cx="37" cy="31" r="14"/><circle cx="47" cy="38" r="10"/><rect x="18" y="38" width="34" height="13" rx="6.5"/></g></svg>`

const partlyCloudyDay = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="#fff"><circle cx="23" cy="22" r="8"/></g><g stroke="#fff" stroke-width="2.6" stroke-linecap="round" fill="none"><line x1="23" y1="6" x2="23" y2="11"/><line x1="7" y1="22" x2="12" y2="22"/><line x1="34" y1="11" x2="37" y2="14"/><line x1="12" y1="33" x2="15" y2="30"/></g><g fill="#fff"><circle cx="30" cy="41" r="9"/><circle cx="41" cy="37" r="12"/><circle cx="49" cy="43" r="8"/><rect x="26" y="43" width="28" height="11" rx="5.5"/></g></svg>`

const partlyCloudyNight = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M36 8a16 16 0 1 0 10 27 12 12 0 0 1-10-27z" fill="#fff"/><g fill="#fff"><circle cx="30" cy="41" r="9"/><circle cx="41" cy="37" r="12"/><circle cx="49" cy="43" r="8"/><rect x="26" y="43" width="28" height="11" rx="5.5"/></g></svg>`

const fog = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="#fff" opacity="0.95"><circle cx="24" cy="29" r="10"/><circle cx="37" cy="25" r="13"/><circle cx="47" cy="31" r="9"/></g><g stroke="#fff" stroke-width="3" stroke-linecap="round"><line x1="14" y1="45" x2="50" y2="45"/><line x1="18" y1="52" x2="46" y2="52"/></g></svg>`

const drizzle = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="#fff"><circle cx="24" cy="29" r="10"/><circle cx="37" cy="25" r="13"/><circle cx="47" cy="31" r="9"/><rect x="19" y="31" width="30" height="10" rx="5"/></g><g fill="#fff"><circle cx="26" cy="48" r="2.6"/><circle cx="35" cy="48" r="2.6"/><circle cx="44" cy="48" r="2.6"/></g></svg>`

const rain = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="#fff"><circle cx="24" cy="27" r="10"/><circle cx="37" cy="23" r="13"/><circle cx="47" cy="29" r="9"/><rect x="19" y="29" width="30" height="10" rx="5"/></g><g stroke="#fff" stroke-width="3" stroke-linecap="round"><line x1="26" y1="44" x2="22" y2="55"/><line x1="36" y1="44" x2="32" y2="55"/><line x1="46" y1="44" x2="42" y2="55"/></g></svg>`

const snow = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="#fff"><circle cx="24" cy="27" r="10"/><circle cx="37" cy="23" r="13"/><circle cx="47" cy="29" r="9"/><rect x="19" y="29" width="30" height="10" rx="5"/></g><g fill="#fff"><circle cx="26" cy="48" r="3"/><circle cx="36" cy="50" r="3"/><circle cx="46" cy="48" r="3"/></g></svg>`

const thunderstorm = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="#fff"><circle cx="24" cy="27" r="10"/><circle cx="37" cy="23" r="13"/><circle cx="47" cy="29" r="9"/><rect x="19" y="29" width="30" height="10" rx="5"/></g><path d="M35 40l-9 13h6l-3 9 12-15h-6z" fill="#FFD24A"/></svg>`

const ICONS: Record<string, string> = {
  'clear-day': sun,
  'clear-night': moon,
  'partly-cloudy-day': partlyCloudyDay,
  'partly-cloudy-night': partlyCloudyNight,
  'cloudy-day': cloud,
  'cloudy-night': cloud,
  fog,
  'drizzle-day': drizzle,
  'drizzle-night': drizzle,
  'rain-day': rain,
  'rain-night': rain,
  'snow-day': snow,
  'snow-night': snow,
  'thunderstorm-day': thunderstorm,
  'thunderstorm-night': thunderstorm
}

export function getIconSvg(category: WeatherCategory, isDay: boolean): string {
  const dn = isDay ? 'day' : 'night'
  const key = category === 'fog' ? 'fog' : `${category}-${dn}`
  return ICONS[key] ?? cloud
}
