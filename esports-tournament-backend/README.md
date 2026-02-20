# ⚙️ Esports Tournament Hub - Backend API

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)](https://sequelize.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)

A robust, production-ready RESTful API and WebSocket server designed to power the Esports Tournament Hub. This backend handles complex scoring logic, real-time leaderboard synchronization, and secure multi-tenant organization management.

## ✨ Core Features

-   **🔐 Enterprise Auth:** Dual authentication system supporting standard JWT and Google OAuth 2.0.
-   **🏢 Multi-Tenancy:** Siloed data management for different esports organizations.
-   **⚡ Real-Time Engine:** Live updates for match statuses and leaderboards via Socket.io.
-   **🧮 Dynamic Scoring:** Highly configurable rulesets for different games (PUBG, BGMI, Free Fire, etc.).
-   **🚀 Performance Architecture:** Redis-backed caching for high-traffic leaderboard endpoints.
-   **🛡️ Security First:** Implements Helmet.js, CORS, rate limiting, and comprehensive input validation.
-   **📊 Automated Standings:** Instant points calculation and ranking logic on match result submission.

## 🚀 Tech Stack

-   **Runtime:** Node.js (ES Modules)
-   **Framework:** Express.js
-   **Database:** PostgreSQL with Sequelize ORM
-   **Cache:** Redis (ioredis)
-   **Real-time:** Socket.io
-   **Security:** JWT, Bcrypt, Helmet
-   **Validation:** Express-Validator

## 🛠️ Installation & Setup

1.  **Clone and Navigate:**
    ```bash
    git clone https://github.com/digeesh038/esports-table-maker-backend.git
    cd esports-table-maker-backend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory:
    ```env
    PORT=5000
    NODE_ENV=development
    
    # Database
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=esports_db
    DB_USER=postgres
    DB_PASSWORD=your_password
    
    # Secrets
    JWT_SECRET=your_super_secret_key
    GOOGLE_CLIENT_ID=your_google_client_id
    
    # Redis (Optional but recommended)
    REDIS_URL=redis://localhost:6379
    ```

4.  **Launch Server:**
    ```bash
    # Development mode
    npm run dev
    
    # Production mode
    npm start
    ```

## 📡 Primary API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Standard login
- `POST /api/auth/google` - Google OAuth authentication

### Tournaments & Stages
- `GET /api/tournaments` - List all tournaments
- `POST /api/tournaments` - Create new tournament
- `POST /api/tournaments/:id/stages` - Add stage to tournament

### Leaderboards
- `GET /api/leaderboard/tournament/:id` - Get full tournament standings
- `GET /api/leaderboard/stage/:id` - Get specific stage standings

## 🔌 WebSocket Events

| Event | Type | Description |
| :--- | :--- | :--- |
| `match:update` | Emit | Broadcasts match status changes |
| `leaderboard:refresh` | Emit | Triggers UI refresh for live standings |
| `join:tournament` | Listen | Joins a specific tournament room |

## 📂 Architecture

```text
src/
├── config/         # Database and third-party configs
├── controllers/    # Request handling logic
├── middlewares/    # Auth, validation, and error handlers
├── models/         # Sequelize database schemas
├── routes/         # Express route definitions
├── services/       # Core business logic (Scoring, Leaderboards)
├── utils/          # Shared utility functions
└── server.js       # Application entry point
```

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
Developed for high-stakes competitive gaming. 🚀
