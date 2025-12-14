import io
import os
import re
import tempfile

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


def _parse_export_pages(export_pages_str):
    """
    Parse export_pages string and return tuple (start, end) or None if empty.
    Format: "4-15" returns (4, 15)
    """
    if not export_pages_str or not export_pages_str.strip():
        return None

    match = re.match(r'^(\d+)-(\d+)$', export_pages_str.strip())
    if match:
        return int(match.group(1)), int(match.group(2))

    return None


def _get_pages_for_export(book):
    """Get pages for export based on book.export_pages setting."""
    from books.models import Page

    pages = Page.objects.filter(book=book).order_by('number')

    page_range = _parse_export_pages(book.export_pages)
    if page_range:
        start, end = page_range
        pages = pages.filter(number__gte=start, number__lte=end)

    return pages


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
    pages = _get_pages_for_export(book)
    pages_texts = _working_with_pages_end(pages)
    text = _join_pages_with_rules(pages_texts)
    text = _merge_annotations(text)
    return text


def _register_cyrillic_font():
    """Register a font that supports Cyrillic characters."""
    try:
        pdfmetrics.getFont('DejaVuSans')
    except KeyError:
        # Common font paths for DejaVu Sans
        font_paths = [
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
            '/usr/share/fonts/TTF/DejaVuSans.ttf',
            '/Library/Fonts/DejaVuSans.ttf',
            os.path.expanduser('~/.fonts/DejaVuSans.ttf'),
        ]

        for font_path in font_paths:
            if os.path.exists(font_path):
                pdfmetrics.registerFont(TTFont('DejaVuSans', font_path))
                return 'DejaVuSans'

        # Fallback to Helvetica if DejaVu not found
        return 'Helvetica'

    return 'DejaVuSans'


def export_book_as_pdf(book):
    """Export book as PDF with proper formatting."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=50,
        leftMargin=50,
        topMargin=50,
        bottomMargin=50,
    )

    font_name = _register_cyrillic_font()
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'BookTitle',
        parent=styles['Heading1'],
        fontName=font_name,
        fontSize=18,
        spaceAfter=20,
        alignment=1,  # Center
    )

    body_style = ParagraphStyle(
        'BookBody',
        parent=styles['Normal'],
        fontName=font_name,
        fontSize=11,
        leading=14,
        spaceAfter=6,
        firstLineIndent=20,
    )

    page_marker_style = ParagraphStyle(
        'PageMarker',
        parent=styles['Normal'],
        fontName=font_name,
        fontSize=9,
        textColor='gray',
        alignment=1,  # Center
        spaceBefore=10,
        spaceAfter=10,
    )

    story = []

    # Add title
    title = book.name
    if book.author:
        title = f"{book.author.name}<br/>{book.name}"
    story.append(Paragraph(title, title_style))
    story.append(Spacer(1, 20))

    # Get text content
    pages = _get_pages_for_export(book)
    pages_texts = _working_with_pages_end(pages)

    for page_num, page_text in enumerate(pages_texts, start=1):
        # Add page marker
        story.append(Paragraph(f"[{page_num}]", page_marker_style))

        # Process text - split into paragraphs and escape special characters
        paragraphs = page_text.split('\n\n')
        for para in paragraphs:
            para = para.strip()
            if para:
                # Escape XML special characters
                para = para.replace('&', '&amp;')
                para = para.replace('<', '&lt;')
                para = para.replace('>', '&gt;')
                # Replace newlines with line breaks
                para = para.replace('\n', '<br/>')
                story.append(Paragraph(para, body_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


def _escape_html(text):
    """Escape HTML special characters."""
    text = text.replace('&', '&amp;')
    text = text.replace('<', '&lt;')
    text = text.replace('>', '&gt;')
    text = text.replace('"', '&quot;')
    return text


def export_book_as_epub(book):
    """Export book as EPUB with proper formatting."""
    from ebooklib import epub

    epub_book = epub.EpubBook()

    # Set metadata
    identifier = f"proofreader-book-{book.id}"
    epub_book.set_identifier(identifier)
    epub_book.set_title(book.name)
    epub_book.set_language('ru')

    if book.author:
        epub_book.add_author(book.author.name)

    # CSS styles
    style = '''
    body { font-family: Georgia, serif; line-height: 1.6; }
    h1 { text-align: center; margin-bottom: 2em; }
    .page-marker { text-align: center; color: gray; font-size: 0.8em; margin: 1em 0; }
    p { text-indent: 1.5em; margin: 0.5em 0; }
    '''
    nav_css = epub.EpubItem(
        uid="style_nav",
        file_name="style/nav.css",
        media_type="text/css",
        content=style,
    )
    epub_book.add_item(nav_css)

    # Get pages
    pages = _get_pages_for_export(book)
    pages_texts = _working_with_pages_end(pages)

    # Create title page (escape HTML in title)
    escaped_name = _escape_html(book.name)
    title_content = f'<h1>{escaped_name}</h1>'
    if book.author:
        escaped_author = _escape_html(book.author.name)
        title_content = f'<h1>{escaped_author}<br/><br/>{escaped_name}</h1>'

    title_chapter = epub.EpubHtml(title='Титульная страница', file_name='title.xhtml', lang='ru')
    title_chapter.content = f'<html><body>{title_content}</body></html>'
    title_chapter.add_item(nav_css)
    epub_book.add_item(title_chapter)

    # Create content chapter
    content_html = ''
    for page_num, page_text in enumerate(pages_texts, start=1):
        content_html += f'<p class="page-marker">[{page_num}]</p>'

        paragraphs = page_text.split('\n\n')
        for para in paragraphs:
            para = para.strip()
            if para:
                para = _escape_html(para)
                para = para.replace('\n', '<br/>')
                content_html += f'<p>{para}</p>'

    content_chapter = epub.EpubHtml(title=book.name, file_name='content.xhtml', lang='ru')
    content_chapter.content = f'<html><body>{content_html}</body></html>'
    content_chapter.add_item(nav_css)
    epub_book.add_item(content_chapter)

    # Define Table of Contents and spine
    epub_book.toc = [
        epub.Link('title.xhtml', 'Титульная страница', 'title'),
        epub.Link('content.xhtml', book.name, 'content'),
    ]
    epub_book.add_item(epub.EpubNcx())
    epub_book.add_item(epub.EpubNav())
    epub_book.spine = ['nav', title_chapter, content_chapter]

    # Write to temp file (ebooklib works more reliably with file paths)
    with tempfile.NamedTemporaryFile(suffix='.epub', delete=False) as tmp:
        tmp_path = tmp.name

    epub.write_epub(tmp_path, epub_book)

    with open(tmp_path, 'rb') as f:
        content = f.read()

    os.unlink(tmp_path)

    return content
