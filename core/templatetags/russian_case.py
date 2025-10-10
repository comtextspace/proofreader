from django import template

register = template.Library()


@register.filter
def accusative(value):
    """
    Convert Russian nominative case to accusative case for common words.
    Used for "Add <object>" buttons in admin.
    """
    # Mapping of nominative to accusative for common model names
    cases = {
        "Книга": "книгу",
        "Страница": "страницу",
        "Автор": "автора",
        "Пользователь": "пользователя",
    }

    return cases.get(value, value)
