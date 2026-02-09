# Hostile Viva Defense Simulation

> [!WARNING]
> These questions are designed to be **uncomfortable**. They target specific design choices. Practice answering them out loud using the "Evidence-Based" responses below.

## Section 1: Machine Learning Validity

**Q1: "Random Forest is an old algorithm. Why didn't you use Deep Learning or a Transformer for this?"**

* **Defense**: "For tabular meteorological data with only 4 features, Deep Learning is overkill and prone to overfitting. Random Forest provides the optimal balance of non-linear capability (capturing Heat+Wind interactions) and interpretability, which is crucial for safety-critical systems. Transformers require vast datasets we don't have."

**Q2: "Your heuristic baseline has 98% accuracy. The ML model adds complexity for barely any gain. Justify its existence."**

* **Defense**: "Accuracy is misleading here. The baseline performs well on 'normal' days because physics is linear. However, the ML model provides a **Critical Advantage in Edge Cases**, specifically identifying non-linear risk amplifications that the linear baseline misses. We optimize for *Recall during Extremes*, not average accuracy." (Ref: `model_comparison_narrative.md`)

**Q3: "You set the High Risk threshold at 50/100. That seems surprisingly low. Did you just guess?"**

* **Defense**: "No, it was empirically calibrated. Our analysis (`calibrate_thresholds.py`) showed that while Threshold 60 maximized F1-score, it missed ~7% of fires. We selected Threshold 50 to ensure **100% Recall**, prioritizing public safety over reducing false alarms." (Ref: `experiment_traceability.md`)

**Q4: "How do we know your model isn't just memorizing the synthetic training data (Overfitting)?"**

* **Defense**: "We limited the tree depth and estimator count to prevent memorization. Furthermore, our `evaluate_model.py` script validates performance on a separate, unseen test set, confirming the model generalizes to new data points within the defined climate profile."

**Q5: "Why did you choose these specific 4 features? Why not Soil Type or Topography?"**

* **Defense**: "This is a defined project scope limitation. We focused on *Dynamic Meteorological Variables* that change hourly. Static features like topography are undoubtedly important for a V2.0, but were out of scope for this initial real-time weather integration proof-of-concept."

## Section 2: Data & Realism

**Q6: "You used synthetic data. Isn't this just 'Garbage In, Garbage Out'?"**

* **Defense**: "It's 'Simulation In, Intelligence Out'. The data wasn't random; it was generated using a physics-constrained probabilistic model calibrated to California's summer climate. This allowed us to train the model on rare, catastrophic edge cases that might not appear in a small historical dataset."

**Q7: "How does your model handle the difference between Winter and Summer?"**

* **Defense**: "The model is agnostic to the calendar but sensitive to the *conditions*. A hot, dry day in Winter will correctly trigger a high risk score. Our synthetic training data covered the full range of operational conditions, implicitly handling seasonality via the `Temperature` and `Humidity` features."

**Q8: "What if the sensor sends a Temperature of 100°C? Your model would crash or output nonsense."**

* **Defense**: "We implemented a strict **Input Contract** with 'Soft Enforcement'. The backend validates all inputs and **Clamps** extreme outliers (e.g., 100°C becomes 50°C) to ensuring the system remains operational and provides a 'saturated' maximum risk prediction rather than crashing." (Ref: `model_input_contract.md`)

**Q9: "Without real historical fire records, how can you claim any validity?"**

* **Defense**: "We claim *Architectural Validity* and *Logic Validity*. The system correctly identifies the non-linear relationships we know exist in fire physics. Validation against real historical data is the immediate next step for Future Work."

**Q10: "Did you handle class imbalance? Fires are rare events."**

* **Defense**: "Yes, our synthetic data generation explicitly over-sampled high-risk conditions to ensure the model had enough positive examples to learn the definition of 'Fire'. A purely random sample would have been 99% 'No Fire', leading to a biased trivial model."

## Section 3: System Engineering

**Q11: "Explain the latency of your system. Is it really 'Real-Time'?"**

* **Defense**: "Yes. The Random Forest inference takes less than 50 milliseconds. The total round-trip time is dominated by network latency, not compute. It is suitable for real-time alerting."

**Q12: "What happens if the backend server goes down during a fire?"**

* **Defense**: "The current architecture is a prototype. For production, the model artifact is stateless and would be deployed in a containerized fleet (Kubernetes) with auto-scaling and redundancy to ensure high availability."

**Q13: "Can I inject malicious code through your API?"**

* **Defense**: "We use Pydantic for strict data validation. The API only accepts specific typed fields (float). It rejects any string payloads or malformed JSON, mitigating SQL injection or command injection attacks."

**Q14: "Why split the Logic into Backend (FastAPI) and Frontend (React)? Why not just one app?"**

* **Defense**: "Decoupling allows us to scale the heavy-lifting (ML inference) separately from the user interface. It also allows other clients (e.g., IoT sensors, Mobile Apps) to consume the same Risk API without needing the React dashboard."

**Q15: "Final Question: If you had to redo one thing, what would it be?"**

* **Defense**: "I would integrate a live satellite data feed (like NASA FIRMS) earlier in the process. While the synthetic data proved the *concept*, real data would prove the *accuracy*."
