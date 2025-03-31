import fs from 'fs'
import path from 'path'
import axios from 'axios'


async function downloadImage(url, folderPath) {
	try {
		url = url.split('?')[0];

		const fileName = url.split('/').pop();
		const filePath = path.join(folderPath, fileName);

		if(fs.existsSync(filePath)) {
			console.warn(`>>>>>>>>>>>>>>>>>>>> Image already exists: ${fileName}`);
			return;
		}

		const response = await axios.get(url, { responseType: 'arraybuffer' });
		fs.writeFileSync(filePath, response.data);		
		console.log(`\tImage downloaded and saved as ${fileName}`);

		return fileName;		
	} catch (error) {
		console.error('Error downloading image:', error);
	}
}

export {downloadImage}