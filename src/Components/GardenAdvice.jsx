import React, { useState } from "react";
import "../Styling/GardenAdvice.css";

export default function GardenAdvice({
  selectedDay,
  groupedDays,
  selectedDayIndex,
  setSelectedDayIndex,
}) {
  // Tracks which action card is currently open in the modal
  const [activeAction, setActiveAction] = useState(null);

  // Don't render advice until a day is available
  if (!selectedDay) return null;

  // Look at the next three days when suggesting the best day
  const nextThreeDays = groupedDays.slice(
    selectedDayIndex,
    selectedDayIndex + 3
  );

  // Convert each hour into a more readable time period
  function getTimePeriod(hour) {
    if (hour < 6) return "00:00-06:00";
    if (hour < 10) return "06:00-10:00";
    if (hour < 12) return "10:00-12:00";
    if (hour < 15) return "12:00-15:00";
    if (hour < 18) return "15:00-18:00";
    if (hour < 21) return "18:00-21:00";
    return "21:00-00:00";
  }

  // Collect unique time periods from valid forecast entries
  function summariseTimePeriods(entries) {
    if (!entries.length) return [];

    const uniquePeriods = [];

    entries.forEach((entry) => {
      const hour = new Date(entry.dt_txt).getHours();
      const period = getTimePeriod(hour);

      if (!uniquePeriods.includes(period)) {
        uniquePeriods.push(period);
      }
    });

    return uniquePeriods;
  }

  // Format time periods into a readable sentence
  function formatPeriodsForText(periods) {
    if (periods.length === 0) return "";

    if (periods.length === 1) {
      return periods[0];
    }

    if (periods.length >= 2) {
      return periods[0];
    }

    return periods[0];
  }

  // Judge overall daily conditions for each farm activity
  function getDayCondition(type, day) {
    if (type === "irrigation") {
      if (day.maxRainChance <= 20) return "good";
      if (day.maxRainChance <= 50) return "mixed";
      return "poor";
    }

    if (type === "fertilising") {
      if (day.maxRainChance < 40 && day.maxWind < 15) return "good";
      return "poor";
    }

    if (type === "fieldwork") {
      if (day.maxRainChance < 50 && day.maxWind < 20) return "good";
      return "mixed";
    }

    if (type === "spraying") {
      if (day.maxRainChance < 20 && day.maxWind < 10) return "good";
      return "poor";
    }

    if (type === "planting") {
      if (day.frostRisk === "HIGH") return "poor";
      if (
        day.maxRainChance < 40 &&
        day.maxWind < 15 &&
        day.avgTemp >= 7 &&
        day.avgTemp <= 22
      ) {
        return "good";
      }
      return "mixed";
    }

    if (type === "harvesting") {
      if (day.maxRainChance < 20 && day.maxWind < 15) return "good";
      if (day.maxRainChance < 40 && day.maxWind < 20) return "mixed";
      return "poor";
    }

    return "mixed";
  }

  // Filter forecast entries that are suitable for each action
  function getValidEntries(type, day) {
    if (!day?.entries?.length) return [];

    if (type === "irrigation") {
      return day.entries.filter((entry) => {
        const rainChance =
          typeof entry.pop === "number" ? Math.round(entry.pop * 100) : 0;
        return rainChance <= 20 && entry.main.temp <= 18;
      });
    }

    if (type === "fertilising") {
      return day.entries.filter((entry) => {
        const rainChance =
          typeof entry.pop === "number" ? Math.round(entry.pop * 100) : 0;
        const windMph = entry.wind.speed * 2.237;
        return rainChance < 40 && windMph < 15;
      });
    }

    if (type === "fieldwork") {
      return day.entries.filter((entry) => {
        const rainChance =
          typeof entry.pop === "number" ? Math.round(entry.pop * 100) : 0;
        const windMph = entry.wind.speed * 2.237;
        return rainChance < 50 && windMph < 20;
      });
    }

    if (type === "spraying") {
      return day.entries.filter((entry) => {
        const rainChance =
          typeof entry.pop === "number" ? Math.round(entry.pop * 100) : 0;
        const windMph = entry.wind.speed * 2.237;
        return rainChance < 20 && windMph < 10;
      });
    }

    if (type === "planting") {
      return day.entries.filter((entry) => {
        const rainChance =
          typeof entry.pop === "number" ? Math.round(entry.pop * 100) : 0;
        const windMph = entry.wind.speed * 2.237;
        return (
          rainChance < 40 &&
          windMph < 15 &&
          entry.main.temp >= 7 &&
          entry.main.temp <= 22
        );
      });
    }

    if (type === "harvesting") {
      return day.entries.filter((entry) => {
        const rainChance =
          typeof entry.pop === "number" ? Math.round(entry.pop * 100) : 0;
        const windMph = entry.wind.speed * 2.237;
        return rainChance < 20 && windMph < 15;
      });
    }

    return [];
  }

  // Build the message shown for the best time window on the selected day
  function buildOptimalTimeText(type, day) {
    if (!day?.entries?.length) {
      return "Optimal time: no time range is available.";
    }

    const validEntries = getValidEntries(type, day);
    const coverage = validEntries.length / day.entries.length;
    const condition = getDayCondition(type, day);

    if (condition === "good") {
      if (coverage === 0) {
        return "Optimal time: suitable throughout the day.";
      }

      if (coverage > 0.7) {
        return "Optimal time: suitable throughout the day.";
      }

      const periods = summariseTimePeriods(validEntries);
      const periodText = formatPeriodsForText(periods);

      if (!periodText) {
        return "Optimal time: suitable throughout the day.";
      }

      return `Optimal time: ${periodText}.`;
    }

    if (condition === "mixed") {
      if (coverage === 0) {
        return "Optimal time: no clearly suitable time range stands out today.";
      }

      const periods = summariseTimePeriods(validEntries);
      const periodText = formatPeriodsForText(periods);

      if (!periodText) {
        return "Optimal time: only limited time ranges look suitable today.";
      }

      return `Optimal time: ${periodText}.`;
    }

    if (type === "spraying") {
      return "Optimal time: wait for a calmer and drier day.";
    }

    if (type === "fertilising") {
      return "Optimal time: wait for drier and less windy conditions.";
    }

    return "Optimal time: conditions are not favourable today.";
  }

  // Compare the next few days and recommend the strongest option
  function getBestDay(type) {
    if (!nextThreeDays.length) {
      return "Optimal day: no clear recommendation is available.";
    }

    const scoredDays = nextThreeDays.map((day) => {
      let score = 0;

      if (type === "irrigation") {
        score += 100 - day.maxRainChance;
        score += 20 - Math.abs(day.avgTemp - 15);
      }

      if (type === "fertilising") {
        score += 100 - day.maxRainChance;
        score += 20 - day.maxWind;
      }

      if (type === "fieldwork") {
        score += 100 - day.maxRainChance;
        score += 20 - day.maxWind;
      }

      if (type === "spraying") {
        score += 100 - day.maxRainChance;
        score += 18 - day.maxWind;
      }

      if (type === "planting") {
        score += 100 - day.maxRainChance;
        score += 18 - day.maxWind;
        score += 20 - Math.abs(day.avgTemp - 14);
        if (day.frostRisk === "HIGH") score -= 50;
        if (day.frostRisk === "LOW") score -= 20;
      }

      if (type === "harvesting") {
        score += 100 - day.maxRainChance;
        score += 20 - day.maxWind;
      }

      return { day, score };
    });

    const best = scoredDays.sort((a, b) => b.score - a.score)[0];

    if (!best) {
      return "Optimal day: no clear recommendation is available.";
    }

    if (type === "irrigation") {
      return `Optimal day: ${best.day.fullLabel} for irrigation.`;
    }

    if (type === "fertilising") {
      return `Optimal day: ${best.day.fullLabel} for fertilising.`;
    }

    if (type === "fieldwork") {
      return `Optimal day: ${best.day.fullLabel} for field work.`;
    }

    if (type === "spraying") {
      return `Optimal day: ${best.day.fullLabel} for spraying.`;
    }

    if (type === "planting") {
      return `Optimal day: ${best.day.fullLabel} for planting.`;
    }

    if (type === "harvesting") {
      return `Optimal day: ${best.day.fullLabel} for harvesting.`;
    }

    return `Optimal day: ${best.day.fullLabel}.`;
  }

  // Store all farm action cards in one array so they can be rendered consistently
  const actionCards = [
    {
      key: "irrigation",
      title: "Irrigation",
      status:
        selectedDay.maxRainChance <= 20
          ? "Recommended"
          : selectedDay.maxRainChance <= 50
          ? "Worth monitoring"
          : "Not necessary",
      summary: `${selectedDay.maxRainChance}% max rainfall chance`,
      detail:
        selectedDay.maxRainChance <= 20
          ? "Rainfall looks limited, so irrigation is likely to be worthwhile."
          : selectedDay.maxRainChance <= 50
          ? "There is some chance of rain, so irrigation should be judged carefully."
          : "Rain is likely, so extra irrigation may not be needed.",
      timingText: buildOptimalTimeText("irrigation", selectedDay),
      bestDayText: getBestDay("irrigation"),
      extraInfo: [
        { label: "Rainfall chance", value: `${selectedDay.maxRainChance}%` },
        {
          label: "Temperature range",
          value: `${Math.round(selectedDay.minTemp)}°C to ${Math.round(
            selectedDay.maxTemp
          )}°C`,
        },
      ],
    },
    {
      key: "fertilising",
      title: "Fertilising",
      status:
        selectedDay.maxRainChance < 40 && selectedDay.maxWind < 15
          ? "Good conditions"
          : "Avoid for now",
      summary: `${selectedDay.maxWind} mph wind, ${selectedDay.maxRainChance}% rain`,
      detail:
        selectedDay.maxRainChance < 40 && selectedDay.maxWind < 15
          ? "Conditions are steady enough for fertiliser application to be effective."
          : "Rain or wind may reduce effectiveness, so it is better to wait.",
      timingText: buildOptimalTimeText("fertilising", selectedDay),
      bestDayText: getBestDay("fertilising"),
      extraInfo: [
        { label: "Wind", value: `${selectedDay.maxWind} mph` },
        { label: "Rainfall chance", value: `${selectedDay.maxRainChance}%` },
      ],
    },
    {
      key: "fieldwork",
      title: "Field Work",
      status:
        selectedDay.maxRainChance < 50 && selectedDay.maxWind < 20
          ? "Good conditions"
          : "Proceed with care",
      summary: `Wind ${selectedDay.maxWind} mph, rain ${selectedDay.maxRainChance}%`,
      detail:
        selectedDay.maxRainChance < 50 && selectedDay.maxWind < 20
          ? "Conditions look suitable for general field work."
          : "Weather conditions may make outdoor work slower or less efficient.",
      timingText: buildOptimalTimeText("fieldwork", selectedDay),
      bestDayText: getBestDay("fieldwork"),
      extraInfo: [
        { label: "Wind", value: `${selectedDay.maxWind} mph` },
        { label: "Rainfall chance", value: `${selectedDay.maxRainChance}%` },
      ],
    },
    {
      key: "spraying",
      title: "Spraying",
      status:
        selectedDay.maxRainChance < 20 && selectedDay.maxWind < 10
          ? "Good conditions"
          : "Not advised",
      summary: `${selectedDay.maxWind} mph wind, ${selectedDay.maxRainChance}% rain`,
      detail:
        selectedDay.maxRainChance < 20 && selectedDay.maxWind < 10
          ? "Conditions are calm and dry enough for spraying."
          : "Spraying may be less effective because of wind or expected rain.",
      timingText: buildOptimalTimeText("spraying", selectedDay),
      bestDayText: getBestDay("spraying"),
      extraInfo: [
        { label: "Wind", value: `${selectedDay.maxWind} mph` },
        { label: "Rainfall chance", value: `${selectedDay.maxRainChance}%` },
      ],
    },
    {
      key: "planting",
      title: "Planting",
      status:
        selectedDay.frostRisk === "HIGH"
          ? "Not advised"
          : selectedDay.maxRainChance < 40 &&
            selectedDay.maxWind < 15 &&
            selectedDay.avgTemp >= 7 &&
            selectedDay.avgTemp <= 22
          ? "Good conditions"
          : "Mixed conditions",
      summary: `${Math.round(selectedDay.avgTemp)}°C average, frost ${selectedDay.frostRisk}`,
      detail:
        selectedDay.frostRisk === "HIGH"
          ? "Cold conditions increase the risk for planting, so it is better to hold off."
          : selectedDay.maxRainChance < 40 &&
            selectedDay.maxWind < 15 &&
            selectedDay.avgTemp >= 7 &&
            selectedDay.avgTemp <= 22
          ? "Conditions are generally suitable for planting."
          : "Planting may still be possible, but conditions are not ideal.",
      timingText: buildOptimalTimeText("planting", selectedDay),
      bestDayText: getBestDay("planting"),
      extraInfo: [
        {
          label: "Average temperature",
          value: `${Math.round(selectedDay.avgTemp)}°C`,
        },
        { label: "Frost risk", value: selectedDay.frostRisk },
      ],
    },
    {
      key: "harvesting",
      title: "Harvesting",
      status:
        selectedDay.maxRainChance < 20 && selectedDay.maxWind < 15
          ? "Good conditions"
          : selectedDay.maxRainChance < 40 && selectedDay.maxWind < 20
          ? "Proceed with care"
          : "Not advised",
      summary: `${selectedDay.maxWind} mph wind, ${selectedDay.maxRainChance}% rain`,
      detail:
        selectedDay.maxRainChance < 20 && selectedDay.maxWind < 15
          ? "Conditions look suitable for harvesting."
          : selectedDay.maxRainChance < 40 && selectedDay.maxWind < 20
          ? "Harvesting may still be possible, but conditions are less reliable."
          : "Rain or stronger wind may make harvesting difficult.",
      timingText: buildOptimalTimeText("harvesting", selectedDay),
      bestDayText: getBestDay("harvesting"),
      extraInfo: [
        { label: "Wind", value: `${selectedDay.maxWind} mph` },
        { label: "Rainfall chance", value: `${selectedDay.maxRainChance}%` },
      ],
    },
  ];

  return (
    <section className="sectionCard">
      <div className="sectionTitle">Farm Actions</div>

      {/* Day selector for switching advice */}
      <div className="adviceDayToggle">
        {groupedDays.map((day, index) => (
          <button
            key={day.date}
            className={`adviceDayButton ${
              selectedDayIndex === index ? "adviceDayButtonActive" : ""
            }`}
            onClick={() => setSelectedDayIndex(index)}
            type="button"
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Main farm action cards */}
      <div className="actionGrid">
        {actionCards.map((card) => (
          <button
            key={card.key}
            type="button"
            className="actionWidget"
            onClick={() => setActiveAction(card)}
          >
            <div className="actionWidgetTop">
              <span className="actionWidgetTitle">{card.title}</span>
            </div>

            <div className="actionWidgetStatus">{card.status}</div>
            <div className="actionWidgetSummary">{card.summary}</div>
          </button>
        ))}
      </div>

      {/* Show extra detail in a modal when an action is selected */}
      {activeAction && (
        <div
          className="adviceModalOverlay"
          onClick={() => setActiveAction(null)}
        >
          <div className="adviceModal" onClick={(e) => e.stopPropagation()}>
            <div className="adviceModalHeader">
              <div className="adviceModalTitle">
                <span>{activeAction.title}</span>
              </div>

              <button
                type="button"
                className="adviceModalClose"
                onClick={() => setActiveAction(null)}
              >
                ×
              </button>
            </div>

            <div className="adviceModalBody">
              <div className="adviceModalStatus">{activeAction.status}</div>
              <p className="adviceModalText">{activeAction.detail}</p>
              <p className="adviceModalText">{activeAction.timingText}</p>
              <p className="adviceModalText">{activeAction.bestDayText}</p>

              <div className="adviceModalInfoGrid">
                {activeAction.extraInfo.map((item) => (
                  <div className="adviceModalInfoCard" key={item.label}>
                    <div className="adviceModalInfoLabel">{item.label}</div>
                    <div className="adviceModalInfoValue">{item.value}</div>
                  </div>
                ))}
              </div>

              <p className="adviceModalMeta">
                Selected day: {selectedDay.fullLabel}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}