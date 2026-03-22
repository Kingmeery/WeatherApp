export default function HourlyForecast({
  hourlyForecast,
  tempUnit,
  formatTemperature,
  formatTimeFromUnix,
}) {
  return (
    <section className="sectionCard">
      <div className="sectionTitle">Hourly Forecast</div>

      <div className="hourlyRow">
        {hourlyForecast.map((item) => (
          <div className="hourCard" key={item.dt}>
            <div className="hourTime">{formatTimeFromUnix(item.dt)}</div>

            <img
              className="hourIcon"
              src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
              alt={item.weather[0].description}
            />

            <div className="hourTemp">
              {formatTemperature(item.main.temp, tempUnit)}
            </div>

            <div className="hourMeta">
              Rain {Math.round((item.pop || 0) * 100)}%
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}