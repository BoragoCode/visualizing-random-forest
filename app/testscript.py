from sklearn import datasets
import pandas as pd
from sklearn import tree
from sklearn.datasets import load_iris
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder
from collections import defaultdict

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

def testfunction(data):
    # print(data)
    target_column = 'label'
    # create a dataframe object
    dataset =pd.DataFrame.from_records(data)

    # separating label data from rest of the data
    X, y = dataset.drop(target_column, axis=1), dataset[target_column]

    clf = DecisionTreeClassifier(max_depth=3)
    clf.fit(X, y)
    test1, test2 = X.columns.values, y.unique()
    tree = rules(clf, X.columns.values, y.unique())

    '''
    clf = tree.DecisionTreeClassifier()
    iris = load_iris()
    clf = clf.fit(iris.data, iris.target)
    dotfile = open("tree.dot", 'w')
    tree.export_graphviz(clf, out_file = 'tree.dot')
    dotfile.close()
    '''



    if data:
        # return cross_validated_scores
        return tree
        # return ['hello test data', ' inside the function']
    else:
        return ['data not found', ': inside tree function']
