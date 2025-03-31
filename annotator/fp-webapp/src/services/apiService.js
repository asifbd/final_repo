import { API_BASE_URL } from "../constants";

async function getAnnotableItem() {
	try {
		const response = await fetch(`${API_BASE_URL}/api/get_annotable_item`)
		const data = await response.json()
		
		return data;

	} catch (error) {
		console.error('Error in getAnnotableItem:', error);
	}
}

async function flagItem(item) {
	try {
		const response = await fetch(`${API_BASE_URL}/api/flag_item`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(item)
		})

		const data = await response.json()
		
		return data;

	} catch (error) {
		console.error('Error in flagItem:', error);
	}
}

async function discardImage(item) {
	try {
		const response = await fetch(`${API_BASE_URL}/api/discard_image`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(item)
		})

		const data = await response.json()
		
		return data;

	} catch (error) {
		console.error('Error in discardImage:', error);
	}
}

async function saveAnnotation(item) {
	try {
		const response = await fetch(`${API_BASE_URL}/api/save_annotation`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(item)
		})

		const data = await response.json()
		
		return data;

	} catch (error) {
		console.error('Error in saveAnnotation:', error);
	}
}

export { getAnnotableItem, flagItem, discardImage, saveAnnotation };