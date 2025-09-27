from datetime import datetime

import requests
from django.conf import settings

from .book_export import export_book


class GitHubUploadService:
    """Service for uploading book exports to GitHub repositories."""

    def __init__(self):
        self.token = getattr(settings, 'GITHUB_TOKEN', None)
        self.repo = getattr(settings, 'GITHUB_REPO', None)
        self.branch = getattr(settings, 'GITHUB_BRANCH', 'main')
        self.target_dir = getattr(settings, 'GITHUB_TARGET_DIR', 'books')
        self.api_base = 'https://api.github.com'

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

    def upload_book_to_github(self, book, custom_path: str | None = None) -> dict:
        """
        Upload book export to GitHub repository.

        Args:
            book: Book model instance
            custom_path: Optional custom path within the repository

        Returns:
            dict: Response from GitHub API with upload details
        """
        if not self.token or not self.repo:
            raise ValueError("GitHub credentials not configured. Set GITHUB_TOKEN and GITHUB_REPO in settings.")

        # Export book content
        content = export_book(book)

        # Prepare file path
        filename = f"{book.name}.md"
        if custom_path:
            file_path = f"{custom_path}/{filename}"
        else:
            file_path = f"{self.target_dir}/{filename}"

        # Encode content to base64 (required by GitHub API)
        import base64

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


def upload_books_to_github(books, custom_path: str | None = None):
    """
    Upload multiple books to GitHub.

    Args:
        books: QuerySet or list of Book instances
        custom_path: Optional custom path within the repository

    Returns:
        list: Results for each book upload
    """
    service = GitHubUploadService()
    results = []

    for book in books:
        try:
            result = service.upload_book_to_github(book, custom_path)
            results.append({'book': book.name, **result})
        except Exception as e:
            results.append({'book': book.name, 'success': False, 'message': str(e)})

    return results
