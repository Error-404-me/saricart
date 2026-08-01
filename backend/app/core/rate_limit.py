from slowapi import Limiter
from slowapi.util import get_remote_address

# Per-IP limiter. Applied selectively on auth endpoints prone to abuse
# (brute force, mass registration, reset-link spam).
limiter = Limiter(key_func=get_remote_address, default_limits=["200/hour"])