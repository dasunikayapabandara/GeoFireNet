# GeoFireNet: Academic Diagrams

> [!NOTE]
> This document contains the Mermaid definitions for the system's core architectural and process diagrams. These can be rendered directly in GitHub or any Markdown viewer supporting Mermaid.

## 1. System Architecture Diagram

High-level view of the application components and their interactions.

```mermaid
graph TD
    Client[("React Frontend<br>(User Interface)")]
    API[("FastAPI Backend<br>(Validation & Logic)")]
    Model[("ML Model Artifact<br>(Random Forest)")]
    
    subgraph "Client Side"
        Client
    end
    
    subgraph "Server Side"
        API
        Model
    end
    
    Client -- "HTTP POST (JSON)" --> API
    API -- "Load & Predict" --> Model
    Model -- "Risk Score (0-100)" --> API
    API -- "JSON Response" --> Client
```

## 2. Data Flow Diagram (DFD)

Tracing the flow of information from user input to visualization.

```mermaid
sequenceDiagram
    participant User
    participant GUI as React Dashboard
    participant API as FastAPI Server
    participant Validator as Pydantic Validator
    participant Model as ML Model
    
    User->>GUI: Adjust Sliders (Temp, Wind, etc.)
    GUI->>API: POST /predict {temp: 55, wind: 30...}
    
    activate API
    API->>Validator: Validate Inputs
    Note right of Validator: Clamp Temp 55 -> 50 (Soft Enforcement)
    Validator-->>API: Validated Data {temp: 50, ...}
    
    API->>Model: predict(features)
    Model-->>API: Risk Score: 85 (Extreme)
    
    API-->>GUI: JSON {risk: 85, level: "Extreme", baseline: 60}
    deactivate API
    
    GUI->>User: Display "Evacuation Alert"
```

## 3. ML Pipeline Diagram

The lineage of the machine learning model from data to frozen artifact.

```mermaid
flowchart LR
    DataGen["Synthetic Data Generation<br>(Calibrated to CA Summer)"]
    Preproc["Preprocessing<br>(Normalization 0-1)"]
    Train["Training<br>(Random Forest Regressor)"]
    Eval["Evaluation<br>(Recall & F1 Analysis)"]
    Artifact["Frozen Artifact<br>(model.pkl)"]
    Prov["Provenance Doc<br>(SHA-256 Hash)"]
    
    DataGen --> Preproc
    Preproc --> Train
    Train --> Eval
    Eval -- "Threshold Tuning (50)" --> Train
    Train --> Artifact
    Artifact -.-> Prov
```

## 4. Decision-Support Workflow

How an end-user utilizes the system for risk assessment.

```mermaid
stateDiagram-v2
    [*] --> Input_Conditions
    Input_Conditions --> Visualize_Risk
    
    state "Analyze Risk Score" as Analyze {
        Visualize_Risk --> Check_Level
        Check_Level --> Low_Risk : Score < 30
        Check_Level --> Moderate_Risk : 30-50
        Check_Level --> High_Risk : 50-80
        Check_Level --> Extreme_Risk : > 80
    }
    
    Extreme_Risk --> Compare_Baseline
    Compare_Baseline --> Action
    
    state "Decision" as Action {
        [*] --> Check_Baseline_Delta
        Check_Baseline_Delta --> NonLinear_Event : Delta > 10
        NonLinear_Event --> Alert_Authorities
    }
```
