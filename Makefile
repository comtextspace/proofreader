shell:
	poetry shell

develop:
	docker-compose up -d --build

stop:
	docker-compose down

logs:
	docker-compose logs

test:
	docker-compose exec web python manage.py test
	
create:
	docker exec -it proofreader-web-1 python3 manage.py createsuperuser

rebuild:
	docker-compose -f docker-compose.yml down
	docker-compose -f docker-compose.yml up -d --build
	docker-compose exec web python3 manage.py migrate
	docker-compose exec web python3 manage.py collectstatic --force