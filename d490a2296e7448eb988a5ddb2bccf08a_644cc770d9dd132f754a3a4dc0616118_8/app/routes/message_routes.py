from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Message
from datetime import datetime

message_bp = Blueprint('message', __name__)

@message_bp.route('/api/message/send', methods=['POST'])
@jwt_required()
def send_message():
    data = request.get_json()
    sender_id = get_jwt_identity()
    receiver_id = data.get('receiver_id')
    content = data.get('content')

    if not receiver_id or not content:
        return jsonify({"message": "缺少字段"}), 400

    msg = Message(sender_id=sender_id, receiver_id=receiver_id, content=content)
    db.session.add(msg)
    db.session.commit()
    return jsonify({"message": "Message sent successfully"})

@message_bp.route('/api/message/chat/<int:user_id>', methods=['GET'])
@jwt_required()
def get_chat(user_id):
    current_user = get_jwt_identity()
    msgs = Message.query.filter(
        ((Message.sender_id == current_user) & (Message.receiver_id == user_id)) |
        ((Message.sender_id == user_id) & (Message.receiver_id == current_user))
    ).order_by(Message.sent_time).all()

    result = [{
        "from_me": m.sender_id == current_user,
        "content": m.content,
        "time": m.sent_time.strftime('%Y-%m-%d %H:%M')
    } for m in msgs]
    return jsonify(result)

@message_bp.route('/api/message/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    current_user = get_jwt_identity()
    all_msgs = Message.query.filter(
        (Message.sender_id == current_user) | (Message.receiver_id == current_user)
    ).all()

    convos = {}
    for msg in all_msgs:
        partner = msg.receiver_id if msg.sender_id == current_user else msg.sender_id
        if partner not in convos or msg.sent_time > convos[partner]['time']:
            convos[partner] = {
                "user_id": partner,
                "last_message": msg.content,
                "time": msg.sent_time
            }

    return jsonify([
        {
            "user_id": v["user_id"],
            "username": f"用户{v['user_id']}",
            "last_message": v["last_message"],
            "time": v["time"].strftime('%Y-%m-%d %H:%M')
        } for v in convos.values()
    ])
