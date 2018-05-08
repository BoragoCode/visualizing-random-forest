
from flask import render_template, flash, json, jsonify

from app import app

from flask import request, redirect, url_for
from werkzeug.utils import secure_filename

from app.rfmodel import treefunction, aggr_treefunction

@app.route('/')
def index():
    return render_template("index.html")


# @app.route('/about')
# def about():
#     return render_template("about.html")

@app.route('/random_forest')
def random_forest():
    return render_template("random_forest.html")


@app.route('/learning', methods=['POST'])
def learning():
    # request.get_data()
    data = json.loads(request.data)
    # print(data)
    response = treefunction(max_depth=data["depth"],
                            min_samples_split=data["minSampleSplit"],
                            data=data["data"], defaultdata=False)
    response = json.dumps(response)
    # print(response)
    return response


@app.route('/defaultdata', methods=['POST'])
def defaultdata():
    data = json.loads(request.data)
    if 'n_estimators' in data:
        response = aggr_treefunction(max_depth=data["depth"],
                                min_samples_split=data["minSampleSplit"],
                                     n_estimators=data["n_estimators"], defaultdata=True)
    else:
        response = treefunction(max_depth=data["depth"],
                                min_samples_split=data["minSampleSplit"], defaultdata=True)
    response = json.dumps(response)
    # print(response)
    return response


