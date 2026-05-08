# Demo Contingency Plan

> [!WARNING]
> Murphy's Law applies to all live demos. Keep this document printed or open during your Viva Defense.

## Scenario A: The "Model Missing" Error

**Symptom**: The backend starts, but logs `Warning: model.pkl not found`.
**Cause**: The binary artifact was not copied to the correct directory or was corrupted.
**System Behavior**:

- `/health/model` reports degraded model readiness.
- `/predict` returns a clear service error instead of fabricating scores.
- The recovery action is to regenerate the artifact with `python -m backend.train_model`.
**Examiner Explanation**:
*"GeoFireNet does not silently switch to mock predictions. A missing model is treated as a deployment readiness failure so every risk score remains traceable to the trained artifact."*

## Scenario B: The "Backend Crash"

**Symptom**: The React frontend shows "Network Error" or fails to load data.
**Recovery Strategy**:

1. Immediately switch to the **Streamlit Prototype** (`prototype_app`).
2. Run: `streamlit run prototype_app/app.py`
3. **Explanation**: *"The React microservice seems to be experiencing network latency. Let me demonstrate the core ML logic using our rapid-prototyping dashboard which shares the exact same Python model backend."*

## Scenario C: "Rogue Inputs" (The Examiner Test)

**Symptom**: An examiner asks you to input `Temp = 100°C`.
**System Response**:

- The validators in `backend/main.py` will **Clamp** the input to `50°C`.
- The logs will show: `WARNING: Clamping temperature input 100.0 to [0, 50]`.
**Explanation**:
*"The system implements 'Soft Enforcement' for inputs. Rather than crashing or returning an error, it clamps extreme out-of-distribution values to the maximum trainable boundary to maintain operational continuity."*

## Checklist Before Demo

- [ ] Run `python3 backend/main.py` and check for "Loaded model..." message.
- [ ] Have the Streamlit command ready in a separate terminal tab.
- [ ] Know exactly where `model_provenance.md` is located to show the hash.
