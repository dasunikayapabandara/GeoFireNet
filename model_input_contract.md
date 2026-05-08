# GeoFireNet ML Model Input Contract

> [!NOTE]
> This contract defines the strict input boundaries for the wildfire risk model. All clients (Dashboards, APIs, Simulations) must adhere to these constraints.

## 1. Input Variables

The prediction API accepts either a complete manual telemetry payload or a location payload that can be completed through the configured weather provider.

| Field | Type | Unit | Min | Max | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `temp` | Float | Celsius (°C) | -20.0 | 60.0 | Surface air temperature. |
| `humidity` | Float | Percent (%) | 0.0 | 100.0 | Relative humidity. |
| `wind` | Float | km/h | 0.0 | 150.0 | Sustained wind speed. |
| `veg_moisture` | Float | Index (0-1) | 0.0 | 1.0 | Normalized vegetation moisture index. |

## 2. Validation & Error Handling

### Out-of-Range Values

To ensure system robustness during demonstrations and simulations:

* **Behavior**: Soft Enforcement (Clamping).
* **Logic**: Values exceeding the defined Min/Max will be clamped to the nearest boundary.
* **Logging**: The system should log valid warnings when clamping occurs.

*Example*: Input `temp=55.0` will be processed as `temp=50.0` (Risk saturated).

### Missing or Null Values

* **Manual Prediction Behavior**: Strict enforcement. If latitude/longitude are not provided, all four environmental fields must be present.
* **Weather Ingestion Behavior**: If one or more environmental fields are missing and explicit latitude/longitude are provided, the backend attempts to fetch current weather from the configured provider.
* **Failure Behavior**: If weather ingestion is unavailable or misconfigured, the API returns a structured error and does not fabricate prediction inputs.

## 3. Data Types

* Inputs must be parseable as standard 64-bit Floating Point numbers.
* Integer inputs are accepted but treated as Floats.
* String inputs (e.g., "30.5") are valid if they can be coerced to Float.
