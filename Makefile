install:
	poetry install

shell:
	poetry shell

django_shell:
	poetry run python proofreader/manage.py shell_plus

develop:
	poetry run python proofreader/manage.py collectstatic --noinput
	poetry run python proofreader/manage.py runserver
