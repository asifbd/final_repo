/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';


function AnnotationForm({annotationClasses, onAnnotationChange, annotations}) {

	// useEffect(() => {
	// 	console.log('Annotations:', annotations)
	// }, [annotations])

	const handleChange = (key, selectedOptions) => {
		console.log('Selected options:', selectedOptions);

		const updatedAnnotations = {
			...annotations,
			[key]: selectedOptions && selectedOptions.map(option => option.value),
		}
		
		onAnnotationChange(updatedAnnotations)
	}

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
			<div>
				<span>Fabric Types</span>
				<CreatableSelect
					isMulti
					onChange={selections => handleChange('fabricTypes', selections)}
					options={annotationClasses.fabricTypes.map(v => ({ label: v, value: v }))}
					value={annotations.fabricTypes && annotations.fabricTypes.map(v => ({ label: v, value: v }))}
					placeholder='Select Fabric Types'
				/>
			</div>

			<div>
				<span>Wear Types</span>
				<CreatableSelect
					isMulti
					onChange={selections => handleChange('wearTypes', selections)}
					options={annotationClasses.wearTypes.map(v => ({ label: v, value: v }))}
					value={annotations.wearTypes && annotations.wearTypes.map(v => ({ label: v, value: v }))}
					placeholder='Select Wear Types'
				/>
			</div>

			<div>
			<span>Texture/Pattern/Print</span>
			<CreatableSelect
				isMulti
				onChange={selections => handleChange('textures', selections)}
				options={annotationClasses.textures.map(v => ({ label: v, value: v }))}
				value={annotations.textures && annotations.textures.map(v => ({ label: v, value: v }))}
				placeholder='Select Texture/Pattern/Print'
			/>
			</div>

			<div>
			<span>Value Additions</span>
			<CreatableSelect
				isMulti
				onChange={selections => handleChange('valueAdditions', selections)}
				options={annotationClasses.valueAdditions.map(v => ({ label: v, value: v }))}
				value={annotations.valueAdditions && annotations.valueAdditions.map(v => ({ label: v, value: v }))}
				placeholder='Select Value Additions'
			/>
			</div>

			<div>
			<span>Colors</span>
			<CreatableSelect
				isMulti
				onChange={selections => handleChange('colors', selections)}
				options={annotationClasses.colors.map(v => ({ label: v, value: v }))}
				value={annotations.colors && annotations.colors.map(v => ({ label: v, value: v }))}
				placeholder='Select Colors'
			/>
			</div>

			<div>
			<span>Tags</span>
			<CreatableSelect
				isMulti
				onChange={selections => handleChange('tags', selections)}
				options={annotationClasses.tags.map(v => ({ label: v, value: v }))}
				value={annotations.tags && annotations.tags.map(v => ({ label: v, value: v }))}
				placeholder='Select Tags'
			/>
			</div>
		</div>
	)
}

export default AnnotationForm
