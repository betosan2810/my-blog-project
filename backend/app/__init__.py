from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from .config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app) # Cho phép frontend gọi API

    # Đăng ký các Blueprints
    from .api.posts import posts_bp
    app.register_blueprint(posts_bp, url_prefix='/api/posts')

    # (Thêm các blueprint khác ở đây)

    return app