import "../Styling/LocationManager.css";

export default function LocationManager({
  query,
  setQuery,
  handleSearchSubmit,
  handleUseMyLocation,
  handleAddSavedLocation,
  activeLocation,
  savedLocations,
  setActiveLocation,
  handleDeleteLocation,
}) {
  return (
    <section className="sectionCard searchCard">
      <form className="searchRow" onSubmit={handleSearchSubmit}>
        <input
          className="input"
          type="text"
          placeholder="Search location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button className="actionButton" type="submit">
          Search
        </button>

        <button
          className="ghostButton"
          type="button"
          onClick={handleUseMyLocation}
        >
          Use GPS
        </button>
      </form>

      <div className="locationActions">
        <button
          type="button"
          className="miniButton"
          onClick={handleAddSavedLocation}
        >
          Save Current Location
        </button>

        <div className="defaultTag">Default: {activeLocation}</div>
      </div>

      <div className="savedSection">
        <div className="sectionTitle">Saved Locations</div>

        <div className="savedList">
          {savedLocations.map((location) => (
            <div
              className={`savedChip ${
                location === activeLocation ? "savedChipActive" : ""
              }`}
              key={location}
            >
              <button
                type="button"
                className="savedChipMain"
                onClick={() => setActiveLocation(location)}
              >
                {location}
              </button>

              <button
                type="button"
                className="savedChipDelete"
                onClick={() => handleDeleteLocation(location)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}