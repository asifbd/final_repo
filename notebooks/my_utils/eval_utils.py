import json
import pandas as pd

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

def compare_task_with_baseline(baseline_metrics, model_metrics, metrics=['accuracy', 'f1', 'precision', 'recall'], baseline_model_name ='ResNet18', new_model_name='??'):
	baseline_perf = pd.DataFrame.from_dict(baseline_metrics, orient='index').T
	model_perf = pd.DataFrame.from_dict(model_metrics, orient='index').T

	rows = []

	for metric in metrics:
		for task in baseline_perf.T.index:
			baseline_value = baseline_perf[task][metric]
			model_value = model_perf[task][metric]
			delta = model_value - baseline_value

			row = {
				'Metric': metric,
				'Task': task,
				f'Baseline ({baseline_model_name})': round(baseline_value, 2),
				f'{new_model_name}': round(model_value, 2),
				'Delta': round(delta, 2)
			}

			rows.append(row)

	comparison_df = pd.DataFrame(rows)

	return comparison_df