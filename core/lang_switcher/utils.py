from django.conf import settings


def switch_lang_code(path, language):
    # Get the supported language codes
    lang_codes = [c for (c, name) in settings.LANGUAGES] + ['']

    # Validate the inputs
    if path == '':
        raise Exception('URL path for language switch is empty')
    elif path[0] != '/':
        raise Exception('URL path for language switch does not start with "/"')
    elif language not in lang_codes:
        raise Exception('%s is not a supported language code' % language)

    # Split the parts of the path
    parts = path.split('/')
    # Add or substitute the new language prefix
    # if language == '':
    #     parts.remove(parts[1])
    if parts[1] in lang_codes:
        parts[1] = language

    else:
        parts[0] = "/" + language

    result = '/'.join(parts)
    result = result.replace('//', '/')
    # Return the full new path
    return result
