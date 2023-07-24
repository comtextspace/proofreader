import pytesseract
from PIL import Image


def extract_text_from_image(image):
    # with image.open('rb') as image_file:
    return pytesseract.image_to_string(Image.open(image), lang='rus')