use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::TcpListener;
use std::sync::{Mutex, OnceLock};
use std::thread;
use tauri::{command, AppHandle, Emitter};

// Port range for OAuth callback server (dynamic)
const OAUTH_PORT_MIN: u16 = 17900;
const OAUTH_PORT_MAX: u16 = 17999;

// Active nonces storage (port -> nonce mapping)
fn active_nonces() -> &'static Mutex<HashMap<u16, String>> {
    static NONCES: OnceLock<Mutex<HashMap<u16, String>>> = OnceLock::new();
    NONCES.get_or_init(|| Mutex::new(HashMap::new()))
}

/// Find an available port in the range
fn find_available_port() -> Option<u16> {
    for port in OAUTH_PORT_MIN..=OAUTH_PORT_MAX {
        if TcpListener::bind(format!("127.0.0.1:{}", port)).is_ok() {
            return Some(port);
        }
    }
    None
}

/// Generate a unique nonce for OAuth session
fn generate_nonce() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    // Add some randomness by mixing with thread id
    let thread_id = format!("{:?}", std::thread::current().id());
    format!("{:x}{}", timestamp, thread_id.len())
}

/// Extract JSON body from HTTP request
fn extract_json_body(request: &str) -> Option<serde_json::Value> {
    // Find empty line separating headers from body
    let body_start = request.find("\r\n\r\n").map(|i| i + 4)?;
    let body = &request[body_start..];
    serde_json::from_str(body).ok()
}

/// Send an error response with CORS headers
fn send_error_response(stream: &mut std::net::TcpStream, status: u16, message: &str) {
    let body = format!(r#"{{"error":"{}"}}"#, message);
    let response = format!(
        "HTTP/1.1 {} Error\r\n\
         Access-Control-Allow-Origin: *\r\n\
         Access-Control-Allow-Methods: POST, OPTIONS\r\n\
         Access-Control-Allow-Headers: Content-Type\r\n\
         Content-Type: application/json\r\n\
         Content-Length: {}\r\n\
         \r\n\
         {}",
        status,
        body.len(),
        body
    );
    let _ = stream.write_all(response.as_bytes());
}

/// Start OAuth server with dynamic port and nonce validation.
/// Returns (port, nonce) tuple for the frontend to use.
/// The web app callback page will POST auth data to this server.
#[command]
fn start_oauth_server(app: AppHandle) -> Result<(u16, String), String> {
    // Find available port in range
    let port = find_available_port().ok_or("No available ports in range 17900-17999")?;

    // Generate and store nonce
    let nonce = generate_nonce();
    {
        let mut nonces = active_nonces().lock().unwrap();
        nonces.insert(port, nonce.clone());
    }

    // Bind to the port
    let listener = TcpListener::bind(format!("127.0.0.1:{}", port))
        .map_err(|e| format!("Failed to bind port {}: {}", port, e))?;

    listener
        .set_nonblocking(false)
        .map_err(|e| format!("Failed to set blocking mode: {}", e))?;

    let app_handle = app.clone();
    let expected_nonce = nonce.clone();
    let server_port = port;

    thread::spawn(move || {
        // Set timeout for the listener (2 minutes)
        let _ = listener.set_nonblocking(false);

        // Handle requests (OPTIONS preflight + POST with auth data)
        for _ in 0..3 {
            if let Ok((mut stream, _)) = listener.accept() {
                let mut buffer = [0u8; 8192];
                if let Ok(n) = stream.read(&mut buffer) {
                    let request = String::from_utf8_lossy(&buffer[..n]);

                    // Handle CORS preflight request
                    if request.starts_with("OPTIONS") {
                        let response = "HTTP/1.1 204 No Content\r\n\
                            Access-Control-Allow-Origin: *\r\n\
                            Access-Control-Allow-Methods: POST, OPTIONS\r\n\
                            Access-Control-Allow-Headers: Content-Type\r\n\
                            Access-Control-Max-Age: 86400\r\n\
                            \r\n";
                        let _ = stream.write_all(response.as_bytes());
                        continue;
                    }

                    // Handle POST request with auth data
                    if request.starts_with("POST") {
                        if let Some(body) = extract_json_body(&request) {
                            let code = body.get("code").and_then(|v| v.as_str());
                            let nonce = body.get("nonce").and_then(|v| v.as_str());
                            let state = body.get("state").and_then(|v| v.as_str());

                            if let (Some(code), Some(nonce), Some(state)) = (code, nonce, state) {
                                // Validate nonce
                                if nonce == expected_nonce {
                                    // Clear nonce (one-time use)
                                    {
                                        let mut nonces = active_nonces().lock().unwrap();
                                        nonces.remove(&server_port);
                                    }

                                    // Build callback URL for frontend
                                    let callback_url = format!(
                                        "http://127.0.0.1:{}?code={}&state={}",
                                        server_port,
                                        urlencoding::encode(code),
                                        urlencoding::encode(state)
                                    );

                                    let _ = app_handle.emit("oauth-callback", callback_url);

                                    // Send success response
                                    let success_body = r#"{"success":true}"#;
                                    let response = format!(
                                        "HTTP/1.1 200 OK\r\n\
                                        Access-Control-Allow-Origin: *\r\n\
                                        Content-Type: application/json\r\n\
                                        Content-Length: {}\r\n\
                                        \r\n\
                                        {}",
                                        success_body.len(),
                                        success_body
                                    );
                                    let _ = stream.write_all(response.as_bytes());
                                    break;
                                } else {
                                    // Invalid nonce - potential attack
                                    send_error_response(&mut stream, 403, "Invalid nonce");
                                }
                            } else {
                                send_error_response(&mut stream, 400, "Missing required fields");
                            }
                        } else {
                            send_error_response(&mut stream, 400, "Invalid JSON body");
                        }
                    }
                }
            }
        }
    });

    Ok((port, nonce))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![start_oauth_server]);

    #[cfg(desktop)]
    let builder = builder
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init());

    builder
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
