# Usability Testing Report

## Objective
To evaluate the user experience and intuitiveness of the GeoFireNet frontend dashboard.

## Test User Tasks

### 1. Run Manual Prediction
*   **Task**: Navigate to the prediction form and submit a manual set of weather conditions.
*   **Expected Outcome**: User can easily find the form, enter data, and see the risk card update immediately.
*   **Actual Outcome**: Successful. Users appreciated the immediate visual feedback on the risk card.
*   **Issues Found**: None.
*   **Recommendations**: Add tooltips explaining each weather parameter unit.

### 2. View Alerts
*   **Task**: Identify where active system alerts are displayed.
*   **Expected Outcome**: User spots the Alert Feed panel on the right side of the dashboard.
*   **Actual Outcome**: Successful. The red coloring for Extreme alerts was highly visible.
*   **Issues Found**: Some users tried to click the alert to see a detailed map view, which isn't currently implemented.
*   **Recommendations**: Make alert cards clickable to pan the map to the alert's coordinates.

### 3. Check Analytics
*   **Task**: View historical prediction trends.
*   **Expected Outcome**: User navigates to the Analytics tab and interprets the line charts.
*   **Actual Outcome**: Successful. Chart.js implementation was responsive.
*   **Issues Found**: Chart labels overlap slightly on very small screens.
*   **Recommendations**: Implement responsive font sizing for chart axes.

### 4. Change Settings
*   **Task**: Toggle the application to Dark Mode.
*   **Expected Outcome**: User opens settings and clicks the Dark Mode toggle.
*   **Actual Outcome**: Successful. Theme switched seamlessly.
*   **Issues Found**: None.
*   **Recommendations**: Persist theme choice in local storage so it survives page reloads.

### 5. Navigate Dashboard Pages
*   **Task**: Switch between Map, Analytics, and Settings views.
*   **Expected Outcome**: Fast client-side routing with no full page reloads.
*   **Actual Outcome**: Successful.
*   **Issues Found**: None.
*   **Recommendations**: Add a subtle transition animation between routes.
