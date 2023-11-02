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

rebuild:
	docker-compose -f docker-compose.yml down
	docker-compose -f docker-compose.yml up -d --build
	docker-compose exec web python3 manage.py migrate
	docker-compose exec web python3 manage.py collectstatic --force

rebuild-prod:
	sudo docker-compose -f docker-compose.prod.yml down
	sudo docker-compose -f docker-compose.prod.yml up -d --build
	sudo docker-compose -f docker-compose.prod.yml exec web python3 manage.py migrate
	sudo docker-compose -f docker-compose.prod.yml exec web python3 manage.py collectstatic --force