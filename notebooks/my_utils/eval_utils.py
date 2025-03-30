import json

def get_classwise_metric(classwise_metrics, task_name, metric_name):
	"""Returns a dictionary of class labels and corresponding metric value."""

	return {class_label: class_metrics[metric_name] for class_label, class_metrics in classwise_metrics[task_name].items()}

def parse_task_metrics(history, verbose=False):
	best_epoch_index = history['best_epoch']

	if verbose:
		print(f"Best Epoch #: {best_epoch_index + 1}")

	metrics = history['val_metrics'][best_epoch_index]

	# Separate out classwise_metrics from each task metrics, makes easy to view taskwise metrics
	task_metrics = {task: {k: v for k, v in metrics[task].items() if k != 'classwise_metrics'} for task in metrics}
	classwise_metrics = {task: metrics[task]['classwise_metrics'] for task in metrics}

	return task_metrics, classwise_metrics

def parse_task_metrics_from_test(metrics):
	task_metrics = {task: {k: v for k, v in metrics[task].items() if k != 'classwise_metrics'} for task in metrics}
	classwise_metrics = {task: metrics[task]['classwise_metrics'] for task in metrics}

	return task_metrics, classwise_metrics

def load_task_metrics(history_path):
	with open(history_path, 'r') as f:
		history = json.load(f)
	return parse_task_metrics(history)

def load_task_metrics_for_test(metrics_path):
	with open(metrics_path, 'r') as f:
		metrics = json.load(f)

	#test_loss, test_metrics = metrics['test_loss'], metrics['test_metrics']
	
	return parse_task_metrics_from_test(metrics['test_metrics'])