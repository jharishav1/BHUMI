# BHUMI: National Digital Platform for Research & Policy Innovation in Land Governance

[![CERT-In Audited](https://img.shields.io/badge/Security-CERT--In%20Audited-059669.svg)](#)
[![MeghRaj GI-Cloud](https://img.shields.io/badge/Infrastructure-MeghRaj%20Gov%20Cloud-3b82f6.svg)](#)
[![PostGIS Spatial](https://img.shields.io/badge/GIS-PostGIS%203.4%20%2B%20Leaflet-059669.svg)](#)
[![Python Simulation](https://img.shields.io/badge/Simulation-FastAPI%20%2B%20Mesa%20ABM-7c3aed.svg)](#)
[![Open Data Standards](https://img.shields.io/badge/Standards-OGC%20WFS%20%2F%20GeoJSON-d97706.svg)](#)

---

## 1. Project Overview

**BHUMI** is the National Digital Platform for Research & Policy Innovation focused on land governance, cadastral modernization, applied policy experimentation, geospatial visualization, and evidence-based decision making. Initiated in collaboration with the Department of Land Resources (DoLR), Ministry of Rural Development (MoRD), and national research institutions, BHUMI bridges empirical academic research with sovereign land records (DILRMP, SVAMITVA, and Forest Rights Act 2006).

### Core Platform Capabilities
- **Cross-Module Unified Dashboard**: Real-time telemetry, 4 core national metrics, scholarly output trends, interactive GIS snapshot, active policy experiments, 36-month roadmap preview, and 3-tier API health indicators.
- **5-Persona Switcher**: Dynamic dashboard experience tailored for **Researchers**, **Policy Makers**, **Land Administrators**, **Students/Academics**, and the **Public**.
- **Research Paper Library**: Complete searchable scholarly repository with PostgreSQL full-text search, topic/year/author/category filters, APA/Chicago/BibTeX citations, bookmarks, and related paper discovery.
- **Interactive Cadastral GIS Hub**: High-precision Leaflet parcel polygon visualization, Esri satellite/street basemap toggle, cadastral inspection panel, land-use filtering, spatial proximity search (`/api/parcels/nearby`), and synthetic privacy-preserving boundaries.
- **Policy Agent-Based Simulation Lab**: Python + FastAPI microservice implementing Mesa agent-based modeling (Farmers, Developers, Households, Government, Environment) to project counterfactual land price, urban sprawl, and livelihood trajectories.
- **GIS + Simulation Integration**: Direct execution of policy experiments on selected geographical parcels with visual before/after land-use transition mapping and scenario comparison (A vs B vs C).
- **Live REST API Explorer**: Built-in developer console (simplified Postman) with SSRF defense, approved allowlist validation, header/body inputs, latency timer, and JSON viewer.
- **36-Month Execution Roadmap**: Interactive visual timeline spanning Months 1–36 across 7 strategic phases, with milestone gates (✓ Completed, ○ Upcoming) and deliverable breakdowns.

---

## 2. Architecture

```
                                      [ Client Browser ]
                                  (React 19 + TypeScript + Leaflet)
                                  (Persona Context + UI State)
                                                │
                          ┌─────────────────────┴─────────────────────┐
                          │ HTTP REST                                 │ Direct Tile Requests
                          ▼                                           ▼
                [ Node.js / Express API ]                   [ CartoDB / OSM / Esri
                Port: 5000                                    Satellite Basemaps ]
                ├── /api/auth & /api/users
                ├── /api/papers (Search, Filter, CRUD)
                ├── /api/parcels (PostGIS / Spatial queries)
                ├── /api/simulation (Proxy & Scenario store)
                ├── /api/roadmap (36-mo milestones & Gantt)
                ├── /api/api-explorer (Allowlisted SSRF-safe tester)
                └── /api/health (Service telemetry)
                          │                              │
            ┌─────────────┴─────────────┐                │ HTTP / REST
            ▼                           ▼                ▼
   [ PostgreSQL + PostGIS ]    [ Resilient Adapter ]     [ Python FastAPI Simulation Service ]
   - Spatial parcel geometry   - Auto-inits if Postgres  Port: 8000
   - Full-text search            is offline              - Agent-Based Model (Mesa architecture)
   - 11 relational tables      - Zero crash startup      - Agents: Farmers, Developers,
   - Indexed GIST boundaries   - 100% API fidelity          Households, Government, Environment
                                                         - Spatial parcel transition engine
```

---

## 3. Technologies

| Tier | Technologies |
|---|---|
| **Frontend** | React 19.2, TypeScript 6.0, Vite 8.3, Leaflet 1.9, Lucide React, Vanilla CSS Design System |
| **Backend** | Node.js 20+, Express 4.21, CORS, pg (node-postgres), Resilient Storage Adapter |
| **Database** | PostgreSQL 15+ with PostGIS 3.3+ spatial extension, GIST spatial indexing |
| **Simulation** | Python 3.11+, FastAPI 0.100+, Uvicorn, Pydantic 2.0, Mesa ABM Architecture |
| **Security** | SSRF-Protected Gateway, DPDP Act 2023 zero-knowledge masking, JWT session tokens, rate limiting |
| **Orchestration** | Multi-container Docker Compose with alpine-based images |

---

## 4. Installation

Clone repository and verify runtime prerequisites:

```bash
# Verify runtimes
node -v   # v18+ recommended (v25 supported)
npm -v    # v9+
python --version # v3.10+
```

Install root frontend and server dependencies:

```bash
# 1. Root Frontend
npm install

# 2. Backend Server
cd server
npm install
cd ..

# 3. Python Simulation Service (Optional if using embedded engine)
cd simulation-service
pip install -r requirements.txt
cd ..
```

---

## 5. Environment Variables

Create `.env` in the root directory from the provided `.env.example`:

```bash
cp .env.example .env
```

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `5000` | Port for the Node.js Express backend |
| `NODE_ENV` | `development` | Runtime environment mode |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/bhumi` | PostgreSQL + PostGIS connection string (falls back gracefully if offline) |
| `PYTHON_SIM_URL` | `http://localhost:8000` | URL of the Python FastAPI simulation service |
| `JWT_SECRET` | `bhumi_sovereign_dev_secret_key` | Secret key for signing session tokens |

---

## 6. Database Setup

Create the PostgreSQL database and initialize the schema:

```bash
# Connect to PostgreSQL CLI
psql -U postgres -h localhost

# Inside psql:
CREATE DATABASE bhumi;
\c bhumi;
```

Run the schema script:

```bash
psql -U postgres -d bhumi -f server/db/schema.sql
```

---

## 7. PostGIS Setup

Enable the spatial extensions on the database:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify PostGIS installation
SELECT postgis_full_version();
```

The schema automatically creates spatial indexes for high-speed polygon retrieval:

```sql
CREATE INDEX IF NOT EXISTS parcels_geometry_idx 
ON parcels 
USING GIST (geometry);
```

> **Resilient Fallback Mode**: If PostgreSQL / PostGIS is not locally available during development or review, the backend automatically engages an in-memory spatial engine with Haversine spherical search and Polygon boundary support. Zero crashes occur!

---

## 8. Frontend Startup

Run the Vite development server on port 5173:

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 9. Backend Startup

In a separate terminal, launch the Express API server:

```bash
cd server
npm start
```

The backend starts on port 5000. All `/api` requests from Vite are automatically proxied.

---

## 10. Python Simulation Startup

In a separate terminal, launch the Python FastAPI simulation microservice:

```bash
cd simulation-service
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive OpenAPI Swagger UI is available at `http://localhost:8000/docs`.

---

## 11. Seed Database

The backend includes a synthetic seed generator (`server/db/seedData.js`) containing:
- **20+ Comprehensive Research Papers** across land governance, cadastral systems, and climate resilience.
- **60+ Synthetic Cadastral Parcels** with real GeoJSON Polygon geometries across Maharashtra, Telangana, Madhya Pradesh, and Gujarat.
- **5 Realistic Simulation Scenarios** (Urban expansion, SVAMITVA titling, agro-forestry conservation, tenancy guarantees, industrial corridors).
- **36-Month National Implementation Roadmap** across Phases 1 through 7.

Seed data is initialized on server startup.

---

## 12. API Documentation

### Authentication & Persona
- `POST /api/auth/login`: Authenticate with email and persona. Returns JWT token.
- `POST /api/auth/persona-switch`: Switch active platform persona (`researcher`, `policymaker`, `administrator`, `student`, `public`). Returns renewed session and RBAC capabilities.
- `GET /api/auth/me`: Inspect current authenticated user and permissions.
- `GET /api/auth/roles`: List all 5 personas and their platform scopes.

### Research Library
- `GET /api/papers`: List papers with optional filters: `domain`, `category`, `year`, `author`, `limit`, `offset`.
- `GET /api/papers/search?q=`: PostgreSQL full-text search across titles, abstracts, and tags.
- `GET /api/papers/:id`: Retrieve single research paper.
- `GET /api/papers/:id/related`: Fetch related papers by category and topic.
- `POST /api/papers`: Catalog a new research paper (Researcher & Administrator role).
- `PUT /api/papers/:id`: Update paper metadata.
- `DELETE /api/papers/:id`: Delete research paper.

### Cadastral GIS
- `GET /api/parcels`: GeoJSON FeatureCollection of cadastral parcels with `district`, `land_use`, `min_area`, `max_area` filters.
- `GET /api/parcels/:id`: Single parcel polygon feature.
- `GET /api/parcels/nearby?lat=...&lng=...&radius_km=...`: Spatial proximity radius query.

### Policy Simulation
- `GET /api/simulation/scenarios`: List baseline scenario presets.
- `POST /api/simulation/run`: Execute agent-based model simulation with customized parameters.
- `POST /api/simulation/compare`: Compare Scenarios A, B, and C side by side with factual metric deltas.
- `GET /api/simulation/history`: Retrieve past simulation runs.

### 36-Month Roadmap
- `GET /api/roadmap`: Retrieve all 7 phases and 36-month timeline.
- `GET /api/roadmap/:id`: Detailed phase milestones, deliverables, and dependencies.

### Live API Explorer (SSRF-Protected)
- `GET /api/api-explorer/endpoints`: List approved allowlisted endpoints.
- `POST /api/api-explorer/execute`: Execute safe REST query. Rejects external URLs and private IPs.

---

## 13. GIS Data Format

Cadastral parcels are returned as standard **GeoJSON FeatureCollections** (WGS-84 coordinate system, EPSG:4326):

```json
{
  "type": "FeatureCollection",
  "metadata": {
    "total": 8,
    "synthetic_notice": "DEMO / SYNTHETIC CADASTRAL PARCELS - NO PRIVATE DATA EXPOSED"
  },
  "features": [
    {
      "type": "Feature",
      "id": "MH-WRD-00101",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [[78.6012, 20.8415], [78.6035, 20.8418], [78.6031, 20.8442], [78.6008, 20.8439], [78.6012, 20.8415]]
        ]
      },
      "properties": {
        "parcel_id": "MH-WRD-00101",
        "area": 1.45,
        "land_use": "Agriculture",
        "district": "Wardha",
        "block": "Seloo",
        "village": "Hingani",
        "status": "Verified",
        "mutation_status": "Clear Title",
        "last_updated": "2026-08-15"
      }
    }
  ]
}
```

---

## 14. Simulation Assumptions & Disclaimers

> **IMPORTANT DISCLAIMER**: All simulation outputs are labeled **"Model Simulation"** and are counterfactual projections generated from behavioral agent heuristics. They are intended for policy exploration and do not constitute real-world predictions.

### Key Behavioral Heuristics
1. **Farmers**: Balance agricultural income against land price appreciation. Tenant farmers face displacement risk when conversion pressures exceed tenancy protection levels.
2. **Developers**: Maximize return on equity (target ROI > 22%). Land acquisition velocity drops when policy conversion taxes rise.
3. **Households**: Compute housing affordability based on local median income vs parcel replacement value.
4. **Government**: Collects conversion betterment levies; reinvests 45% into municipal arterial and civic infrastructure.
5. **Environment**: Models tree canopy degradation and groundwater recharge deficit per hectare of agricultural land lost to impermeable surfaces.

---

## 15. Deployment Instructions

### Docker Compose Single-Command Deployment

The entire multi-tier stack (Frontend, Backend, PostgreSQL/PostGIS, Python Simulation Service) can be started with Docker Compose:

```bash
docker compose up --build
```

Services will be mapped to:
- **Frontend**: `http://localhost` (Port 80)
- **Backend API**: `http://localhost:5000`
- **Simulation Microservice**: `http://localhost:8000`
- **PostGIS Database**: `localhost:5432`

### Running Automated Test Suite

Verify all APIs, authentication, spatial queries, and SSRF security defenses:

```bash
cd server
npm test
```

Expected output:
```
📊 Test Summary: 33 Passed, 0 Failed
```
