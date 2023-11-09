from collections import namedtuple

from rest_framework import serializers, status
from rest_framework.response import Response


class ParentSerializer(serializers.ModelSerializer):
    pass


# noinspection PyAbstractClass
class SuccessSerializer(serializers.Serializer):
    detail = serializers.ReadOnlyField(default='success')


CommonResponse = namedtuple('CommonResponse', 'response swagger')
COMMON_SUCCESS_RESPONSE = CommonResponse(
    Response(SuccessSerializer({}).data, status=status.HTTP_200_OK), SuccessSerializer()
)


# noinspection PyAbstractClass
class EmptySerializer(serializers.Serializer):
    pass
