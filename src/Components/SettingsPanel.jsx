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
      {!settingsOpen && (
        <button
          className="settingsToggle"
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
        >
          ⚙
        </button>
      )}

      <aside className={`settingsPanel ${settingsOpen ? "settingsPanelOpen" : ""}`}>
        <div className="settingsHeader">
          <h2>Settings</h2>
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
            <button
              className={`miniButton ${tempUnit === "C" ? "activeSetting" : ""}`}
              onClick={() => setTempUnit("C")}
            >
              Celsius °C
            </button>

            <button
              className={`miniButton ${tempUnit === "F" ? "activeSetting" : ""}`}
              onClick={() => setTempUnit("F")}
            >
              Fahrenheit °F
            </button>
          </div>
        </div>
      </aside>

      {settingsOpen && (
        <div
          className="settingsOverlay"
          onClick={() => setSettingsOpen(false)}
        />
      )}
    </>
  );
}