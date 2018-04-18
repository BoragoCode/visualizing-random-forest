import pandas as pd
import sklearn
from sklearn.datasets import load_iris
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from collections import defaultdict
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
        node['name'] = ', '.join(('{} of {}'.format(int(count), label)
                                  for count, label in count_labels))
    else:
        feature = features[clf.tree_.feature[node_index]]
        threshold = clf.tree_.threshold[node_index]
        node['name'] = '{} > {}'.format(feature, threshold)
        left_index = clf.tree_.children_left[node_index]
        right_index = clf.tree_.children_right[node_index]
        node['children'] = [rules(clf, features, labels, right_index),
                            rules(clf, features, labels, left_index)]
    return node


# if default data then load iris
def testfunction(data = 'null', defaultdata = True):
    if defaultdata == True:
        iris = load_iris()
        X, y = iris.data, iris.target

        model = RandomForestClassifier(max_depth=3, random_state=0)
        model.fit(X, y)
        # model.estimators_[i].tree_ gives ith tree
        tree = rules(model.estimators_[0], iris.feature_names, iris.target_names)
        tree_list = []
        # TODO: aggregate the trees such that features and respective occurance at each level is recorded
        # model.estimators_: list of sk learn decision trees
        for index in range(len(model.estimators_)):
            tree_list.append(rules(model.estimators_[index], iris.feature_names, iris.target_names))
        # print(json.dumps(tree_list, indent=2, sort_keys=True))
        # print(tree_list)
        # print(model.estimators_[0].tree_)
        # print(model.estimators_[0].tree_.children_left)
        # print(model.estimators_[0].tree_.children_right)
        # print(iris.feature_names[model.estimators_[0].tree_.feature[0]])
        print(json.dumps(tree, indent=2, sort_keys=True))
        return tree
    else:
        # data = data["data"]
        target_column = 'label'
        # create a dataframe object
        dataset =pd.DataFrame.from_records(data)
        # separating label data from rest of the data
        X, y = dataset.drop(target_column, axis=1), dataset[target_column]
        # fit a randomforestclassifier
        model = RandomForestClassifier(max_depth=3, random_state=0)
        model.fit(X, y)
        # model.estimators_[i].tree_ gives ith tree
        tree = rules(model.estimators_[0], X.columns.values, y.unique())


    if data:
        return tree
    else:
        return ['data not found', ': inside tree function']


# if __name__ == '__main__':
#     testfunction(defaultdata=True)