use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CityEntry {
    pub id: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub admin1: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub country: Option<String>,
    pub lat: f64,
    pub lon: f64,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Position {
    pub x: i32,
    pub y: i32,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WidgetConfig {
    #[serde(default)]
    pub cities: Vec<CityEntry>,
    #[serde(default)]
    pub current_city_id: Option<String>,
    #[serde(default)]
    pub position: Option<Position>,
    #[serde(default = "default_opacity")]
    pub opacity: f64,
    #[serde(default = "default_refresh")]
    pub refresh_interval: u64,
}

fn default_opacity() -> f64 {
    1.0
}
fn default_refresh() -> u64 {
    15
}

impl Default for WidgetConfig {
    fn default() -> Self {
        Self {
            cities: vec![],
            current_city_id: None,
            position: None,
            opacity: 1.0,
            refresh_interval: 15,
        }
    }
}

pub struct ConfigState {
    pub inner: Mutex<WidgetConfig>,
    path: PathBuf,
}

impl ConfigState {
    pub fn new(dir: PathBuf) -> Self {
        let _ = fs::create_dir_all(&dir);
        let path = dir.join("config.json");
        let cfg = fs::read_to_string(&path)
            .ok()
            .and_then(|s| serde_json::from_str::<WidgetConfig>(&s).ok())
            .unwrap_or_default();
        Self {
            inner: Mutex::new(cfg),
            path,
        }
    }

    pub fn save(&self) {
        let cfg = self.inner.lock().unwrap();
        if let Ok(json) = serde_json::to_string_pretty(&*cfg) {
            let _ = fs::write(&self.path, json);
        }
    }
}

#[tauri::command]
pub fn get_config(state: tauri::State<'_, ConfigState>) -> WidgetConfig {
    state.inner.lock().unwrap().clone()
}

#[tauri::command]
pub fn add_city(state: tauri::State<'_, ConfigState>, city: CityEntry) -> WidgetConfig {
    {
        let mut cfg = state.inner.lock().unwrap();
        if !cfg.cities.iter().any(|c| c.id == city.id) {
            cfg.cities.push(city.clone());
        }
        cfg.current_city_id = Some(city.id);
    }
    state.save();
    state.inner.lock().unwrap().clone()
}

#[tauri::command]
pub fn remove_city(state: tauri::State<'_, ConfigState>, id: String) -> WidgetConfig {
    {
        let mut cfg = state.inner.lock().unwrap();
        cfg.cities.retain(|c| c.id != id);
        if cfg.current_city_id.as_deref() == Some(id.as_str()) {
            cfg.current_city_id = cfg.cities.first().map(|c| c.id.clone());
        }
    }
    state.save();
    state.inner.lock().unwrap().clone()
}

#[tauri::command]
pub fn set_current_city(state: tauri::State<'_, ConfigState>, id: String) {
    {
        let mut cfg = state.inner.lock().unwrap();
        cfg.current_city_id = Some(id);
    }
    state.save();
}

#[tauri::command]
pub fn set_opacity(state: tauri::State<'_, ConfigState>, opacity: f64) {
    {
        let mut cfg = state.inner.lock().unwrap();
        cfg.opacity = opacity;
    }
    state.save();
}

#[tauri::command]
pub fn set_position(state: tauri::State<'_, ConfigState>, x: i32, y: i32) {
    {
        let mut cfg = state.inner.lock().unwrap();
        cfg.position = Some(Position { x, y });
    }
    state.save();
}
