# Inventory Dashboard — Frontend (React)

Single-page React application for the Inventory Movement Dashboard. Handles JSON file uploads, SHA-256 verification (in-browser), filtered data display, and visualizations.

---

## Prerequisites

| Tool | Version  |
|------|----------|
| Node | 18+      |
| npm  | 9+       |

---

## Getting Started

```bash
# Clone the repo
git clone <your-frontend-repo-url>
cd inventory-dashboard-frontend

# Install dependencies
npm install

# Start development server
npm start
```

The app opens at **http://localhost:3000**.

> The `proxy` field in `package.json` forwards all `/api/*` requests to `http://localhost:8080`, so the Spring Boot backend must be running concurrently.

---

## Environment Variables

| Variable           | Default                  | Description                    |
|--------------------|--------------------------|--------------------------------|
| `REACT_APP_API_URL` | `` (uses proxy)         | Override backend base URL      |

Create a `.env` file in the project root to set these:
```
REACT_APP_API_URL=http://localhost:8080
```

---

## Features

### JSON Upload & SHA-256 Verification
- Drag-and-drop or click-to-browse for `.json` files
- SHA-256 digest computed **in the browser** using the Web Crypto API (no libraries needed)
- Digest + file sent together to `POST /api/verify-file`
- Backend recomputes hash and compares — mismatch returns a clear error state
- Displays the computed hex digest for transparency

### Filters Panel
- **Date range** (from / to) — required fields
- **Movement type** — All / IN / OUT
- **Warehouse** — dropdown populated from `GET /api/warehouses`

### Stock Movements Table
- Paginated: 10 rows per page
- Columns: Date/Time, ID, SKU, Type (badge), Quantity, Warehouse
- Respects all active filters

### Pie Chart — IN vs OUT Split
- Shows total quantity IN vs OUT as a donut chart
- Includes stat cards with exact totals and percentages

### Time-Series Area Chart
- X-axis: only dates present in filtered data (no empty gaps)
- Y-axis: total quantity per day
- Separate area series for IN (green) and OUT (red)

---

## Project Structure

```
src/
├── components/
│   ├── FileUploader.jsx    # Drag-drop upload + SHA-256 flow
│   ├── FiltersPanel.jsx    # Date / type / warehouse filters
│   ├── MovementsTable.jsx  # Paginated table
│   ├── InOutPieChart.jsx   # Donut chart
│   └── TimeSeriesChart.jsx # Area chart
├── utils/
│   ├── api.js              # Backend API calls
│   └── sha256.js           # Web Crypto SHA-256 helper
├── App.jsx                 # Root component & layout
├── App.css                 # Global styles
└── index.js                # ReactDOM entry point
```
