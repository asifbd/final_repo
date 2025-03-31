import puppeteer from 'puppeteer';
import fs from 'fs';


function delay(time) {
	return new Promise(function (resolve) {
		setTimeout(resolve, time)
	});
}

async function testDetailsFetching() {
	const browser = await puppeteer.launch({ headless: true });
	const context = await browser.createBrowserContext();

	let result = JSON.parse(fs.readFileSync('products-Kurta-1720989497394.json'));

	for (let product of result.products) {
		console.log('Getting details for product: ', product.link);
		let details = await getProductDetails(context, product.link).catch(e => console.error(e));
		console.log(details);
		product.details = details;
		break;
	}

	fs.writeFileSync('products-with-details.json', JSON.stringify(result, null, 2));
	console.log('All products details written to file: products.json');
}

async function getProductDetails(context, productLink) {
	console.log('Navigating to product page: ', productLink);
	const page = await context.newPage();
	await page.goto(productLink);
	console.log('Product page loaded.');

	// Click to expand the SKU section
	let skuExpandBtn = '#tab-label-test\\.tab-title'
	console.log('Waiting for SKU Expand button to be rendered. Path:', skuExpandBtn)
	await page.waitForSelector(skuExpandBtn);
	console.log('SKU expand button rendered, clicking the expander...');
	await page.click(skuExpandBtn);

	// Get the SKU
	let skuPath = '#Sku > div > div'
	console.log('Waiting for SKU to be rendered. Path:', skuPath)
	await page.waitForSelector(skuPath);
	console.log('SKU rendered.');
	let sku = await page.evaluate((skuPath) => { return document.documentElement.querySelector(skuPath).textContent }, skuPath);
	console.log('SKU:', sku);

	// Click to expand the Description section
	let descriptionBtn = '#tab-label-description-title'
	console.log('Waiting for Description Expand Button to be rendered. Path:', descriptionBtn)
	await page.waitForSelector(descriptionBtn);
	console.log('Description button rendered, clicking the expander...');
	await page.click(descriptionBtn);

	// Get the Description
	let descriptionPath = '#description > div.product.attribute.description > div';
	console.log('Waiting for Description to be rendered. Path:', descriptionPath)
	await page.waitForSelector(descriptionPath);
	console.log('Description rendered.');
	let description = await page.evaluate((descriptionPath) => { return document.documentElement.querySelector(descriptionPath).textContent }, descriptionPath);
	console.log('Description:', description, '\n\n');

	let specPath = '#product-attribute-specs-table > tbody'

	let specs = await parseTable(page, specPath);


	page.close();

	return {
		sku: sku,
		description: description,
		specs: specs
	}

}

async function run() {
	//const browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'], devtools: true});
	const browser = await puppeteer.launch({ headless: true, defaultViewport: null, args: ['--start-maximized'] });
	const context = await browser.createBrowserContext();

	// =========== Get All Products (param=context) ===========
	await getAllProducts(context);		//Writes to file, with timestamp

	await browser.close();
};

async function getAllProducts(context, categories) {
	const page = await context.newPage();
	console.log('Context created, navigating to the page');

	let categoryLinks = await getCategoryLinks(page);
	console.log(categoryLinks);

	for (let category of categoryLinks) {
		if (categories && categories.length > 0 && !categories.includes(category.title)) continue;
		//if(!category.link.includes('tops') && !category.link.includes('kurta')) continue;

		let result = await getProductsFromCategoryLink(page, category.link, 60);

		let filename = `products-${category.title}-${Date.now()}.json`;

		fs.writeFileSync(filename, JSON.stringify(result, null, 2));

		for (let product of result.products) {
			break;	//TODO:: Remove this break. For now, not collecting details of the item to keep the server load low. Also the additional image is not being parsed as of now, so we'll have to re-run anyway.
			console.log('Getting details for product: ', product.link);
			let details = await getProductDetails(context, product.link).catch(e => console.error(e));
			console.log(details);
			product.details = details;
		}

		//console.log('All products details fetched for category: ', category.link);		
		//fs.writeFileSync(filename, JSON.stringify(result, null, 2));

		console.log('All products details written to file: products.json');

		//break;
	}
}

