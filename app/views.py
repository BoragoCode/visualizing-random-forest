import os

from flask import render_template, flash, json, jsonify

from app import app

from flask import request, redirect, url_for
from werkzeug.utils import secure_filename

from flask import send_from_directory

from app.testscript import testfunction

@app.route('/')
def index():
    return render_template("index.html")


@app.route('/about')
def about():
    return render_template("about.html")


@app.route('/learning', methods=['POST'])
def learning():
    data = json.loads(request.data)
    response = testfunction(data)
    return jsonify(response)

    # data == {"userInput": "data readin"}
    # file = request.files['uploads[]']
    # if file:
    #     filename = secure_filename(file.filename)
    #     # file.save(os.path.join('/tmp/', filename))
    #     # file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    # return 'hello test'

    # data = json.loads(request.data)
    # data == {"userInput": "data readin"}
    # response = testfunction(data)
    # return jsonify(response)


