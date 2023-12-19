FROM ubuntu:latest

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

ENV POETRY_VERSION=1.5.1
RUN apt-get update && apt-get install -y python3 python3-pip gettext
RUN python3 -m pip install poetry==$POETRY_VERSION
RUN apt-get install -y tesseract-ocr-rus -y libtesseract-dev poppler-utils

WORKDIR /code

COPY poetry.lock pyproject.toml /code/

RUN poetry config virtualenvs.create false --local
RUN poetry install --no-dev

COPY . /code/
