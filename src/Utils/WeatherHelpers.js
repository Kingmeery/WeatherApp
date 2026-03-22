export function formatTimeFromUnix(unix) {
  const d = new Date(unix * 1000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDayFromUnix(unix) {
  const d = new Date(unix * 1000);
  return d.toLocaleDateString([], { weekday: "short" });
}

export function formatFullDate(unix) {
  const d = new Date(unix * 1000);
  return d.toLocaleDateString([], {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });
}

export function getFrostRisk(temp) {
  if (typeof temp !== "number") return "—";
  if (temp <= 1) return "HIGH";
  if (temp <= 5) return "LOW";
  return "NONE";
}

export function buildAlerts(current, forecastList) {
  const alerts = [];

  const currentTemp = current?.main?.temp;
  const wind = current?.wind?.speed;
  const weatherMain = current?.weather?.[0]?.main?.toLowerCase() || "";

  if (typeof currentTemp === "number" && currentTemp >= 30) {
    alerts.push("Heat alert: high temperature may affect crops and irrigation.");
  }

  if (typeof currentTemp === "number" && currentTemp <= 1) {
    alerts.push("Frost alert: temperatures are near or below freezing.");
  }

  if (typeof wind === "number" && wind >= 12) {
    alerts.push("Strong wind alert: spraying and field work may be affected.");
  }

  if (weatherMain.includes("thunder")) {
    alerts.push("Storm alert: thunderstorms detected.");
  }

  const nextRainy = forecastList?.some((item) => (item.pop || 0) >= 0.6);

  if (nextRainy) {
    alerts.push("Heavy rain risk in the upcoming forecast.");
  }

  return alerts;
}

export function groupDailyForecast(list) {
  if (!Array.isArray(list)) return [];

  const byDay = {};

  list.forEach((item) => {
    const dateKey = new Date(item.dt * 1000).toDateString();

    if (!byDay[dateKey]) {
      byDay[dateKey] = [];
    }

    byDay[dateKey].push(item);
  });

  return Object.values(byDay)
    .slice(0, 5)
    .map((dayItems) => {
      const middayItem =
        dayItems.find((item) => {
          const hour = new Date(item.dt * 1000).getHours();
          return hour >= 12 && hour <= 15;
        }) || dayItems[0];

      const temps = dayItems.map((item) => item.main.temp);
      const max = Math.max(...temps);
      const min = Math.min(...temps);

      return {
        dt: middayItem.dt,
        icon: middayItem.weather?.[0]?.icon || "01d",
        description: middayItem.weather?.[0]?.description || "",
        max,
        min,
        pop: Math.round(
          Math.max(...dayItems.map((item) => (item.pop || 0) * 100))
        ),
      };
    });
}

export function toFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

export function formatTemperature(temp, unit) {
  if (typeof temp !== "number") return "—";
  const value = unit === "F" ? toFahrenheit(temp) : temp;
  return `${Math.round(value)}°${unit}`;
}