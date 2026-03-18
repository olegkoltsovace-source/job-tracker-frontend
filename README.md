# Job Tracker

A full-stack web application for tracking job applications during the job search process.

**Live demo:** https://job-tracker-frontend-oxv7.vercel.app/

---

## Overview

Job Tracker is a CRUD application that lets users manage their job search in one place. Users can register, log in, and track applications through every stage of the hiring process — from initial application to offer or rejection. A statistics dashboard and charts provide an at-a-glance view of the job search pipeline.

---

## Features

- **JWT authentication** — secure register and login with BCrypt password hashing
- **Full CRUD** — create, read, update and delete job applications
- **Status tracking** — Applied, Interviewing, Offer, Rejected, Withdrawn
- **Notes** — add notes to each application visible directly in the dashboard
- **Real-time search and filtering** — filter by company name or status instantly
- **Statistics dashboard** — total applications, wins, losses broken down by status
- **Charts** — visual breakdown of application pipeline
- **Responsive design** — desktop table view and mobile card view

---

## Tech Stack

### Frontend
- Vue 3 (Composition API)
- Vue Router
- Axios
- Vite
- Deployed on Vercel

### Backend
- Java 21 + Spring Boot 3
- Spring Security + JWT
- BCrypt password hashing
- Spring Data JPA + PostgreSQL
- Flyway migrations
- Deployed on Railway

---

## Architecture

```
src/
├── views/
│   ├── Login.vue          # Authentication
│   ├── Register.vue       # Account creation
│   └── Dashboard.vue      # Main application view
├── components/
│   ├── ApplicationForm.vue  # Add / edit modal
│   └── StatsCharts.vue      # Chart components
├── router/
│   └── index.js           # Routes with navigation guard
└── api.js                 # Axios instance with JWT interceptor
```

```
backend/
└── src/main/java/jobtracker/
    ├── controller/
    │   ├── AuthController.java           # Register and login endpoints
    │   └── JobApplicationController.java # CRUD endpoints
    ├── security/
    │   ├── JwtUtil.java        # Token generation and validation
    │   ├── JwtFilter.java      # Request filter
    │   └── SecurityConfig.java # Spring Security configuration
    ├── entity/
    │   ├── User.java
    │   └── JobApplication.java
    └── dto/
        ├── AuthResponseDTO.java
        ├── LoginRequestDTO.java
        └── StatsDTO.java
```

---

## Running Locally

### Backend

```bash
./mvnw spring-boot:run
```

Requires a PostgreSQL database. Set environment variables:

```
PGHOST=localhost
PGPORT=5432
PGDATABASE=your_database
PGUSER=your_username
PGPASSWORD=your_password
JWT_SECRET=your_long_secret_key
CORS_ORIGINS=http://localhost:5173
```

### Frontend

```bash
npm install
npm run dev
```

Requires a `.env` file in the project root:

```
VITE_API_URL=http://localhost:8080
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create account | Public |
| POST | `/api/auth/login` | Login | Public |
| GET | `/api/applications` | Get all applications | Required |
| POST | `/api/applications` | Create application | Required |
| PUT | `/api/applications/{id}` | Update application | Required |
| DELETE | `/api/applications/{id}` | Delete application | Required |
| GET | `/api/applications/stats` | Get statistics | Required |