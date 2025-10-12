from flask import Blueprint, jsonify
from app.models import Post

# Tạo một Blueprint tên là 'posts'
posts_bp = Blueprint('posts', __name__)

@posts_bp.route('/', methods=['GET'])
def get_posts():
    posts = Post.query.order_by(Post.created_at.desc()).all()
    posts_list = [
        {
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'image_url': post.image_url
        } for post in posts
    ]
    return jsonify(posts_list)