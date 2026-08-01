mod config;
mod geo;
mod weather;
mod window_ctl;

use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::{Manager, WindowEvent};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};

pub struct WindowState {
    pub last_move: Mutex<Instant>,
    pub last_save: Mutex<Instant>,
    pub search_open: Mutex<bool>,
}

#[tauri::command]
fn set_search_state(state: tauri::State<'_, WindowState>, open: bool) {
    *state.search_open.lock().unwrap() = open;
}

#[tauri::command]
fn show_about(app: tauri::AppHandle) {
    app.dialog()
        .message("桌面天气小组件\n\n天气数据由 Open-Meteo.com 提供 (CC-BY 4.0)\n字体 Inter (OFL 1.1)\nMIT License")
        .title("关于")
        .kind(MessageDialogKind::Info)
        .show(|_| ());
}

#[tauri::command]
fn quit(app: tauri::AppHandle) {
    app.exit(0);
}

#[cfg(target_os = "windows")]
fn pin_window(win: &tauri::WebviewWindow) {
    if let Ok(hwnd) = win.hwnd() {
        window_ctl::pin_to_bottom(hwnd.0);
    }
}
#[cfg(not(target_os = "windows"))]
fn pin_window(_win: &tauri::WebviewWindow) {}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let data_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| std::path::PathBuf::from("."));
            let config_state = config::ConfigState::new(data_dir);

            // Restore saved position before showing.
            if let Some(pos) = config_state.inner.lock().unwrap().position.clone() {
                if let Some(win) = app.get_webview_window("main") {
                    let _ = win.set_position(tauri::PhysicalPosition { x: pos.x, y: pos.y });
                }
            }
            app.manage(config_state);
            app.manage(WindowState {
                last_move: Mutex::new(Instant::now()),
                last_save: Mutex::new(Instant::now()),
                search_open: Mutex::new(false),
            });

            if let Some(win) = app.get_webview_window("main") {
                let _ = win.show();
                pin_window(&win);
            }

            // Periodically keep the widget pinned to the desktop bottom.
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                loop {
                    tokio::time::sleep(Duration::from_secs(2)).await;
                    let win_state = handle.state::<WindowState>();
                    let search_open = *win_state.search_open.lock().unwrap();
                    let last_move = *win_state.last_move.lock().unwrap();
                    if !search_open && last_move.elapsed() > Duration::from_millis(800) {
                        if let Some(win) = handle.get_webview_window("main") {
                            pin_window(&win);
                        }
                    }
                }
            });

            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::Moved(pos) = event {
                let app = window.app_handle();
                if let Some(ws) = app.try_state::<WindowState>() {
                    *ws.last_move.lock().unwrap() = Instant::now();
                    let last_save = *ws.last_save.lock().unwrap();
                    if last_save.elapsed() > Duration::from_millis(400) {
                        *ws.last_save.lock().unwrap() = Instant::now();
                        if let Some(cfg) = app.try_state::<config::ConfigState>() {
                            {
                                let mut c = cfg.inner.lock().unwrap();
                                c.position = Some(config::Position { x: pos.x, y: pos.y });
                            }
                            cfg.save();
                        }
                    }
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            weather::fetch_weather,
            geo::ip_locate,
            geo::geolocate,
            geo::search_city,
            config::get_config,
            config::add_city,
            config::remove_city,
            config::set_current_city,
            config::set_opacity,
            config::set_position,
            set_search_state,
            show_about,
            quit
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
