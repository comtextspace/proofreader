# Proofreader

Proofreader — средство для коллективной оцифровки и вычитке текстов.

Стек:

* Python + Django
* Postgresql
* Docker + Docker Compose

## Инструкция для разворачивания локально (Docker)

Предварительно должен быть установлен [Docker](https://www.docker.com).

### Загрузка

Клонируйте репозиторий

```bash
git clone https://github.com/comtextspace/proofreader.git
cd proofreader
```

Запустите сборку сайта

```bash
make rebuild
```

### Обновление версии

Обновите версию из репозитория git и запустите сборку проекта:

```bash
git pull
make rebuild
```

### Остановка приложения

Для остановки приложения используйте команду

```bash
make stop
```

## Инструкция для разворачивания локально (Vagrant)

Предварительно должны быть установлены [Vagrant](https://www.vagrantup.com) и [VirtualBox](https://www.virtualbox.org).

### Загрузка

Клонируйте репозиторий

```bash
git clone https://github.com/comtextspace/proofreader.git
cd proofreader
```

Запустите сборку сайта

```bash
make v-rebuild
```

После разворачивания Proofreader будет доступен по адресу `http://127.0.0.1:5555/home/`.

### Обновление версии

Обновите версию из репозитория git и запустите сборку проекта:

```bash
git pull
make v-rebuild
```

### Остановка приложения

Для остановки приложения используйте команду

```bash
make v-stop
```

Для удаления виртуальной машины

```bash
make v-destroy
```
