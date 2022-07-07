from django.shortcuts import render
from django.views import View
from django.views.generic import TemplateView, ListView, DetailView

from .models import Book, Page, PageText


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

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(book_id=self.kwargs["id"])


class PageView(View):
    def get(self, request, book_id, page_id):

        page = Page.objects.get(id=page_id)
        texts = PageText.objects.filter(page=page_id)
        cur_text = PageText.objects.filter(page=page_id).latest("date")

        context = {
            "page": page,
            "texts": texts,
            "cur_text": cur_text,
        }
        return render(request, "book/page.html", context)


class ActivityView(ListView):
    model = PageText
    template_name = "book/activity.html"

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.order_by("-date")
