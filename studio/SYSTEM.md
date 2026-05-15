# Radbit SME Hub: System Architecture

This document provides a high-level overview of the Radbit SME Hub's system structure, components, and data flow.

```mermaid
graph TD
    subgraph "Frontend (Next.js / React)"
        A[Marketing Pages] --> B{App Shell};
        C[Authentication Pages] --> B;
        B --> D[Dashboard & Agent Control Center];
        B --> E[Assessment];
        B --> F[AI Toolkit];
        B --> G[Tenders & News];
        B --> H[Community Forum];
        B --> I[Settings];
    end

    subgraph "Backend (Firebase & Genkit)"
        M[Firebase Auth]
        N[Firestore Database]
        O[Genkit AI Flows & Agents]
        P[Firebase Security Rules]
    end

    subgraph "AI Services (Google AI)"
        Q[Gemini 2.0 Flash]
        R[Gemini Image Generation]
    end
    
    subgraph "AI Agent Workforce"
        S[Engineering Agents]
        T[Design Agents]
        U[Marketing Agents]
        V[Sales Agents]
        W[Support Agents]
        X[Data Analyst Agent]
    end

    %% Frontend to Backend Connections
    C -- "Sign-Up / Sign-In" --> M;
    B -- "Get Auth State" --> M;

    D -- "Read Assessment & Manage Agents" --> N;
    E -- "Write Assessment" --> N;
    H -- "Read/Write Threads & Replies" --> N;
    I -- "Read/Write User Profile" --> N;
    
    %% AI Connections
    F -- "Generate Insights" --> O;
    D -- "Deploy/Instruct Agents" --> O;
    O -- "Execute Tasks" --> S;
    O -- "Execute Tasks" --> T;
    O -- "Execute Tasks" --> U;
    O -- "Execute Tasks" --> V;
    O -- "Execute Tasks" --> W;
    O -- "Execute Tasks" --> X;
    
    S -- "Call LLM" --> Q;
    T -- "Call Image Model" --> R;
    U -- "Call LLM" --> Q;
    V -- "Call LLM" --> Q;
    W -- "Call LLM" --> Q;
    X -- "Call LLM" --> Q;
    
    
    %% Backend Services
    N -- "Is Protected By" --> P;
    M -- "Provides UID for" --> P;
    
    classDef frontend fill:#D1E8E2,stroke:#4A6C6F,stroke-width:2px;
    classDef backend fill:#E8D1D1,stroke:#6F4A4A,stroke-width:2px;
    classDef ai fill:#D1D1E8,stroke:#4A4A6F,stroke-width:2px;
    classDef agent fill:#F5E8DD,stroke:#8A6D3B,stroke-width:2px;

    class A,B,C,D,E,F,G,H,I frontend;
    class M,N,O,P backend;
    class Q,R ai;
    class S,T,U,V,W,X agent;
```

---

## Component Breakdown

### **Frontend (Next.js)**

-   **`src/app`**: Contains all pages and layouts.
    -   **`Dashboard & Agent Control Center`**: The central hub for users to get an overview, manage their deployed AI agents, and view results.
    -   Other pages remain as they are, serving core functionalities like Assessment, Community, etc.

### **Backend & AI (Firebase & Genkit)**

-   **Firebase Auth & Firestore**: Continue to manage user identity, profiles, and application data.
-   **`src/ai/flows`**: Contains all Genkit AI flows. This layer is expanded to become the **AI Agent Orchestrator**. It defines the core logic for each type of agent (e.g., `codeGeneratorAgent`, `contentCreatorAgent`) and manages their execution. Each agent is a specialized flow that may use one or more tools or prompts to accomplish its task.
-   **AI Agent Workforce**: This is a conceptual layer representing the specialized AI agents. Each agent (e.g., `Engineering Agent`) is a collection of Genkit flows and tools designed for a specific business function. They are invoked by the orchestrator in response to user requests from the dashboard.
