use std::sync::Arc;
use tauri::State;

use dbx_core::plugins::{InstalledPlugin, PluginManifest, SUPPORTED_PLUGIN_PROTOCOL_VERSION};
use serde::Serialize;

use super::connection::AppState;

const JDBC_PLUGIN_DOWNLOAD_URL: &str = "https://github.com/t8y2/dbx/releases/latest/download/dbx-jdbc-plugin-0.1.0.zip";
const JDBC_PLUGIN_R2_PATH: &str = "releases/latest/dbx-jdbc-plugin-0.1.0.zip";

#[tauri::command]
pub async fn list_plugins(state: State<'_, Arc<AppState>>) -> Result<Vec<InstalledPlugin>, String> {
    state.plugins.list_installed()
}

#[derive(Debug, Clone, Serialize)]
pub struct JdbcDriverInfo {
    pub name: String,
    pub path: String,
    pub size: u64,
}

#[derive(Debug, Clone, Serialize)]
pub struct JdbcPluginStatus {
    pub installed: bool,
    pub version: Option<String>,
    pub protocol_version: Option<u32>,
    pub compatible: bool,
    pub path: String,
}

#[tauri::command]
pub async fn jdbc_plugin_status(state: State<'_, Arc<AppState>>) -> Result<JdbcPluginStatus, String> {
    jdbc_plugin_status_from_state(&state)
}

#[tauri::command]
pub async fn install_jdbc_plugin(state: State<'_, Arc<AppState>>) -> Result<JdbcPluginStatus, String> {
    let bytes = download_jdbc_plugin_zip().await?;
    let plugin_dir = state.plugins.root_dir().join("jdbc");
    install_jdbc_plugin_zip(&bytes, &plugin_dir)?;
    jdbc_plugin_status_from_state(&state)
}

#[tauri::command]
pub async fn install_jdbc_plugin_local(
    state: State<'_, Arc<AppState>>,
    path: String,
) -> Result<JdbcPluginStatus, String> {
    let bytes = std::fs::read(&path).map_err(|e| format!("Failed to read file: {e}"))?;
    let plugin_dir = state.plugins.root_dir().join("jdbc");
    install_jdbc_plugin_zip(&bytes, &plugin_dir)?;
    jdbc_plugin_status_from_state(&state)
}

#[tauri::command]
pub async fn uninstall_jdbc_plugin(state: State<'_, Arc<AppState>>) -> Result<JdbcPluginStatus, String> {
    let plugin_dir = state.plugins.root_dir().join("jdbc");
    for entry in ["manifest.json", "bin", "lib"] {
        let path = plugin_dir.join(entry);
        if !path.exists() {
            continue;
        }
        if path.is_dir() {
            std::fs::remove_dir_all(path).map_err(|err| err.to_string())?;
        } else {
            std::fs::remove_file(path).map_err(|err| err.to_string())?;
        }
    }
    jdbc_plugin_status_from_state(&state)
}

#[tauri::command]
pub async fn list_jdbc_drivers(state: State<'_, Arc<AppState>>) -> Result<Vec<JdbcDriverInfo>, String> {
    list_jdbc_drivers_from_dir(&jdbc_drivers_dir(&state))
}

#[tauri::command]
pub async fn import_jdbc_drivers(
    state: State<'_, Arc<AppState>>,
    paths: Vec<String>,
) -> Result<Vec<JdbcDriverInfo>, String> {
    let drivers_dir = jdbc_drivers_dir(&state);
    std::fs::create_dir_all(&drivers_dir).map_err(|err| err.to_string())?;

    for path in paths {
        let source = std::path::PathBuf::from(path);
        if !source.exists() {
            return Err(format!("Driver JAR does not exist: {}", source.display()));
        }
        if source.extension().and_then(|ext| ext.to_str()).map(|ext| ext.eq_ignore_ascii_case("jar")) != Some(true) {
            return Err(format!("Only .jar files can be imported: {}", source.display()));
        }
        let file_name = source
            .file_name()
            .and_then(|name| name.to_str())
            .ok_or_else(|| format!("Invalid driver file path: {}", source.display()))?;
        let target = unique_target_path(&drivers_dir, file_name);
        if source == target {
            continue;
        }
        std::fs::copy(&source, &target)
            .map_err(|err| format!("Failed to import {} to {}: {err}", source.display(), target.display()))?;
    }

    list_jdbc_drivers_from_dir(&drivers_dir)
}

