import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

/*
  Import UI components
*/
import SettingsPanel from "./Components/SettingsPanel";
import HeroWeather from "./Components/HeroWeather";
import Alerts from "./Components/Alerts";
import WeatherStats from "./Components/WeatherStats";
import HourlyForecast from "./Components/HourlyForecast";
import WeeklyForecast from "./Components/WeeklyForecast";

/*
  Import helper functions
*/
import {
  formatTimeFromUnix,
  formatDayFromUnix,
  formatFullDate,
  getFrostRisk,
  buildAlerts,
  groupDailyForecast,
  formatTemperature,
} from "./Utils/WeatherHelpers";

/*
  OpenWeather API key
*/
const API_KEY = "a70466e267c72a34d9ad25b97612f3e6";

/*
  MAIN WEATHER COMPONENT
*/
export default function Weather() {

  /*
    STATE VARIABLES
  */

  const [query, setQuery] = useState("");

  const [activeLocation, setActiveLocation] = useState(
    localStorage.getItem("defaultLocation") || "Luton"
  );

  const [savedLocations, setSavedLocations] = useState(() => {
    const stored = localStorage.getItem("savedLocations");
    return stored ? JSON.parse(stored) : ["Luton"];
  });

  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecastList, setForecastList] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "normal"
  );

  const [tempUnit, setTempUnit] = useState(
    localStorage.getItem("tempUnit") || "C"
  );

  /*
    SAVE SETTINGS TO LOCAL STORAGE
  */

  useEffect(() => {
    localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
  }, [savedLocations]);

  useEffect(() => {
    localStorage.setItem("defaultLocation", activeLocation);
  }, [activeLocation]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("tempUnit", tempUnit);
  }, [tempUnit]);

  /*
    FETCH WEATHER WHEN LOCATION CHANGES
  */

  useEffect(() => {
    fetchWeatherByCity(activeLocation);
  }, [activeLocation]);

  /*
    FETCH WEATHER BY CITY NAME
  */

  async function fetchWeatherByCity(city) {

    if (!city.trim()) return;

    try {

      setLoading(true);
      setError("");

      const currentResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
      );

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
      );

      setCurrentWeather(currentResponse.data);
      setForecastList(forecastResponse.data.list || []);

    } catch (err) {

      setError("Could not fetch weather for that location.");
      setCurrentWeather(null);
      setForecastList([]);

    } finally {

      setLoading(false);

    }
  }

  /*
    FETCH WEATHER USING LATITUDE + LONGITUDE
  */

  async function fetchWeatherByCoords(lat, lon) {

    try {

      setLoading(true);
      setError("");

      const currentResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );

      setCurrentWeather(currentResponse.data);
      setForecastList(forecastResponse.data.list || []);

      /*
        IMPORTANT:
        Use the place name returned by the API
      */
      setActiveLocation(currentResponse.data.name);

    } catch (err) {

      setError("Could not fetch GPS-based weather.");

    } finally {

      setLoading(false);

    }
  }

  /*
    SEARCH HANDLER
  */

  function handleSearchSubmit(e) {

    e.preventDefault();

    if (!query.trim()) return;

    setActiveLocation(query.trim());
    setQuery("");

  }

  /*
    SAVE CURRENT LOCATION
  */

  function handleAddSavedLocation() {

    const trimmed = activeLocation.trim();

    if (!trimmed) return;

    if (savedLocations.includes(trimmed)) return;

    setSavedLocations([...savedLocations, trimmed]);

  }

  /*
    DELETE SAVED LOCATION
  */

  function handleDeleteLocation(location) {

    const updated = savedLocations.filter(
      (item) => item !== location
    );

    setSavedLocations(updated);

    if (location === activeLocation && updated.length > 0) {
      setActiveLocation(updated[0]);
    }

  }

  /*
    USE GPS LOCATION

    This restores your ORIGINAL working behaviour.
  */

  function handleUseMyLocation() {

    if (!navigator.geolocation) {

      setError("Geolocation is not supported on this device.");
      return;

    }

    navigator.geolocation.getCurrentPosition(

      (position) => {

        fetchWeatherByCoords(
          position.coords.latitude,
          position.coords.longitude
        );

      },

      () => {

        setError("Location access was denied.");

      }

    );
  }

  /*
    SIMPLE DERIVED DATA
  */

  const hourlyForecast = forecastList.slice(0, 8);

  const weeklyForecast = groupDailyForecast(forecastList);

  const alerts = buildAlerts(currentWeather, forecastList);

  const rainfallChance =
    typeof forecastList[0]?.pop === "number"
      ? Math.round(forecastList[0].pop * 100)
      : currentWeather?.clouds?.all ?? 0;

  /*
    RENDER UI
  */

  return (

    <div className={`app ${theme === "contrast" ? "themeContrast" : "themeNormal"}`}>

      <SettingsPanel
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        theme={theme}
        setTheme={setTheme}
        tempUnit={tempUnit}
        setTempUnit={setTempUnit}
      />

      <main className="page">

        <header className="pageHeader">

          <div className="brand">
            <span className="brandDot" />
            <span>Agriculture</span>
          </div>

          <p className="brandSubtitle">
            Weather planning for farms and field work
          </p>

        </header>

        <section className="sectionCard searchCard">

          <form className="searchRow" onSubmit={handleSearchSubmit}>

            <input
              className="input"
              type="text"
              placeholder="Search location..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <button className="actionButton" type="submit">
              Search
            </button>

            <button
              className="ghostButton"
              type="button"
              onClick={handleUseMyLocation}
            >
              Use GPS
            </button>

          </form>

          <div className="locationActions">

            <button className="miniButton" onClick={handleAddSavedLocation}>
              Save Current Location
            </button>

            <div className="defaultTag">
              Default: {activeLocation}
            </div>

          </div>

          {/* SAVED LOCATIONS */}

          <div className="savedSection">

            <div className="sectionTitle">
              Saved Locations
            </div>

            <div className="savedList">

              {savedLocations.map((location) => (

                <div
                  className={`savedChip ${
                    location === activeLocation ? "savedChipActive" : ""
                  }`}
                  key={location}
                >

                  <button
                    className="savedChipMain"
                    onClick={() => setActiveLocation(location)}
                  >
                    {location}
                  </button>

                  <button
                    className="savedChipDelete"
                    onClick={() => handleDeleteLocation(location)}
                  >
                    ×
                  </button>

                </div>

              ))}

            </div>

          </div>

        </section>

        {loading && <div className="infoBanner">Loading weather data...</div>}

        {error && <div className="errorBanner">{error}</div>}

        {currentWeather && (

          <>

            <HeroWeather
              currentWeather={currentWeather}
              tempUnit={tempUnit}
              formatTemperature={formatTemperature}
              formatFullDate={formatFullDate}
            />

            <Alerts alerts={alerts} />

            <WeatherStats
              currentWeather={currentWeather}
              tempUnit={tempUnit}
              formatTemperature={formatTemperature}
              rainfallChance={rainfallChance}
              getFrostRisk={getFrostRisk}
            />

            <HourlyForecast
              hourlyForecast={hourlyForecast}
              tempUnit={tempUnit}
              formatTemperature={formatTemperature}
              formatTimeFromUnix={formatTimeFromUnix}
            />

            <WeeklyForecast
              weeklyForecast={weeklyForecast}
              tempUnit={tempUnit}
              formatTemperature={formatTemperature}
              formatDayFromUnix={formatDayFromUnix}
            />

          </>

        )}

      </main>

    </div>
  );
}