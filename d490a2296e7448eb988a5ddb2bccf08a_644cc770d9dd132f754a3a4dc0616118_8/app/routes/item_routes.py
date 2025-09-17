import os
from flask import Blueprint, request, jsonify, current_app,Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Item
from werkzeug.utils import secure_filename
from datetime import datetime

import json

item_bp = Blueprint('item', __name__)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

#发布
@item_bp.route('/api/post_item', methods=['POST'])
@jwt_required()
def post_item():
    user_id = int(get_jwt_identity())
    data = request.form
    file = request.files.get('image')

    # ✅ 字段完整性检查
    required_fields = ['title', 'description', 'type', 'location']
    for field in required_fields:
        if not data.get(field):
            return jsonify({"message": f"Missing field: {field}"}), 400

    # ✅ 图片保存处理
    image_url = "static/uploads/default.jpg"
    if file:
        if not allowed_file(file.filename):
            return jsonify({"message": "Invalid file type"}), 400
        try:
            filename = secure_filename(file.filename)
            filename = f"{user_id}_{int(datetime.utcnow().timestamp())}_{filename}"
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            image_url = f"static/uploads/{filename}"
        except Exception as e:
            return jsonify({"message": "Image upload failed", "error": str(e)}), 500

    # ✅ 保存新物品
    new_item = Item(
        user_id=user_id,
        title=data.get('title'),
        description=data.get('description'),
        type=data.get('type'),
        location=data.get('location'),
        image_url=image_url
    )
    db.session.add(new_item)
    db.session.commit()

    # ✅ 自动匹配对立物品
    keyword = new_item.title
    match_type = 'found' if new_item.type == 'lost' else 'lost'

    matched_items = Item.query.filter(
        Item.type == match_type,
        Item.title.like(f"%{keyword}%")
    ).order_by(Item.posted_at.desc()).limit(5).all()

    matched = [{
        "id": item.id,
        "title": item.title,
        "location": item.location,
        "image_url": item.image_url
    } for item in matched_items]

    return jsonify({
        "message": "Item posted successfully",
        "id": new_item.id,
        "matched": matched,
        "match_message": "未找到匹配物品" if not matched else f"找到 {len(matched)} 条可能匹配项"
    })



#获取
@item_bp.route('/api/items', methods=['GET'])
def get_items():
    item_type = request.args.get('type')  # 可选参数
    query = Item.query
    if item_type in ['lost', 'found']:
        query = query.filter_by(type=item_type)

    items = query.order_by(Item.posted_at.desc()).all()
    result = [{
        "id": item.id,
        "title": item.title,
        "description": item.description,
        "type": item.type,
        "location": item.location,
        "image_url": item.image_url,
        "posted_at": item.posted_at.strftime("%Y-%m-%d %H:%M")
    } for item in items]
    return Response(
        json.dumps(result, ensure_ascii=False),  # 保留中文
        content_type='application/json; charset=utf-8'
    )

#修改
@item_bp.route('/api/items/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_item(item_id):
    user_id = int(get_jwt_identity())
    item = Item.query.get_or_404(item_id)
    if item.user_id != user_id:
        return jsonify({"message": "Permission denied"}), 403
    data = request.get_json()
    item.title = data.get('title', item.title)
    item.description = data.get('description', item.description)
    item.type = data.get('type', item.type)
    item.location = data.get('location', item.location)
    item.image_url = data.get('image_url', item.image_url)
    db.session.commit()
    return jsonify({"message": "Item updated"})

#删除
@item_bp.route('/api/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_item(item_id):
    user_id = int(get_jwt_identity())
    item = Item.query.get_or_404(item_id)
    if item.user_id != user_id:
        return jsonify({"message": "Permission denied"}), 403
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deleted"})

#匹配
@item_bp.route('/api/match_item', methods=['POST'])
@jwt_required()
def match_item():
    data = request.get_json()
    keyword = data.get('title')
    item_type = data.get('type')

    if not keyword or not item_type:
        return jsonify({"message": "Missing title or type"}), 400

    # 对立类型匹配
    match_type = 'found' if item_type == 'lost' else 'lost'

    matched_items = Item.query.filter(
        Item.type == match_type,
        Item.title.like(f"%{keyword}%")
    ).all()

    return jsonify([
        {
            "id": item.id,
            "title": item.title,
            "location": item.location,
            "image_url": item.image_url
        } for item in matched_items
    ])
