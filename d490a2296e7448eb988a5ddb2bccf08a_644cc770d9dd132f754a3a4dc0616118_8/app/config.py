import os


class Config:
    SQLALCHEMY_DATABASE_URI = 'mssql+pymssql://sa:123456@localhost/lost_found'

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'rjkfhnhn'

    # 上传相关
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif'}
