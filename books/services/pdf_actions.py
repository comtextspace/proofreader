import io

from pdf2image import convert_from_bytes
from PyPDF2 import PdfReader


def split_pdf_to_pages(pdf_file, name, start_page):
    pdf = PdfReader(pdf_file)

    for page_number, page in enumerate(pdf.pages, start_page):
        with pdf_file.open('rb') as pdf_file:
            pdf_bytes = pdf_file.read()
            images = convert_from_bytes(pdf_bytes, dpi=150, first_page=page_number, last_page=page_number)

            # Save the extracted image using ImageField and ContentFile
            image_bytes = io.BytesIO()
            images[0].save(image_bytes, format='PNG')
            image_name = f"{name}_page_{page_number}.png"

            yield page_number, image_bytes.getvalue(), image_name
