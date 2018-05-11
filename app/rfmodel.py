import pandas as pd
import numpy as np
from sklearn.datasets import load_iris
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from collections import defaultdict
from sklearn.model_selection import cross_val_score

import json

def datapreprocessing(dataset):
    # data preprocessing
    d = defaultdict(LabelEncoder)

    # Encoding the variable
    fit = dataset.apply(lambda x: d[x.name].fit_transform(x))

    # Inverse the encoded
    fit.apply(lambda x: d[x.name].inverse_transform(x))

    # Using the dictionary to label future data
    dataset = dataset.apply(lambda x: d[x.name].transform(x))
    return dataset


def aggregateTree(tree, features, labels, agg, node_index=0):
    if tree.children_left[node_index] == -1:  # indicates leaf
        # agg['leaf'] = agg.get('leaf', 0) + 1
        agg['name'] = agg.get('name', {})
        agg['name']['leaf'] = agg['name'].get('leaf', 0) + 1
        # to avoid setting the flag when it was set to false before
        if agg.get('isLeaf', True):  # if not set before set flag to true
            agg['isLeaf'] = True
        else:  # if false before set to false
            agg['isLeaf'] = False

    else:
        feature = features[tree.feature[node_index]]
        threshold = tree.threshold[node_index]
        agg['name'] = agg.get('name', {})
        agg['name'][feature] = agg['name'].get(feature, 0) + 1
        agg['isLeaf'] = False
        left_index = tree.children_left[node_index]
        right_index = tree.children_right[node_index]
        children = agg.get('children', [{}, {}])
        agg['children'] = [aggregateTree(tree, features, labels, children[0], right_index),
                           aggregateTree(tree, features, labels, children[1], left_index)]
    return agg

def aggregateTrees(trees, features, labels):
    agg = {}
    for tree in trees:
        agg = aggregateTree(tree, features, labels, agg)
    return agg





def rules(clf, features, labels, node_index=0):
    """Structure of rules in a fit decision tree classifier

    Parameters
    ----------
    clf : DecisionTreeClassifier
        A tree that has already been fit.

    features, labels : lists of str
        The names of the features and labels, respectively.

    """
    node = {}
    if clf.tree_.children_left[node_index] == -1:  # indicates leaf
        count_labels = zip(clf.tree_.value[node_index, 0], labels)
        # name is just an identifier for tree layout in js not being used any where
        node['name'] = ', '.join(('{} : {}'.format(label, int(count))
                                  for count, label in count_labels))
        node['leafCounts'] = list(zip(labels, clf.tree_.value[node_index, 0]))
        node['isLeaf'] = True

    else:
        feature = features[clf.tree_.feature[node_index]]
        threshold = clf.tree_.threshold[node_index]
        node['name'] = feature
        # node['rule'] = '{} > {}'.format(feature, threshold)
        # node['rule'] = {feature: threshold}
        node['rule'] = [feature, threshold]
        node['isLeaf'] = False
        left_index = clf.tree_.children_left[node_index]
        right_index = clf.tree_.children_right[node_index]
        node['children'] = [rules(clf, features, labels, right_index),
                            rules(clf, features, labels, left_index)]
    return node


# if default data then load iris
def treefunction(max_depth, min_samples_split, data='null', defaultdata=True):
    # if max_depth:
    if max_depth != "":
        max_depth = int(max_depth)  # parse value
    else:
        max_depth = None
    if min_samples_split != "":
        min_samples_split = int(min_samples_split)  # parse value
    else:
        min_samples_split = 2  # default value

    if defaultdata:
        iris = load_iris()
        X, y = iris.data, iris.target
        model = RandomForestClassifier(max_depth=max_depth,
                                       min_samples_split=min_samples_split,
                                       random_state=0)
        model.fit(X, y)
        # model.estimators_[i].tree_ gives ith tree
        tree = rules(model.estimators_[0], iris.feature_names, iris.target_names)
        # TODO: aggregate the trees such that features and respective occurance at each level is recorded
        # model.estimators_: list of sk learn decision trees
        # print(json.dumps(agg_tree, indent=2))
        # print("----tree----")
        # print(json.dumps(tree, indent=2))
        return tree
    else:
        target_column = 'label'
        # create a dataframe object
        dataset =pd.DataFrame.from_records(data)
        # separating label data from rest of the data
        X, y = dataset.drop(target_column, axis=1), dataset[target_column]
        # fit a randomforestclassifier
        model = RandomForestClassifier(max_depth=max_depth,
                                       min_samples_split=min_samples_split, random_state=0)
        model.fit(X, y)
        # model.estimators_[i].tree_ gives ith tree
        tree = rules(model.estimators_[0], X.columns.values, y.unique())
        return tree


# if default data then load iris
def aggr_treefunction(max_depth, min_samples_split,  n_estimators, data='null', defaultdata=True):
    # if max_depth:
    if max_depth != "":
        max_depth = int(max_depth)  # parse value
    else:
        max_depth = None
    if min_samples_split != "":
        min_samples_split = int(min_samples_split)  # parse value
    else:
        min_samples_split = 2  # default value
    if n_estimators != "":
        n_estimators = int(n_estimators)  # parse value
    else:
        n_estimators = 10  # default value

    if defaultdata:
        iris = load_iris()
        X, y = iris.data, iris.target
        model = RandomForestClassifier(max_depth=max_depth,
                                       min_samples_split=min_samples_split,
                                       random_state=0, n_estimators=n_estimators)
        model.fit(X, y)
        # aggregate the trees such that features and respective occurance at each level is recorded
        # model.estimators_: list of sk learn decision trees
        agg_tree = aggregateTrees([e.tree_ for e in model.estimators_], iris.feature_names, iris.target_names)
        feature_importance = (dict(zip(iris.feature_names, model.feature_importances_)))
        feature_importance["cv_accuracy"] = np.mean(cross_val_score(model, X, y, cv=3))
        # print("----tree----")
        # print(json.dumps(agg_tree, indent=2))
        return agg_tree, feature_importance
    else:
        target_column = 'label'
        # create a dataframe object
        dataset =pd.DataFrame.from_records(data)
        # separating label data from rest of the data
        X, y = dataset.drop(target_column, axis=1), dataset[target_column]
        # fit a randomforestclassifier
        model = RandomForestClassifier(max_depth=max_depth,
                                       min_samples_split=min_samples_split,
                                       random_state=0, n_estimators=n_estimators)
        model.fit(X, y)
        # aggregate the trees such that features and respective occurance at each level is recorded
        # model.estimators_: list of sk learn decision trees
        agg_tree = aggregateTrees([e.tree_ for e in model.estimators_], X.columns.values, y.unique())
        # print("----tree----")
        # print(json.dumps(agg_tree, indent=2))
        feature_importance = dict(zip(X.columns.values, model.feature_importances_))
        feature_importance["cv_accuracy"] = np.mean(cross_val_score(model, X, y, cv=3))
        return agg_tree, feature_importance


if __name__ == '__main__':
    aggr_treefunction(defaultdata=True, max_depth="", min_samples_split="", n_estimators=5)
    # treefunction(defaultdata=True, max_depth="", min_samples_split="")
