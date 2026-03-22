export default function WeatherStats({
  currentWeather,
  tempUnit,
  formatTemperature,
  rainfallChance,
  getFrostRisk,
}) {
  return (
    <section className="sectionCard">
      <div className="sectionTitle">Detailed Weather</div>

      <div className="statsGrid">
        <div className="statCard">
          <div className="statLabel">Temperature</div>
          <div className="statValue">
            {formatTemperature(currentWeather.main.temp, tempUnit)}
          </div>
        </div>

        <div className="statCard">
          <div className="statLabel">Rainfall Chance</div>
          <div className="statValue">{rainfallChance}%</div>
        </div>

        <div className="statCard">
          <div className="statLabel">Wind</div>
          <div className="statValue">
            {Math.round(currentWeather.wind.speed * 2.237)} mph
          </div>
        </div>

        <div className="statCard">
          <div className="statLabel">Humidity</div>
          <div className="statValue">{currentWeather.main.humidity}%</div>
        </div>

        <div className="statCard">
          <div className="statLabel">Pressure</div>
          <div className="statValue">{currentWeather.main.pressure} hPa</div>
        </div>

        <div className="statCard">
          <div className="statLabel">Frost Risk</div>
          <div className="statValue">
            {getFrostRisk(currentWeather.main.temp)}
          </div>
        </div>
      </div>
    </section>
  );
}