import pytesseract
from PIL import Image

from proofreader.settings import env


def extract_text_from_image(image):
    pytesseract.pytesseract.tesseract_cmd = env('TESSERACT_CMD', default='/usr/bin/tesseract')
    img = Image.open(image)
    image_width, image_height = img.size

    data = pytesseract.image_to_data(img, lang='rus', output_type=pytesseract.Output.DICT)

    words = []
    text_parts = []
    char_offset = 0
    prev_line_num = None
    prev_block_num = None

    for i in range(len(data['text'])):
        word = data['text'][i].strip()
        if not word:
            continue

        current_block = data['block_num'][i]
        current_line = data['line_num'][i]

        if text_parts:
            if current_block != prev_block_num:
                text_parts.append('\n\n')
                char_offset += 2
            elif current_line != prev_line_num:
                text_parts.append('\n')
                char_offset += 1
            else:
                text_parts.append(' ')
                char_offset += 1

        words.append(
            {
                'text': word,
                'left': data['left'][i],
                'top': data['top'][i],
                'width': data['width'][i],
                'height': data['height'][i],
                'conf': int(data['conf'][i]),
                'char_offset': char_offset,
            }
        )

        text_parts.append(word)
        char_offset += len(word)
        prev_block_num = current_block
        prev_line_num = current_line

    full_text = ''.join(text_parts)
    ocr_data = {
        'image_width': image_width,
        'image_height': image_height,
        'words': words,
    }

    return full_text, ocr_data
