from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from .config import Config
import cloudinary

db = SQLAlchemy()
migrate = Migrate()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    # Cấu hình Cloudinary
    cloudinary.config(
        cloud_name=app.config.get("CLOUDINARY_CLOUD_NAME"),
        api_key=app.config.get("CLOUDINARY_API_KEY"),
        api_secret=app.config.get("CLOUDINARY_API_SECRET"),
    )

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)  # Cho phép frontend gọi API

    # Đăng ký các Blueprints
    from .api.posts import posts_bp
    from .api.auth import auth_bp
    from .api.media import media_bp
    from .api.reactions import reactions_bp

    app.register_blueprint(posts_bp, url_prefix="/api/posts")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(media_bp, url_prefix="/api/media")
    app.register_blueprint(reactions_bp, url_prefix="/api/reactions")

    return app
