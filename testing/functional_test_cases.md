# Functional Test Cases

## 1. Prediction Endpoint Test Cases
| Test ID | Description | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| P-01 | Submit valid weather parameters | Returns 200 OK with `risk_score` and `risk_level` | Pass |
| P-02 | Submit missing parameters | Uses external weather API to fill gaps, returns 200 OK | Pass |
| P-03 | Submit extreme/impossible values | Clamps values to realistic bounds (e.g., temp to 60.0), returns 200 OK | Pass |

## 2. Alerts Generation Test Cases
| Test ID | Description | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| A-01 | Trigger "Extreme" risk prediction | Background task generates an Active Alert in DB | Pass |
| A-02 | Trigger "Low" risk prediction | No alert generated | Pass |
| A-03 | Retrieve Active Alerts | Returns 200 OK with list of current alerts | Pass |

## 3. Dashboard Page Loading Test Cases
| Test ID | Description | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| D-01 | Load Map View | Map renders, tiles load correctly | Pass |
| D-02 | Load Analytics Page | Charts render with historical data | Pass |
| D-03 | Load Settings Page | Theme toggle and configuration controls visible | Pass |

## 4. History Retrieval Test Cases
| Test ID | Description | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| H-01 | Fetch recent predictions limit=10 | Returns 200 OK with array length <= 10 | Pass |
| H-02 | Fetch prediction details by ID | Returns 200 OK with specific prediction object | Pass |

## 5. Settings Page Test Cases
| Test ID | Description | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| S-01 | Toggle Dark Mode | CSS classes update, UI goes dark | Pass |
| S-02 | Update System Mode | State changes between Production/Simulation | Pass |

## 6. Database Persistence Test Cases
| Test ID | Description | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| DB-01 | Save Prediction Request | Request data is saved to `WeatherInput` table | Pass |
| DB-02 | Update Alert Status | Alert status transitions to "Resolved" successfully | Pass |
