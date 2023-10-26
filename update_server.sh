docker-compose -f docker-compose.yml down
docker-compose -f docker-compose.yml up -d --build
docker exec proofreader_web_1 python3 manage.py migrate
docker exec proofreader_web_1 python3 manage.py collectstatic --force