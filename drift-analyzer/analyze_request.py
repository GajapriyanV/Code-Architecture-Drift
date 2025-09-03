import json
from urllib import request

payload = {
    "git": {
        "repo_url": "https://github.com/sinatra/sinatra.git",
        "ref": "main",
        "token": None,
    },
    "rules": {
        "layers": [],
        "forbidden_dependencies": [],
        "must_route_via": [],
        "disallowed_apis": [],
    },
    "mode": "full",
}

req = request.Request(
    "http://localhost:8000/analyze",
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json"},
    method="POST",
)

with request.urlopen(req, timeout=300) as resp:
    print(resp.status)
    print(resp.read().decode("utf-8"))
