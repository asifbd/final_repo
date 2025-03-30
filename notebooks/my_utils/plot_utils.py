import matplotlib.pyplot as plt

def plot_metrics_for_task(history, task, show_metrics=['f1', 'precision', 'recall', 'accuracy'], show_losses=False):
	# Extract metrics for the specified task
	f1_scores = [epoch_metrics[task]['f1'] for epoch_metrics in history['val_metrics']]
	precision_scores = [epoch_metrics[task]['precision'] for epoch_metrics in history['val_metrics']]
	recall_scores = [epoch_metrics[task]['recall'] for epoch_metrics in history['val_metrics']]
	accuracy_scores = [epoch_metrics[task]['accuracy'] for epoch_metrics in history['val_metrics']]
	
	# Create figure
	plt.figure(figsize=(10, 6))
	
	# Plot the metrics
	if 'f1' in show_metrics:
		plt.plot(f1_scores, label='F1 Score', color='blue', marker='o')
	
	if 'precision' in show_metrics:
		plt.plot(precision_scores, label='Precision', color='orange', marker='s')
	
	if 'recall' in show_metrics:
		plt.plot(recall_scores, label='Recall', color='green', marker='^')
	
	if 'accuracy' in show_metrics:
		plt.plot(accuracy_scores, label='Accuracy', color='red', marker='*')

	if show_losses:
		# Scale into 0,1 range
		rescaled_train_loss = [x / max(history['train_loss']) for x in history['train_loss']]
		rescaled_val_loss = [x / max(history['val_loss']) for x in history['val_loss']]
		
		plt.plot(rescaled_train_loss, label='Scaled Train Loss', color='purple', linestyle=':')
		plt.plot(rescaled_val_loss, label='Scaled Validation Loss', color='brown', linestyle='--')
	
	plt.title(f'{task.capitalize()} - Performance Metrics')
	plt.xlabel('Epoch')
	plt.ylabel('Score')
	plt.legend()
	plt.grid(True, linestyle='--', alpha=0.7)

	plt.xticks(ticks=range(len(history['train_loss'])), labels=range(1, len(history['train_loss']) + 1))
	plt.yticks(ticks=[i / 10 for i in range(0, 11)], labels=[f'{i/10:.1f}' for i in range(0, 11)])
	
	plt.tight_layout()
	plt.show()

def plot_train_val_loss(history):
	plt.plot(history['unweighted_train_loss'], label='unweighted_train_loss')
	plt.plot(history['val_loss'], label='val_loss')
	plt.xlabel('Epochs')
	plt.ylabel('Loss')
	plt.legend()
	plt.grid(True, linestyle='--', alpha=0.7)

	plt.xticks(ticks=range(len(history['train_loss'])), labels=range(1, len(history['train_loss']) + 1))

	plt.show()

def compare_tasks_for_metric(history, metric_name, show_losses=False):
	plt.figure(figsize=(10, 6))

	tasks = history['val_metrics'][0].keys()

	for task in tasks:
		# Extract specific metric for the task
		metric_scores = [epoch_metrics[task][metric_name] for epoch_metrics in history['val_metrics']]
		plt.plot(metric_scores, label=task)

	if show_losses:
		# Scale into 0,1 range
		rescaled_train_loss = [x / max(history['train_loss']) for x in history['train_loss']]
		rescaled_val_loss = [x / max(history['val_loss']) for x in history['val_loss']]
		
		plt.plot(rescaled_train_loss, label='Scaled Train Loss', color='purple', linestyle=':')
		plt.plot(rescaled_val_loss, label='Scaled Validation Loss', color='brown', linestyle='--')
	
	plt.title(f'{metric_name.capitalize()} - Performance Metrics')
	plt.xlabel('Epoch')
	plt.ylabel(metric_name.capitalize())
	plt.legend()
	plt.grid(True, linestyle='--', alpha=0.7)

	plt.xticks(ticks=range(len(history['train_loss'])), labels=range(1, len(history['train_loss']) + 1))
	plt.yticks(ticks=[i / 10 for i in range(0, 11)], labels=[f'{i/10:.1f}' for i in range(0, 11)])

	plt.tight_layout()
	plt.show()

def plot_classwise_metric(classwise_metric, task_name='task', metric_name='metric', color='purple'):
	"""Plots the classwise metric for a given task."""

	plt.figure(figsize=(6, 3))
	plt.bar(classwise_metric.keys(), classwise_metric.values(), color=color)
	plt.title(f'{task_name.capitalize()} - {metric_name.capitalize()}')
	plt.xlabel('Class Labels')
	plt.ylabel(metric_name.capitalize())
	plt.xticks(rotation=90)
	plt.grid(axis='y', linestyle='--', alpha=0.7)
	plt.tight_layout()
	plt.show()