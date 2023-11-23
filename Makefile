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
	docker compose -f docker-compose.test.yml exec web python3 manage.py migrate
	docker compose -f docker-compose.test.yml exec web python3 manage.py collectstatic --force

rebuild-prod:
	docker compose -f docker-compose.prod.yml down
	docker compose -f docker-compose.prod.yml up -d --build
	docker compose -f docker-compose.prod.yml exec web python3 manage.py migrate
	docker compose -f docker-compose.prod.yml exec web python3 manage.py collectstatic --force

restart-prod:
	docker compose -f docker-compose.prod.yml down
	docker compose -f docker-compose.prod.yml up -d

v-rebuild:
	vagrant up
	vagrant ssh -c 'docker compose -f /proofreader/docker-compose.test.yml down'
	vagrant ssh -c 'docker compose -f /proofreader/docker-compose.test.yml up -d --build'
	vagrant ssh -c 'docker compose -f /proofreader/docker-compose.test.yml exec web python3 manage.py migrate'
	vagrant ssh -c 'docker compose -f /proofreader/docker-compose.test.yml exec web python3 manage.py collectstatic --force'

v-stop:
	vagrant halt

v-destroy:
	vagrant destroy

v-test:
	vagrant ssh -c 'docker compose -f /proofreader/docker-compose.test.yml exec web python3 manage.py test'