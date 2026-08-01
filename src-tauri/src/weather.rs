use serde::{Deserialize, Serialize};

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CurrentWeather {
    pub temperature: f64,
    pub apparent_temperature: f64,
    pub humidity: i64,
    pub wind_speed: f64,
    pub weather_code: i64,
    pub is_day: bool,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DailyEntry {
    pub date: String,
    pub weather_code: i64,
    pub max_temp: f64,
    pub min_temp: f64,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct HourlyEntry {
    pub time: String,
    pub temperature: f64,
    pub weather_code: i64,
    pub is_day: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WeatherData {
    pub current: CurrentWeather,
    pub today: DailyEntry,
    pub hourly: Vec<HourlyEntry>,
    pub daily: Vec<DailyEntry>,
}

#[derive(Deserialize)]
struct OmCurrent {
    time: String,
    temperature_2m: f64,
    relative_humidity_2m: i64,
    apparent_temperature: f64,
    is_day: i64,
    weather_code: i64,
    wind_speed_10m: f64,
}

#[derive(Deserialize)]
struct OmDaily {
    time: Vec<String>,
    weather_code: Vec<i64>,
    temperature_2m_max: Vec<f64>,
    temperature_2m_min: Vec<f64>,
}

#[derive(Deserialize)]
struct OmHourly {
    time: Vec<String>,
    temperature_2m: Vec<f64>,
    weather_code: Vec<i64>,
    is_day: Vec<i64>,
}

#[derive(Deserialize)]
struct OmResponse {
    current: OmCurrent,
    daily: OmDaily,
    hourly: OmHourly,
}

#[tauri::command]
pub async fn fetch_weather(lat: f64, lon: f64) -> Result<WeatherData, String> {
    let url = format!(
        "https://api.open-meteo.com/v1/forecast?latitude={}&longitude={}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code,is_day&timezone=auto&forecast_days=3",
        lat, lon
    );
    let resp: OmResponse = reqwest::get(&url)
        .await
        .map_err(|e| e.to_string())?
        .json()
        .await
        .map_err(|e| e.to_string())?;

    let start = resp
        .hourly
        .time
        .iter()
        .rposition(|t| t.as_str() <= resp.current.time.as_str())
        .unwrap_or(0);
    let end = (start + 7).min(resp.hourly.time.len());
    let mut hourly = Vec::with_capacity(end - start);
    for i in start..end {
        hourly.push(HourlyEntry {
            time: resp.hourly.time[i].clone(),
            temperature: resp.hourly.temperature_2m[i],
            weather_code: resp.hourly.weather_code[i],
            is_day: resp.hourly.is_day[i] == 1,
        });
    }

    let daily: Vec<DailyEntry> = resp
        .daily
        .time
        .iter()
        .enumerate()
        .map(|(i, date)| DailyEntry {
            date: date.clone(),
            weather_code: resp.daily.weather_code[i],
            max_temp: resp.daily.temperature_2m_max[i],
            min_temp: resp.daily.temperature_2m_min[i],
        })
        .collect();

    let today = daily[0].clone();

    Ok(WeatherData {
        current: CurrentWeather {
            temperature: resp.current.temperature_2m,
            apparent_temperature: resp.current.apparent_temperature,
            humidity: resp.current.relative_humidity_2m,
            wind_speed: resp.current.wind_speed_10m,
            weather_code: resp.current.weather_code,
            is_day: resp.current.is_day == 1,
        },
        today,
        hourly,
        daily,
    })
}
