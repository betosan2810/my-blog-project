from flask import Blueprint, jsonify, request
from app.models import Post, PostImage
from app import db
from .decorators import token_required

# Khởi tạo Blueprint
posts_bp = Blueprint("posts", __name__)


# 🟩 Lấy tất cả bài viết
@posts_bp.route("/", methods=["GET"])
def get_posts():
    search_query = request.args.get("search", "").strip()  # lấy ?search=... từ URL

    # Nếu có từ khóa tìm kiếm thì lọc theo title hoặc content
    if search_query:
        posts = (
            Post.query.filter(
                (Post.title.ilike(f"%{search_query}%"))
                | (Post.content.ilike(f"%{search_query}%"))
            )
            .order_by(Post.created_at.desc())
            .all()
        )
    else:
        posts = Post.query.order_by(Post.created_at.desc()).all()

    posts_list = []
    for post in posts:
        images = PostImage.query.filter_by(post_id=post.id).all()
        image_urls = [img.url for img in images]

        posts_list.append(
            {
                "id": post.id,
                "title": post.title,
                "content": post.content,
                "video_url": post.video_url,
                "image_urls": image_urls,
                "created_at": post.created_at.isoformat(),
                "author": post.author.username if post.author else None,
            }
        )

    return jsonify(posts_list)


# 🟩 Tạo bài viết mới (yêu cầu token)
@posts_bp.route("", methods=["POST"])
@token_required
def create_post(current_user):
    data = request.get_json()

    if not data or not data.get("title") or not data.get("content"):
        return jsonify({"message": "Missing title or content"}), 400

    # Tạo bài viết mới
    new_post = Post(
        title=data["title"],
        content=data["content"],
        video_url=data.get("video_url"),
        author=current_user,
    )
    db.session.add(new_post)
    db.session.flush()  # flush để có ID của post trước khi commit

    # Thêm danh sách ảnh (nếu có)
    image_urls = data.get("image_urls", [])
    if isinstance(image_urls, list):
        for url in image_urls:
            new_image = PostImage(url=url, post_id=new_post.id)
            db.session.add(new_image)

    db.session.commit()

    return (
        jsonify({"message": "Post created successfully", "post_id": new_post.id}),
        201,
    )


# 🟩 Lấy chi tiết một bài viết theo id
@posts_bp.route("/<int:post_id>", methods=["GET"])
def get_post(post_id):
    post = Post.query.get_or_404(post_id)
    images = PostImage.query.filter_by(post_id=post.id).all()
    image_urls = [img.url for img in images]

    return jsonify(
        {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "video_url": post.video_url,
            "image_urls": image_urls,
            "created_at": post.created_at.isoformat(),
            "author": post.author.username if post.author else None,
        }
    )
