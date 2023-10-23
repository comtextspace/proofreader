docker-compose -f docker-compose.yml down
docker-compose -f docker-compose.yml up -d --build
docker-compose -f docker-compose.yml web django python manage.py migrate
docker-compose -f docker-compose.yml web django python manage.py collectstatic --force