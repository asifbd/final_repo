from torch.utils.data import Dataset
from PIL import Image
import torch

class CustomMTLDataset(Dataset):
	def __init__(self, df, image_dir, transform=None):
		self.df = df.reset_index(drop=True)
		self.image_dir = image_dir
		self.transform = transform

		# Specifying label groups for each classification head
		self.label_columns = {
			'fabric': [col for col in df.columns if col.startswith('fabric_types_clean__')],
			'wear': [col for col in df.columns if col.startswith('wear_types_clean__')],
			'color': [col for col in df.columns if col.startswith('colors_clean__')],
			'texture': [col for col in df.columns if col.startswith('textures_clean__')],
			'value_add': [col for col in df.columns if col.startswith('value_additions_clean__')],
		}

	def __len__(self):
		return len(self.df)

	def __getitem__(self, idx):
		row = self.df.iloc[idx]
		
		image_path = f"{self.image_dir}/{row['annotated_image_name']}"
		image = Image.open(image_path).convert("RGB")
		
		if self.transform:
			image = self.transform(image)

		# Extract labels for each separate task
		labels = {
			task: torch.tensor(row[self.label_columns[task]].values.astype('float32'))
			for task in self.label_columns
		}

		return image, labels