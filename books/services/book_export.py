import re


def _working_with_pages_end(pages):
    return [re.sub(r'[ \n]+$', '', page.text) for page in pages if page.text]


def _join_pages_with_rules(pages_texts):
    result = pages_texts[0].strip()
    for page_number, page_text in enumerate(pages_texts[1:], start=2):
        page_number = f'[# {page_number}]'
        if not page_text.startswith('\r\n'):
            if result.endswith('-'):
                result = f'{result[:-1]}{page_number}{page_text}'
            else:
                result = f'{result} {page_number} {page_text}'
        elif page_text.startswith('\r\n'):
            result = f'{result}\n\n{page_number}\n{page_text}'

        result = result.strip()

    return result


def export_book(book):
    from books.models import Page

    pages = Page.objects.filter(book=book).order_by('number')
    pages_texts = _working_with_pages_end(pages)
    text = _join_pages_with_rules(pages_texts)
    return text
