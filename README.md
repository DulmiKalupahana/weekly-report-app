# Weekly Report Generator & Team Dashboard

A full-stack web application that allows team members to submit structured weekly work reports and allows managers to view and analyze those reports across the team through a consolidated dashboard.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios, Recharts
- **Backend:** Node.js, Express
- **Database:** MongoDB (via Mongoose)
- **Auth:** JWT (JSON Web Tokens), bcryptjs for password hashing

## Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended) and npm
- [MongoDB](https://www.mongodb.com/try/download/community) installed locally, **or** a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster

---

## 1. Installing Dependencies

Clone the repository and install dependencies for both the frontend and backend.

```bash
git clone <repository-url>
cd weekly-report-app
```

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

---

## 2. Running the Database

You can use either a local MongoDB instance or a cloud-hosted MongoDB Atlas cluster.

### Option A: Local MongoDB

Start the MongoDB service on your machine:

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

By default, MongoDB will run at `mongodb://localhost:27017`.

### Option B: MongoDB Atlas (cloud)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a database user and whitelist your IP address (or allow access from anywhere for development).
3. Copy the provided connection string — you'll use it as `MONGO_URI` in the next step.

---

## 3. Running the Backend

Create a `.env` file inside the `backend` folder with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/weekly-report-app
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

> Replace `MONGO_URI` with your Atlas connection string if using Option B above.
> `JWT_SECRET` can be any long, random string — it's used to sign authentication tokens.
> `GEMINI_API_KEY` is required for the AI Chat Assistant feature. Get a key from [Google AI Studio](https://aistudio.google.com/apikey). The feature will show a helpful error if the key is missing.

Start the backend server:

```bash
cd backend
npm start
```

If there isn't a `start` script yet, run it directly instead:

```bash
node server.js
```

The API will be available at `http://localhost:5000`, and you should see:

```
MongoDB Connected: <host>
Server running on port 5000
```

---

## 4. Running the Frontend

Create a `.env` file inside the `frontend` folder (optional — only needed if your backend isn't running on the default URL):

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173` (Vite's default port).

---

## Project Structure

```
weekly-report-app/
├── backend/
│   ├── config/         # Database connection setup
│   ├── controllers/    # Route logic (auth, reports, projects)
│   ├── middleware/     # Auth / role-based access middleware
│   ├── models/         # Mongoose schemas (User, Report, Project)
│   ├── routes/         # Express route definitions
│   └── server.js       # App entry point
│
└── frontend/
    ├── src/
    │   ├── api/         # Axios instance & API calls
    │   ├── components/  # Reusable UI components
    │   ├── pages/       # Page-level components (report page, dashboard, etc.)
    │   └── ...
    └── vite.config.js
```

## Features

- **Authentication & Roles:** Registration, login/logout, and role-based access control for Team Members and Managers.
- **Personal Weekly Reports:** Fixed-format report creation, editing, and history, organized by week.
- **Team Dashboard:** Manager view with filters by team member, project, and date range, plus submission status tracking.
- **Projects/Categories:** Create, edit, and delete work categories to tag reports.
- **Visual Insights:** Charts for task trends, submission status, and workload distribution (built with Recharts).
- **AI Chat Assistant:** Manager-only AI-powered assistant that answers questions about team activity, identifies recurring blockers, and generates weekly summaries — powered by Gemini (Google AI).

---

## AI Chat Assistant — Approach & Architecture

The AI Chat Assistant is a manager-only feature that provides conversational access to team report insights using Google's Gemini (`gemini-2.0-flash`).

### How the Context Is Built

Rather than sending raw database rows to the LLM, the backend **pre-aggregates** team data into a compact, structured context:

1. **Recent reports** (last 8 weeks) are fetched from MongoDB and grouped by team member and project.
2. **Recurring blockers** are detected by finding blocker text that appears across ≥ 2 different weeks, along with the affected team members.
3. **Workload signals** are computed: total hours per person per week, report counts per project.
4. **Project stats** include report volume per project over the time window.

This aggregated context is sent as a structured JSON summary in the system prompt, keeping token usage low (typically < 2K tokens of context regardless of database size).

### Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/assistant/chat` | Conversational chat — accepts `{ message, conversationHistory }` |
| `GET` | `/api/assistant/summary` | Auto-generates a weekly team summary (no user question needed) |

Both endpoints require authentication (`protect` middleware) **and** manager role (`managerOnly` middleware).

### Data-Privacy Implementation

The following safeguards are implemented in code — not just documented:

- **No emails or passwords** are ever sent to the LLM. The aggregation query uses `.populate('user', 'name')` to select only the `name` field.
- **Report history is capped** at the last 8 weeks (`MAX_REPORT_WEEKS = 8`) to limit both cost and context window usage.
- **Conversation history is trimmed** to the last 20 turns before being sent to the API.
- **Server-side role enforcement** via `protect` + `managerOnly` middleware — not just UI-level hiding.
- **Pre-aggregation** ensures no raw database rows (with ObjectIds, timestamps, etc.) leak into the prompt.

### Setting Up the API Key

1. Get an API key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Add `GEMINI_API_KEY=your_key_here` to `backend/.env`.
3. Restart the backend server.

If you want a quick local manager test account, run `node seed-manager.js` from the backend folder to create one.

If the key is missing, the endpoints return a clear `500` error message rather than crashing.

---

## Troubleshooting

- **`MongoDB Connected` error on backend start:** Confirm MongoDB is running and `MONGO_URI` in `backend/.env` is correct.
- **Frontend can't reach the API:** Confirm the backend is running on port 5000 and `VITE_API_URL` (if set) matches it.
- **401/403 errors after login:** Ensure `JWT_SECRET` is set in `backend/.env` before generating any tokens (restart the backend after changing it).
- **AI Assistant returns "GEMINI_API_KEY is not configured":** Add your Gemini API key to `backend/.env` and restart the server.