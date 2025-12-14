import io

from pdf2image import convert_from_bytes
from PyPDF2 import PdfReader


def split_pdf_to_pages(pdf_file, name, start_page):
    pdf = PdfReader(pdf_file)

    for pdf_page_index, page in enumerate(pdf.pages, start=1):
        page_number = start_page + pdf_page_index - 1
        with pdf_file.open('rb') as pdf_file_handle:
            pdf_bytes = pdf_file_handle.read()
            images = convert_from_bytes(pdf_bytes, dpi=150, first_page=pdf_page_index, last_page=pdf_page_index)

            # Save the extracted image using ImageField and ContentFile
            image_bytes = io.BytesIO()
            images[0].save(image_bytes, format='PNG')
            image_name = f"{name}_page_{page_number}.png"

            yield page_number, image_bytes.getvalue(), image_name
