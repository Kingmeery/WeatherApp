import "../Styling/Alerts.css";

export default function Alerts({ alerts }) {
  // Don't render anything if there are no alerts
  if (alerts.length === 0) return null;

  return (
    <section className="sectionCard">
      <div className="sectionTitle">Weather Alerts</div>

      <div className="alertsList">
        {alerts.map((alert, index) => (
          // Render each alert message
          <div className="alertItem" key={index}>
            ⚠️ {alert}
          </div>
        ))}
      </div>
    </section>
  );
}