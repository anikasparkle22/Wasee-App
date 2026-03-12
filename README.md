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