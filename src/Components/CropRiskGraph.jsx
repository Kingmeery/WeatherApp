import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../Styling/CropRisk.css";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function getRiskLevel(score) {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function getMainDriver(drivers) {
  return Object.entries(drivers).sort((a, b) => b[1] - a[1])[0]?.[0] || "Stable";
}

function calculateRisk(day) {
  const maxTemp = day.maxTemp ?? 0;
  const rainChance = day.maxRainChance ?? 0;
  const windSpeed = day.maxWindMps ?? 0;
  const humidity = day.avgHumidity ?? 0;

  const heatRisk = clamp((maxTemp - 22) * 4, 0, 30);
  const droughtRisk = clamp((60 - rainChance) * 0.35, 0, 25);
  const windRisk = clamp((windSpeed - 8) * 3, 0, 20);
  const diseaseRisk = clamp(((humidity - 75) * 0.45) + (rainChance * 0.08), 0, 25);

  const score = round(clamp(heatRisk + droughtRisk + windRisk + diseaseRisk, 0, 100));

  const drivers = {
    Heat: round(heatRisk),
    Drought: round(droughtRisk),
    Wind: round(windRisk),
    Disease: round(diseaseRisk),
  };

  return {
    score,
    level: getRiskLevel(score),
    driver: getMainDriver(drivers),
  };
}

export default function CropRiskGraph({ forecastList = [], locationName }) {
  const chartData = useMemo(() => {
    if (!forecastList.length) return [];

    const grouped = Object.entries(
      forecastList.reduce((acc, item) => {
        const dateKey = item.dt_txt.split(" ")[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(item);
        return acc;
      }, {})
    ).slice(0, 7);

    return grouped.map(([date, entries], index) => {
      const temps = entries.map((entry) => entry.main.temp_max ?? entry.main.temp);
      const humidities = entries.map((entry) => entry.main.humidity);
      const winds = entries.map((entry) => entry.wind.speed);
      const rainChances = entries.map((entry) =>
        typeof entry.pop === "number" ? Math.round(entry.pop * 100) : 0
      );

      const maxTemp = Math.max(...temps);
      const avgHumidity = Math.round(
        humidities.reduce((sum, value) => sum + value, 0) / humidities.length
      );
      const maxWindMps = Math.max(...winds);
      const maxRainChance = Math.max(...rainChances);

      const risk = calculateRisk({
        maxTemp,
        avgHumidity,
        maxWindMps,
        maxRainChance,
      });

      const dateObj = new Date(date);

      return {
        day:
          index === 0
            ? "Today"
            : dateObj.toLocaleDateString("en-GB", { weekday: "short" }),
        fullDate:
          index === 0
            ? "Today"
            : dateObj.toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "short",
              }),
        risk: risk.score,
        level: risk.level,
        driver: risk.driver,
        maxTemp: round(maxTemp),
        humidity: avgHumidity,
        windSpeed: round(maxWindMps),
        rainChance: maxRainChance,
      };
    });
  }, [forecastList]);

  const averageRisk = useMemo(() => {
    if (!chartData.length) return 0;
    return Math.round(
      chartData.reduce((sum, item) => sum + item.risk, 0) / chartData.length
    );
  }, [chartData]);

  if (!chartData.length) {
    return (
      <section className="sectionCard cropRiskCard">
        <div className="sectionTitle">7-Day Crop Risk</div>
        <div className="infoBanner cropRiskBanner">No forecast data available yet.</div>
      </section>
    );
  }

  return (
    <section className="sectionCard cropRiskCard">
      <div className="cropRiskHeader">
        <div>
          <div className="sectionTitle">7-Day Crop Risk</div>
          <div className="cropRiskSubtext">
            {locationName
              ? `Forecast-based crop risk for ${locationName}`
              : "Forecast-based crop risk"}
          </div>
        </div>

        <div className="cropRiskScoreCard">
          <div className="cropRiskScoreLabel">Average Risk</div>
          <div className="cropRiskScoreValue">{averageRisk}</div>
        </div>
      </div>

      <div className="cropRiskChartWrap">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--page-border)" />
            <XAxis dataKey="day" stroke="currentColor" tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} stroke="currentColor" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 18,
                border: "1px solid var(--page-border)",
                background: "rgba(15, 23, 42, 0.94)",
                color: "#ffffff",
              }}
              labelFormatter={(value, payload) => payload?.[0]?.payload?.fullDate || value}
            />
            <Line
              type="monotone"
              dataKey="risk"
              stroke="currentColor"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="cropRiskStatsGrid">
        {chartData.map((item) => (
          <div className="cropRiskStatCard" key={item.fullDate}>
            <div className="cropRiskStatTop">
              <div>
                <div className="cropRiskDay">{item.day}</div>
                <div className="cropRiskDate">{item.fullDate}</div>
              </div>
              <div className="cropRiskBadge">{item.level}</div>
            </div>

            <div className="cropRiskValue">{item.risk}</div>
            <div className="cropRiskDriver">Main driver: {item.driver}</div>

            <div className="cropRiskMeta">
              <span>Temp {item.maxTemp}°C</span>
              <span>Rain {item.rainChance}%</span>
              <span>Wind {item.windSpeed} m/s</span>
              <span>Humidity {item.humidity}%</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}