FROM python:3.10

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

ENV POETRY_VERSION=1.5.1
RUN python -m pip install poetry==$POETRY_VERSION

WORKDIR /code

COPY poetry.lock pyproject.toml /code/

RUN poetry config virtualenvs.create false --local
RUN poetry install --no-dev

COPY . /code/
CMD python manage.py runserver 0.0.0.0:8000

