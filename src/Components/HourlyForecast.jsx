import "../Styling/HourlyForecast.css";

export default function HourlyForecast({
  hourlyForecast,
  selectedDay,
  tempUnit,
  formatTemperature,
  formatTimeFromUnix,
}) {
  // Use selected day's entries if available, otherwise fall back to default hourly forecast
  const displayForecast =
    selectedDay?.entries && selectedDay.entries.length > 0
      ? selectedDay.entries
      : hourlyForecast;

  return (
    <section className="sectionCard">
      <div className="sectionTitle">Hourly Forecast</div>

      <div className="hourlyRow">
        {displayForecast.map((item) => (
          <div className="hourCard" key={item.dt}>
            {/* Format time from Unix timestamp */}
            <div className="hourTime">{formatTimeFromUnix(item.dt)}</div>

            <img
              className="hourIcon"
              src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
              alt={item.weather[0].description}
            />

            {/* Format temperature based on selected unit */}
            <div className="hourTemp">
              {formatTemperature(item.main.temp, tempUnit)}
            </div>

            {/* Convert rain probability to percentage */}
            <div className="hourMeta">
              Rain {Math.round((item.pop || 0) * 100)}%
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}