# Wasee-App

A ride-sharing platform with a React front-end and a **Node.js / Express REST API** backed by **Redis** for real-time driver matching.

---

## API – quick start

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 18 |
| Redis | ≥ 6 |

### 1 – Clone & install

```bash
git clone https://github.com/anikasparkle22/Wasee-App.git
cd Wasee-App
npm install
```

### 2 – Configure environment

```bash
cp .env.example .env
# Edit .env if your Redis runs on a non-default host/port
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port the server listens on |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Redis connection string |
| `MATCH_RADIUS_KM` | `5` | Radius (km) used for automatic driver matching |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed browser origin(s). Comma-separate multiple values (e.g. `https://app.wasee.com,https://driver.wasee.com`). Use `*` to allow all origins during testing only. |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate-limit window in milliseconds (default: 1 minute) |
| `RATE_LIMIT_MAX` | `100` | Maximum requests per IP per window |

### 3 – Start Redis

```bash
# macOS (Homebrew)
brew services start redis

# Linux (systemd)
sudo systemctl start redis

# Or run directly
redis-server
```

### 4 – Run the server

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3000`.

---

## API reference

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness check |

---

### Drivers

#### Register / update driver location
`POST /drivers/:id/location`

```json
{
  "longitude": 36.3,
  "latitude": 33.5,
  "name": "Ahmad",
  "vehicle": "Toyota Corolla"
}
```

#### Remove driver from available pool
`DELETE /drivers/:id/location`

#### Find nearby available drivers
`POST /drivers/nearby`

```json
{ "longitude": 36.3, "latitude": 33.5, "radiusKm": 5 }
```

Location coordinates are sent in the request body (not in the URL) to prevent them appearing in server access logs.

#### Get driver info
`GET /drivers/:id`

---

### Rides

#### Request a ride (auto-matches nearest driver)
`POST /rides`

```json
{
  "riderId": "rider-001",
  "pickupLng": 36.30,
  "pickupLat": 33.50,
  "dropoffLng": 36.35,
  "dropoffLat": 33.52
}
```

Response `status` is `matched` when a driver was found, or `pending` when none are available.

#### Get ride details
`GET /rides/:id`

#### Driver manually accepts a pending ride
`PUT /rides/:id/accept`

```json
{ "driverId": "driver-001" }
```

#### Update ride status
`PUT /rides/:id/status`

```json
{ "status": "in_progress" }
```

Allowed values: `pickup` → `in_progress` → `completed` | `cancelled`.  
When a ride is `completed` or `cancelled` the driver is automatically returned to the available pool.

**Valid state transitions:**

| Current status | Allowed next statuses |
|---|---|
| `matched` | `pickup`, `cancelled` |
| `pickup` | `in_progress`, `cancelled` |
| `in_progress` | `completed`, `cancelled` |
| `completed` | *(terminal – no further updates)* |
| `cancelled` | *(terminal – no further updates)* |

Attempting an invalid transition returns `409 Conflict`.

---

## Redis data model

| Key | Type | Description |
|---|---|---|
| `geo:drivers:available` | GEO set | Members `driver:<id>` scored by lat/lng |
| `driver:<id>:info` | Hash | Driver metadata + availability flag |
| `ride:<id>` | Hash | Full ride request record |
| `rides:pending` | List | IDs of rides waiting for a driver |

---

## Running tests

```bash
# Uses Redis database index 1 (isolated from production data)
npm test
```

---

## Real-world / field testing checklist

Before handing the server to real drivers and riders, complete the following steps:

1. **Set a real Redis URL** – point `REDIS_URL` at a persistent Redis instance (not `127.0.0.1`).  
   Use Redis AUTH (`redis://:password@host:port`) or a TLS URL (`rediss://`) for security.

2. **Set your frontend URL(s) in `CORS_ORIGIN`** – replace the localhost default with the actual
   origin(s) of your rider app and driver app:
   ```
   CORS_ORIGIN=https://rider.wasee.app,https://driver.wasee.app
   ```

3. **Tune `MATCH_RADIUS_KM`** – start with `5` for dense urban areas; increase for rural zones.

4. **Run behind HTTPS** – place the server behind a TLS-terminating reverse proxy (nginx, Caddy, or
   a cloud load-balancer) so that rider and driver locations are never sent in plain text.

5. **Verify the health endpoint** – hit `GET /health` from the device network before your test
   session to confirm the server is reachable and Redis is connected.

6. **Monitor the pending rides queue** – the `rides:pending` Redis list accumulates ride IDs that
   have not yet been matched; inspect it with `redis-cli lrange rides:pending 0 -1` during testing
   to confirm the queue stays clean.