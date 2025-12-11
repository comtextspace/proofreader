import base64
from datetime import datetime

import requests
from django.conf import settings

from .book_export import export_book


class GitHubUploadService:
    """Service for uploading book exports to GitHub repositories."""

    def __init__(self, export_source=None):
        self.token = getattr(settings, 'GITHUB_TOKEN', None)
        self.api_base = 'https://api.github.com'

        if export_source:
            self.repo = export_source.repo
            self.branch = export_source.branch
            self.target_dir = export_source.directory
        else:
            self.repo = None
            self.branch = None
            self.target_dir = None

    def _get_headers(self):
        """Get headers for GitHub API requests."""
        return {
            'Authorization': f'token {self.token}',
            'Accept': 'application/vnd.github.v3+json',
        }

    def _get_file_sha(self, file_path: str) -> str | None:
        """Get SHA of existing file if it exists."""
        url = f'{self.api_base}/repos/{self.repo}/contents/{file_path}'
        response = requests.get(url, headers=self._get_headers())

        if response.status_code == 200:
            return response.json().get('sha')
        return None

    def upload_book_to_github(self, book) -> dict:
        """
        Upload book export to GitHub repository.

        Args:
            book: Book model instance

        Returns:
            dict: Response from GitHub API with upload details
        """
        if not self.token:
            raise ValueError("GitHub token not configured. Set GITHUB_TOKEN in settings.")

        if not self.repo:
            raise ValueError("No export source configured for this book.")

        # Export book content
        content = export_book(book)

        # Prepare file path
        filename = f"{book.export_name}.md"
        file_path = f"{self.target_dir}/{filename}"

        # Encode content to base64 (required by GitHub API)
        encoded_content = base64.b64encode(content.encode('utf-8')).decode('utf-8')

        # Check if file exists and get its SHA
        file_sha = self._get_file_sha(file_path)

        # Prepare commit message
        if file_sha:
            message = f"Update {book.name} - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        else:
            message = f"Add {book.name} - {datetime.now().strftime('%Y-%m-%d %H:%M')}"

        # Prepare request data
        data = {
            'message': message,
            'content': encoded_content,
            'branch': self.branch,
        }

        # Add SHA if updating existing file
        if file_sha:
            data['sha'] = file_sha

        # Make API request
        url = f'{self.api_base}/repos/{self.repo}/contents/{file_path}'
        response = requests.put(url, json=data, headers=self._get_headers())

        if response.status_code in [200, 201]:
            result = response.json()
            return {
                'success': True,
                'message': f'Successfully uploaded to {file_path}',
                'url': result['content']['html_url'],
                'commit_sha': result['commit']['sha'],
            }
        else:
            return {
                'success': False,
                'message': f'Failed to upload: {response.status_code} - {response.text}',
            }


def upload_book_to_github(book):
    """
    Upload a single book to GitHub using its export source.

    Args:
        book: Book model instance with export_source

    Returns:
        dict: Result of the upload
    """
    if not book.export_source:
        return {'book': book.name, 'success': False, 'message': 'No export source configured', 'skipped': True}

    service = GitHubUploadService(export_source=book.export_source)
    try:
        result = service.upload_book_to_github(book)
        return {'book': book.name, **result}
    except Exception as e:
        return {'book': book.name, 'success': False, 'message': str(e)}


def upload_books_to_github(books):
    """
    Upload multiple books to GitHub.

    Args:
        books: QuerySet or list of Book instances

    Returns:
        list: Results for each book upload
    """
    results = []

    for book in books:
        result = upload_book_to_github(book)
        results.append(result)

    return results
