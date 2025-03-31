import { useEffect, useState } from "react"
import { Button, Snackbar, TextField, Typography } from "@mui/material";
import ReviewImage from "../components/ReviewImage";
import ProductMetadata from "../components/ProductMetadata";
import { API_BASE_URL, colors, fabricTypes, textures, valueAdditions, wearTypes } from "../constants";

const predefinedAnnotationClasses = {
	fabricTypes: fabricTypes,
	wearTypes: wearTypes,
	textures: textures,
	valueAdditions: valueAdditions,
	colors: colors,
	tags: []
}


///images/segmented/0410000094320_1_1.jpg/0410000094320_1_1.jpg___upper.png


function Review() {
	const [annotableItem, setAnnotableItem] = useState(null);
	const [commentText, setCommentText] = useState('');

	const [notification, setNotification] = useState(false);

	const [info, setInfo] = useState({});

	const getAnnotableItem = async () => {
		setAnnotableItem(null);
		try {
			const response = await fetch(`${API_BASE_URL}/api/get_annotable_item`)
			const {item, info} = await response.json()

			//console.log(item)
			setAnnotableItem(item);
			setInfo(info);
		} catch (error) {
			console.error('Error in getAnnotableItem:', error)
		}
	}

	const flagItem = async () => {
		try {
			let payload = {
				id: annotableItem.id,
				comment: commentText,
			}

			//const response = 
			await fetch(`${API_BASE_URL}/api/flag_item`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			setNotification('Item flagged, loading next..');

			setCommentText('');
			await getAnnotableItem();

			// const data = await response.json()			
			// return data;

		} catch (error) {
			console.error('Error in flagItem:', error);
		}
	}


	useEffect(() => {
		getAnnotableItem();
	}, [])

	return (
		<div style={{ display: 'flex', overflow: 'auto', height: '90vh', padding: 10 }}>
			<div style={{ width: '25%' }}>
				<h1>Review Item</h1>
				<ProductMetadata metadata={annotableItem || {}} />

				<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
					<Button variant="contained" color="primary" onClick={getAnnotableItem}>Next</Button>

					<div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 30 }}>
						{/* <TextField label="Comment (Optional)" variant="outlined" multiline rows={1} value={commentText} onChange={(e)=> setCommentText(e.target.value)} fullWidth /> */}
						<Button variant="contained" color="warning" onClick={flagItem}>Flag Item</Button>
					</div>

					<div style={{ display: 'flex', flexDirection: 'row', gap: 10, marginTop: 30, alignItems: 'center' }}>
						<Typography variant="subtitle1">Items In Queue: </Typography>
						<Typography variant="body1">{info.items_in_queue}</Typography>
					</div>
				</div>

				{notification && <Snackbar
					open={open}
					autoHideDuration={800}
					onClose={() => setNotification(false)}
					message={notification}
				/>}


			</div>

			<div style={{ overflow: "auto", width: '100%' }}>
				{
					annotableItem && annotableItem.available_images
						? annotableItem.available_images.map((item, index) => {
							return (
								<>
									<ReviewImage imageSrc={item.original_image_name} annotationClasses={predefinedAnnotationClasses} metadata={annotableItem} key={index} />
									{item.segmented_images.map((segmentedItem, index) => {
										return (
											<ReviewImage style={{ mb: 2 }} isSegment={true} imageSrc={segmentedItem} annotationClasses={predefinedAnnotationClasses} metadata={annotableItem} key={index} />
										)
									})}
								</>
							)
						})
						: <p>...</p>
				}
			</div>

		</div>
	)
}

export default Review
