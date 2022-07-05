from django.shortcuts import render
from django.views.generic import TemplateView, ListView, DetailView

from .models import Book, Page


class HomePageView(TemplateView):
    template_name = "home.html"


class BookListView(ListView):
    model = Book
    template_name = "book/book_list.html"


class BookView(DetailView):
    model = Book
    template_name = "book/book.html"


class PageListView(ListView):
    model = Page
    template_name = "book/page_list.html"


class PageView(DetailView):
    model = Page
    template_name = "book/page.html"
