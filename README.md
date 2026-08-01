# Weather Widget

Apple-style desktop weather widget for Windows, pinned to the desktop. Built with **Tauri 2 + React + TypeScript + Rust**.

精仿苹果天气小组件，常驻 Windows 桌面底层显示。

## Features

- Apple-style weather card: condition-driven gradients, scene animations (sun glow / stars / drifting clouds / rain / snow), custom SVG icons
- Pinned to desktop (always-on-bottom via Win32 `SetWindowPos`), stays behind other windows
- Smooth native drag (`data-tauri-drag-region`), no system menu interference
- Auto IP geolocation (Chinese names via Nominatim) + manual city search & switching
- Current temperature, condition, hi/lo, feels-like, humidity, wind
- Hourly forecast (next 6 hours) + 3-day forecast
- Day/night aware themes & icons
- Adjustable opacity, autostart on boot, in-widget settings panel
- 15-minute auto refresh

## Tech Stack

- **Tauri 2** (Rust backend) + **React + TypeScript** (frontend) + **Vite**
- Open-Meteo (weather, no API key)
- ip-api.com + Nominatim (geolocation)
- `windows` crate (Win32 API for desktop pinning)
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

### ip-api.com & Nominatim

IP geolocation via [ip-api.com](https://ip-api.com/) (non-commercial) and
reverse geocoding via [Nominatim](https://nominatim.openstreetmap.org/) (OSM).

## Fonts

Uses [Inter](https://github.com/rsms/inter) by Rasmus Andersson, licensed under
the [SIL Open Font License 1.1](https://scripts.sil.org/OFL), bundled via
`@fontsource/inter`.

## License

MIT - see [LICENSE](./LICENSE).

Weather data: CC-BY 4.0 (Open-Meteo). Font: OFL-1.1 (Inter). These retain their
respective licenses.
