FROM ubuntu:latest

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

ENV POETRY_VERSION=1.5.1
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv gettext
RUN python3 -m venv /opt/venv
RUN /opt/venv/bin/pip install --upgrade pip setuptools wheel
RUN /opt/venv/bin/pip install poetry==$POETRY_VERSION

ENV PATH="/opt/venv/bin:$PATH"

RUN apt-get install -y tesseract-ocr-rus libtesseract-dev poppler-utils

WORKDIR /code

COPY poetry.lock pyproject.toml /code/

RUN poetry config virtualenvs.create false --local
RUN poetry install --only main

COPY . /code/
