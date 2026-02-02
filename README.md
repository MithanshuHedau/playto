# Community Feed Prototype

A full-stack Reddit-like community feed with threaded comments, gamification (Karma), and a dynamic 24-hour leaderboard.

**Tech Stack:**

- **Backend:** Django 5, DRF (Django Rest Framework)
- **Frontend:** React, Vite, Tailwind CSS
- **Database:** SQLite (default for prototype)

## Features

- **The Feed:** View posts with like counts.
- **Threaded Comments:** Infinite nesting of comments and replies (like Reddit).
- **Gamification:**
  - 5 Karma for a Post Like.
  - 1 Karma for a Comment Like.
  - Dynamic leaderboard showing top users from the last 24 hours.
- **Efficient:** Optimized to prevent N+1 query problems using `django-mptt` and `prefetch_related`.
- **Dynamic User Entry:** Create posts and comments by simply entering a username (no specialized auth required for this prototype).

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+

### 1. Backend Setup

Open a terminal in the root directory:

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Mac/Linux
# source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The backend API will run at `http://localhost:8000`.

### 2. Frontend Setup

Open a **new** terminal in the root directory:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173` (or `5174` if 5173 is busy).

### 3. Docker (Alternative)

Run the entire application with a single command:

```bash
docker-compose up --build
```

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`

## API Endpoints

- `GET /api/posts/` - List all posts
- `POST /api/posts/` - Create a new post
- `POST /api/comments/` - Create a comment or reply
- `POST /api/likes/like_post/` - Like a post
- `POST /api/likes/like_comment/` - Like a comment
- `POST /api/likes/unlike_post/` - Unlike a post
- `POST /api/likes/unlike_comment/` - Unlike a comment
- `GET /api/leaderboard/` - Get top 5 users (last 24h karma)
- `POST /api/get-or-create-user/` - Get/Create user by username
