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