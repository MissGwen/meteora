use serde::{Deserialize, Serialize};

#[cfg(target_os = "windows")]
use windows::Devices::Geolocation::{Geolocator, PositionAccuracy, GeolocationAccessStatus};
#[cfg(target_os = "windows")]
use windows::Foundation::IAsyncOperation;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IpLocation {
    pub lat: f64,
    pub lon: f64,
    pub name: String,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CityResult {
    pub id: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub admin1: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub country: Option<String>,
    pub lat: f64,
    pub lon: f64,
}

#[derive(Deserialize)]
struct IpApiResp {
    status: String,
    lat: f64,
    lon: f64,
    city: String,
}

#[derive(Deserialize)]
struct GeoResp {
    results: Option<Vec<GeoItem>>,
}

#[derive(Deserialize)]
struct GeoItem {
    id: i64,
    name: String,
    admin1: Option<String>,
    country: Option<String>,
    latitude: f64,
    longitude: f64,
}

#[derive(Deserialize)]
struct NominatimResp {
    name: Option<String>,
    address: Option<NominatimAddr>,
}

#[derive(Deserialize)]
struct NominatimAddr {
    city: Option<String>,
    town: Option<String>,
    county: Option<String>,
    district: Option<String>,
    state: Option<String>,
}

async fn reverse_geocode(lat: f64, lon: f64) -> Option<String> {
    let client = reqwest::Client::new();
    let resp: NominatimResp = client
        .get(format!(
            "https://nominatim.openstreetmap.org/reverse?lat={}&lon={}&format=json&accept-language=zh-CN&zoom=12&addressdetails=1",
            lat, lon
        ))
        .header("User-Agent", "weather-widget/0.1 (desktop)")
        .send()
        .await
        .ok()?
        .json()
        .await
        .ok()?;
    if let Some(a) = resp.address {
        let n = a
            .city
            .or(a.town)
            .or(a.county)
            .or(a.district)
            .or(a.state)
            .or(resp.name);
        n.filter(|s| !s.is_empty())
    } else {
        resp.name.filter(|s| !s.is_empty())
    }
}

#[cfg(target_os = "windows")]
pub async fn system_locate() -> Option<(f64, f64)> {
    let access = Geolocator::RequestAccessAsync().ok()?;
    let status = tokio::time::timeout(std::time::Duration::from_secs(5), async {
        access.get()
    }).await.ok()?.ok()?;

    if status != GeolocationAccessStatus::Allowed {
        return None;
    }

    let locator = Geolocator::new().ok()?;
    let _ = locator.SetDesiredAccuracy(PositionAccuracy::High);
    let op: IAsyncOperation<_> = locator.GetGeopositionAsync().ok()?;

    let pos = tokio::time::timeout(std::time::Duration::from_secs(10), async {
        op.get()
    }).await.ok()?.ok()?;

    let coord = pos.Coordinate().ok()?;
    let point = coord.Point().ok()?;
    let position = point.Position().ok()?;
    let lat = position.Latitude;
    let lon = position.Longitude;
    if lat.is_nan() || lon.is_nan() || (lat == 0.0 && lon == 0.0) {
        return None;
    }
    Some((lat, lon))
}

#[cfg(not(target_os = "windows"))]
pub async fn system_locate() -> Option<(f64, f64)> {
    None
}

#[tauri::command]
pub async fn geolocate() -> Result<Option<IpLocation>, String> {
    if let Some((lat, lon)) = system_locate().await {
        let name = reverse_geocode(lat, lon).await.unwrap_or_else(|| "当前位置".to_string());
        return Ok(Some(IpLocation { lat, lon, name }));
    }
    ip_locate_impl().await.map_err(|e| e.to_string())
}

async fn ip_locate_impl() -> Result<Option<IpLocation>, String> {
    let resp: IpApiResp = reqwest::get("http://ip-api.com/json/?fields=status,lat,lon,city&lang=zh-CN")
        .await
        .map_err(|e| e.to_string())?
        .json()
        .await
        .map_err(|e| e.to_string())?;
    if resp.status != "success" {
        return Ok(None);
    }
    let mut name = if resp.city.is_empty() {
        "当前位置".to_string()
    } else {
        resp.city
    };
    if let Some(zh) = reverse_geocode(resp.lat, resp.lon).await {
        name = zh;
    }
    Ok(Some(IpLocation {
        lat: resp.lat,
        lon: resp.lon,
        name,
    }))
}

#[tauri::command]
pub async fn ip_locate() -> Result<Option<IpLocation>, String> {
    ip_locate_impl().await
}

#[tauri::command]
pub async fn search_city(name: String) -> Result<Vec<CityResult>, String> {
    let resp: GeoResp = reqwest::Client::new()
        .get("https://geocoding-api.open-meteo.com/v1/search")
        .query(&[
            ("name", name.as_str()),
            ("count", "6"),
            ("language", "zh"),
            ("format", "json"),
        ])
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json()
        .await
        .map_err(|e| e.to_string())?;
    Ok(resp
        .results
        .unwrap_or_default()
        .into_iter()
        .map(|r| CityResult {
            id: format!("geo-{}", r.id),
            name: r.name,
            admin1: r.admin1,
            country: r.country,
            lat: r.latitude,
            lon: r.longitude,
        })
        .collect())
}
