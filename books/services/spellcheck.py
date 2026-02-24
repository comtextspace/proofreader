import re
import threading

import enchant

_dict = None
_lock = threading.Lock()
_WORD_RE = re.compile(r"(?=[^\W\d]*[а-яёА-ЯЁ])[^\W\d]+", re.UNICODE)


def _get_dict():
    global _dict
    if _dict is None:
        _dict = enchant.Dict("ru")
    return _dict


def check_spelling(text: str) -> list[dict]:
    d = _get_dict()
    errors = []

    for match in _WORD_RE.finditer(text):
        word = match.group()
        if len(word) < 2:
            continue
        if word[0].isupper():
            continue
        end = match.end()
        start = match.start()
        if end < len(text) and text[end] == "-" and (end + 1 >= len(text) or text[end + 1] == "\n"):
            continue
        if start >= 2 and text[start - 1] == "\n" and text[start - 2] == "-":
            continue
        with _lock:
            correct = d.check(word)
        if correct:
            continue
        errors.append(
            {
                "from": match.start(),
                "to": match.end(),
                "word": word,
            }
        )

    return errors
