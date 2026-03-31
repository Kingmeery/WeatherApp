export default function WeatherStats({
  currentWeather,
  selectedDay,
  tempUnit,
  formatTemperature,
  rainfallChance,
  getFrostRisk,
}) {
  const temperature =
    selectedDay?.label === "Today"
      ? currentWeather.main.temp
      : selectedDay?.avgTemp ?? currentWeather.main.temp;

  const rainValue =
    selectedDay?.label === "Today"
      ? rainfallChance
      : selectedDay?.maxRainChance ?? rainfallChance;

  const windValue =
    selectedDay?.label === "Today"
      ? Math.round(currentWeather.wind.speed * 2.237)
      : selectedDay?.maxWind ?? Math.round(currentWeather.wind.speed * 2.237);

  const humidityValue =
    selectedDay?.label === "Today"
      ? currentWeather.main.humidity
      : selectedDay?.avgHumidity ?? currentWeather.main.humidity;

  const pressureValue =
    selectedDay?.label === "Today"
      ? currentWeather.main.pressure
      : Math.round(
          selectedDay?.entries?.reduce(
            (sum, entry) => sum + entry.main.pressure,
            0
          ) / (selectedDay?.entries?.length || 1)
        ) || currentWeather.main.pressure;

  const frostValue =
    selectedDay?.label === "Today"
      ? getFrostRisk(currentWeather.main.temp)
      : selectedDay?.frostRisk ?? getFrostRisk(currentWeather.main.temp);

  return (
    <section className="sectionCard">
      <div className="sectionTitle">Detailed Weather</div>

      <div className="statsGrid">
        <div className="statCard">
          <div className="statLabel">Temperature</div>
          <div className="statValue">
            {formatTemperature(temperature, tempUnit)}
          </div>
        </div>

        <div className="statCard">
          <div className="statLabel">Rainfall Chance</div>
          <div className="statValue">{rainValue}%</div>
        </div>

        <div className="statCard">
          <div className="statLabel">Wind</div>
          <div className="statValue">{windValue} mph</div>
        </div>

        <div className="statCard">
          <div className="statLabel">Humidity</div>
          <div className="statValue">{humidityValue}%</div>
        </div>

        <div className="statCard">
          <div className="statLabel">Pressure</div>
          <div className="statValue">{pressureValue} hPa</div>
        </div>

        <div className="statCard">
          <div className="statLabel">Frost Risk</div>
          <div className="statValue">{frostValue}</div>
        </div>
      </div>
    </section>
  );
}