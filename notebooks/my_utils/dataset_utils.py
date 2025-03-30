import pandas as pd
from collections import Counter

def get_label_distribution(column, multi_label=True, sep=','):
    if multi_label:
        all_labels = column.dropna().apply(lambda x: x.split(sep)).sum()
    else:
        all_labels = column.dropna().tolist()
    
    label_counts = Counter(all_labels)
    return pd.DataFrame.from_dict(label_counts, orient='index', columns=['count']).sort_values(by='count', ascending=False)

def get_multilabel_counts(series):
	num_labels = {}

	for raw_labels in series:
		labels = raw_labels.split(",")
		num_labels[len(labels)] = num_labels.get(len(labels), 0) + 1

	# sort the dictionary by key in ascending order
	num_labels = dict(sorted(num_labels.items(), key=lambda item: item[0]))
	return num_labels

def get_rare_labels(column, count_threshold=10):
	# Split and flatten all labels
	all_labels = column.dropna().str.split(',').sum()
	label_counts = Counter(all_labels)

	rare_labels = {l for l, count in label_counts.items() if count < count_threshold}

	return rare_labels

def remove_labels(current_labels, labels_to_remove):
	try:
		# if not current_labels:
		# 	print(f"current_labels is empty: {current_labels}")
		# 	return current_labels
		
		labels = current_labels.split(",")

		# Remove embroidery and Machine Embroidery from the list
		for label in labels_to_remove:
			if label in labels:
				labels.remove(label)

		# Join the remaining labels back into a string
		remaining_labels = ",".join(labels)
		return remaining_labels
	
	except Exception as e:
		print(f"Error when removing {labels_to_remove} from {current_labels}: {e}")
		raise e

def get_all_labels(column, sep=',', allow_empty=False):
	# Split and flatten all labels
	all_labels = column.dropna().str.split(sep).sum()

	if not allow_empty:
		all_labels = [label for label in all_labels if label.strip() != '']
		
	return set(all_labels)

def remove_rare_labels(column, min_samples_threshold):
	"""
	Remove rare labels from the given column in the DataFrame.
	"""
	rare_labels = get_rare_labels(column, min_samples_threshold)

	if len(rare_labels) < 1:
		return column
	
	return column.apply(lambda x: remove_labels(x, rare_labels))