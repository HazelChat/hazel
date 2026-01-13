use std::io::{Read, Write};
use std::net::TcpListener;
use std::thread;
use tauri::{command, AppHandle, Emitter};

// Fixed port for OAuth callback in dev mode
// Must be registered in WorkOS as a valid redirect URI
const OAUTH_PORT: u16 = 17927;

/// Extract the Full-Url header value from an HTTP request
fn extract_full_url_header(request: &str) -> Option<String> {
    for line in request.lines() {
        let lower = line.to_lowercase();
        if lower.starts_with("full-url:") {
            return Some(line[9..].trim().to_string());
        }
    }
    None
}

#[command]
fn start_oauth_server(app: AppHandle) -> Result<u16, String> {
    // Start server on fixed port (must be pre-registered with WorkOS)
    let listener = TcpListener::bind(format!("127.0.0.1:{}", OAUTH_PORT))
        .map_err(|e| format!("Failed to bind port {}: {}", OAUTH_PORT, e))?;

    // Set a timeout so we don't block forever
    listener
        .set_nonblocking(false)
        .map_err(|e| format!("Failed to set blocking mode: {}", e))?;

    let app_handle = app.clone();

    // Spawn thread to handle OAuth callback (two-phase approach)
    // Phase 1: OAuth redirect arrives, we send HTML with JS
    // Phase 2: JS fetches /cb with Full-Url header containing the complete URL
    thread::spawn(move || {
        // Handle up to 2 requests (initial redirect + /cb fetch)
        for _ in 0..2 {
            if let Ok((mut stream, _)) = listener.accept() {
                let mut buffer = [0u8; 4096];
                if let Ok(n) = stream.read(&mut buffer) {
                    let request = String::from_utf8_lossy(&buffer[..n]);

                    // Check if this is the /cb request with Full-Url header
                    if request.starts_with("GET /cb") || request.starts_with("POST /cb") {
                        if let Some(url) = extract_full_url_header(&request) {
                            // Emit to frontend with the complete URL from browser
                            let _ = app_handle.emit("oauth-callback", url);

                            // Send simple success response
                            let response = "HTTP/1.1 200 OK\r\nContent-Length: 0\r\nAccess-Control-Allow-Origin: *\r\n\r\n";
                            let _ = stream.write_all(response.as_bytes());
                            break;
                        }
                    }

                    // Initial OAuth redirect - send HTML with JS to capture full URL
                    // The JS will fetch /cb with window.location.href in a header
                    let html = format!(
                        r#"<!DOCTYPE html>
<html>
<head>
    <title>Authentication Successful</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: #f5f5f5;
        }}
        .container {{
            text-align: center;
            padding: 2rem;
        }}
        h1 {{ color: #333; margin-bottom: 0.5rem; }}
        p {{ color: #666; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Authentication Successful</h1>
        <p>You can close this tab and return to Hazel.</p>
    </div>
    <script>
        fetch("http://127.0.0.1:{}/cb", {{
            method: "POST",
            headers: {{ "Full-Url": window.location.href }}
        }});
    </script>
</body>
</html>"#,
                        OAUTH_PORT
                    );

                    let response = format!(
                        "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\n\r\n{}",
                        html.len(),
                        html
                    );
                    let _ = stream.write_all(response.as_bytes());
                }
            }
        }
    });

    Ok(OAUTH_PORT)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
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
