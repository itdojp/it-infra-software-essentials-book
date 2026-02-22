import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Note: POST is often non-idempotent; avoid retries unless the API supports idempotency keys.
retry_strategy = Retry(
    total=3,
    backoff_factor=1,
    status_forcelist=[429, 500, 502, 503, 504],
    allowed_methods=["HEAD", "GET", "PUT", "DELETE", "OPTIONS", "TRACE"],
    raise_on_status=False,
    respect_retry_after_header=True,
)

session = requests.Session()
adapter = HTTPAdapter(max_retries=retry_strategy)
session.mount("http://", adapter)
session.mount("https://", adapter)
