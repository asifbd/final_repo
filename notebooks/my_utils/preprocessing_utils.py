import pandas as pd

from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.preprocessing import OneHotEncoder

def ml_binarizer(df, column_name):
	"""
	Function to transform a column of lists into one-hot encoded columns.
	"""
	mlb = MultiLabelBinarizer()

	temp_col = column_name + '_as_list'
	df[temp_col] = df[column_name].apply(lambda x: x.split(',') if isinstance(x, str) else [])

	one_hot = mlb.fit_transform(df[temp_col])

	one_hot_cols = [f"{column_name}__{c}" for c in mlb.classes_]

	one_hot_df = pd.DataFrame(one_hot, columns=one_hot_cols, index=df.index)

	return pd.concat([df, one_hot_df], axis=1).drop(columns=[temp_col])


def onehot_encode(df, column_name):
	"""
	Generate onehot encoded columns for given column
	"""
	ohe = OneHotEncoder(sparse_output=False, drop='first')
	
	one_hot = ohe.fit_transform(df[[column_name]])
	
	#oh_columns = [f"{column_name}__{oh_category}" for oh_category in ohe.categories_[0]]
	oh_columns = [f"{column_name}__{oh_category}" for oh_category in ohe.categories_[0][1:]]
	one_hot_df = pd.DataFrame(one_hot, columns=oh_columns, index=df.index)

	return pd.concat([df, one_hot_df], axis=1)

