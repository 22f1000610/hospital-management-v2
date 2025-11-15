"""
Celery configuration
"""
from celery import Celery
from celery.schedules import crontab


def make_celery(app):
    """Create Celery instance"""
    celery = Celery(
        app.import_name,
        broker=app.config['CELERY_BROKER_URL'],
        backend=app.config['CELERY_RESULT_BACKEND']
    )
    celery.conf.update(app.config)
    
    # Configure periodic tasks
    celery.conf.beat_schedule = {
        'send-daily-reminders': {
            'task': 'app.tasks.celery_tasks.send_daily_reminders',
            'schedule': crontab(hour=9, minute=0),  # Run daily at 9 AM
        },
        'send-monthly-reports': {
            'task': 'app.tasks.celery_tasks.send_monthly_reports',
            'schedule': crontab(day_of_month=1, hour=0, minute=0),  # Run on 1st of each month
        },
    }
    
    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)
    
    celery.Task = ContextTask
    return celery
