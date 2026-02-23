FROM ubuntu:latest

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

ENV POETRY_VERSION=2.2.1
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv gettext
RUN python3 -m venv /opt/venv
RUN /opt/venv/bin/pip install --upgrade pip setuptools wheel
RUN /opt/venv/bin/pip install poetry==$POETRY_VERSION

ENV PATH="/opt/venv/bin:$PATH"
ENV VIRTUAL_ENV="/opt/venv"

RUN apt-get install -y tesseract-ocr-rus libtesseract-dev poppler-utils libenchant-2-2 hunspell-ru

WORKDIR /code

COPY poetry.lock pyproject.toml /code/

RUN poetry config virtualenvs.in-project false --local && \
    poetry config virtualenvs.path /opt/venv --local && \
    poetry config virtualenvs.create false --local
RUN poetry install --only main

COPY . /code/
