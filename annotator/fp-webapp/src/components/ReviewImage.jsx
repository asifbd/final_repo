import { useEffect, useState } from "react"
import AnnotationForm from "./AnnotationForm"
import { Button, Divider, Snackbar, Typography } from "@mui/material";
import { CheckBox } from "@mui/icons-material";

import { API_BASE_URL } from "../constants";
import { discardImage, saveAnnotation } from "../services/apiService";



function predictAnnotation(metadata) {
	let annotations = {
		fabricTypes: [],
		wearTypes: [],
		textures: [],
		valueAdditions: [],
		colors: [],
		tags: []
	}

	// --------------------- Wear types ---------------------------------
	// Wear types are usually the top level category 
	if (metadata['category']) annotations.wearTypes.push(metadata['category']);
	// -------------------- End of wear types ---------------------


	// ------------------ Check for fabric types -------------------
	// Fabric Types are often speicified in sub_category or specs.Fabric
	if (metadata['sub_category'] && ['Cotton', 'Muslin', 'Silk', 'Katan', 'Nakshi Kantha', 'Jamdani', 'Brac Silk', 'Viscose'].includes(metadata['sub_category'])) annotations.fabricTypes.push(metadata['sub_category']);
	if (metadata['specs.Fabric']) annotations.fabricTypes.push(metadata['specs.Fabric']);

	// Fabric types are often specified in specs.Dupatta Fabric or Bottom Fabric
	if (metadata['specs.Dupatta Fabric']) annotations.fabricTypes.push(metadata['specs.Dupatta Fabric']);
	if (metadata['specs.Bottom Fabric']) annotations.fabricTypes.push(metadata['specs.Bottom Fabric']);

	//---------------------------- End of fabric types -------------------


	// ============================= New Rules ==========================
	let description = metadata['description'].toLowerCase();
	let valueAddition = metadata['specs.Value Addition'] ? metadata['specs.Value Addition'].toLowerCase() : '';
	let specColour = metadata['specs.Colour'] ? metadata['specs.Colour'].toLowerCase() : '';

	// ------------------------ Colour rules -------------------
	if (specColour) annotations.colors.push(specColour);
	
	if (metadata['specs.Dupatta Colour']) annotations.colors.push(metadata['specs.Dupatta Colour']);
	if (metadata['specs.Bottom Colour']) annotations.colors.push(metadata['specs.Bottom Colour']);

	// Mapping based on description
	//if(description.includes('dual tone')) annotations.colors.push('dual tone');
	//if (description.includes('multicolour')) annotations.colors.push('multicolour');

	
	if (description.includes('lilac') || description.includes('lavender') || description.includes('violet') || description.includes('plum') || description.includes('purple')) annotations.colors.push('purple');
	
	if (description.includes('apricot') || description.includes('mustard')) annotations.colors.push('yellow');	// kind of yellow
	if (description.includes('yellow')) annotations.colors.push('yellow');
	if (description.includes('orange')) annotations.colors.push('orange');
	if (description.includes('gold')) annotations.colors.push('golden');
	
	if (description.includes('chocolate') || description.includes('coffee') || description.includes('maroon') || description.includes('burgundy') ) annotations.colors.push('brown');	// generalized to brown
	if (description.includes('copper') || description.includes('brown')) annotations.colors.push('brown');

	if (description.includes('watermelon') || description.includes('fuchsia') || description.includes('coral') || description.includes('peach') || description.includes('pink')) annotations.colors.push('pink');
	
	if (description.includes('aqua') || description.includes('teal')) annotations.colors.push('blue');
	if (description.includes('blue')) annotations.colors.push('blue');
	if (description.includes('cyan') || description.includes('turquoise')) annotations.colors.push('cyan');
	
	if (description.includes('rust') || description.includes(' red') || description.includes('magenta')) annotations.colors.push('red');
	
	if (description.includes('white') || description.includes('ivory') || description.includes('beige')) annotations.colors.push('white');
	
	if (description.includes('mint') || description.includes('olive') || description.includes('green')) annotations.colors.push('green');
	if (description.includes('silver') || description.includes('grey')) annotations.colors.push('grey');
	
	if (description.includes('black')) annotations.colors.push('black');


	// ------------------------ End of colour rules -------------------





	// --------------------------- Check for Pattern/print/textures -------------------
	if (description.includes('applique') || valueAddition.includes('applique')) annotations.textures.push('applique');
	if (description.includes('buti')) annotations.textures.push('buti');
	if (description.includes('check')) annotations.textures.push('check');
	if (description.includes('dobby')) annotations.textures.push('dobby');

	if(description.includes('dye')) {
		if (description.includes('tie dye') || description.includes('tie-dye') || description.includes('tie & dye')) annotations.textures.push('tie dye');
		else if (description.includes('wax dye') || description.includes('wax-dye')) annotations.textures.push('wax dye');
		else annotations.textures.push('dye');
	}
	else if (valueAddition.includes('dye')) {
		if (description.includes('tie dye') || description.includes('tie-dye') || description.includes('tie & dye')) annotations.textures.push('tie dye');
		else if (description.includes('wax dye') || description.includes('wax-dye')) annotations.textures.push('wax dye');
		else annotations.textures.push('dye');
	}

	if (description.includes('embroider') || valueAddition.includes('embroider')) annotations.textures.push('embroidery');
	
	if (description.includes('floral')) annotations.textures.push('floral');

	if (description.includes('mauve')) annotations.textures.push('mauve');

	if (description.includes('nakshi')) annotations.textures.push('nakshi');
	if (description.includes('opera')) annotations.textures.push('opera');

	if (description.includes('paint')) {
		if (description.includes('hand paint') || description.includes('hand-paint')) annotations.textures.push('hand paint');
		else if (description.includes('brush paint') || description.includes('brush-paint')) annotations.textures.push('brush paint');
		else annotations.textures.push('painted');
	}
	else if (valueAddition.includes('paint')) {
		if (valueAddition.includes('hand paint') || valueAddition.includes('hand-paint')) annotations.textures.push('hand paint');
		else if (valueAddition.includes('brush paint') || valueAddition.includes('brush-paint')) annotations.textures.push('brush paint');
		else annotations.textures.push('painted');
	}

	if (valueAddition.includes('print')) {
		if (valueAddition.includes('batik print')) annotations.textures.push('batik print');
		else if (valueAddition.includes('block print')) annotations.textures.push('block print');
		//else if (valueAddition.includes('digital print')) annotations.textures.push('digital print');
		else if (valueAddition.includes('screen print')) annotations.textures.push('screen print');
		else annotations.textures.push('printed');
	}
	else if (description.includes('print')) {
		if (description.includes('batik print')) annotations.textures.push('batik print');
		else if (description.includes('block print')) annotations.textures.push('block print');
		//else if (description.includes('digital print')) annotations.textures.push('digital print');
		else if (description.includes('screen print')) annotations.textures.push('screen print');
		else annotations.textures.push('printed');
	}

	if (description.includes('stripe')) annotations.textures.push('striped');

	if (description.includes('texture') && !description.includes('dobby')) annotations.textures.push('textured');

	// -------------------------------------------- End of Pattern/print/textures rules -------------------

	// -------------------------------------------- Check for VALUE ADDITIONS -------------------

	if (description.includes('embroider') || valueAddition.includes('embroider')) annotations.valueAdditions.push('embroidery');
	if (description.includes('nakshi') || valueAddition.includes('nakshi')) annotations.valueAdditions.push('nakshi');
	if (description.includes('baluchari') || valueAddition.includes('baluchari')) annotations.valueAdditions.push('baluchari');
	if (description.includes('handloom') || valueAddition.includes('kanhandloomtha')) annotations.valueAdditions.push('handloom');
	if (description.includes('lace') || valueAddition.includes('lace')) annotations.valueAdditions.push('lace');
	
	if (description.includes('mirror') || valueAddition.includes('mirror')) annotations.valueAdditions.push('mirror work');
	if (description.includes('glass') || valueAddition.includes('glass')) annotations.valueAdditions.push('mirror work');

	if (description.includes('sequin') || valueAddition.includes('sequin')) annotations.valueAdditions.push('sequins');
	if (description.includes('stone') || valueAddition.includes('stone')) annotations.valueAdditions.push('stone work');
	if (description.includes('tassel') || valueAddition.includes('tassel')) annotations.valueAdditions.push('tassels');
	if (description.includes('fringe') || valueAddition.includes('fringe')) annotations.valueAdditions.push('fringe');
	if (description.includes('applique') || valueAddition.includes('applique')) annotations.valueAdditions.push('applique');
	if (description.includes('tangail') || valueAddition.includes('tangail')) annotations.valueAdditions.push('tangail');

	//if (annotations.valueAdditions.length < 1 && valueAddition) 

	// ------------------- End of Value addition rules  -------------------
	


	// For each key remove dups if any
	for (let key in annotations) {
		annotations[key] = [...new Set(annotations[key])];
	}

	//console.log('Predicted annotations:', annotations)

	return annotations;
}

