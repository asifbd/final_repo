async function getProductDetails(context, productLink) {
	console.log('Navigating to product page: ', productLink);
	const page = await context.newPage();
	await page.goto(productLink);
	console.log('Product page loaded.');

	// Get Product Title and Price
	let titlePath = 'div.page-title-wrapper.product > h1 > span';
	console.log('Waiting for Product Title to be rendered. Path:', titlePath)
	await page.waitForSelector(titlePath);
	console.log('Product Title rendered.');
	let title = await page.evaluate((titlePath) => { return document.documentElement.querySelector(titlePath).textContent }, titlePath).catch((err) => { return 'Title not found.' });

	let pricePath = 'span.price';
	let price = await page.evaluate((pricePath) => { return document.documentElement.querySelector(pricePath).textContent }, pricePath).catch((err) => { return 'Price not found.' });

	let numericPricePath = 'meta[itemprop="price"]'
	let priceNumeric = await page.evaluate((numericPricePath) => { return document.documentElement.querySelector(numericPricePath).content }, numericPricePath).catch((err) => { return 'NULL' });

	let priceCurrencyPath = 'meta[itemprop="priceCurrency"]'
	let priceCurrency = await page.evaluate((priceCurrencyPath) => { return document.documentElement.querySelector(priceCurrencyPath).content }, priceCurrencyPath).catch((err) => { return 'NULL' });

	let availabilityPath = 'div.product-info-stock-sku > div > span'
	let availability = await page.evaluate((availabilityPath) => { return document.documentElement.querySelector(availabilityPath).textContent }, availabilityPath).catch((err) => { return 'Unknown.' });

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

	// Get the image urls
	//let imagesDivPath = 'div.fotorama__stage__shaft.fotorama__grab'
	//await page.waitForSelector(imagesDivPath);

	let imagesPath = 'img.fotorama__img';
	await page.waitForSelector(imagesPath);
	console.log('Image tags rendered.');
	
	let images = await page.evaluate((imagesPath) => {
		let imgTags = document.querySelectorAll(imagesPath);
		let imgUrls = [];

		imgTags.forEach((imgTag) => {imgTag && imgTag.src && imgUrls.push(imgTag.src)});

		return imgUrls;
	}, imagesPath).catch((err) => { return [] });

	console.log('Images:', images);

	page.close();

	return {
		sku: sku,
		title: title,
		price: price,
		priceNumeric: priceNumeric,
		priceCurrency: priceCurrency,
		availability: availability,
		description: description,
		specs: specs,
		images: images
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

export { getProductDetails };