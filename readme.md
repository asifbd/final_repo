# Overview

This repository contains the code that has been written for this project, as well as part of the data that was collected and curated to build a completely new dataset.

There are a few different applications or types of code that are included in this repository, a quick overview below:

- **Scrapper**: Scrapper scripts that were used to scrape image and text metadata from the web.

- **Annotator**: A simple web application that was built to facilitate rapid manual annotation and review of the scraped data. This also relies on a backend API that serves the annotable items from the database, and saves the annotations back to the database. The API exists as a python script, which was originally implemented as a notebook which also exists in the notebooks folder.

- **Database**: A MySQL database was used to store scrapped data in a structured manner, and to be able to scrape/annotate related metadata in a resumable approach.

- **Notebooks**: A collection of Jupyter notebooks that were used to experiment with different ideas and strategies for various steps of the process. This includes dataset curation, model training, and other related tasks.

Below is a slightly more elaborate description of those components, to help the reader understand the purpose of each component, and be able to navigate the repository.


## Scrapper

TODO:: Add details after importing scrapper code into the repo


## Annotator

TODO:: Add details after importing annotator code into the repo

## Database

TODO:: Add some details about the schema


## Notebooks

At various stages of this coursework, I used several Jupyter notebooks to experiment with different ideas and strategies for various steps of the process. Throughout the project, I tried to keep the notebooks brief and logically separate so that it's easy to navigate, which is why there is quite a number of notebooks here as opposed to a few long notebooks. Hopefully, with the brief descriptions below, it will be easy to navigate to appropriate notebooks when needed.

Following is the list of notebooks that exist in this repository, along with a brief description.

### Dataset Curation Related Notebooks

Below notebooks were used for various steps in curating the dataset.

- **segmentation**: Refactors segmentation code to a Class to be able to reuse

- **batch_segmentation**: 
	Get scraped product information from db, normalize the json fields in scraped data into dataframes, get annotation candidates from db, get segmentation canidates from db, use Segmentation Helper class to segment items etc.

- **resizer**:
	Inspects all image files to determine ideal resolution. Resizes all raw images according to a defined resizer, and puts them in a separate directory.

- **review_product**:
	This notebook provides a simple way to quickly look up one or more products, their raw metadata, and relevant images. Was useful for quick inspection from time to time.

- **text_analysis**:
	This notebook performs some NLP techniques to analyze the raw textual metadata available for each scraped product. This was useful to determine potential labels that can be inferred from the title/description etc. 

- **extract_labels**:
	This notebook is used to analyze available attributes and their values, and potentially map the attributes with wider range of values to a smaller set of generic values so that there is enough sample available for each class.

- **annotation_backend**:
	Serves API endpoints to get annotable items from DB, save annotations to DB. This API is used by annotator frontend.

- **label_encoding**:
	This notebook is intended to briefly experiment on different ways to encode the labels to understand which one makes sense for model training.

- **refine_dataset**:
	This notebook uses the raw annotations available in database to prepare a refined dataset and export to csv, which then can be used for model training.


### Model Traing Related Notebooks

- **simgle_feature_classification**:
	This was an early attempt to fine-tune effnet for single feature classification using a preliminary version of the dataset where many of the features were auto-annotated using simple rules, without any manual review. This was just to do a quick initial test with the available data and see if the model can learn anything useful. Aftewards, when manual annotations were done and dataset matured, more mature classification models (including MTL) is attempted.


- **training_dataset_review**:
	This notebook loads the curated dataset from csv file, reviews the features, and does some cleanup to prepare for model training such as removing rare feature labels etc. Then it plots some visualization to look at some of the samples, class distribution for different features etc.

- **training_mtl_resnet**:
	This notebook is used to train a multi-task learning model using ResNet18 backbone.

- **training_mtl_effnet**:
	This notebook is used to train a multi-task learning model using EfficientNet backbone. This also introduces some additional techniques on top of what was tried on previous resnet attempt.

