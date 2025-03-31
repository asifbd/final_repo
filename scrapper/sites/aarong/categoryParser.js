//import fs from 'fs';

// async function getAllCategoryTotals(context) {
// 	// Load aarong-sitemap.json
// 	let sitemap = JSON.parse(fs.readFileSync('aarong-sitemap.json'));

// 	console.log('Total sections:', Object.keys(sitemap).length);

// 	for (let sectionName in sitemap) {
// 		let section = sitemap[sectionName];

// 		for (let categoryName in section.categories) {
// 			let category = section.categories[categoryName];

// 			console.log('Getting total for category:', category.link);
// 			try {
// 				let total = await getCategoryTotal(context, category.link);
// 				category.total = total;
// 			} catch (e) {
// 				category.comment = 'Error fetching total';
// 				category.total = 0
// 			}
// 		}
// 	}

// 	fs.writeFileSync('aarong-sitemap-with-itemcounts.json', JSON.stringify(sitemap, null, 2));
// }

async function getCategoryTotal(context, categoryLink) {
	console.log('Navigating to Category Page: ', categoryLink);
	const page = await context.newPage();
	await page.goto(categoryLink);

	let totalNode = '#toolbar-amount > span.toolbar-number'
	let totalProducts = await page.waitForSelector(totalNode);
	let totalProductsText = await totalProducts.evaluate(node => node.innerText);

	console.info('Total Products in the Category:', totalProductsText);
	return totalProductsText;
}

async function parseCategoryPage(context, categoryLink, maxScroll = 200) {
	console.log('Getting products from Category Link: ', categoryLink);
	const page = await context.newPage();
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

function delay(time) {
	return new Promise(function (resolve) {
		setTimeout(resolve, time)
	});
}

async function waitForScrollCompleteAuto(page, productGridPath, maxScroll = 200) {
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
			console.log(`Container has not expanded. Wait till perPageMaxWaitTime duration (${waitTimeForThisPage}/${perPageMaxWaitTime}) before considering it end of page.`);

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

export { parseCategoryPage }