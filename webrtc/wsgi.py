"""
WSGI config for webrtc project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.9/howto/deployment/wsgi/
"""

import os, sys

sys.path.append('/usr/local/test1/webrtc')

sys.path.append('/usr/local/test1/env/lib/python2.7/site-packages')

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "webrtc.settings")
from django.core.wsgi import get_wsgi_application


application = get_wsgi_application()