function ReviewImage({ imageSrc, annotationClasses, metadata, isSegment }) {
	const [annotations, setAnnotations] = useState({});
	const [notification, setNotification] = useState();

	const [processed, setProcessed] = useState(false);

	useEffect(() => {
		setAnnotations(predictAnnotation(metadata));

	}, [metadata])

	const handleAnnotationChange = (updatedAnnotations) => {
		console.log('Updated annotations:', updatedAnnotations)
		setAnnotations(updatedAnnotations)
	}

	const handleSave = async () => {
		console.log('Submitting annotations:', annotations);

		//TODO:: Custom labels are temporarily placed into available options, may want to persist later
		annotations.tags.forEach(t=> annotationClasses['tags'].includes(t) || annotationClasses['tags'].push(t));
		annotations.fabricTypes.forEach(t=> annotationClasses['fabricTypes'].includes(t) || annotationClasses['fabricTypes'].push(t));
		annotations.wearTypes.forEach(t=> annotationClasses['wearTypes'].includes(t) || annotationClasses['wearTypes'].push(t));
		annotations.textures.forEach(t=> annotationClasses['textures'].includes(t) || annotationClasses['textures'].push(t));
		annotations.valueAdditions.forEach(t=> annotationClasses['valueAdditions'].includes(t) || annotationClasses['valueAdditions'].push(t));
		annotations.colors.forEach(t=> annotationClasses['colors'].includes(t) || annotationClasses['colors'].push(t));
		

		let data = {
			id: metadata['id'],
			annotation: {
				original_image_name: imageSrc,
				annotated_image_name: imageSrc.split('/').pop(),
				segment_type: isSegment ? 'segmented' : 'original',
				fabric_types: annotations.fabricTypes.join(','),
				wear_types: annotations.wearTypes.join(','),
				textures: annotations.textures.join(','),
				value_additions: annotations.valueAdditions.join(','),
				colors: annotations.colors.join(','),
				tags: annotations.tags.join(',')
			},
		}


		await saveAnnotation(data);

		setNotification('Annotation saved!');
		setProcessed(true);
	}

	const handleDiscard = async (reason='unusable') => {
		console.log('Discarding annotations:', annotations);
		console.log('for image:', imageSrc);

		let imageName = imageSrc.split('/').pop();
		let response = await discardImage({ image_name: imageName, product_id: metadata['id'], image_path: imageSrc, reason: reason });

		console.log('Discard response:', response);

		setNotification('Image marked redundant/invalid');
		setProcessed(true);
	}

	return (
		<div>
			<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
				<div style={{ minWidth: 300 }}>
					<img style={{ maxHeight: 300 }} src={API_BASE_URL + imageSrc} alt="image not found" />
					<Typography variant="h6" align="center" sx={{ mt: 2 }}>
						{imageSrc.split('/').pop()}
					</Typography>
				</div>
				<div style={{ marginLeft: 20, minWidth: 500 }}>
					<AnnotationForm annotationClasses={annotationClasses} annotations={annotations} onAnnotationChange={handleAnnotationChange} />
				</div>


			</div>

			<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 5, margin: 10 }}>
				<Button disabled={processed} sx={{ width: 'fit-content' }} variant="contained" color="primary" onClick={handleSave}>Save Annotation</Button>
				{/* <Button sx={{ width: 'fit-content', ml: 5 }} variant="contained" color="warning" onClick={handleLater}>Later</Button> */}
				
				<Button disabled={processed} sx={{ width: 'fit-content', ml: 5 }} variant="contained" color="warning" onClick={()=> handleDiscard('Redundant')}>Redundant</Button>
				<Button disabled={processed} sx={{ width: 'fit-content', ml: 5 }} variant="contained" color="error" onClick={()=> handleDiscard('Invalid')}>Invalid</Button>
				
			</div>

			
			<Typography color={isSegment ? "textSecondary" : "primary"} variant={"subtitle1"} sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				{isSegment ? `Segmented Image (${imageSrc.split('___')[1].split('.')[0]})` : 'Original Image'}
			</Typography>

			{notification && <Snackbar
				open={open}
				autoHideDuration={800}
				onClose={() => setNotification(false)}
				message={notification}
				/>}

			<Divider sx={{ my: 2 }} />

		</div>

	)
}

export default ReviewImage
