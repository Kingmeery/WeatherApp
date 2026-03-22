export default function WeeklyForecast({
  weeklyForecast,
  tempUnit,
  formatTemperature,
  formatDayFromUnix,
}) {
  return (
    <section className="sectionCard">
      <div className="sectionTitle">Weekly Forecast</div>

      <div className="weekGrid">
        {weeklyForecast.map((day) => (
          <div className="dayCard" key={day.dt}>
            <div className="dayName">{formatDayFromUnix(day.dt)}</div>

            <img
              className="dayIcon"
              src={`https://openweathermap.org/img/wn/${day.icon}.png`}
              alt={day.description}
            />

            <div className="dayDesc">{day.description}</div>

            <div className="dayTemps">
              <span>{formatTemperature(day.max, tempUnit)}</span>
              <span className="mutedTemp">
                {formatTemperature(day.min, tempUnit)}
              </span>
            </div>

            <div className="dayRain">Rain {day.pop}%</div>
          </div>
        ))}
      </div>
    </section>
  );
}