import "../Styling/SettingsPanel.css";

export default function SettingsPanel({
  settingsOpen,
  setSettingsOpen,
  theme,
  setTheme,
  tempUnit,
  setTempUnit,
}) {
  return (
    <>
      {/* Show settings button only when panel is closed */}
      {!settingsOpen && (
        <button
          className="settingsToggle"
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
        >
          ⚙
        </button>
      )}

      {/* Side panel for settings */}
      <aside className={`settingsPanel ${settingsOpen ? "settingsPanelOpen" : ""}`}>
        <div className="settingsHeader">
          <h2>Settings</h2>

          {/* Close panel */}
          <button
            className="settingsClose"
            onClick={() => setSettingsOpen(false)}
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        <div className="settingsBlock">
          <div className="settingsLabel">Display Mode</div>

          {/* Toggle between normal and high contrast theme */}
          <button
            className="miniButton"
            onClick={() =>
              setTheme(theme === "normal" ? "contrast" : "normal")
            }
          >
            Switch to {theme === "normal" ? "High Contrast" : "Normal"} Mode
          </button>
        </div>

        <div className="settingsBlock">
          <div className="settingsLabel">Temperature Unit</div>

          <div className="settingsRow">
            {/* Set temperature to Celsius */}
            <button
              className={`miniButton ${tempUnit === "C" ? "activeSetting" : ""}`}
              onClick={() => setTempUnit("C")}
            >
              Celsius °C
            </button>

            {/* Set temperature to Fahrenheit */}
            <button
              className={`miniButton ${tempUnit === "F" ? "activeSetting" : ""}`}
              onClick={() => setTempUnit("F")}
            >
              Fahrenheit °F
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay closes panel when clicking outside */}
      {settingsOpen && (
        <div
          className="settingsOverlay"
          onClick={() => setSettingsOpen(false)}
        />
      )}
    </>
  );
}