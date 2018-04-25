
from flask import render_template, flash, json, jsonify

from app import app

from flask import request, redirect, url_for
from werkzeug.utils import secure_filename

from app.rfmodel import testfunction

@app.route('/')
def index():
    return render_template("index.html")


@app.route('/about')
def about():
    return render_template("about.html")


@app.route('/learning', methods=['POST'])
def learning():
    # request.get_data()
    data = json.loads(request.data)
    # print(data)
    response = testfunction(max_depth=data["depth"],
                            min_samples_split=data["minSampleSplit"],
                            data=data["data"], defaultdata=False)
    response = json.dumps(response)
    print(response)
    return response

@app.route('/defaultdata', methods=['POST'])
def defaultdata():
    data = json.loads(request.data)
    response = testfunction(max_depth=data["depth"],
                            min_samples_split=data["minSampleSplit"], defaultdata=True)
    response = json.dumps(response)
    print(response)
    return response

    # return jsonify(response)