async function waitForScrollComplete(page, productGridPath) {
	let scrollCount = 0;
	let maxScroll = 5;

	let previousHeight = await page.evaluate((productGridPath) => { return document.querySelector(productGridPath).scrollHeight }, productGridPath);

	// Keep scrolling until we have all the products
	while (scrollCount < maxScroll) {
		console.log(`Scrolling... (scroll count=${scrollCount})`);
		await page.evaluate((productGridPath) => {
			window.scrollTo(0, document.documentElement.scrollHeight);
		});

		await delay(5000);

		let currentHeight = await page.evaluate((productGridPath) => { return document.querySelector(productGridPath).scrollHeight }, productGridPath);
		//let currentHeight = await productGrid.evaluate((productGrid) => productGrid.scrollHeight);

		if (currentHeight === previousHeight) {
			break;
		} else {
			previousHeight = currentHeight;
			scrollCount++;
		}
	}
}

async function waitUntilChildrenCount(page, selector, count) {
	await page.waitForFunction(
		(selector, count) => {
			window.scrollTo(0, document.documentElement.scrollHeight);
			const element = document.querySelector(selector);
			if (element) {
				console.log('Element children count:', element.children.length);
				return element.children.length >= count;
			} else {
				return false;
			}
		},
		{},
		selector,
		count
	);

}

async function waitForScrollCompleteAuto(page, productGridPath, maxScroll = 50) {
	let scrollCount = 0;
	const perPageMaxWaitTime = 10000;

	let previousHeight = await page.evaluate((productGridPath) => { return document.querySelector(productGridPath).scrollHeight }, productGridPath);
	let waitTimeForThisPage = 0;

	// Keep scrolling until we have all the products
	while (scrollCount < maxScroll) {
		console.log(`Scrolling... (scroll count=${scrollCount})`);
		await page.evaluate((productGridPath) => {
			window.scrollTo(0, document.documentElement.scrollHeight);			// Should it be productGrid.scrollHeight?
		});

		await delay(1000);
		waitTimeForThisPage += 1000;

		let currentHeight = await page.evaluate((productGridPath) => { return document.querySelector(productGridPath).scrollHeight }, productGridPath);

		if (currentHeight === previousHeight) {
			console.log('Container has not expanded. Wait till perPageMaxWaitTime duration before considering it end of page.');

			await page.evaluate((scrollAmount) => window.scrollBy(0, -scrollAmount), 50);		// Scroll up a bit to trigger more content loading
			if (waitTimeForThisPage >= perPageMaxWaitTime) {
				console.log(`Reached the end of the page as waiteTimeForThisPage (${waitTimeForThisPage})  >= perPageMaxWaitTime (${perPageMaxWaitTime}).`);
				break;
			}
			else continue;

		} else {
			console.log(`Container has expanded from ${previousHeight} to ${currentHeight}. Continuing scrolling...\n`);
			waitTimeForThisPage = 0;

			previousHeight = currentHeight;
			scrollCount++;
		}

		let count = await getChildrenCount(page, productGridPath);
		console.log('Product count:', count);

		//if(count >= 60) break;
	}
}

async function getChildrenCount(page, selector) {
	const childrenCount = await page.evaluate((selector) => {
		const element = document.querySelector(selector);
		if (element) {
			return element.children.length;
		} else {
			return 0;
		}
	}, selector);

	return childrenCount;
}

/**
 * Retrieves products from a given category link.
 *
 * @param {Page} page - The Puppeteer page object.
 * @param {string} categoryLink - The link to the category page.
 * @param {number} [maxScroll=50] - The maximum number of times to scroll to load all products.
 * @returns {Promise<Object>} A promise that resolves to an object containing  
 * 	- products: list of parsed product objects {link, image, name, price},  
 * 	- total: total number of products mentioned in page,  
 * 	- parsed: total parsed products. This is a redundant attribute, should be removed as the length of products array can be used instead
 */
