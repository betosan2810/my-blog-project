from flask import Blueprint, request, jsonify
from app.models import User
from app import db
import jwt
from datetime import datetime, timedelta
import os

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    # Kiểm tra dữ liệu đầu vào
    if (
        not data
        or not data.get("email")
        or not data.get("password")
        or not data.get("username")
    ):
        return jsonify({"message": "Missing username, email, or password"}), 400

    # Kiểm tra xem email đã tồn tại chưa
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email already exists"}), 409

    # Kiểm tra xem username đã tồn tại chưa
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"message": "Username already exists"}), 409

    # Tạo người dùng mới
    new_user = User(username=data.get("username"), email=data["email"])
    new_user.set_password(data["password"])
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Missing email or password"}), 400

    user = User.query.filter_by(email=data["email"]).first()

    if not user or not user.check_password(data["password"]):
        return jsonify({"message": "Invalid credentials"}), 401

    # Tạo JWT token
    token = jwt.encode(
        {
            "sub": str(user.id),
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=24),  # Token hết hạn sau 24 giờ
        },
        os.environ.get("SECRET_KEY"),
        algorithm="HS256",
    )

    return jsonify(
        {
            "token": token,
            "user": {"id": user.id, "username": user.username, "email": user.email},
        }
    )
