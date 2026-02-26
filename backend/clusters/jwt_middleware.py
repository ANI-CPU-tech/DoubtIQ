from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from channels.db import database_sync_to_async

@database_sync_to_async
def get_user(validated_token):
    jwt_auth = JWTAuthentication()
    return jwt_auth.get_user(validated_token)

class JWTAuthMiddleware(BaseMiddleware):

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        query_params = parse_qs(query_string)

        token = query_params.get("token")

        if token:
            token = token[0]
            try:
                jwt_auth = JWTAuthentication()
                validated_token = jwt_auth.get_validated_token(token)
                scope["user"] = await get_user(validated_token)
            except Exception:
                scope["user"] = AnonymousUser()
        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)
