import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

from django.core.asgi import get_asgi_application
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from clusters.jwt_middleware import JWTAuthMiddleware
import clusters.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,

    "websocket": JWTAuthMiddleware(
        URLRouter(
            clusters.routing.websocket_urlpatterns
        )
    ),
})
