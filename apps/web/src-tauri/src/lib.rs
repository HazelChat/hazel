mod auth;

use tauri::Emitter;
use tauri_plugin_deep_link::DeepLinkExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_keyring::init())
        .plugin(tauri_plugin_opener::init())
        .manage(auth::AuthState::default())
        .invoke_handler(tauri::generate_handler![
            auth::generate_pkce_challenge,
            auth::get_code_verifier,
            auth::clear_code_verifier,
            auth::store_tokens,
            auth::get_tokens,
            auth::clear_tokens,
            auth::has_tokens,
        ])
        .setup(|app| {
            // Register deep link schemes (only on bundled builds, not dev)
            #[cfg(all(desktop, not(debug_assertions)))]
            if let Err(e) = app.deep_link().register_all() {
                log::warn!("Failed to register deep links: {}", e);
            }

            // Listen for deep link events and emit to frontend
            let handle = app.handle().clone();
            app.deep_link().on_open_url(move |event| {
                let urls = event.urls();
                log::info!("Deep link received: {:?}", urls);
                for url in urls {
                    // Emit the URL to the frontend for processing
                    if let Err(e) = handle.emit("deep-link", url.as_str()) {
                        log::error!("Failed to emit deep link event: {}", e);
                    }
                }
            });

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
