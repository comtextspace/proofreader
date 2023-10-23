docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d --build
docker compose -f docker-compose.dev.yml exec django python manage.py migrate
docker compose -f docker-compose.dev.yml exec django python manage.py collectstatic --force