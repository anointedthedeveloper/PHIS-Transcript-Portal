# Student Transcript Archive
### Peter Harvard International Schools

A full-stack web application to search and view student academic transcripts.

---

## Project Structure

```
ResultPortal/
├── transcripts/        ← JSON transcript files (data source)
├── backend/            ← Node.js + Express API server
│   ├── server.js
│   └── package.json
├── frontend/           ← React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ResultsPage.jsx
│   │   │   └── TranscriptPage.jsx
│   │   ├── components/
│   │   │   └── Header.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

---

## Prerequisites

- Node.js v18+ installed
- npm v9+

---

## How to Run Locally

### 1. Start the Backend

```bash
cd backend
npm install       # only needed first time
npm start
```

The backend will start on **http://localhost:3001**  
It loads all JSON files from `/transcripts` into memory at startup.

### 2. Start the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install       # only needed first time
npm run dev
```

The frontend will start on **http://localhost:5173**

Open your browser at: **http://localhost:5173**

---

## Features

- **Search** by student name (partial, case-insensitive), student ID (exact), or academic year
- **Results list** showing name, ID, and number of terms
- **Transcript view** with all terms, subjects, scores, and grades
- **Download as PDF** — generates a formatted PDF of the transcript
- **Download as JSON** — downloads the raw transcript data
- Responsive, red-themed UI

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search?name=&student_id=&year=` | Search students |
| GET | `/student/:id` | Get full transcript by student_id |

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS 3, React Router v6, html2pdf.js
- **Backend**: Node.js, Express, CORS
