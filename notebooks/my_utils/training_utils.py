import torch
from sklearn.metrics import f1_score, precision_score, recall_score, accuracy_score

def run_epoch(model, loader, optimizer, device, is_train=True, threshold=0.5):
	if is_train:
		model.train()
	else:
		model.eval()

	total_loss = 0.0
	all_preds = {k: [] for k in model.heads}
	all_targets = {k: [] for k in model.heads}

	for images, labels in tqdm(loader):
		images = images.to(device)
		labels = {k: v.to(device) for k, v in labels.items()}

		if is_train:
			optimizer.zero_grad()

		with torch.set_grad_enabled(is_train):
			outputs = model(images)
			losses = []

			for task in outputs:
				loss = torch.nn.functional.binary_cross_entropy_with_logits(outputs[task], labels[task])
				losses.append(loss)

				if not is_train:
					probs = torch.sigmoid(outputs[task])
					preds = (probs > threshold).int()
					all_preds[task].extend(preds.cpu().numpy())
					all_targets[task].extend(labels[task].cpu().numpy())

			batch_loss = sum(losses)
			total_loss += batch_loss.item()

			if is_train:
				batch_loss.backward()
				optimizer.step()

	avg_loss = total_loss / len(loader)

	if not is_train:
		metrics = {
			task: {
				'f1': f1_score(all_targets[task], all_preds[task], average='micro', zero_division=0),
				'precision': precision_score(all_targets[task], all_preds[task], average='micro', zero_division=0),
				'recall': recall_score(all_targets[task], all_preds[task], average='micro', zero_division=0),
				'accuracy': accuracy_score(all_targets[task], all_preds[task])
			}
			for task in all_preds
		}
		return avg_loss, metrics
	else:
		return avg_loss

def train_model(model, train_loader, val_loader, optimizer, device, num_epochs=10, threshold=0.5, verbose=True):
	model.to(device)
	best_val_loss = float('inf')
	patience = 3
	patience_counter = 0

	history = {
		'train_loss': [],
		'val_loss': [],
		'val_metrics': []
	}

	for epoch in range(num_epochs):
		print(f"\nEpoch {epoch+1}/{num_epochs}")
		train_loss = run_epoch(model, train_loader, optimizer, device, is_train=True)
		val_loss, val_metrics = run_epoch(model, val_loader, optimizer, device, is_train=False, threshold=threshold)

		history['train_loss'].append(train_loss)
		history['val_loss'].append(val_loss)
		history['val_metrics'].append(val_metrics)

		print(f"Train Loss: {train_loss:.4f}")
		print(f"Val Loss: {val_loss:.4f}")

		if verbose:
			for task, task_metrics in val_metrics.items():
				print("Metrics for task:", task)
				for metric_name, metric_value in task_metrics.items():
					print(f"\t[Val {metric_name}]: {metric_value:.4f}")

		# Early stopping
		if val_loss < best_val_loss:
			best_val_loss = val_loss
			patience_counter = 0
			torch.save(model.state_dict(), '../data/model_weights/best_model_resnet18.pt')
		else:
			patience_counter += 1
			if patience_counter >= patience:
				print("Early stopping triggered.")

				return history
				#break

	return history