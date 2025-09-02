# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Proofreader is a Django-based collaborative text digitization and proofreading platform. The system processes PDF books by splitting them into pages, extracting text using OCR (pytesseract), and providing a workflow for collaborative proofreading.

**Tech Stack:**
- Python 3.10+ with Django 4.1+
- PostgreSQL database with multi-schema organization
- Redis for caching
- RabbitMQ as message broker
- Celery for async task processing
- Docker + Docker Compose for containerized deployment
- Poetry for Python dependency management
- Pre-commit hooks for code quality

## Essential Development Commands

### Local Development
```bash
# Start development environment with Docker
make rebuild

# Stop all services
make stop

# View logs
make logs

# Access Django shell
docker compose -f docker-compose.dev.yml exec web python manage.py shell

# Create superuser
make create
```

### Testing
```bash
# Run all tests
make test

# Run specific test
docker compose exec web python manage.py test books.tests.TestSpecificCase
```

### Database Operations
```bash
# Run migrations
docker compose -f docker-compose.dev.yml exec web python3 manage.py migrate

# Create new migration
docker compose -f docker-compose.dev.yml exec web python3 manage.py makemigrations

# Compile translations
docker compose -f docker-compose.dev.yml exec web python3 manage.py compilemessages

# Collect static files
docker compose -f docker-compose.dev.yml exec web python3 manage.py collectstatic --force
```

### Code Quality
```bash
# Format code with Black (line length 120)
poetry shell
black . --line-length 120

# Sort imports with isort
isort .

# Run flake8 linting
flake8 .

# Run pre-commit hooks
pre-commit run --all-files
```

### Celery Task Management
```bash
# Monitor active tasks
docker compose exec celery_worker celery -A taskapp.celery:app inspect active

# Purge all tasks
docker compose exec celery_worker celery -A taskapp.celery:app purge
```

## Architecture Overview

### Core Applications

**books/** - Main application for book and page management
- `models.py`: Core entities (Author, Book, Page) with django-lifecycle hooks
- `tasks.py`: Celery tasks for PDF processing and OCR text extraction
- `services/`: Business logic modules
  - `pdf_actions.py`: PDF splitting functionality
  - `image_actions.py`: OCR and image processing
  - `book_export.py`: Export functionality
- `managers.py`: Custom QuerySet for Page model
- Page status workflow: PROCESSING → READY → IN_PROGRESS → FORMATTING → CHECK → DONE

**accounts/** - User management with custom authentication
- `models.py`: CustomUser model with admin role detection, UserSettings, Assignment, PageStatus
- Assignment system maps users to specific page ranges for proofreading
- PageStatus model links workflow statuses to permission groups

**core/** - Shared utilities and base classes
- `base_classes/`: Abstract models, serializers, views, and admin classes
- `templatetags/`: Custom template tags for i18n and admin customization
- `admin_filter.py`: Custom admin filters
- `admin_utils.py`: Admin interface utilities

### Key Architectural Patterns

**Lifecycle Hooks**: Automatic task triggering via django-lifecycle
- Book with PDF triggers `split_pdf_to_pages_task` on creation
- Page with image triggers `extract_text_from_image_task` on creation

**Async Processing**: Celery handles computationally expensive operations
- PDF to images conversion with configurable page limits
- OCR text extraction with retry logic and exponential backoff
- Task results stored in django_celery_results

**Multi-schema Database**: PostgreSQL with schema separation
- All book-related tables use `"book"` schema
- Custom table names maintain data organization

**Environment Detection**:
- `LOCAL_DEVELOP`: Detected via runserver/pydevconsole - tasks run synchronously
- `DEBUG=True`: Docker development with full async processing
- Production: `DEBUG=False` with Sentry integration

### API Structure
- RESTful API with Django REST Framework at `/api/v1/`
- JWT authentication via djangorestframework-simplejwt
- Swagger documentation with drf-yasg
- Separate URL routing: `api_urls.py` for API endpoints

### Deployment Configuration
- GitHub Actions CI/CD pipeline (`.github/workflows/deploy.yml`)
- Docker images hosted on GitHub Container Registry
- Separate compose files for dev (`docker-compose.dev.yml`) and prod (`docker-compose.prod.yml`)
- Nginx for static file serving and reverse proxy

### Important Configuration
- `pyproject.toml`: Poetry dependencies, Black/isort configuration
- `.pre-commit-config.yaml`: Code quality hooks
- `proofreader/settings.py`: Django settings with environment-based configuration
- `taskapp/celery.py`: Celery configuration and task discovery