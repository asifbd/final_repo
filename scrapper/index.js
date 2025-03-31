import { fetchProductDetails, fetchAllProducts, downloadProductImages } from './sites/aarong/index.js';

async function main() {
	const args = process.argv.slice(2); // Skips first two args (node and script name)

	if (args.length < 3) {
		console.error('Please provide a site name');
		return;
	}

	const action = args[0];

	switch (action) {
		case 'fetchProductDetails':
			await fetchProductDetails(args[1], args[2]);
			break;
		case 'fetchAllProducts':
			await fetchAllProducts();
			break;
		case 'downloadProductImages':
			await downloadProductImages(args[1], args[2]);
			break;
		default:
			console.error('Invalid action');
	}

	console.log('Done');
}

main()
	.then(() => {
		console.log('Script completed');
		process.exit(0); // Exit the script with a success status code
	})
	.catch((e) => {
		console.error('Error running script:', e);
		process.exit(1); // Exit the script with an error status code
	});