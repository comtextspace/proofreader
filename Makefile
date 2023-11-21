shell:
	poetry shell

develop:
	docker compose up -d --build

stop:
	docker compose down

logs:
	docker compose logs

test:
	docker compose exec web python manage.py test

rebuild:
	docker compose -f docker-compose.test.yml down
	docker compose -f docker-compose.test.yml up -d --build
	docker compose exec web python3 manage.py migrate
	docker compose exec web python3 manage.py collectstatic --force

rebuild-prod:
	docker compose -f docker-compose.prod.yml down
	docker compose -f docker-compose.prod.yml up -d --build
	docker compose -f docker-compose.prod.yml exec web python3 manage.py migrate
	docker compose -f docker-compose.prod.yml exec web python3 manage.py collectstatic --force

restart-prod:
	docker compose -f docker-compose.prod.yml down
	docker compose -f docker-compose.prod.yml up -d
