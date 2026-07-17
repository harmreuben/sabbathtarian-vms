from .base import *
import os

DEBUG = False
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='').split(',')

# In the cloud, Render provides a DATABASE_URL. We parse it here.
# If running locally without Docker, it falls back to SQLite.
if 'DATABASE_URL' in os.environ:
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.config(default=os.environ['DATABASE_URL'])
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Allow the Render Frontend URL to talk to the Backend
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    config('FRONTEND_URL', default='http://localhost:5173'),
]

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True