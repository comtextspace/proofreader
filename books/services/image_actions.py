import pytesseract
from PIL import Image


def extract_text_from_image(image):
    pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'
    return pytesseract.image_to_string(Image.open(image), lang='rus')