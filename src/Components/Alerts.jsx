export default function Alerts({ alerts }) {
  if (alerts.length === 0) return null;

  return (
    <section className="sectionCard">
      <div className="sectionTitle">Weather Alerts</div>
      <div className="alertsList">
        {alerts.map((alert, index) => (
          <div className="alertItem" key={index}>
            ⚠️ {alert}
          </div>
        ))}
      </div>
    </section>
  );
}