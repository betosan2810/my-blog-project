from flask import Blueprint, request, jsonify
from ..models import db, Post, Reaction
from datetime import datetime

reactions_bp = Blueprint("reactions", __name__)


# ==========================
# POST /api/reactions
# Body: { "post_id": int, "emoji": "❤️", "user_id": int }
# ==========================
@reactions_bp.route("/", methods=["POST"])
def add_or_toggle_reaction():
    data = request.get_json()
    post_id = data.get("post_id")
    emoji = data.get("emoji")  # frontend vẫn gửi "emoji" → ta map vào "type"
    user_id = data.get("user_id")

    if not all([post_id, emoji, user_id]):
        return jsonify({"error": "Thiếu dữ liệu"}), 400

    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Bài viết không tồn tại"}), 404

    existing_reaction = Reaction.query.filter_by(
        user_id=user_id, post_id=post_id
    ).first()

    if existing_reaction:
        if existing_reaction.type == emoji:  # 🔄 so sánh theo "type"
            db.session.delete(existing_reaction)
            db.session.commit()
            return jsonify({"message": "Đã bỏ cảm xúc"}), 200
        else:
            existing_reaction.type = emoji
            existing_reaction.created_at = datetime.utcnow()
            db.session.commit()
            return jsonify({"message": "Đã đổi cảm xúc"}), 200

    new_reaction = Reaction(type=emoji, user_id=user_id, post_id=post_id)
    db.session.add(new_reaction)
    db.session.commit()

    return jsonify({"message": "Đã thêm cảm xúc"}), 201


# ==========================
# GET /api/reactions/<post_id>
# ==========================
@reactions_bp.route("/<int:post_id>", methods=["GET"])
def get_reactions(post_id):
    reactions = Reaction.query.filter_by(post_id=post_id).all()

    if not reactions:
        return jsonify({"post_id": post_id, "reactions": {}, "total": 0})

    stats = {}
    for r in reactions:
        stats[r.type] = stats.get(r.type, 0) + 1  # 🔄 dùng "type"

    return jsonify({"post_id": post_id, "reactions": stats, "total": len(reactions)})


# ==========================
# GET /api/reactions/user/<user_id>/<post_id>
# ==========================
@reactions_bp.route("/user/<int:user_id>/<int:post_id>", methods=["GET"])
def get_user_reaction(user_id, post_id):
    reaction = Reaction.query.filter_by(user_id=user_id, post_id=post_id).first()

    if reaction:
        return (
            jsonify(
                {"post_id": post_id, "user_id": user_id, "emoji": reaction.type}
            ),  # 🔄 trả về "emoji" cho frontend
            200,
        )

    return jsonify({"post_id": post_id, "user_id": user_id, "emoji": None}), 200
