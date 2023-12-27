from django.db import models


class PagesQuerySet(models.QuerySet):
    use_in_migrations = True

    def _get_list_of_int_from_comma_separated_string(self, string):
        result = []
        for item in string.split(','):
            if '-' in item:
                start, end = item.split('-')
                result.extend(range(int(start), int(end) + 1))
            else:
                result.append(int(item))
        return result

    def user_assignments(self, user):
        from accounts.models import Assignment

        if user_assignments := Assignment.objects.filter(user=user).values('pages', 'book_id'):
            q_filter = models.Q()

            for assignment in user_assignments:
                q_filter |= models.Q(
                    book_id=assignment['book_id'],
                    number__in=self._get_list_of_int_from_comma_separated_string(assignment['pages']),
                )
            return self.filter(q_filter)

        return self.none()
