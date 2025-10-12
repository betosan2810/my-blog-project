from app import create_app, db
from app.models import User, Post # Nhớ import models

app = create_app()

if __name__ == '__main__':
    app.run()