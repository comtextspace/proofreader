#!/bin/sh

pip install pre-commit
pre-commit install

# fixes setuptools issue https://github.com/pre-commit/pre-commit/issues/2178#issuecomment-1002163763
export SETUPTOOLS_USE_DISTUTILS=stdlib
pre-commit run isort --files .env
