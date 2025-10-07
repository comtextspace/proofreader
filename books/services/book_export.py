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


def _merge_annotations(text):
    """
    Merges multi-page annotations into single annotations and places them
    immediately after the paragraph where they are referenced.

    Annotation format:
    - [^N]{ - annotation start
    - ~[^N] - annotation continues on next page
    - [^N]~ - annotation continued from previous page
    - }[^N] - annotation end
    """
    lines = text.split('\n')
    result_lines = []
    annotations = {}  # {annotation_number: {'text': str, 'complete': bool, 'ref_line_idx': int}}

    # First pass: collect all annotations and track where they're referenced
    for idx, line in enumerate(lines):
        # Check if line starts annotation: [^N]{
        start_match = re.match(r'\[\^(\d+)\]\{(.*)$', line)
        if start_match:
            num = start_match.group(1)
            content = start_match.group(2).strip()

            # Check if annotation completes on same line: }[^N]
            end_match = re.search(r'(.*?)\}\[\^' + num + r'\]', content)
            if end_match:
                # Complete annotation on single page
                annotation_text = end_match.group(1).strip()
                annotations[num] = {
                    'text': annotation_text,
                    'complete': True,
                    'ref_line_idx': None,  # Will be set when we find the reference
                }
            else:
                # Check if ends with continuation marker: ~[^N]
                continuation_match = re.search(r'(.*?)~\[\^' + num + r'\]', content)
                if continuation_match:
                    # Annotation continues on next page
                    annotations[num] = {
                        'text': continuation_match.group(1).strip(),
                        'complete': False,
                        'ref_line_idx': None,
                    }
                else:
                    # Malformed or single-line annotation
                    annotations[num] = {'text': content, 'complete': False, 'ref_line_idx': None}
            continue

        # Check if line continues annotation: [^N]~
        continue_match = re.match(r'\[\^(\d+)\]~(.*)$', line)
        if continue_match:
            num = continue_match.group(1)
            content = continue_match.group(2).strip()

            if num in annotations:
                # Check if annotation ends: }[^N]
                end_match = re.search(r'(.*?)\}\[\^' + num + r'\]', content)
                if end_match:
                    # Annotation is complete
                    annotations[num]['text'] += ' ' + end_match.group(1).strip()
                    annotations[num]['complete'] = True
                else:
                    # Check if continues further: ~[^N]
                    continuation_match = re.search(r'(.*?)~\[\^' + num + r'\]', content)
                    if continuation_match:
                        annotations[num]['text'] += ' ' + continuation_match.group(1).strip()
                    else:
                        annotations[num]['text'] += ' ' + content
            continue

    # Second pass: build result and insert annotations after paragraph ends
    for idx, line in enumerate(lines):
        # Check if line starts with annotation definition: [^N]{ or [^N]~
        annotation_start = re.match(r'\[\^(\d+)\]\{(.*)$', line)
        annotation_continue = re.match(r'\[\^(\d+)\]~(.*)$', line)

        if annotation_start:
            # Extract any text after the annotation start marker
            remaining_text = annotation_start.group(2)
            # Remove the annotation content and markers, keep only regular text
            remaining_text = re.sub(r'.*?\}?\[\^\d+\]', '', remaining_text).strip()
            if remaining_text:
                result_lines.append(remaining_text)
            continue

        if annotation_continue:
            # Extract any text after the annotation continuation
            remaining_text = annotation_continue.group(2)
            # Remove the annotation content and markers, keep only regular text
            remaining_text = re.sub(r'.*?\}?\[\^\d+\]', '', remaining_text).strip()
            if remaining_text:
                result_lines.append(remaining_text)
            continue

        # Check if this line contains annotation references
        annotation_refs = re.findall(r'\[\^(\d+)\]', line)

        result_lines.append(line)

        # If line contains references and next line is empty or doesn't exist (paragraph end)
        if annotation_refs and (idx + 1 >= len(lines) or lines[idx + 1].strip() == ''):
            # Insert completed annotations for this line
            for ref_num in annotation_refs:
                if ref_num in annotations and annotations[ref_num]['complete']:
                    result_lines.append(f'[^{ref_num}]: {annotations[ref_num]["text"]}')

    return '\n'.join(result_lines)


def export_book(book):
    from books.models import Page

    pages = Page.objects.filter(book=book).order_by('number')
    pages_texts = _working_with_pages_end(pages)
    text = _join_pages_with_rules(pages_texts)
    text = _merge_annotations(text)
    return text
