"""
Redis cache utilities
"""
import json
import redis
from functools import wraps
from flask import current_app


class Cache:
    """Redis cache wrapper"""
    
    def __init__(self, app=None):
        self.redis_client = None
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize cache with Flask app"""
        redis_url = app.config.get('REDIS_URL', 'redis://localhost:6379/0')
        try:
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            self.redis_client.ping()
        except redis.ConnectionError:
            app.logger.warning('Redis connection failed. Caching disabled.')
            self.redis_client = None
    
    def get(self, key):
        """Get value from cache"""
        if not self.redis_client:
            return None
        
        try:
            value = self.redis_client.get(key)
            if value:
                return json.loads(value)
        except Exception as e:
            current_app.logger.error(f'Cache get error: {e}')
        
        return None
    
    def set(self, key, value, timeout=None):
        """Set value in cache"""
        if not self.redis_client:
            return False
        
        try:
            timeout = timeout or current_app.config.get('CACHE_DEFAULT_TIMEOUT', 300)
            self.redis_client.setex(key, timeout, json.dumps(value))
            return True
        except Exception as e:
            current_app.logger.error(f'Cache set error: {e}')
            return False
    
    def delete(self, key):
        """Delete key from cache"""
        if not self.redis_client:
            return False
        
        try:
            self.redis_client.delete(key)
            return True
        except Exception as e:
            current_app.logger.error(f'Cache delete error: {e}')
            return False
    
    def clear(self):
        """Clear all cache"""
        if not self.redis_client:
            return False
        
        try:
            self.redis_client.flushdb()
            return True
        except Exception as e:
            current_app.logger.error(f'Cache clear error: {e}')
            return False


# Global cache instance
cache = Cache()


def cached(timeout=300, key_prefix='view'):
    """Decorator to cache function results"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Generate cache key
            cache_key = f"{key_prefix}:{f.__name__}"
            
            # Try to get from cache
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = f(*args, **kwargs)
            cache.set(cache_key, result, timeout)
            
            return result
        
        return decorated_function
    return decorator
