export default function GardenAdvice({
  currentWeather,
  rainfallChance,
  getFrostRisk,
}) {
  const temperature = currentWeather?.main?.temp;
  const humidity = currentWeather?.main?.humidity;

  const windSpeedMph = currentWeather?.wind?.speed
    ? Math.round(currentWeather.wind.speed * 2.237)
    : 0;

  const frostRisk = getFrostRisk(temperature);

  const advice = [];

  if (typeof temperature === "number") {
    if (rainfallChance <= 20) {
      advice.push("💧 Low rainfall — irrigation is recommended.");
    } else {
      advice.push("💧 Rainfall expected — irrigation may not be necessary.");
    }

    if (rainfallChance < 50 && windSpeedMph < 15) {
      advice.push("🌱 Conditions are stable — suitable for fertiliser application.");
    } else {
      advice.push("🌱 Unstable conditions — fertiliser application may be ineffective.");
    }

    if (rainfallChance < 40 && windSpeedMph < 20) {
      advice.push("🚜 Weather conditions are suitable for field work.");
    } else {
      advice.push("🚜 Weather conditions may disrupt field work.");
    }

    if (frostRisk === "HIGH") {
      advice.push("❄ High frost risk — protective measures are advised.");
    } else if (frostRisk === "LOW") {
      advice.push("❄ Possible frost — monitor overnight conditions.");
    } else {
      advice.push("❄ No significant frost risk expected.");
    }

    if (temperature >= 25) {
      advice.push("🌡 High temperatures — monitor crops for heat stress.");
    } else {
      advice.push("🌡 Temperature conditions are within a safe range.");
    }

    if (humidity >= 85) {
      advice.push("💨 High humidity — increased risk of crop disease.");
    } else if (humidity <= 40) {
      advice.push("💨 Low humidity — soil may dry out quickly.");
    } else {
      advice.push("💨 Humidity levels are within a normal range.");
    }
  }

  return (
    <section className="sectionCard">
      <div className="sectionTitle">Garden Advice</div>

      <div className="adviceList">
        {advice.map((item, index) => (
          <div className="adviceCard" key={index}>
            <span className="adviceText">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}