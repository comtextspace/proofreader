from django import template

from core.utils import get_htm_differences

register = template.Library()


@register.inclusion_tag("history/_object_history_list.html", takes_context=True)
def display_list(context):
    return context


@register.filter('getattribute')
def getattribute(value, arg):
    """Gets an attribute of an object dynamically from a string name"""

    previous_history_record = getattr(value.prev_record or value.instance, arg, None)
    current_history_record = getattr(value, arg, None)

    if previous_history_record is not None and current_history_record is not None:
        result = get_htm_differences(
            previous_history_record.replace('\n', '<br>'), current_history_record.replace('\n', '<br>')
        )
    else:
        result = current_history_record.replace('\n', '<br>')

    return result
