function makeLayer({height=600, width=800, zoom=1}={}) {
	const layer = {};

	layer.resize = function({height, width, scale=1}) { // {{{
		layer.height = height;
		layer.width = width;

		layer.drawCanvas.resize({height, width, scale});

		layer.tempCanvas.resize({height, width, scale});

		layer.temp2Canvas.resize({height, width, scale});

		layer.selectCanvas.resize({height, width, scale});

		layer.select2Canvas.resize({height, width, scale});

		layer.cursorCanvas.resize({height, width, scale});


		return layer;
	}; // }}}

	layer.refreshPreviewElement = function() { // {{{
		layer.previewElement.src = layer.drawCanvas.toDataUrl();

		return layer;
	}; // }}}

	layer.fill = function({color}) { // {{{
		layer.drawCanvas.fillAll({color});

		return layer;
	} // }}}

	layer.add = function({layer2}) { // {{{
		layer.drawCanvas.add({canvas2: layer2.drawCanvas});

		return layer;
	} // }}}

	layer.flipVertical = function() { // {{{
		layer.drawCanvas.flipVertical();

		return layer;
	} // }}}

	layer.flipHorizontal = function() { // {{{
		layer.drawCanvas.flipHorizontal();

		return layer;
	} // }}}

	layer.zoom = function({scale}) { // {{{
		layer.drawCanvas.zoom({scale});
		layer.cursorCanvas.zoom({scale});
		layer.tempCanvas.zoom({scale});
		layer.temp2Canvas.zoom({scale});
		layer.selectCanvas.zoom({scale});
		layer.select2Canvas.zoom({scale});
	}; // }}}

	layer.toggleHide = function() { // {{{
		layer.hidden = !layer.hidden;
	} // }}}

	// init
	
	layer.destruct = function() { // {{{
		if (layer.drawCanvas && layer.drawCanvas.parentNode) {
			layer.drawCanvas.parentNode.removeChild(layer.drawCanvas);
		}
		if (layer.cursorCanvas && layer.cursorCanvas.parentNode) {
			layer.cursorCanvas.parentNode.removeChild(layer.cursorCanvas);
		}
		if (layer.tempCanvas && layer.tempCanvas.parentNode) {
			layer.tempCanvas.parentNode.removeChild(layer.tempCanvas);
		}
		if (layer.temp2Canvas && layer.temp2Canvas.parentNode) {
			layer.temp2Canvas.parentNode.removeChild(layer.temp2Canvas);
		}
		if (layer.selectCanvas && layer.selectCanvas.parentNode) {
			layer.selectCanvas.parentNode.removeChild(layer.selectCanvas);
		}
		if (layer.select2Canvas && layer.select2Canvas.parentNode) {
			layer.select2Canvas.parentNode.removeChild(layer.select2Canvas);
		}
	}; // }}}

	layer.init = function() { // {{{
		layer.height = height;
		layer.width = width;

		layer.drawCanvas = makeCanvas({height, width});

		layer.tempCanvas = makeCanvas({height, width});
		layer.tempCanvas.style.pointerEvents = 'none';

		layer.temp2Canvas = makeCanvas({height, width});
		layer.temp2Canvas.style.pointerEvents = 'none';

		layer.selectCanvas = makeCanvas({height, width});
		layer.selectCanvas.style.pointerEvents = 'none';
		layer.selectCanvas.style.mixBlendMode = 'difference';
		layer.selectCanvas.style.zIndex = 4;

		layer.select2Canvas = makeCanvas({height, width});
		layer.select2Canvas.style.pointerEvents = 'none';
		layer.select2Canvas.style.mixBlendMode = 'difference';
		layer.select2Canvas.style.zIndex = 4;

		layer.cursorCanvas = makeCanvas({height, width});
		layer.cursorCanvas.style.mixBlendMode = 'difference';
		layer.cursorCanvas.style.pointerEvents = 'none';
		layer.cursorCanvas.style.zIndex = 5;

		layer.zoom({scale: zoom});

		layer.hidden = false;

		const previewElement = document.createElement("img");
		previewElement.draggable = false;
		previewElement.className = "layer-preview";
		layer.previewElement = previewElement;

		return layer;
	} // }}}

	layer.init();

	return layer;

}


