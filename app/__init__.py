from flask import Flask

# STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../static')
STATIC_DIR = '../static'

#initialize the app
# setting up the template directory
app = Flask(__name__, instance_relative_config=True, static_folder=STATIC_DIR)
app.secret_key = 'super secret key'
app.config['SESSION_TYPE'] = 'filesystem'

# Load the views
from app import views

# Load the config file
app.config.from_object('config')

