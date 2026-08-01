# Meteora

Desktop weather widget for Windows, pinned to the desktop. Built with **Tauri 2 + React + TypeScript + Rust**.

桌面天气小组件，常驻 Windows 桌面底层显示。

## Features

- Weather card: condition-driven gradients, scene animations (sun glow / stars / drifting clouds / rain / snow), custom SVG icons
- Pinned to desktop (always-on-bottom via Win32 `SetWindowPos`), stays behind other windows
- Smooth native drag (`startDragging()` JS API), no system menu interference
- Windows system geolocation (GPS) with IP fallback (Chinese names via Nominatim) + manual city search & switching
- Current temperature, condition, hi/lo, feels-like, humidity, wind
- Hourly forecast (next 6 hours) + 3-day forecast
- Day/night aware themes & icons
- Adjustable opacity, autostart on boot, in-widget settings panel
- 15-minute auto refresh

## Tech Stack

- **Tauri 2** (Rust backend) + **React + TypeScript** (frontend) + **Vite**
- Open-Meteo (weather forecast + geocoding, no API key)
- Windows Geolocation API + ip-api.com (location), Nominatim (reverse geocoding)
- `windows` crate (Win32 API for desktop pinning + system geolocation)
- `tauri-plugin-autostart`, `tauri-plugin-dialog`
- Inter font (OFL 1.1)

## Prerequisites

- [Rust](https://rustup.rs) (stable, MSVC toolchain)
- Node.js + pnpm
- Microsoft C++ Build Tools (for Rust on Windows)
- WebView2 Runtime (preinstalled on Windows 10/11)

## Getting Started

```bash
pnpm install
pnpm tauri dev
```

## Build

```bash
pnpm tauri build
```

Outputs an installer / portable exe in `src-tauri/target/release/bundle/`.

## Data Sources & Attribution

### Open-Meteo

Weather data by [Open-Meteo.com](https://open-meteo.com/), licensed under
[CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/). Attribution is
shown in the widget and here as required by the license.

The free Open-Meteo API is for **non-commercial use** only (≤ 10,000 calls/day
per IP). This widget refreshes every 15 minutes (~96 calls/day). For commercial
use, subscribe to an Open-Meteo API plan.

> Note: Open-Meteo provides weather *model* forecast data, not real-time station
> observations, so the temperature may differ by 1-3° from phone apps that use
> observational data.

### Open-Meteo Geocoding

City search uses the [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)
under the same CC-BY 4.0 terms as the weather API.

### Location & Reverse Geocoding

Primary location via the Windows Geolocation API (system location services),
falling back to IP geolocation via [ip-api.com](https://ip-api.com/) (non-commercial).
Reverse geocoding (coordinates to Chinese place name) via
[Nominatim](https://nominatim.openstreetmap.org/) (OSM).

## Fonts

Uses [Inter](https://github.com/rsms/inter) by Rasmus Andersson, licensed under
the [SIL Open Font License 1.1](https://scripts.sil.org/OFL), bundled via
`@fontsource/inter`.

## License

MIT - see [LICENSE](./LICENSE).

Weather data: CC-BY 4.0 (Open-Meteo). Font: OFL-1.1 (Inter). These retain their
respective licenses.
