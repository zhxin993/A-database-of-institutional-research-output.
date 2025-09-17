from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from config import Config
from models import db
from routes.auth_routes import auth_bp
from routes.item_routes import item_bp
from routes.message_routes import message_bp

app = Flask(__name__)
app.config.from_object(Config)
app.config['JSON_AS_ASCII'] = False  # 保证 jsonify 保留中文


db.init_app(app)
jwt = JWTManager(app)

# 注册蓝图
app.register_blueprint(auth_bp)
app.register_blueprint(item_bp)
app.register_blueprint(message_bp)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
