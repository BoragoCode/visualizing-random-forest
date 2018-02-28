from flask import Flask

import os


UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../app/data')
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../static')

#initialize the app
# setting up template directory
app = Flask(__name__, instance_relative_config=True, static_folder=STATIC_DIR)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.secret_key = 'super secret key'
app.config['SESSION_TYPE'] = 'filesystem'

# Load the views
from app import views

# Load the config file
app.config.from_object('config')

