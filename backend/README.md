# Community Feed - Backend

A Django REST Framework backend for a community feed with threaded discussions and dynamic leaderboard.

## Features

- **Threaded Comments**: Nested comment system using django-mptt for efficient tree queries
- **Gamification**: Karma system (5 points for post likes, 1 point for comment likes)
- **24h Leaderboard**: Dynamic leaderboard showing top 5 users by karma earned in last 24 hours
- **Concurrency Safe**: Atomic transactions prevent double-likes
- **N+1 Prevention**: Optimized queries using select_related and prefetch_related

## Tech Stack

- Django 5.0.1
- Django REST Framework 3.14.0
- django-mptt 0.16.0 (for nested comments)
- SQLite (development)

## Installation

1. Create and activate virtual environment:

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

4. Create superuser:

```bash
python manage.py createsuperuser
```

5. Run development server:

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Posts

- `GET /api/posts/` - List all posts
- `POST /api/posts/` - Create a new post
- `GET /api/posts/{id}/` - Get post with nested comments
- `PUT /api/posts/{id}/` - Update post
- `DELETE /api/posts/{id}/` - Delete post

### Comments

- `GET /api/comments/` - List all comments
- `POST /api/comments/` - Create a comment (with optional parent for threading)
- `GET /api/comments/{id}/` - Get comment details
- `PUT /api/comments/{id}/` - Update comment
- `DELETE /api/comments/{id}/` - Delete comment

### Likes

- `POST /api/likes/like_post/` - Like a post (body: `{"post_id": 1}`)
- `POST /api/likes/like_comment/` - Like a comment (body: `{"comment_id": 1}`)

### Leaderboard

- `GET /api/leaderboard/` - Get top 5 users by 24h karma

## Database Models

### UserProfile

- Extends Django User with karma tracking
- `total_karma`: Cached total karma
- `get_24h_karma()`: Calculate karma from last 24 hours

### Post

- `author`: ForeignKey to User
- `content`: TextField
- `like_count`: Denormalized counter
- `created_at`, `updated_at`: Timestamps

### Comment (MPTT Model)

- `post`: ForeignKey to Post
- `author`: ForeignKey to User
- `parent`: TreeForeignKey to self (for threading)
- `content`: TextField
- `like_count`: Denormalized counter
- MPTT auto-adds: `lft`, `rght`, `tree_id`, `level`

### Like

- GenericForeignKey to support both Posts and Comments
- Unique constraint on (user, content_type, object_id)

### KarmaTransaction

- Logs every karma-earning event with timestamp
- Used for 24h leaderboard calculation
- `amount`: 5 for post likes, 1 for comment likes

## Admin Interface

Access at `http://localhost:8000/admin/`

- View and manage all posts, comments, likes
- Hierarchical comment display using MPTT admin
- Karma transaction history

## Development

### Running Tests

```bash
python manage.py test
```

### Creating Sample Data

```bash
python manage.py shell
# Then run seed_data.py script
```

## Deployment

For production deployment:

1. Set `DEBUG = False` in settings.py
2. Configure `ALLOWED_HOSTS`
3. Use PostgreSQL instead of SQLite
4. Set up proper SECRET_KEY
5. Configure static files serving
6. Use gunicorn: `gunicorn community_feed.wsgi`

## License

MIT