#[tauri::command]
pub async fn delete_jdbc_driver(state: State<'_, Arc<AppState>>, path: String) -> Result<Vec<JdbcDriverInfo>, String> {
    let drivers_dir = jdbc_drivers_dir(&state);
    let drivers_dir = drivers_dir.canonicalize().map_err(|err| err.to_string())?;
    let target = std::path::PathBuf::from(path).canonicalize().map_err(|err| err.to_string())?;
    if !target.starts_with(&drivers_dir) {
        return Err("Driver file is outside the JDBC drivers directory".to_string());
    }
    std::fs::remove_file(&target).map_err(|err| err.to_string())?;
    list_jdbc_drivers_from_dir(&drivers_dir)
}

fn jdbc_drivers_dir(state: &AppState) -> std::path::PathBuf {
    state.plugins.root_dir().join("jdbc").join("drivers")
}

fn jdbc_plugin_status_from_state(state: &AppState) -> Result<JdbcPluginStatus, String> {
    let plugin_dir = state.plugins.root_dir().join("jdbc");
    let manifest_path = plugin_dir.join("manifest.json");
    let manifest = match std::fs::read_to_string(&manifest_path) {
        Ok(raw) => Some(serde_json::from_str::<PluginManifest>(&raw).map_err(|err| err.to_string())?),
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => None,
        Err(err) => return Err(err.to_string()),
    };
    let version =
        manifest.as_ref().and_then(|manifest| (!manifest.version.is_empty()).then_some(manifest.version.clone()));
    let protocol_version = manifest.as_ref().map(|manifest| manifest.protocol_version);
    let compatible = match manifest.as_ref() {
        Some(manifest) => manifest.protocol_version == SUPPORTED_PLUGIN_PROTOCOL_VERSION,
        None => true,
    };
    Ok(JdbcPluginStatus {
        installed: manifest.is_some(),
        version,
        protocol_version,
        compatible,
        path: plugin_dir.to_string_lossy().to_string(),
    })
}

async fn download_jdbc_plugin_zip() -> Result<Vec<u8>, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(60))
        .build()
        .map_err(|err| err.to_string())?;

    let resp =
        dbx_core::race_download(&client, JDBC_PLUGIN_DOWNLOAD_URL, JDBC_PLUGIN_R2_PATH, "dbx-jdbc-plugin-installer")
            .await
            .map_err(|err| format!("Failed to download JDBC plugin: {err}"))?;

    let bytes = resp.bytes().await.map_err(|err| err.to_string())?;
    Ok(bytes.to_vec())
}

