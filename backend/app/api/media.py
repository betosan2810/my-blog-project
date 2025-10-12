from flask import Blueprint, jsonify
import cloudinary.utils
from ..api.decorators import token_required
import time
import os

media_bp = Blueprint("media", __name__)


@media_bp.route("/sign-upload", methods=["POST"])
@token_required
def sign_upload(current_user):
    # Lấy timestamp hiện tại
    timestamp = int(time.time())

    # Tạo chữ ký từ timestamp. Cloudinary sẽ dùng chữ ký này để xác thực.
    signature = cloudinary.utils.api_sign_request(
        {"timestamp": timestamp}, os.environ.get("CLOUDINARY_API_SECRET")
    )

    return jsonify(
        {
            "signature": signature,
            "timestamp": timestamp,
            "api_key": os.environ.get("CLOUDINARY_API_KEY"),
        }
    )
