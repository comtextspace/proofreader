from django.core.cache import cache

PAGES_LIST_CACHE_VERSION_KEY = 'pages:list:version'


def get_pages_list_cache_version() -> int:
    try:
        version = cache.get(PAGES_LIST_CACHE_VERSION_KEY)
        if version is None:
            cache.set(PAGES_LIST_CACHE_VERSION_KEY, 1, timeout=None)
            return 1
        return int(version)
    except Exception:
        return 1


def bump_pages_list_cache_version() -> None:
    try:
        try:
            cache.incr(PAGES_LIST_CACHE_VERSION_KEY)
        except ValueError:
            cache.set(PAGES_LIST_CACHE_VERSION_KEY, 2, timeout=None)
    except Exception:
        return