async function getProductsFromCategoryLink(page, categoryLink, maxScroll = 50) {
	console.log('Getting products from Category Link: ', categoryLink);
	await page.goto(categoryLink);

	let totalNode = '#toolbar-amount > span.toolbar-number'
	let totalProducts = await page.waitForSelector(totalNode);
	let totalProductsText = await totalProducts.evaluate(node => node.innerText);

	console.info('Total Products in the Category:', totalProductsText);

	let productGridPath = '#amasty-shopby-product-list > div.products.wrapper.grid.products-grid > ol'
	await page.waitForSelector(productGridPath);
	console.log('Product Grid Loaded');

	// Keep scrolling until we have all the products
	console.log(`Scrolling to load all products...`);
	await waitForScrollCompleteAuto(page, productGridPath, maxScroll);
	//await waitUntilChildrenCount(page, productGridPath, parseInt(totalProductsText));
	console.log('All products loaded. Now parsing...');

	await delay(1000);

	let products = await page.evaluate((productGridPath) => {
		let products = [];
		const element = document.querySelector(productGridPath);

		for (const card of element.children) {
			try {
				let itemLink = card.querySelector('div > a').href;
				let itemImg = card.querySelector('div > a > span > span > img').src?.split('?')[0] || '';
				let productName = card.querySelector('div > div > strong > a')?.textContent?.trim() || '';
				let productPrice = card.querySelector('.price-container .price')?.textContent || '';

				if (!(itemLink && itemImg && productName && productPrice)) {
					console.error(`Error parsing product card:', 'One of the required fields is missing. ${itemLink}, ${itemImg}, ${productName}, ${productPrice}`);
					continue;
				}

				products.push({
					link: itemLink,
					image: itemImg,
					name: productName,
					price: productPrice
				});
			} catch (e) {
				console.log('Error parsing product card:', e, '\n\n', card.outerHTML)
			}
		}

		return products
	}, productGridPath);

	console.log('Products parsed:', products.length, 'products found.');

	return {
		'products': products,
		'total': totalProductsText,
		'parsed': products.length
	}

}



async function parseTable(page, specPath) {
	await page.waitForSelector(specPath);

	const tableData = await page.evaluate((specPath) => {
		const table = document.querySelector(specPath);
		const rows = table.querySelectorAll('tr');

		const parsedData = {};

		for (const row of rows) {
			//const rowData = [];
			const ths = row.querySelectorAll('th');
			const tds = row.querySelectorAll('td');

			// Handle cases where there might be different numbers of ths and tds
			const cellCount = Math.max(ths.length, tds.length);

			for (let i = 0; i < cellCount; i++) {
				const thValue = ths[i]?.textContent || ''; // Get th content or empty string
				const tdValue = tds[i]?.textContent || ''; // Get td content or empty string

				//rowData.push({thValue, tdValue}); // Combine th and td values in an array
				parsedData[thValue] = tdValue;
			}

			//parsedData.push(rowData);
		}

		return parsedData;
	}, specPath);

	// Print the parsed data
	// for (const row of tableData) {
	//   console.log('Row:', row);
	// }

	return tableData;
}


/**
 * Retrieves the category links from the Aarong website.
 * 
 * @param {Page} page - The Puppeteer page object.
 * @returns {Promise<Array<Object>>} The array of category links, each containing a link and title.
 */
async function getCategoryLinks(page) {
	//let startUrl = 'https://www.aarong.com/men/panjabi'
	let startUrl = 'https://www.aarong.com/women/saree';	// Can be any category page, as nav tree is same for all

	console.log(`Getting all the Category Links by visiting the page: ${startUrl} ...`);
	await page.goto(startUrl);
	console.log('Page loaded.');

	let catFilterExpanderSelector = '#narrow-by-list > div:nth-child(1) > div.filter-options-title'
	console.log('Waiting for Category expander to be rendered. Path:', catFilterExpanderSelector)
	let expander = await page.waitForSelector(catFilterExpanderSelector);

	console.log('Category expander rendered, clicking the expander...');
	await expander.click();
	console.log('Expander clicked.');

	let categoryFilterSelector = '#narrow-by-list > div.filter-options-item.allow.active > div.filter-options-content > form > ul'
	console.log('Waiting to render filters list. Selector path: ', categoryFilterSelector);

	let element = await page.waitForSelector(categoryFilterSelector);
	console.log('Filters list rendered.');

	console.log('Parsing categories (from filters list, only first level filters are considered for now.)');
	let categories = await element.evaluate(() => {
		let categoriesNode = document.querySelector("#narrow-by-list > div.filter-options-item.allow.active > div.filter-options-content > form > ul");
		let categories = [];

		for (const category of categoriesNode.children) {
			let categoryLink = category.querySelector('a').href;
			categories.push({
				link: categoryLink,
				title: category.querySelector('a').title
			});
		}

		return categories;
	});

	console.log('Categories parsed:', categories.length, 'categories found.');

	return categories;
}

//run();

testDetailsFetching();