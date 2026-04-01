import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

/*
  Import UI components
*/
import SettingsPanel from "./Components/SettingsPanel";
import LocationManager from "./Components/LocationManager";
import HeroWeather from "./Components/HeroWeather";
import Alerts from "./Components/Alerts";
import WeatherStats from "./Components/WeatherStats";
import HourlyForecast from "./Components/HourlyForecast";
import WeeklyForecast from "./Components/WeeklyForecast";
import GardenAdvice from "./Components/GardenAdvice";
import Map from "./Components/Map";

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

  // Stores the user's search input
  const [query, setQuery] = useState("");

  // Stores the current active location
  const [activeLocation, setActiveLocation] = useState(
    localStorage.getItem("defaultLocation") || "Luton"
  );

  // Stores the user's saved locations
  const [savedLocations, setSavedLocations] = useState(() => {
    const stored = localStorage.getItem("savedLocations");
    return stored ? JSON.parse(stored) : ["Luton"];
  });

  // Stores current weather data and forecast data
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecastList, setForecastList] = useState([]);

  // Stores loading and error states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Controls settings panel and map modal visibility
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  // Stores user display preferences
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "normal"
  );

  const [tempUnit, setTempUnit] = useState(
    localStorage.getItem("tempUnit") || "C"
  );

  // Tracks which day is selected in the advice section
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  /*
    SAVE SETTINGS TO LOCAL STORAGE
  */

  // Save updated locations list
  useEffect(() => {
    localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
  }, [savedLocations]);

  // Save current default location
  useEffect(() => {
    localStorage.setItem("defaultLocation", activeLocation);
  }, [activeLocation]);

  // Save selected theme
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Save selected temperature unit
  useEffect(() => {
    localStorage.setItem("tempUnit", tempUnit);
  }, [tempUnit]);

  /*
    FETCH WEATHER WHEN LOCATION CHANGES
  */

  // Reload weather whenever the active location changes
  useEffect(() => {
    fetchWeatherByCity(activeLocation);
  }, [activeLocation]);

  /*
    FETCH WEATHER BY CITY NAME
  */

  // Fetch current weather and forecast for a searched city
  async function fetchWeatherByCity(city) {
    if (!city.trim()) return;

    try {
      setLoading(true);
      setError("");

      const currentResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )}&units=metric&appid=${API_KEY}`
      );

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
          city
        )}&units=metric&appid=${API_KEY}`
      );

      setCurrentWeather(currentResponse.data);
      setForecastList(forecastResponse.data.list || []);

      // Reset selected day when new forecast data is loaded
      setSelectedDayIndex(0);
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

  // Fetch weather using coordinates chosen from GPS or map
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
      setSelectedDayIndex(0);

      /*
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

  // Submit a typed location search
  function handleSearchSubmit(e) {
    e.preventDefault();

    if (!query.trim()) return;

    setActiveLocation(query.trim());
    setQuery("");
  }

  /*
    SAVE CURRENT LOCATION
  */

  // Add the current location to the saved list
  function handleAddSavedLocation() {
    const trimmed = activeLocation.trim();

    if (!trimmed) return;
    if (savedLocations.includes(trimmed)) return;

    setSavedLocations([...savedLocations, trimmed]);
  }

  /*
    DELETE SAVED LOCATION
  */

  // Remove a location from the saved list
  function handleDeleteLocation(location) {
    const updated = savedLocations.filter((item) => item !== location);

    setSavedLocations(updated);

    // Switch to another saved location if the active one is deleted
    if (location === activeLocation && updated.length > 0) {
      setActiveLocation(updated[0]);
    }
  }

  /*
    USE GPS LOCATION
  */

  // Use the browser's geolocation to fetch local weather
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

  // First 8 forecast entries for the hourly section
  const hourlyForecast = forecastList.slice(0, 8);

  // Group forecast data into daily summaries
  const weeklyForecast = groupDailyForecast(forecastList);

  // Build alert messages from current and forecast conditions
  const alerts = buildAlerts(currentWeather, forecastList);

  // Use rain probability if available, otherwise fall back to cloud cover
  const rainfallChance =
    typeof forecastList[0]?.pop === "number"
      ? Math.round(forecastList[0].pop * 100)
      : currentWeather?.clouds?.all ?? 0;

  // Group forecast entries by date for advice calculations
  const groupedDays = forecastList.length
    ? Object.entries(
        forecastList.reduce((acc, item) => {
          const dateKey = item.dt_txt.split(" ")[0];

          if (!acc[dateKey]) {
            acc[dateKey] = [];
          }

          acc[dateKey].push(item);
          return acc;
        }, {})
      )
        .slice(0, 5)
        .map(([date, entries], index) => {
          const temps = entries.map((entry) => entry.main.temp);
          const humidities = entries.map((entry) => entry.main.humidity);

          // Convert wind speed from m/s to mph
          const winds = entries.map((entry) => entry.wind.speed * 2.237);

          const rainChances = entries.map((entry) =>
            typeof entry.pop === "number" ? Math.round(entry.pop * 100) : 0
          );

          const avgTemp =
            temps.reduce((sum, value) => sum + value, 0) / temps.length;
          const minTemp = Math.min(...temps);
          const maxTemp = Math.max(...temps);
          const avgHumidity =
            humidities.reduce((sum, value) => sum + value, 0) /
            humidities.length;
          const maxWind = Math.max(...winds);
          const maxRainChance = Math.max(...rainChances);

          // Label first day as Today, then use weekday names
          const label =
            index === 0
              ? "Today"
              : new Date(date).toLocaleDateString("en-GB", {
                  weekday: "short",
                });

          const fullLabel =
            index === 0
              ? "Today"
              : new Date(date).toLocaleDateString("en-GB", {
                  weekday: "long",
                });

          return {
            date,
            label,
            fullLabel,
            entries,
            avgTemp,
            minTemp,
            maxTemp,
            avgHumidity: Math.round(avgHumidity),
            maxWind: Math.round(maxWind),
            maxRainChance,
            frostRisk: getFrostRisk(minTemp),
          };
        })
    : [];

  // Select the day currently being used for farm advice
  const selectedDay = (() => {
    const forecastDay = groupedDays[selectedDayIndex];

    if (forecastDay) {
      // Use live current weather for today instead of forecast averages
      if (selectedDayIndex === 0 && currentWeather) {
        return {
          ...forecastDay,
          avgTemp: currentWeather.main.temp,
          minTemp: currentWeather.main.temp,
          maxTemp: currentWeather.main.temp,
          avgHumidity: currentWeather.main.humidity,
          maxWind: Math.round(currentWeather.wind.speed * 2.237),
          maxRainChance:
            typeof forecastList[0]?.pop === "number"
              ? Math.round(forecastList[0].pop * 100)
              : currentWeather?.clouds?.all ?? 0,
          frostRisk: getFrostRisk(currentWeather.main.temp),
        };
      }

      return forecastDay;
    }

    // Fallback if no grouped forecast exists yet
    if (currentWeather) {
      return {
        date: new Date().toISOString().split("T")[0],
        label: "Today",
        fullLabel: "Today",
        avgTemp: currentWeather.main.temp,
        minTemp: currentWeather.main.temp,
        maxTemp: currentWeather.main.temp,
        avgHumidity: currentWeather.main.humidity,
        maxWind: Math.round(currentWeather.wind.speed * 2.237),
        maxRainChance:
          typeof forecastList[0]?.pop === "number"
            ? Math.round(forecastList[0].pop * 100)
            : currentWeather?.clouds?.all ?? 0,
        frostRisk: getFrostRisk(currentWeather.main.temp),
        entries: [],
      };
    }

    return null;
  })();

  /*
    RENDER UI
  */

  return (
    <div
      className={`app ${theme === "contrast" ? "themeContrast" : "themeNormal"}`}
    >
      <SettingsPanel
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        theme={theme}
        setTheme={setTheme}
        tempUnit={tempUnit}
        setTempUnit={setTempUnit}
      />

      <button
        type="button"
        className="mapToggleBtn"
        onClick={() => setMapOpen(true)}
        aria-label="Open Map"
      >
        View Map
      </button>

      <main className="page">
        <header className="pageHeader">
          <div className="brand">
            <span>Agriculture</span>
          </div>

          <p className="brandSubtitle">
            Weather planning for farms and field work
          </p>
        </header>

      <LocationManager
        query={query}
        setQuery={setQuery}
        handleSearchSubmit={handleSearchSubmit}
        handleUseMyLocation={handleUseMyLocation}
        handleAddSavedLocation={handleAddSavedLocation}
        activeLocation={activeLocation}
        savedLocations={savedLocations}
        setActiveLocation={setActiveLocation}
        handleDeleteLocation={handleDeleteLocation}
      />

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

            <GardenAdvice
              selectedDay={selectedDay}
              groupedDays={groupedDays}
              selectedDayIndex={selectedDayIndex}
              setSelectedDayIndex={setSelectedDayIndex}
            />

            <WeatherStats
              currentWeather={currentWeather}
              selectedDay={selectedDay}
              tempUnit={tempUnit}
              formatTemperature={formatTemperature}
              rainfallChance={rainfallChance}
              getFrostRisk={getFrostRisk}
            />

            <HourlyForecast
              hourlyForecast={hourlyForecast}
              selectedDay={selectedDay}
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

      {/* render of the Map modal when mapOpen is true */}
      {mapOpen && (
        <Map
          lat={currentWeather?.coord?.lat}
          lon={currentWeather?.coord?.lon}
          onLocationSelect={(lat, lon) => {
            fetchWeatherByCoords(lat, lon);
            setMapOpen(false);
          }}
          onClose={() => setMapOpen(false)}
        />
      )}
    </div>
  );
}