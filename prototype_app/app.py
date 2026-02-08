import streamlit as st
import pandas as pd
import numpy as np
import folium
from streamlit_folium import st_folium
from model import WildfireModel
from datetime import datetime

# Page Config
st.set_page_config(page_title="GeoFireNet Risk Dashboard", page_icon="🔥", layout="wide")

# Initialize Model
@st.cache_resource
def load_model():
    return WildfireModel()

model = load_model()

# Sidebar: User Inputs
st.sidebar.header("🔥 Wildfire Risk Parameters")

# 1. Date Filter (Seasonality Logic)
date = st.sidebar.date_input("Simulation Date", value=datetime.today())
month = date.month

# Seasonality offsets (Summer is hotter/drier)
# Mock logic: Month 6-9 (June-Sept) gets temp boost +5C, humidity drop -10%
is_fire_season = 6 <= month <= 10
season_temp_offset = 5 if is_fire_season else -2
season_hum_offset = -10 if is_fire_season else 10

st.sidebar.caption(f"Seasonality Effect: {'High (Fire Season)' if is_fire_season else 'Low (Winter/Spring)'}")

# 2. Region Filter
region_options = {
    "All Regions": {"lat": 38.5, "lon": -122.3, "zoom": 9},
    "North Napa": {"lat": 38.5, "lon": -122.4, "zoom": 11},
    "Sonoma East": {"lat": 38.4, "lon": -122.7, "zoom": 11},
    "Central Valley": {"lat": 38.5, "lon": -122.0, "zoom": 10},
}
selected_region = st.sidebar.selectbox("Select Region", list(region_options.keys()))
region_view = region_options[selected_region]

st.sidebar.markdown("---")
st.sidebar.markdown("**Climate Variables**")
temp = st.sidebar.slider("Temperature (°C)", 0, 50, 30 + season_temp_offset)
humidity = st.sidebar.slider("Humidity (%)", 0, 100, max(0, 30 + season_hum_offset))
wind = st.sidebar.slider("Wind Speed (km/h)", 0, 100, 15)
veg_moisture = st.sidebar.slider("Vegetation Moisture Index", 0.0, 1.0, 0.4)

# Main Dashboard
st.title("GeoFireNet: Wildfire Risk Prediction System")
st.markdown(f"**Analysis for:** {selected_region} | **Date:** {date}")

col1, col2 = st.columns([3, 1])

with col1:
    st.subheader("Geospatial Risk Visualization")

    # Session State for Map View
    if "map_center" not in st.session_state:
        st.session_state.map_center = [region_view["lat"], region_view["lon"]]
        st.session_state.map_zoom = region_view["zoom"]
        st.session_state.last_region = selected_region

    # Update View ONLY if Region Changed
    if selected_region != st.session_state.last_region:
        st.session_state.map_center = [region_view["lat"], region_view["lon"]]
        st.session_state.map_zoom = region_view["zoom"]
        st.session_state.last_region = selected_region

    # Dynamic center based on session state (Preserves zoom/pan on slider update)
    m = folium.Map(
        location=st.session_state.map_center, 
        zoom_start=st.session_state.map_zoom, 
        tiles="OpenStreetMap"
    )

    # Define Mock Regions (GeoJSON) - Same as before
    mock_regions = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"name": "North Napa", "id": "1", "temp_offset": 2},
                "geometry": {"type": "Polygon", "coordinates": [[[-122.5, 38.6], [-122.3, 38.6], [-122.3, 38.4], [-122.5, 38.4], [-122.5, 38.6]]]}
            },
            {
                "type": "Feature",
                "properties": {"name": "Sonoma East", "id": "2", "temp_offset": -3},
                "geometry": {"type": "Polygon", "coordinates": [[[-122.8, 38.5], [-122.6, 38.5], [-122.6, 38.3], [-122.8, 38.3], [-122.8, 38.5]]]}
            },
            {
                "type": "Feature",
                "properties": {"name": "Central Valley", "id": "3", "temp_offset": 5},
                "geometry": {"type": "Polygon", "coordinates": [[[-122.2, 38.7], [-121.8, 38.7], [-121.8, 38.3], [-122.2, 38.3], [-122.2, 38.7]]]}
            }
        ]
    }

    # Filter regions if specific one selected
    if selected_region != "All Regions":
        mock_regions["features"] = [f for f in mock_regions["features"] if f["properties"]["name"] == selected_region]

    # Calculate Risk per Region
    for feature in mock_regions["features"]:
        props = feature["properties"]
        local_temp = temp + props.get("temp_offset", 0)
        risk_prob = model.predict(local_temp, humidity, wind, veg_moisture)
        risk_level, color = model.get_risk_level(risk_prob)
        props.update({"risk_prob": risk_prob, "risk_level": risk_level, "color": color})

    def style_function(feature):
        return {"fillColor": feature["properties"]["color"], "color": "black", "weight": 1, "fillOpacity": 0.6}

    folium.GeoJson(
        mock_regions,
        style_function=style_function,
        tooltip=folium.GeoJsonTooltip(fields=["name", "risk_prob", "risk_level"], localize=True)
    ).add_to(m)

    # Capture map state to persist zoom/pan on sidebar changes
    map_data = st_folium(
        m, 
        width="100%", 
        height=500,
        key="fire_map",
        returned_objects=["last_active_drawing", "zoom", "center"]
    )

    # Update session state with latest map view if user interacted
    if map_data and map_data.get("zoom") is not None:
        st.session_state.map_zoom = map_data["zoom"]
    if map_data and map_data.get("center") is not None:
        # st_folium returns center as {'lat': ..., 'lng': ...}
        center = map_data["center"]
        st.session_state.map_center = [center["lat"], center["lng"]]

with col2:
    st.subheader("Regional Analytics")
    
    # Calculate visible region scores
    ml_scores = [f["properties"]["risk_prob"] for f in mock_regions["features"]]
    avg_ml = sum(ml_scores) / len(ml_scores) if ml_scores else 0
    avg_ml_level, _ = model.get_risk_level(avg_ml)
    
    # Calculate Heuristic Baselines for same regions
    base_scores = []
    for f in mock_regions["features"]:
        props = f["properties"]
        l_temp = temp + props.get("temp_offset", 0)
        base_scores.append(model.predict_heuristic(l_temp, humidity, wind, veg_moisture))
    
    avg_base = sum(base_scores) / len(base_scores) if base_scores else 0
    avg_base_level, _ = model.get_risk_level(avg_base)

    # Side-by-Side Metrics
    m1, m2 = st.columns(2)
    m1.metric("ML Prediction", f"{avg_ml:.0f}/100", f"{avg_ml_level}")
    m2.metric("Baseline (Linear)", f"{avg_base:.0f}/100", f"{avg_base_level}", delta_color="off")
    
    # Comparison Insight
    diff = avg_ml - avg_base
    if diff > 5:
        st.info(f"💡 **ML Insight**: Model detected **+{diff:.0f} points** additional risk due to non-linear climate interactions (e.g. Extreme Heat + Wind).")
    
    st.markdown("---")
    st.markdown("### Decision Support")
    if avg_ml > 80: st.error("⚠️ **EVACUATION ALERT**")
    elif avg_ml > 50: st.warning("⚠️ **High Alert**")
    else: st.success("✅ **Status Normal**")

    st.markdown("---")
    st.markdown("**Seasonality Impact**")
    st.write(f"Month: {month} ({'Fire Season' if is_fire_season else 'Off-Season'})")
    st.write(f"Temp Adj: {season_temp_offset}°C")
