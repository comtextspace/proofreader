import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class OllamaClient:
    def __init__(self, base_url=None, model=None, timeout=None):
        self.base_url = base_url or settings.LLM_OLLAMA_URL
        self.model = model or settings.LLM_MODEL_NAME
        self.timeout = timeout or settings.LLM_REQUEST_TIMEOUT

    def is_available(self) -> bool:
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = [m["name"] for m in response.json().get("models", [])]
                return self.model in models or any(m.startswith(self.model.split(":")[0]) for m in models)
            return False
        except requests.RequestException:
            return False

    def generate(self, prompt: str, system_prompt: str = "") -> str:
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system_prompt,
            "stream": False,
            "options": {
                "temperature": 0.1,
                "num_predict": 4096,
            },
        }
        response = requests.post(
            f"{self.base_url}/api/generate",
            json=payload,
            timeout=self.timeout,
        )
        response.raise_for_status()
        return response.json()["response"]
