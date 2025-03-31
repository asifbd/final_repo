//load dotenv
import dotenv from 'dotenv';
dotenv.config();

import puppeteer from 'puppeteer';
import mysql from 'mysql2/promise';
import fs from 'fs';

import { parseCategoryPage } from './categoryParser.js';
import { getProductDetails } from './skuParser.js';
import { downloadImage } from './imageDownloader.js';


async function fetchProductDetails(startId, endId) {
	if (!startId || !endId) throw new Error('Start and End IDs are required!');

	const connection = await mysql.createConnection({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME
	});

	const browser = await puppeteer.launch({ headless: true, defaultViewport: null, args: ['--start-maximized'], timeout: 8000 });
	const context = await browser.createBrowserContext();

	const [rows, fields] = await connection.execute("SELECT id, product_link FROM products WHERE flagged=0 AND processing_status IS NULL AND id between ? and ?", [startId, endId]);

	console.log('Rows:', rows.length);

	for (const row of rows) {
		console.log('Processing Row:', row);
		try {
			let details = await getProductDetails(context, row.product_link);
			await connection.execute('INSERT INTO raw_details (product_id, details) VALUES (?, ?) ON DUPLICATE KEY UPDATE details = VALUES(details)', [row.id, details]);
			await connection.execute("UPDATE products SET processing_status = 'processed' WHERE id = ?", [row.id]);
			console.log('Details saved to database for id:', row.id);
		} catch (error) {
			await connection.execute("UPDATE products SET processing_status = 'processing_error' WHERE id = ?", [row.id]);
			console.log(`$id={row.id} flagged with processing_error:`, error);
		}
		
	}

	console.log('Closing browser...');
	await browser.close();

	console.log('Closing connection...');
	await connection.end();

	console.log('All done!');
}

async function downloadProductImages(startId, endId) {
	if (!startId || !endId) throw new Error('Start and End IDs are required!');

	const connection = await mysql.createConnection({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME
	});

	const FOLDER_PATH = 'sites/aarong/aarong_all_images';

	const [rows, fields] = await connection.execute('SELECT product_id, details FROM raw_details WHERE is_image_downloaded=0 and product_id between ? and ?', [startId, endId]);

	console.log('Rows:', rows.length);

	for (const row of rows) {
		console.log(`Processing Row:: id= ${row.product_id}, Images: `, row.details.images);

		//let details = JSON.parse(row.details);
		let {details} = row;

		for (const image of details.images) {
			console.log('\tDownloading image:', image);
			await downloadImage(image, FOLDER_PATH);
		}

		await connection.execute('UPDATE raw_details SET is_image_downloaded = 1 WHERE product_id = ?', [row.product_id]);
		console.log(`Images downloaded for product_id: ${row.product_id}\n`);
	}

}

async function fetchAllProducts() {
	const browser = await puppeteer.launch({ headless: true, defaultViewport: null, args: ['--start-maximized'], timeout: 8000 });
	const context = await browser.createBrowserContext();

	let sitemap = JSON.parse(fs.readFileSync('./raw_data/aarong-sitemap-with-itemcounts.json'));

	for (let sectionName in sitemap) {
		let section = sitemap[sectionName];

		if (sectionName == 'NEW ARRIVALS') continue;

		for (let categoryName in section.categories) {
			let category = section.categories[categoryName];

			for (let subCategoryName in category.sub_categories) {
				let subCategory = category.sub_categories[subCategoryName];

				console.log('Getting products for sub-category:', subCategory.link);

				try {
					let products = await parseCategoryPage(context, subCategory.link);
					subCategory.products = products;
				} catch (e) {
					subCategory.comment = 'Error fetching products';
					subCategory.products = []
				}
			}

			if (Object.keys(category.sub_categories).length < 1) {
				console.log('Getting products for category:', category.link);
				try {
					let products = await parseCategoryPage(context, category.link);
					category.products = products;
				} catch (e) {
					category.comment = 'Error fetching products';
					category.products = []
				}
			}
		}

		try {
			const timestamp = new Date().toISOString().replace(/:/g, '-');
			fs.writeFileSync(`aarong-sitemap-with-products-${sectionName}-${timestamp}.json`, JSON.stringify(sitemap, null, 2));
		} catch (error) {
			console.error(`Error writing file for section: ${sectionName}`, error);
		}
	}

	await browser.close();
}

export { fetchProductDetails, fetchAllProducts, downloadProductImages };