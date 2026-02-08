import logging

from .client import OllamaClient
from .prompts import CORRECTION_PROMPT_TEMPLATE, SYSTEM_PROMPT_RU

logger = logging.getLogger(__name__)

MAX_CHUNK_CHARS = 3000


def correct_text(text: str, client: OllamaClient = None) -> str:
    client = client or OllamaClient()

    if not text.strip():
        return text

    if len(text) <= MAX_CHUNK_CHARS:
        return _correct_chunk(text, client)

    paragraphs = text.split("\n\n")
    chunks = _build_chunks(paragraphs, MAX_CHUNK_CHARS)
    logger.info("Text split into %d chunks for LLM correction", len(chunks))
    corrected_chunks = [_correct_chunk(chunk, client) for chunk in chunks]
    return "\n\n".join(corrected_chunks)


def _build_chunks(paragraphs: list[str], max_chars: int) -> list[str]:
    chunks = []
    current_chunk = []
    current_length = 0

    for para in paragraphs:
        if current_length + len(para) > max_chars and current_chunk:
            chunks.append("\n\n".join(current_chunk))
            current_chunk = [para]
            current_length = len(para)
        else:
            current_chunk.append(para)
            current_length += len(para) + 2

    if current_chunk:
        chunks.append("\n\n".join(current_chunk))

    return chunks


def _correct_chunk(text: str, client: OllamaClient) -> str:
    prompt = CORRECTION_PROMPT_TEMPLATE.format(text=text)
    result = client.generate(prompt=prompt, system_prompt=SYSTEM_PROMPT_RU)
    result = result.replace("--- TEXT START ---", "").replace("--- TEXT END ---", "").strip()
    return result
