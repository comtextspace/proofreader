from tkinter import Widget
from django.urls import reverse_lazy
from django.shortcuts import render
from django.views import View
from django.views.generic import TemplateView, ListView, DetailView, CreateView
from django.contrib.auth.mixins import LoginRequiredMixin

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


class PageView(CreateView):
    model = PageText
    fields = ["text"]  # "__all__"  #
    # form_class = PageTextForm
    template_name = "book/page.html"
    success_url = reverse_lazy("book_list")

    def get_form(self):
        form = super().get_form()
        form.fields["text"].widget.attrs.update({"class": "datepicker", "rows": "40"})
        form.fields["text"].label = ""
        return form

    def form_valid(self, form):
        book_id = self.kwargs["book_id"]
        page_id = self.kwargs["page_id"]

        form.instance.book = Book.objects.get(id=book_id)
        form.instance.page = Page.objects.get(id=page_id)
        form.instance.editor = self.request.user

        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        book_id = self.kwargs["book_id"]
        page_id = self.kwargs["page_id"]

        page = Page.objects.get(id=page_id)
        texts = PageText.objects.filter(page=page_id).order_by("-date")

        ctx = super().get_context_data(**kwargs)
        ctx["page"] = page
        ctx["texts"] = texts

        return ctx

    def get_initial(self):
        book_id = self.kwargs["book_id"]
        page_id = self.kwargs["page_id"]
        current_text = PageText.objects.filter(page=page_id).latest("date")

        initial = super().get_initial()

        initial["book"] = book_id
        initial["page"] = page_id
        initial["editor"] = self.request.user
        initial["text"] = current_text.text
        return initial


class ActivityView(ListView):
    model = PageText
    template_name = "book/activity.html"

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.order_by("-date")
