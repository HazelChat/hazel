use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use rand::Rng;
use sha2::{Digest, Sha256};
use std::sync::Mutex;
use tauri::{AppHandle, State};
use tauri_plugin_keyring::KeyringExt;

const KEYRING_SERVICE: &str = "com.hazel.app";
const ACCESS_TOKEN_KEY: &str = "access_token";
const REFRESH_TOKEN_KEY: &str = "refresh_token";

/// Stores the PKCE code verifier during auth flow
pub struct AuthState {
    pub code_verifier: Mutex<Option<String>>,
}

impl Default for AuthState {
    fn default() -> Self {
        Self {
            code_verifier: Mutex::new(None),
        }
    }
}

/// Generate a cryptographically random code verifier for PKCE
fn generate_code_verifier() -> String {
    let mut rng = rand::thread_rng();
    let bytes: Vec<u8> = (0..32).map(|_| rng.gen()).collect();
    URL_SAFE_NO_PAD.encode(&bytes)
}

/// Generate code challenge from verifier using SHA256
fn generate_code_challenge(verifier: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(verifier.as_bytes());
    let result = hasher.finalize();
    URL_SAFE_NO_PAD.encode(&result)
}

#[derive(serde::Serialize)]
pub struct PkceChallenge {
    pub code_challenge: String,
    pub code_challenge_method: String,
}

/// Generate PKCE challenge and store verifier for later use
#[tauri::command]
pub fn generate_pkce_challenge(state: State<AuthState>) -> Result<PkceChallenge, String> {
    let verifier = generate_code_verifier();
    let challenge = generate_code_challenge(&verifier);

    // Store verifier for token exchange
    let mut stored_verifier = state
        .code_verifier
        .lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    *stored_verifier = Some(verifier);

    Ok(PkceChallenge {
        code_challenge: challenge,
        code_challenge_method: "S256".to_string(),
    })
}

/// Get the stored code verifier (used during token exchange)
#[tauri::command]
pub fn get_code_verifier(state: State<AuthState>) -> Result<String, String> {
    let verifier = state
        .code_verifier
        .lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;

    verifier
        .clone()
        .ok_or_else(|| "No code verifier stored. Call generate_pkce_challenge first.".to_string())
}

/// Clear the stored code verifier after use
#[tauri::command]
pub fn clear_code_verifier(state: State<AuthState>) -> Result<(), String> {
    let mut verifier = state
        .code_verifier
        .lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    *verifier = None;
    Ok(())
}

/// Store tokens securely in system keychain
#[tauri::command]
pub fn store_tokens(
    app: AppHandle,
    access_token: String,
    refresh_token: Option<String>,
) -> Result<(), String> {
    let keyring = app.keyring();

    keyring
        .set_password(KEYRING_SERVICE, ACCESS_TOKEN_KEY, &access_token)
        .map_err(|e| format!("Failed to store access token: {}", e))?;

    if let Some(refresh) = refresh_token {
        keyring
            .set_password(KEYRING_SERVICE, REFRESH_TOKEN_KEY, &refresh)
            .map_err(|e| format!("Failed to store refresh token: {}", e))?;
    }

    Ok(())
}

#[derive(serde::Serialize)]
pub struct StoredTokens {
    pub access_token: Option<String>,
    pub refresh_token: Option<String>,
}

/// Retrieve tokens from system keychain
#[tauri::command]
pub fn get_tokens(app: AppHandle) -> Result<StoredTokens, String> {
    let keyring = app.keyring();

    let access_token = keyring
        .get_password(KEYRING_SERVICE, ACCESS_TOKEN_KEY)
        .ok()
        .flatten();

    let refresh_token = keyring
        .get_password(KEYRING_SERVICE, REFRESH_TOKEN_KEY)
        .ok()
        .flatten();

    Ok(StoredTokens {
        access_token,
        refresh_token,
    })
}

/// Clear all stored tokens (logout)
#[tauri::command]
pub fn clear_tokens(app: AppHandle) -> Result<(), String> {
    let keyring = app.keyring();

    // Ignore errors if tokens don't exist
    let _ = keyring.delete_password(KEYRING_SERVICE, ACCESS_TOKEN_KEY);
    let _ = keyring.delete_password(KEYRING_SERVICE, REFRESH_TOKEN_KEY);

    Ok(())
}

/// Check if user has stored tokens
#[tauri::command]
pub fn has_tokens(app: AppHandle) -> bool {
    let keyring = app.keyring();
    keyring
        .get_password(KEYRING_SERVICE, ACCESS_TOKEN_KEY)
        .ok()
        .flatten()
        .is_some()
}
