# Proofreader

Proofreader — средство для коллективной оцифровки и вычитке текстов.

Стек:

* Python + Django
* Postgresql
* Docker + Docker Compose

## Инструкция для разворачивания локально 

Клонируйте репозиторий

```bash
git clone https://github.com/comtextspace/proofreader.git
cd proofreader
```

Запустите сборку сайта

```bash
make rebuild
```

## Обновление версии

Обновите версию из репозитория git и запустите сборку проекта:

```bash
git pull
make rebuild
```

## Остановка приложения

Для остановки приложения используйте команду

```bash
make stop
```
