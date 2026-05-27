# Inventory Dashboard — Backend (Spring Boot)

REST API for the Inventory Movement Dashboard. Exposes endpoints to serve filtered stock movement data and to validate + ingest uploaded JSON files via SHA-256 verification.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Java | 17+     |
| Maven | 3.8+   |

---

## Getting Started

```bash
# Clone the repo
git clone <your-backend-repo-url>
cd inventory-dashboard-backend

# Build & run
./mvnw spring-boot:run
```

The server starts on **http://localhost:8080**.

---

## API Reference

### `GET /api/movements`

Returns filtered stock movements from the current backend dataset.

| Query Param | Type   | Required | Description                        |
|-------------|--------|----------|------------------------------------|
| `from`      | string | Yes      | Start date `YYYY-MM-DD` (inclusive) |
| `to`        | string | Yes      | End date `YYYY-MM-DD` (inclusive)   |
| `type`      | string | No       | `IN`, `OUT`, or omit for all        |
| `warehouse` | string | No       | Warehouse code, e.g. `WH-NORTH`    |

**Example:**
```
GET /api/movements?from=2026-01-01&to=2026-06-30&type=IN&warehouse=WH-NORTH
```

---

### `POST /api/verify-file`

Validates the SHA-256 digest of an uploaded JSON file, then persists it as the new dataset.

**Content-Type:** `multipart/form-data`

| Field    | Type   | Description                                      |
|----------|--------|--------------------------------------------------|
| `file`   | File   | The JSON movements file                          |
| `sha256` | string | Hex SHA-256 digest computed by the frontend       |

**Success response (`200`):**
```json
{
  "valid": true,
  "message": "File verified and loaded successfully.",
  "count": 10000,
  "movements": [ ... ]
}
```

**Failure response (`400`):**
```json
{
  "valid": false,
  "message": "SHA-256 digest mismatch. The file may be corrupted or tampered."
}
```

---

### `GET /api/warehouses`

Returns the sorted list of distinct warehouse codes in the current dataset. Used to populate the warehouse dropdown.

---

## Data Flow

```
Startup
  └─► Load movements.json from classpath (seed data)

POST /api/verify-file
  └─► Recompute SHA-256 from uploaded bytes
  └─► Compare with frontend digest
  └─► If valid: parse JSON → write movements_data.json (working dir)
  └─► All subsequent GET /api/movements reads movements_data.json

GET /api/movements
  └─► Reads movements_data.json (if present) OR classpath movements.json
  └─► Applies date / type / warehouse filters
  └─► Returns filtered list
```

---

## Running Tests

```bash
./mvnw test
```

Tests cover:
- Seed data loading
- SHA-256 success / failure
- Movement type filtering
- Date range filtering

---

## Trade-offs & Notes

- **In-process persistence**: Uploaded data is written to `movements_data.json` in the working directory. A production system would use a database.
- **No auth**: CORS is open (`*`) for local dev convenience; lock this down in production.
- **No pagination on backend**: Pagination is handled client-side for simplicity; at large scale, move it server-side.
- **Java 17**: Uses `HexFormat` (Java 17+) and records-style pattern. Requires JDK 17 minimum.
