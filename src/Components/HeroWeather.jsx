import "../Styling/HeroWeather.css";

export default function HeroWeather({
  currentWeather,
  tempUnit,
  formatTemperature,
  formatFullDate,
}) {
  return (
    <section className="sectionCard heroCard">
      <div className="heroTop">
        <div className="condition">
          <img
            className="weatherIconMain"
            src={`https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`}
            alt={currentWeather.weather[0].description}
          />

          <div className="condText">
            <div className="condTitle">
              {currentWeather.weather?.[0]?.main}
            </div>

            <div className="condSub">
              {currentWeather.weather?.[0]?.description}
            </div>
          </div>
        </div>
      </div>

      <div className="tempCenterBlock">
        {/* Display location name */}
        <div className="heroLocation">{currentWeather.name}</div>

        {/* Format temperature based on selected unit */}
        <div className="temp">
          {formatTemperature(currentWeather.main.temp, tempUnit)}
        </div>

        {/* Show "feels like" temperature */}
        <div className="feels">
          Feels like {formatTemperature(currentWeather.main.feels_like, tempUnit)}
        </div>
      </div>

      {/* Format and display full date */}
      <div className="dateLine">{formatFullDate(currentWeather.dt)}</div>
    </section>
  );
}