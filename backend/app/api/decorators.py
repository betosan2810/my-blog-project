from functools import wraps
from flask import request, jsonify
import jwt
import os
from ..models import User  # Import User model từ thư mục cha của 'api'


def token_required(f):
    """
    Decorator để đảm bảo một route được bảo vệ bằng JWT token.
    Nó sẽ giải mã token, lấy thông tin người dùng và truyền vào route.
    """

    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Kiểm tra xem token có được gửi trong header 'Authorization' không
        if "Authorization" in request.headers:
            # Token thường có dạng "Bearer <token>"
            try:
                token = request.headers["Authorization"].split(" ")[1]
            except IndexError:
                return jsonify({"message": "Malformed token header"}), 401

        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        try:
            # Giải mã token bằng SECRET_KEY
            data = jwt.decode(token, os.environ.get("SECRET_KEY"), algorithms=["HS256"])
            # Lấy user từ database dựa trên id ('sub') trong token
            current_user = User.query.get(data["sub"])

            if not current_user:
                return jsonify({"message": "User not found!"}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired!"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Token is invalid!"}), 401
        except Exception as e:
            return jsonify({"message": "An error occurred", "error": str(e)}), 500

        # Truyền đối tượng user đã được xác thực vào hàm route ban đầu
        return f(current_user, *args, **kwargs)

    return decorated