fn install_jdbc_plugin_zip(bytes: &[u8], plugin_dir: &std::path::Path) -> Result<(), String> {
    let cursor = std::io::Cursor::new(bytes);
    let mut archive = zip::ZipArchive::new(cursor).map_err(|err| err.to_string())?;
    let temp_dir = plugin_dir.with_extension("tmp");
    if temp_dir.exists() {
        std::fs::remove_dir_all(&temp_dir).map_err(|err| err.to_string())?;
    }
    std::fs::create_dir_all(&temp_dir).map_err(|err| err.to_string())?;

    for index in 0..archive.len() {
        let mut file = archive.by_index(index).map_err(|err| err.to_string())?;
        if file.is_dir() {
            continue;
        }
        let Some(enclosed) = file.enclosed_name().map(|path| path.to_path_buf()) else {
            continue;
        };
        let relative = strip_zip_root(&enclosed);
        if relative.as_os_str().is_empty() {
            continue;
        }
        let output = temp_dir.join(relative);
        if let Some(parent) = output.parent() {
            std::fs::create_dir_all(parent).map_err(|err| err.to_string())?;
        }
        let mut target = std::fs::File::create(&output).map_err(|err| err.to_string())?;
        std::io::copy(&mut file, &mut target).map_err(|err| err.to_string())?;
    }

    if !temp_dir.join("manifest.json").exists() {
        let _ = std::fs::remove_dir_all(&temp_dir);
        return Err("Downloaded JDBC plugin package is missing manifest.json".to_string());
    }
    let manifest_path = temp_dir.join("manifest.json");
    let manifest = std::fs::read_to_string(&manifest_path)
        .map_err(|err| format!("Failed to read downloaded JDBC plugin manifest: {err}"))?;
    let manifest: PluginManifest = serde_json::from_str(&manifest)
        .map_err(|err| format!("Failed to parse downloaded JDBC plugin manifest: {err}"))?;
    if manifest.id != "jdbc" {
        let _ = std::fs::remove_dir_all(&temp_dir);
        return Err(format!("Downloaded plugin has unexpected id '{}'", manifest.id));
    }
    if manifest.protocol_version != SUPPORTED_PLUGIN_PROTOCOL_VERSION {
        let _ = std::fs::remove_dir_all(&temp_dir);
        return Err(format!(
            "Downloaded JDBC plugin uses protocol version {}, but this DBX build supports protocol version {}",
            manifest.protocol_version, SUPPORTED_PLUGIN_PROTOCOL_VERSION
        ));
    }

    let drivers_dir = plugin_dir.join("drivers");
    let temp_drivers_dir = temp_dir.join("drivers");
    if drivers_dir.exists() && !temp_drivers_dir.exists() {
        copy_dir_all(&drivers_dir, &temp_drivers_dir)?;
    }
    if plugin_dir.exists() {
        std::fs::remove_dir_all(plugin_dir).map_err(|err| err.to_string())?;
    }
    std::fs::rename(&temp_dir, plugin_dir).map_err(|err| err.to_string())?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let executable = plugin_dir.join("bin").join("dbx-jdbc-plugin");
        if executable.exists() {
            let mut permissions = std::fs::metadata(&executable).map_err(|err| err.to_string())?.permissions();
            permissions.set_mode(0o755);
            std::fs::set_permissions(executable, permissions).map_err(|err| err.to_string())?;
        }
    }

    Ok(())
}

fn strip_zip_root(path: &std::path::Path) -> std::path::PathBuf {
    let mut components = path.components();
    let first = components.next();
    if let (Some(std::path::Component::Normal(_)), Some(_)) = (first, components.clone().next()) {
        components.collect()
    } else {
        path.to_path_buf()
    }
}

fn copy_dir_all(source: &std::path::Path, target: &std::path::Path) -> Result<(), String> {
    std::fs::create_dir_all(target).map_err(|err| err.to_string())?;
    for entry in std::fs::read_dir(source).map_err(|err| err.to_string())? {
        let entry = entry.map_err(|err| err.to_string())?;
        let file_type = entry.file_type().map_err(|err| err.to_string())?;
        let dest = target.join(entry.file_name());
        if file_type.is_dir() {
            copy_dir_all(&entry.path(), &dest)?;
        } else {
            std::fs::copy(entry.path(), dest).map_err(|err| err.to_string())?;
        }
    }
    Ok(())
}

fn list_jdbc_drivers_from_dir(drivers_dir: &std::path::Path) -> Result<Vec<JdbcDriverInfo>, String> {
    let entries = match std::fs::read_dir(drivers_dir) {
        Ok(entries) => entries,
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => return Ok(vec![]),
        Err(err) => return Err(err.to_string()),
    };

    let mut drivers = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|err| err.to_string())?;
        let path = entry.path();
        if path.extension().and_then(|ext| ext.to_str()).map(|ext| ext.eq_ignore_ascii_case("jar")) != Some(true) {
            continue;
        }
        let metadata = entry.metadata().map_err(|err| err.to_string())?;
        drivers.push(JdbcDriverInfo {
            name: path.file_name().and_then(|name| name.to_str()).unwrap_or("driver.jar").to_string(),
            path: path.to_string_lossy().to_string(),
            size: metadata.len(),
        });
    }
    drivers.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(drivers)
}

fn unique_target_path(dir: &std::path::Path, file_name: &str) -> std::path::PathBuf {
    let target = dir.join(file_name);
    if !target.exists() {
        return target;
    }

    let path = std::path::Path::new(file_name);
    let stem = path.file_stem().and_then(|value| value.to_str()).unwrap_or("driver");
    let ext = path.extension().and_then(|value| value.to_str()).unwrap_or("jar");
    for index in 1.. {
        let candidate = dir.join(format!("{stem}-{index}.{ext}"));
        if !candidate.exists() {
            return candidate;
        }
    }
    unreachable!()
}
