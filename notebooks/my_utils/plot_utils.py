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
		normalized_train_loss = [(loss - min(history['train_loss'])) / (max(history['train_loss']) - min(history['train_loss'])) for loss in history['train_loss']]
		plt.plot(normalized_train_loss, label='Normalized Train Loss', color='purple', linestyle=':')

		normalized_val_loss = [(loss - min(history['val_loss'])) / (max(history['val_loss']) - min(history['val_loss'])) for loss in history['val_loss']]
		plt.plot(normalized_val_loss, label='Normalized Validation Loss', color='brown', linestyle='--')
	
	plt.title(f'{task.capitalize()} - Performance Metrics')
	plt.xlabel('Epoch')
	plt.ylabel('Score')
	plt.legend()
	plt.grid(True, linestyle='--', alpha=0.7)

	plt.xticks(ticks=range(len(history['train_loss'])), labels=range(1, len(history['train_loss']) + 1))
	
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
		normalized_train_loss = [(loss - min(history['train_loss'])) / (max(history['train_loss']) - min(history['train_loss'])) for loss in history['train_loss']]
		plt.plot(normalized_train_loss, label='Normalized Train Loss', color='purple', linestyle=':')

		normalized_val_loss = [(loss - min(history['val_loss'])) / (max(history['val_loss']) - min(history['val_loss'])) for loss in history['val_loss']]
		plt.plot(normalized_val_loss, label='Normalized Validation Loss', color='brown', linestyle='--')
	
	plt.title(f'{metric_name.capitalize()} - Performance Metrics')
	plt.xlabel('Epoch')
	plt.ylabel(metric_name.capitalize())
	plt.legend()
	plt.grid(True, linestyle='--', alpha=0.7)

	plt.xticks(ticks=range(len(history['train_loss'])), labels=range(1, len(history['train_loss']) + 1))

	plt.tight_layout()
	plt.show()