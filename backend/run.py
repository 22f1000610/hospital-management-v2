"""
Application entry point
"""
from app import create_app
from app.tasks.celery_config import make_celery

app = create_app()
celery = make_celery(app)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
