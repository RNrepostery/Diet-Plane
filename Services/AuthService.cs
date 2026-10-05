using System;
using System.IO;
using System.Text.Json;
using Microsoft.Maui.Storage;

namespace Diet.Services
{
    public class AdminCredentialConfig
    {
        public string Username { get; set; } = "Ashish";
        public string Password { get; set; } = "Ashish@2026";
        public string DisplayName { get; set; } = "Ashish (Admin / Registered Dietitian)";
        public bool IsSessionActive { get; set; } = false;
        public DateTime? LastLoginTime { get; set; }
    }

    public class AuthService
    {
        private readonly string _authFilePath;
        private AdminCredentialConfig _config = new();

        public bool IsAuthenticated => _config.IsSessionActive;
        public string CurrentUsername => _config.Username;
        public string CurrentDisplayName => _config.DisplayName;

        public event Action? OnAuthStateChanged;

        public AuthService()
        {
            _authFilePath = Path.Combine(FileSystem.AppDataDirectory, "diet_admin_session.json");
            LoadSession();
        }

        private void LoadSession()
        {
            try
            {
                if (File.Exists(_authFilePath))
                {
                    string json = File.ReadAllText(_authFilePath);
                    var loaded = JsonSerializer.Deserialize<AdminCredentialConfig>(json);
                    if (loaded != null)
                    {
                        _config = loaded;
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to load auth session: {ex.Message}");
            }
        }

        private void SaveSession()
        {
            try
            {
                string json = JsonSerializer.Serialize(_config, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(_authFilePath, json);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to save auth session: {ex.Message}");
            }
        }

        public bool Login(string username, string password, out string errorMessage)
        {
            errorMessage = string.Empty;

            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                errorMessage = "Username and password are required.";
                return false;
            }

            // Verify credentials (supporting default 'Ashish' / 'Ashish@2026' or configured credentials)
            bool matchesCurrent = username.Trim().Equals(_config.Username, StringComparison.OrdinalIgnoreCase) && password == _config.Password;
            bool matchesDefault = username.Trim().Equals("Ashish", StringComparison.OrdinalIgnoreCase) && password == "Ashish@2026";

            if (matchesCurrent || matchesDefault)
            {
                _config.IsSessionActive = true;
                _config.LastLoginTime = DateTime.Now;
                SaveSession();
                OnAuthStateChanged?.Invoke();
                return true;
            }

            errorMessage = "Invalid credentials. Use administrator username 'Ashish' and password 'Ashish@2026'";
            return false;
        }

        public void Logout()
        {
            _config.IsSessionActive = false;
            SaveSession();
            OnAuthStateChanged?.Invoke();
        }

        public void UpdateCredentials(string newUsername, string newPassword, string displayName)
        {
            _config.Username = newUsername;
            _config.Password = newPassword;
            _config.DisplayName = displayName;
            SaveSession();
            OnAuthStateChanged?.Invoke();
        }
    }
}
