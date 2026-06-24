from http.server import BaseHTTPRequestHandler
import json

def handler(request):
    return {
        "success": True,
        "provider": "VnStock",
        "message": "Python Runtime OK"
    }