function makeLayers({easelElement, layersElement, sizeControllerElement, zoomControllerElement,
	height=600, width=800, infoTipElement, toolTopElement, shape}) {
	if (!easelElement || !layersElement) {
		throw new Error("easelElement and layersElement are required to make layers");
	}

	const layers = [];


	// state
	
	layers._serialize = function() { // {{{
		return {
			height: layers.height,
			width: layers.width,
			layersData: layers.map(layer => ({
				drawCanvasData: layer.drawCanvas.toDataUrl()
			}))
		};
	}; // }}}

	layers._deserializeReplace = function({state}) { // {{{
		layers.clear(); 

		layers.height = state.height;
		layers.width = state.width;
		layers.easelElement.style.height = `${state.height + 2}px`;
		layers.easelElement.style.width = `${state.width + 2}px`;


		const loadPromises = state.layersData.map(layerState => {
			const layer = makeLayer({ height: layers.height, width: layers.width });
			layers.push(layer);
			return layer.drawCanvas.fromDataUrl({ dataUrl: layerState.drawCanvasData });
		});

		Promise.all(loadPromises).then(() => {
			layers.updateActive().zoom({scale: layers.zoomScale});
			layers.refreshPreviews();
		});
	}; // }}}

	layers._deserializeAdd = function({state}) { // {{{

		const height = Math.max(layers.height, state.height);
		const width = Math.max(layers.width, state.width);
		layers.resize({height: layers.height, width: layers.width});
		// layers.easelElement.style.height = `${layers.height + 2}px`;
		// layers.easelElement.style.width = `${layers.width + 2}px`;

		const loadPromises = state.layersData.map(layerState => {
			const layer = makeLayer({ height: height, width: width });
			layers.push(layer);
			return layer.drawCanvas.fromDataUrl({ dataUrl: layerState.drawCanvasData }).then((canvas) => {
				canvas.resize({height, width});
			});
		});

		Promise.all(loadPromises).then(() => {
			layers.updateActive().zoom({scale: layers.zoomScale});
			layers.refreshPreviews();
		});
	}; // }}}

	layers.saveToLocalStorage = function() { // {{{
		let historyData = JSON.stringify(layers.historyStack);
		let redoData = JSON.stringify(layers.redoStack);

		try {
			// Try to save history and redo data to localStorage
			localStorage.setItem('layersHistory', historyData);
			localStorage.setItem('layersRedo', redoData);
		} catch (e) {
			if (e.name === 'QuotaExceededError') {
				console.warn('LocalStorage quota exceeded. Removing older history states...');
				
				// Remove the oldest history state until enough space is available
				while (layers.historyStack.length > 0) {
					layers.historyStack.shift();  // Remove the oldest state
					historyData = JSON.stringify(layers.historyStack);

					try {
						localStorage.setItem('layersHistory', historyData);  // Retry saving
						break;  // If successful, stop the loop
					} catch (e) {
						if (e.name !== 'QuotaExceededError') {
							console.error('An error occurred while saving to localStorage:', e);
							break;  // Stop on any error that's not quota-related
						}
					}
				}
			} else {
				console.error('An error occurred while saving to localStorage:', e);
			}
		}

		return layers;
	};

	// }}}

	layers.save = function() { // {{{
		const state = layers._serialize();
		layers.historyStack.push(state);

		if (layers.historyStack.length > 20) {
			layers.historyStack.shift();
		}
		layers.redoStack = [];
		layers.saveToLocalStorage();
		
		return layers;
	}; // }}}

	layers.loadFromLocalStorage = function() { // {{{
		const historyData = localStorage.getItem('layersHistory');
		const redoData = localStorage.getItem('layersRedo');
		if (historyData) {
			layers.historyStack = JSON.parse(historyData);
		}
		if (redoData) {
			layers.redoStack = JSON.parse(redoData);
		}
		if (layers.historyStack.length > 0) {
			const lastState = layers.historyStack[layers.historyStack.length - 1];
			layers._deserializeReplace({state: lastState});
		} else {
			layers.save();
		}

		return layers;
	}; // }}}
   
	layers.undo = function() { // {{{
		
		if (layers.historyStack.length > 1) {

			const currentState = layers.historyStack.pop();
			layers.redoStack.push(currentState);
			const previousState = layers.historyStack[layers.historyStack.length - 1];
			layers._deserializeReplace({state: previousState});
			layers.saveToLocalStorage();

		}


		return layers;
	}; // }}}

	layers.redo = function() { // {{{
		if (layers.redoStack.length > 0) {

			const nextState = layers.redoStack.pop();
			layers.historyStack.push(nextState);
			layers._deserializeReplace({state: nextState});
			layers.saveToLocalStorage();

		}

		return layers;
	}; // }}}

	// active layer

	layers.getActive = function() { // {{{
		return layers[layers.activeIndex];
	}; // }}}

	layers.activate = function({layer}) { // {{{
		layers.activeIndex = layers.indexOf(layer);

		return layers;
	}; // }}}

	layers.updateActive = function() { // {{{
		if (layers.activeIndex < 0 || layers.activeIndex >= layers.length) {
			layers.activeIndex = layers.length - 1;
		}

		return layers;
	}; // }}}

	// layer management

	layers.add = function() { // {{{
		const layer = makeLayer({height: layers.height, width: layers.width});
		const scale = layers.zoomScale;
		layer.drawCanvas.zoom({scale});
		layer.cursorCanvas.zoom({scale});
		layer.tempCanvas.zoom({scale});
		layer.temp2Canvas.zoom({scale});
		layer.selectCanvas.zoom({scale});
		layer.select2Canvas.zoom({scale});
		layers.push(layer);
		layers.activate({layer});

		return layers;
	}; // }}}

	layers.remove = function({index}) { // {{{
		if (layers.length > 1) {
			if (index > -1 && index < layers.length) {
				layers[index].destruct();
				layers.splice(index, 1);
				layers.updateActive();
			}
		}
		return layers;
	}; // }}}

	layers.clear = function() { // {{{
		while (layers.length > 0) {
			const layer = layers.pop();
			if (layer.drawCanvas && layer.drawCanvas.parentNode) {
				layer.drawCanvas.parentNode.removeChild(layer.drawCanvas);
			}
			if (layer.cursorCanvas && layer.cursorCanvas.parentNode) {
				layer.cursorCanvas.parentNode.removeChild(layer.cursorCanvas);
			}
			if (layer.tempCanvas && layer.tempCanvas.parentNode) {
				layer.tempCanvas.parentNode.removeChild(layer.tempCanvas);
			}
			if (layer.temp2Canvas && layer.temp2Canvas.parentNode) {
				layer.temp2Canvas.parentNode.removeChild(layer.temp2Canvas);
			}
			if (layer.selectCanvas && layer.selectCanvas.parentNode) {
				layer.selectCanvas.parentNode.removeChild(layer.selectCanvas);
			}
			if (layer.select2Canvas && layer.select2Canvas.parentNode) {
				layer.select2Canvas.parentNode.removeChild(layer.select2Canvas);
			}
		}

		return layers;
	}; // }}}

	layers.switchIndex = function({index1, index2}) { // {{{
		const temp = layers[index1];
		layers[index1] = layers[index2];
		layers[index2] = temp;

		return layers;
	}; // }}}

	layers.mergeIndex = function({index1, index2}) { // {{{
		layers[index1].add({layer2: layers[index2]});
		layers.remove({index: index2});

		return layers;
	}; // }}}

	layers.moveUp = function({index}) { // {{{
		if (index === layers.length - 1) return layers;
		layers.switchIndex({index1: index, index2: index + 1});
		layers.activeIndex = index + 1;

		return layers;
	}; // }}}

	layers.moveDown = function({index}) { // {{{
		if (index === 0) return layers;
		layers.switchIndex({index1: index, index2: index - 1});
		layers.activeIndex = index - 1;

		return layers;
	}; // }}}

	layers.mergeDown = function({index}) { // {{{
		if (index === 0) return layers;
		layers.mergeIndex({index2: index, index1: index - 1});
		layers.activeIndex = index - 1;

		return layers;
	}; // }}}

	layers.duplicate = function({index}) { // {{{
		const newLayer = makeLayer({height: layers.height, width: layers.width, zoom: layers.zoomScale});
		newLayer.add({layer2: layers[index]});
		layers.splice(index + 1, 0, newLayer);
		layers.activeIndex = index + 1;

		return layers;
	} // }}}

	// resize

	layers.resize = function({height, width}) { // {{{
		layers.height = height;
		layers.width = width;
		layers.forEach(layer => {
			layer.resize({height, width, scale: layers.zoomScale});
		});
		easelElement.style.width = `${layers.width * layers.zoomScale + 2}px`;
		easelElement.style.height = `${layers.height * layers.zoomScale + 2}px`;
		easelElement.style.backgroundSize = `${40 * layers.zoomScale}px ${40 * layers.zoomScale}px`;
		easelElement.style.backgroundPosition = `0 0, ${20 * layers.zoomScale}px ${20 * layers.zoomScale}px`;
		return layers;
	}; // }}}

	layers.zoom = function({scale}) { // {{{
		// if (scale <= 1) {
		// 	scale = 1;
		// }
		if (scale >= 20) {
			scale = 20;
		}
		layers.zoomScale = scale;
		layers.forEach(layer => {
			layer.zoom({scale});
		});
		easelElement.style.width = `${layers.width * scale + 2}px`;
		easelElement.style.height = `${layers.height * scale + 2}px`;
		easelElement.style.backgroundSize = `${40 * scale}px ${40 * scale}px`;
		easelElement.style.backgroundPosition = `0 0, ${20 * scale}px ${20 * scale}px`;
		return layers;
	} // }}}

	layers.flipAllVertical = function() { // {{{
		layers.forEach(layer => {
			layer.flipVertical();
		});

		return layers;
	} // }}}

	layers.flipAllHorizontal = function() { // {{{
		layers.forEach(layer => {
			layer.flipHorizontal();
		});
	} // }}}

	// export and import
	
	layers.mergeAll = async function() { // {{{
		const mergedCanvas = makeCanvas({height: layers.height, width: layers.width});
		mergedCanvas.style.zIndex = 100;
		mergedCanvas.classList.add('merged-canvas');

		layers.forEach(layer => {
			if (!layer.hidden) {
				mergedCanvas.add({canvas2: layer.drawCanvas});
			}
		});

		return mergedCanvas;
	}; // }}}

	layers.exportPng = async function() { // {{{
		const mergedCanvas = await layers.mergeAll();
	
		if (window.showSaveFilePicker) {
			try {
				// Convert the canvas to a Blob
				const pngBlob = await new Promise(resolve => mergedCanvas.toBlob(resolve, 'image/png'));

				const fileHandle = await window.showSaveFilePicker({
					suggestedName: 'layers.png',
					types: [{
						description: 'PNG Files',
						accept: { 'image/png': ['.png'] }
					}]
				});

				const writableStream = await fileHandle.createWritable();
				await writableStream.write(pngBlob);
				await writableStream.close();
			} catch (error) {
				console.error("Error saving PNG file:", error);
			}
		} else {
			// // Fallback for browsers that do not support the File System Access API
			// const pngDataUrl = mergedCanvas.toDataURL('image/png');
			// const link = document.createElement('a');
			// link.href = pngDataUrl;
			// link.download = 'layers.png'; // Default file name
			// document.body.appendChild(link);
			// link.click();
			// document.body.removeChild(link);
			const fileName = prompt('Enter a name for the file:', 'layers.png');
			const pngDataUrl = mergedCanvas.toDataURL('image/png');
			const link = document.createElement('a');
			link.href = pngDataUrl;
			link.download = fileName || 'layers.png'; // Use the user-provided name or default if empty
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}

		return layers;
	}; // }}}

	layers.exportBlob = async function() { // {{{
		const state = JSON.stringify(layers._serialize());

		// Create a blob from the serialized state
		const blob = new Blob([state], { type: 'application/json' });

		// Check if the File System Access API is supported
		if (window.showSaveFilePicker) {
			try {
				// Open the file save dialog
				const fileHandle = await window.showSaveFilePicker({
					suggestedName: 'project.mixx',
					types: [{
						description: 'JSON Files',
						accept: { 'application/json': ['.json'] }
					}]
				});

				// Create a writable stream to the file
				const writableStream = await fileHandle.createWritable();

				// Write the blob to the file
				await writableStream.write(blob);

				// Close the writable stream
				await writableStream.close();
			} catch (error) {
				console.error("Error saving file:", error);
			}
		} else {
			const fileName = prompt('Enter a name for the file:', 'project.mixx');
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = fileName || 'project.mixx'; // Use the user-provided name or default if empty
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(link.href);
		}
	}; // }}}

	layers.importBlob = function({add=false}) { // {{{
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.style.display = 'none'; // Hide the input

		// Add an event listener to handle the file selection
		fileInput.addEventListener('change', function(event) {
			const file = event.target.files[0]; // Get the selected file
			if (file) {
				const reader = new FileReader();
				reader.onload = function(e) {
					try {
						const state = JSON.parse(e.target.result);
						if (add) {
							layers._deserializeAdd({ state });
						} else {
							layers._deserializeReplace({ state });
						}

						// Save the imported state to local storage
						// layers.saveToLocalStorage();
						layers.save();
						layers.updateActive().refresh();

					} catch (error) {
						console.error("Error importing layers from file:", error);
					}
				};

				reader.readAsText(file); // Read the file content as text
			}

			// Cleanup: Remove the file input from the DOM
			document.body.removeChild(fileInput);
		});

		// Append the file input to the body
		document.body.appendChild(fileInput);

		// Programmatically trigger a click on the file input to open the file chooser
		fileInput.click();
	}; // }}}

	layers.importImage = function({add=false}) { // {{{
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = 'image/*'; // Allow only image files
		fileInput.style.display = 'none'; // Hide the input

		// Add an event listener to handle the file selection
		fileInput.addEventListener('change', function(event) {
			const file = event.target.files[0]; // Get the selected file
			if (file) {
				const reader = new FileReader();
				reader.onload = function(e) {
					const image = new Image();
					image.onload = function() {
						const height = Math.max(layers.height, image.height);
						const width = Math.max(layers.width, image.width);
						layers.resize({height, width});

						const layer = makeLayer({height, width, zoom: layers.zoomScale});
						layer.drawCanvas.fromImage({image});

						if (add) {
							layers.push(layer);
						} else {
							layers.clear();
							layers.push(layer);
						}

						layers.resize({height, width});

						layers.updateActive().refresh();
					};

					image.src = e.target.result;
				};

				reader.readAsDataURL(file); // Read the file content as a data URL
			}

			// Cleanup: Remove the file input from the DOM
			document.body.removeChild(fileInput);
		});

		// Append the file input to the body
		document.body.appendChild(fileInput);

		// Programmatically trigger a click on the file input to open the file chooser
		fileInput.click();
	}; // }}}

	// refresh

	layers.refreshEasel = function() { // {{{
		layers.easelElement.innerHTML = "";
		layers.forEach(layer => {
			layers.easelElement.appendChild(layer.drawCanvas);
			layers.easelElement.appendChild(layer.temp2Canvas);
			layers.easelElement.appendChild(layer.selectCanvas);
			layers.easelElement.appendChild(layer.select2Canvas);
			layers.easelElement.appendChild(layer.cursorCanvas);
			if (layer.hidden) {
				layer.drawCanvas.style.display = 'none';
			} else {
				layer.drawCanvas.style.display = 'block';
			}
		});

		return layers;
	}; // }}}

	layers.refreshController = function() { // {{{
		layers.layersElement.innerHTML = "";
		layers.forEach(layer => {

			const layersElement = document.createElement("div");
			layersElement.className = "layer";
			if (layer === layers.getActive()) {
				layersElement.classList.add("active");
			}

			const previewElement = layer.previewElement;
			layersElement.appendChild(previewElement);
			layersElement.style.cursor = "pointer";

			previewElement.addEventListener("pointerdown", (e) => {
				e.stopPropagation();
				layers.getActive().tempCanvas.clear();
				layers.getActive().temp2Canvas.clear();
				layers.getActive().selectCanvas.clear();
				layers.getActive().select2Canvas.clear();
				layers.shape.polygonStart = false;
				layers.shape.lineStart = false;
				layers.activate({layer}).refreshController().refreshEasel();
			});
			previewElement.addEventListener("pointerup", (e) => {
				e.stopPropagation();
			});
			previewElement.addEventListener("pointermove", (e) => {
				e.stopPropagation();
			});

			previewElement.addEventListener("pointerenter", () => {
				layers.infoTipElement.innerHTML = 'Select layer.';
				layers.toolTipElement.style.visibility = 'hidden';
				layersElement.classList.add("hover");
			});

			previewElement.addEventListener("pointerleave", () => {
				layers.infoTipElement.innerHTML = 'mixx.';
				layers.toolTipElement.style.visibility = 'visible';
				layersElement.classList.remove("hover");
			});

			if (layer.hidden) {
				const hiddenElement = document.createElement("div");
				hiddenElement.innerHTML = `<i class="hidden-indicator ri-eye-off-fill"></i>`;
				layersElement.appendChild(hiddenElement);
			}

			layers.layersElement.appendChild(layersElement);

		});

		return layers;
	}; // }}}

	layers.refreshSizeController = function() { // {{{
		layers.sizeControllerElement.innerHTML = "";

		const heightInputWrapper = document.createElement("div");
		heightInputWrapper.classList.add("size-input-wrapper");
		heightInputWrapper.classList.add("height-input-wrapper");
		const heightInput = document.createElement("input");
		heightInput.classList.add("size-input");
		heightInput.type = "number";
		heightInput.value = layers.height;
		heightInput.addEventListener("change", () => {
			layers.resize({height: parseInt(heightInput.value), width: layers.width}).save().refresh();
		});

		heightInputWrapper.addEventListener("pointerenter", () => {
			layers.infoTipElement.innerHTML = 'Change canvas height.';
		});
		heightInputWrapper.addEventListener("pointerleave", () => {
			layers.infoTipElement.innerHTML = 'mixx.';
		});

		heightInputWrapper.appendChild(heightInput);
		layers.sizeControllerElement.appendChild(heightInputWrapper);

		const widthInputWrapper = document.createElement("div");
		widthInputWrapper.classList.add("size-input-wrapper");
		widthInputWrapper.classList.add("width-input-wrapper");
		const widthInput = document.createElement("input");
		widthInput.classList.add("size-input");
		widthInput.type = "number";
		widthInput.value = layers.width;
		widthInput.addEventListener("change", () => {
			layers.resize({height: layers.height, width: parseInt(widthInput.value)}).save().refresh();
		});

		widthInputWrapper.addEventListener("pointerenter", () => {
			layers.infoTipElement.innerHTML = 'Change canvas width.';
		});
		widthInputWrapper.addEventListener("pointerleave", () => {
			layers.infoTipElement.innerHTML = 'mixx.';
		});

		widthInputWrapper.appendChild(widthInput);
		layers.sizeControllerElement.appendChild(widthInputWrapper);

		return layers;
	} // }}}

	layers.refreshZoomController = function() { // {{{
		layers.zoomControllerElement.innerHTML = "";

		const zoomInputWrapper = document.createElement("div");
		zoomInputWrapper.classList.add("zoom-input-wrapper");
		const zoomInput = document.createElement("input");
		zoomInput.classList.add("zoom-input");
		zoomInput.type = "number";
		zoomInput.min = "0.1"; // Prevents reaching 0
		zoomInput.max = "20";
		zoomInput.step = "0.1"; // Allows zoom out but in reasonable steps
		zoomInput.value = layers.zoomScale;
		zoomInput.addEventListener("change", () => {
			let newZoom = Math.max(0.1, Math.min(20, parseFloat(zoomInput.value)));
			zoomInput.value = newZoom;
			layers.zoom({ scale: newZoom }).refresh();
		});

		zoomInputWrapper.addEventListener("pointerenter", () => {
			layers.infoTipElement.innerHTML = 'Change canvas zoom.';
		});
		zoomInputWrapper.addEventListener("pointerleave", () => {
			layers.infoTipElement.innerHTML = 'mixx.';
		});

		zoomInputWrapper.appendChild(zoomInput);
		layers.zoomControllerElement.appendChild(zoomInputWrapper);

		return layers;
	} // }}}

	layers.refreshPreviews = function() { // {{{
		layers.forEach(layer => {
			layer.refreshPreviewElement();
		});

		return layers;
	}; // }}}

	layers.refresh = function() { // {{{
		layers
			.refreshEasel()
			.refreshController()
			.refreshSizeController()
			.refreshZoomController()
			.refreshPreviews();

		return layers;
	}; // }}}

	// helper
	
	layers.inBounds = function({x, y}) { // {{{
		return x >= 0 && x < layers.width && y >= 0 && y < layers.height;
	} // }}}

	layers.getColor = function({x, y}) { // {{{
		for (const layer of layers.toReversed()) {
			// if (!layer.hidden) {
				if (!layer.drawCanvas.isTransparent({x, y})) {
					return layer.drawCanvas.getPixel({x, y});
				}
			// }
		}
		return makeColor({r: 0, g: 0, b: 0, a: 0});
	} // }}}

	// init
	
	layers.destruct = function() { // {{{
		layers.clear();
		layers.easelElement.innerHTML = "";
		layers.layersElement.innerHTML = "";
	}; // }}}

	layers.reset = function() { // {{{
		layers.height = height;
		layers.width = width;
		layers.easelElement = easelElement;
		layers.layersElement = layersElement;
		layers.infoTipElement = infoTipElement;
		layers.toolTipElement = toolTipElement;
		layers.sizeControllerElement = sizeControllerElement;
		layers.zoomControllerElement = zoomControllerElement;
		layers.shape = shape;
		layers.activeIndex = 1;
		layers.clear();
		layers.zoom({scale: 1});
		layers.push(makeLayer({height: layers.height, width: layers.width, zoom: layers.zoomScale}));
		// layers.push(makeLayer({height: layers.height, width: layers.width}));

		return layers;
	} // }}}

	layers.init = function() { // {{{
		layers.historyStack = [];
		layers.redoStack = [];
		layers.reset();

		return layers;
	}; // }}}

	layers.init();

	return layers;

}
