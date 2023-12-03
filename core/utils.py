import base64
import collections
import functools
import hashlib
import html
import json
import os
import secrets
from io import BytesIO
from urllib.parse import urljoin

import toml
from django.conf import settings
from django.core.files import File
from django.core.files.storage import default_storage
from django.db.models import ForeignKey, Model, OneToOneField
from django.template import Context, Template
from django.utils.crypto import get_random_string
from django.utils.safestring import mark_safe
from PIL import Image
from pygments import highlight
from pygments.formatters.html import HtmlFormatter
from pygments.lexers.data import JsonLexer
from rest_framework.utils.encoders import JSONEncoder


def get_base_url(domain=None):
    return f'{settings.BASE_URL_SCHEMA}://{domain or settings.DOMAIN}'


def make_url_absolute(url, domain=None):
    return urljoin(get_base_url(domain), url)


def get_media_upload_path(_record, filename, *args, **kwargs):
    """
    Generates the path at which an item's picture will be stored.
    """
    _, ext = os.path.splitext(filename)
    token = secrets.token_urlsafe(16)
    return f"{token[:3]}/{token[3:]}{ext}"


def rgetattr(obj, attr, *args, ignore_errors=False, default=None):
    # noinspection PyShadowingNames
    def _getattr(obj, attr):
        if isinstance(obj, Model) and (field := obj._meta._forward_fields_map.get(attr, None)):
            # try to get fk or o2o id field value to prevent unnecessary database request
            if isinstance(field, (ForeignKey, OneToOneField)) and not getattr(obj, field.attname):
                return default

        try:
            return getattr(obj, attr, *args)
        except Exception as e:
            if ignore_errors:
                return default

            raise e

    return functools.reduce(_getattr, [obj] + attr.split('.'))


def cut_dict(dict_, maxdepth, replaced_with=None):
    """Cuts the dictionary at the specified depth.

    If maxdepth is n, then only n levels of keys are kept.
    """
    queue = collections.deque([(dict_, 0)])

    # invariant: every entry in the queue is a dictionary
    while queue:
        parent, depth = queue.popleft()
        for key, child in parent.items():
            if isinstance(child, dict):
                if depth == maxdepth - 1:
                    parent[key] = replaced_with
                else:
                    queue.append((child, depth + 1))


def pretty_typeform(content, cut=False):
    formatter = HtmlFormatter(style='default')
    try:
        if isinstance(content, str):
            content = json.loads(content)
    except json.JSONDecodeError:
        pass
    else:
        if cut:
            cut_dict(content, 1)
        content = json.dumps(content, indent=2, cls=JSONEncoder)
        response = highlight(content, JsonLexer(), formatter)
        style = "<style>" + formatter.get_style_defs() + "</style><br>"
        return mark_safe(style + response)


def render_from_string(string, context):
    """
    Render string with context
    """
    t = Template(html.unescape(string))
    return t.render(Context(context))


def recursive_get(d, *keys, default=None):
    """
    Get a value from a nested dictionary.
    :param d: dictionary
    :param keys: keys
    :param default: default value
    """
    try:
        return functools.reduce(lambda c, k: c.get(k, {}), keys, d) or default
    except AttributeError:
        return default


def save_image(image_field):
    with default_storage.open(image_field.name) as image_file:
        with Image.open(image_file) as img:
            img_bytes = BytesIO()
            img.save(img_bytes, format=img.format)
        img_bytes.seek(0)

        return File(img_bytes)


def generate_api_key() -> str:
    """
    Generate random api key in JdE54P-XfWGsR-K9z2lm-T09nEK-5KazQp format
    :return:
    """
    return '-'.join([get_random_string(length=6) for _ in range(5)])


def generate_cache_key(text_input, prefix: str = '', key_length=16):
    # Step 1: Choose a hashing algorithm (MD5)
    hasher = hashlib.md5()

    # Step 2: Compute the hash
    hasher.update(text_input.encode('utf-8'))
    hash_value = hasher.digest()

    # Step 3: Shorten the hash
    shortened_hash = hash_value[:key_length]

    # Step 4: Encode the shortened hash using Base64
    cache_key = base64.urlsafe_b64encode(shortened_hash).decode('utf-8')

    return prefix + cache_key


def get_htm_differences(string1, string2):
    import difflib

    # Create a Differ object
    d = difflib.Differ()

    # Calculate the differences
    diff = list(d.compare(string1.split(), string2.split()))

    # Prepare the highlighted result
    highlighted_diff = []
    for word in diff:
        print(word)
        if word.startswith("+ "):
            # Highlight additions with green
            highlighted_diff.append(f'<span style="color:green;">{word[2:]}</span>')
        elif word.startswith("- "):
            # Highlight deletions with red
            highlighted_diff.append(f'<span style="color:red; text-decoration: line-through;">{word[2:]}</span>')
        elif word.startswith("? "):
            pass
        else:
            highlighted_diff.append(word[2:])

    # Join the result into a single string with HTML formatting
    result_html = " ".join(highlighted_diff).replace('^', '')

    return result_html


def get_app_version():
    # Load the contents of the pyproject.toml file
    with open('pyproject.toml', 'r') as file:
        pyproject_contents = toml.load(file)

    # Extract the version value
    # Adjust the path ['tool']['poetry']['version'] according to your file's structure
    version = pyproject_contents['tool']['poetry']['version']

    return version
