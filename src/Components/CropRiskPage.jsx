import React from "react";
import CropRiskGraph from "./CropRiskGraph";
import "../Styling/CropRisk.css";

export default function CropRiskPage({
  locationName,
  forecastList,
  onBack,
}) {
  return (
    <>
      <section className="sectionCard cropRiskIntroCard">
        <div className="cropRiskPageHeader">
          <div>
            <div className="sectionTitle cropRiskPageTitle">
              Crop Risk Forecast
            </div>
            <p className="cropRiskPageText">
              View the next few days of weather-driven crop risk using the same
              forecast data as your main weather dashboard.
            </p>
          </div>

          <button
            type="button"
            className="actionButton cropRiskBackButton"
            onClick={onBack}
          >
            ← Back to Weather
          </button>
        </div>
      </section>

      <CropRiskGraph
        locationName={locationName}
        forecastList={forecastList}
      />
    </>
  );
}