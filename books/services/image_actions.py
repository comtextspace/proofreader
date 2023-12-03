import pytesseract
from PIL import Image

from proofreader.settings import env


def extract_text_from_image(image):
    pytesseract.pytesseract.tesseract_cmd = env('TESSERACT_CMD', default='/usr/bin/tesseract')
    return pytesseract.image_to_string(Image.open(image), lang='rus')
