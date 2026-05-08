# Heuristic Evaluation Report

Based on Nielsen's Usability Heuristics.

## 1. Visibility of System Status
*   **Observation**: The risk gauge and alert feed update dynamically based on backend responses.
*   **Defect**: None.
*   **Severity**: Low.
*   **Recommendation**: Add a clear "Loading..." or skeleton state when fetching historical data.

## 2. Match Between System and Real World
*   **Observation**: Terms like "Temperature", "Humidity", and "Wind Speed" map to standard meteorological terms.
*   **Defect**: "Vegetation Moisture" uses a 0-1 scale which might be unintuitive to laymen.
*   **Severity**: Medium.
*   **Recommendation**: Represent Vegetation Moisture as a percentage (0-100%).

## 3. User Control and Freedom
*   **Observation**: Users can easily clear manual inputs or toggle settings.
*   **Defect**: No way to "undo" or dismiss an active alert from the UI.
*   **Severity**: High.
*   **Recommendation**: Implement an "Acknowledge" or "Dismiss" button on alert cards.

## 4. Consistency and Standards
*   **Observation**: Consistent color coding (Red for Extreme, Orange for High, Green for Low) across the app.
*   **Defect**: None.
*   **Severity**: Low.
*   **Recommendation**: Ensure this color standard is enforced in any future chart additions.

## 5. Error Prevention
*   **Observation**: Backend clamps extreme inputs (e.g., 200°C), but frontend still allows users to type them.
*   **Defect**: Slider limits prevent extreme input, but manual text entry allows it.
*   **Severity**: Medium.
*   **Recommendation**: Add frontend input validation to match backend clamping logic.

## 6. Recognition Rather Than Recall
*   **Observation**: The dashboard displays the recent prediction history, so the user doesn't have to remember past states.
*   **Defect**: None.
*   **Severity**: Low.
*   **Recommendation**: Provide a "Compare" feature to select two past predictions easily.

## 7. Flexibility and Efficiency of Use
*   **Observation**: The system automatically fetches weather data if the user leaves fields blank.
*   **Defect**: Advanced users might want to batch-upload a CSV of parameters for rapid testing.
*   **Severity**: Low (enhancement).
*   **Recommendation**: Add a CSV upload utility for simulation mode.

## 8. Aesthetic and Minimalist Design
*   **Observation**: The UI is clean, utilizing glassmorphism and clear spacing.
*   **Defect**: Alert feed can become cluttered if too many alerts trigger at once.
*   **Severity**: Medium.
*   **Recommendation**: Implement alert grouping or pagination.

## 9. Help and Documentation
*   **Observation**: The system lacks an explicit "Help" page or onboarding tour.
*   **Defect**: New users might not understand how the Random Forest model derives its score.
*   **Severity**: Medium.
*   **Recommendation**: Add a small "?" icon next to the Risk Score linking to a modal explaining the ML logic.
