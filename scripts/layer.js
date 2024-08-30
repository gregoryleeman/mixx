function makeLayer({height=600, width=800}={}) {
	const layer = {};

	layer.resize = function({height, width}) { // {{{
		layer.height = height;
		layer.width = width;
		layer.drawCanvas.resize({height, width});
		layer.selectCanvas.resize({height, width});
		return layer;
	}; // }}}

	layer.refreshPreviewElement = function() { // {{{
		layer.previewElement.src = layer.drawCanvas.toDataUrl();

		return layer;
	}; // }}}

	layer.fill = function({color}) { // {{{
		layer.drawCanvas.fill({color});

		return layer;
	} // }}}

	layer.add = function({layer2}) { // {{{
		layer.drawCanvas.add({canvas2: layer2.drawCanvas});

		return layer;
	} // }}}

	// init
	
	layer.destruct = function() { // {{{
		if (layer.drawCanvas && layer.drawCanvas.parentNode) {
			layer.drawCanvas.parentNode.removeChild(layer.drawCanvas);
		}
		if (layer.selectCanvas && layer.selectCanvas.parentNode) {
			layer.selectCanvas.parentNode.removeChild(layer.selectCanvas);
		}
	}; // }}}

	layer.init = function() { // {{{
		layer.height = height;
		layer.width = width;
		layer.drawCanvas = makeCanvas({height, width});
		layer.selectCanvas = makeCanvas({height, width});
		layer.selectCanvas.style.mixBlendMode = 'difference';
		layer.selectCanvas.style.pointerEvents = 'none';
		layer.selectCanvas.style.zIndex = 5;
		const previewElement = document.createElement("img");
		previewElement.className = "layer-preview";
		layer.previewElement = previewElement;

		return layer;
	} // }}}

	layer.init();

	return layer;

}


function makeLayers({easelElement, controllerElement, sizeControllerElement, height=600, width=800, backgroundColor=makeColor({r: 255, g: 255, b: 255}), infoTipElement}) {
	if (!easelElement || !controllerElement) {
		throw new Error("easelElement and controllerElement are required to make layers");
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

	layers._deserialize = function({state}) { // {{{
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
			layers.updateActive();
			layers.refreshPreviews();
		});
	}; // }}}

	layers.saveToLocalStorage = function() { // {{{
		// const currentState = JSON.stringify(layers._serialize());
		// localStorage.setItem('layers', currentState);
		const historyData = JSON.stringify(layers.historyStack);
		const redoData = JSON.stringify(layers.redoStack);
		localStorage.setItem('layersHistory', historyData);
		localStorage.setItem('layersRedo', redoData);

		return layers;
	}; // }}}

	layers.loadFromLocalStorage = function() { // {{{
		// const currentState = localStorage.getItem('layers');
		// if (currentState) {
		// 	console.log("Restoring current state from local storage");
		// 	const state = JSON.parse(currentState);
		// 	console.log(state);
		// 	layers._deserialize({ state });
		// 	layers.historyStack = [];
		// 	layers.redoStack = [];
		// } else {
		// 	console.log("No current state found in local storage");
		// }
		const historyData = localStorage.getItem('layersHistory');
		const redoData = localStorage.getItem('layersRedo');
		if (historyData) {
			layers.historyStack = JSON.parse(historyData);
		}
		if (redoData) {
			layers.redoStack = JSON.parse(redoData);
		}
		if (layers.historyStack.length > 0) {
			console.log("Restoring history from local storage");
			const lastState = layers.historyStack[layers.historyStack.length - 1];
			layers._deserialize({state: lastState});
		} else {
			console.log("No history found in local storage");
			layers.save();
		}

		return layers;
	}; // }}}

	layers.save = function() { // {{{
		const state = layers._serialize();
		layers.historyStack.push(state);

		if (layers.historyStack.length > 20) {
			layers.historyStack.shift();
		}
		layers.redoStack = [];
		layers.saveToLocalStorage();
		console.log("Saving current state to history stack");
		
		return layers;
	}; // }}}
   
	layers.undo = function() { // {{{
		if (layers.historyStack.length > 1) {
			const currentState = layers.historyStack.pop();
			layers.redoStack.push(currentState);
			const previousState = layers.historyStack[layers.historyStack.length - 1];
			layers._deserialize({state: previousState});
			layers.saveToLocalStorage();
		}

		return layers;
	}; // }}}

	layers.redo = function() { // {{{
		if (layers.redoStack.length > 0) {
			const nextState = layers.redoStack.pop();
			layers.historyStack.push(nextState);
			layers._deserialize({state: nextState});
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
		layers.push(layer);
		layers.activate({layer});

		return layers;
	}; // }}}

	layers.remove = function({ layer}) { // {{{
		const index = layers.indexOf(layer);
		if (index > 1 && index < layers.length) {
			layer.destruct();
			layers.splice(index, 1);
			layers.updateActive();
		}

		return layers;
	}; // }}}

	layers.clear = function() { // {{{
		while (layers.length > 0) {
			const layer = layers.pop();
			if (layer.drawCanvas && layer.drawCanvas.parentNode) {
				layer.drawCanvas.parentNode.removeChild(layer.drawCanvas);
			}
			if (layer.selectCanvas && layer.selectCanvas.parentNode) {
				layer.selectCanvas.parentNode.removeChild(layer.selectCanvas);
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
		layers.remove({layer: layers[index2]});

		return layers;
	}; // }}}

	layers.moveUp = function({layer}) { // {{{
		const index = layers.indexOf(layer);
		if (index === 0 || index === layers.length - 1) return;
		layers.switchIndex({index1: index, index2: index + 1});
		layers.activate({layer: layers[index]});

		return layers;
	}; // }}}

	layers.moveDown = function({layer}) { // {{{
		const index = layers.indexOf(layer);
		if (index === 0 || index === 1) return;
		layers.switchIndex({index1: index, index2: index - 1});
		layers.activate({layer: layers[index]});

		return layers;
	}; // }}}

	layers.mergeUp = function({layer}) { // {{{
		const index = layers.indexOf(layer);
		if (index === 0 || index === layers.length - 1) return;
		layers.mergeIndex({index1: index, index2: index + 1});
		layers.activate({layer: layers[index]});

		return layers;
	}; // }}}

	layers.mergeDown = function({layer}) { // {{{
		const index = layers.indexOf(layer);
		if (index === 0 || index === 1) return;
		layers.mergeIndex({index2: index, index1: index - 1});
		layers.activate({layer: layers[index - 1]});

		return layers;
	}; // }}}


	// resize

	layers.resize = function({height, width}) { // {{{
		layers.height = height;
		layers.width = width;
		layers.easelElement.style.height = `${height + 2}px`;
		layers.easelElement.style.width = `${width + 2}px`;
		layers.forEach(layer => {
			layer.resize({height, width});
		});
		if (layers.length > 0) {
			layers[0].fill({color: layers.backgroundColor});
		}

		return layers;
	}; // }}}

	layers.zoom = function({scale}) { // {{{
		if (scale <= 1) {
			scale = 1;
		}
		if (scale >= 16) {
			scale = 16;
		}
		layers.zoomScale = scale;
		layers.forEach(layer => {
			layer.drawCanvas.zoom({scale});
			layer.selectCanvas.zoom({scale});
		});
		easelElement.style.width = `${layers.width * scale}px`;
		easelElement.style.height = `${layers.height * scale}px`;
		return layers;
	} // }}}

	// export and import

	layers.exportPng = async function() { // {{{
		const mergedCanvas = document.createElement('canvas');
		mergedCanvas.width = layers.width;
		mergedCanvas.height = layers.height;
		const mergedCtx = mergedCanvas.getContext('2d');

		layers.forEach(layer => {
			if (layer === layers[0]) return;
			mergedCtx.drawImage(layer.drawCanvas, 0, 0);
		});

		    if (window.showSaveFilePicker) {
        // Use File System Access API if supported
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
        // Fallback for browsers that do not support the File System Access API
        const pngDataUrl = mergedCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngDataUrl;
        link.download = 'layers.png'; // Default file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return layers;

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
					suggestedName: 'mixx.json',
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
			console.log("Fallback for browsers that do not support the File System Access API");
			// Fallback for browsers that do not support the File System Access API
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = 'mixx.json'; // Default file name

			// Trigger the download
			document.body.appendChild(link);
			link.click();

			// Clean up
			document.body.removeChild(link);
			URL.revokeObjectURL(link.href);
		}
	}; // }}}

	layers.importBlob = function() { // {{{
		// Create a hidden file input element
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
						const state = JSON.parse(e.target.result); // Parse the JSON content
						layers._deserialize({ state }); // Deserialize into the application state

						// Clear history and redo stacks after importing new layers
						layers.historyStack = [];
						layers.redoStack = [];

						// Save the imported state to local storage
						layers.saveToLocalStorage();
						layers.updateActive().refresh();

						console.log("Layers successfully imported from file.");
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

	// refresh

	layers.refreshEasel = function() { // {{{
		layers.easelElement.innerHTML = "";
		layers.forEach(layer => {
			layers.easelElement.appendChild(layer.drawCanvas);
			layers.easelElement.appendChild(layer.selectCanvas);
		});

		return layers;
	}; // }}}

	layers.refreshController = function() { // {{{
		layers.controllerElement.innerHTML = "";
		layers.forEach(layer => {

			const controllerElement = document.createElement("div");
			controllerElement.className = "layer";
			if (layer === layers.getActive()) {
				controllerElement.classList.add("active");
			}

			const previewElement = layer.previewElement;
			controllerElement.appendChild(previewElement);

			if(layer !== layers[0]) {
				previewElement.style.cursor = "pointer";
				previewElement.addEventListener("click", () => {
					layers.activate({layer}).refreshController().refreshEasel();
				});
				previewElement.addEventListener("mouseenter", () => {
					layers.infoTipElement.innerHTML = 'Select layer.';
					controllerElement.classList.add("hover");
				});
				previewElement.addEventListener("mouseleave", () => {
					layers.infoTipElement.innerHTML = 'mixx.';
					controllerElement.classList.remove("hover");
				});

				const moveButtons = document.createElement("div");
				moveButtons.classList.add("layer-move-buttons");
				moveButtons.className = "layer-move-buttons";

				const moveUpButton = document.createElement("div");
				moveUpButton.classList.add("button");
				moveUpButton.classList.add("mini-button");
				moveUpButton.classList.add("layer-move-button");
				moveUpButton.innerHTML = `<img src="icons/solid/arrow-up.svg" alt="move up">`;
				moveUpButton.addEventListener("click", () => {
					layers.moveUp({layer}).save().refreshController().refreshEasel();
				});
				moveUpButton.addEventListener("mouseenter", () => {
					layers.infoTipElement.innerHTML = 'Move layer up.';
				});
				moveUpButton.addEventListener("mouseleave", () => {
					layers.infoTipElement.innerHTML = 'mixx.';
				});

				moveButtons.appendChild(moveUpButton);

				const moveDownButton = document.createElement("div");
				moveDownButton.classList.add("button");
				moveDownButton.classList.add("mini-button");
				moveDownButton.classList.add("layer-move-button");
				moveDownButton.innerHTML = `<img src="icons/solid/arrow-down.svg" alt="move down">`;
				moveDownButton.addEventListener("click", () => {
					layers.moveDown({layer}).save().refreshController().refreshEasel();
				});
				moveDownButton.addEventListener("mouseenter", () => {
					layers.infoTipElement.innerHTML = 'Move layer down.';
				});
				moveDownButton.addEventListener("mouseleave", () => {
					layers.infoTipElement.innerHTML = 'mixx.';
				});

				moveButtons.appendChild(moveDownButton);

				controllerElement.appendChild(moveButtons);

				const mergeButtons = document.createElement("div");
				mergeButtons.classList.add("layer-merge-buttons");
				mergeButtons.className = "layer-merge-buttons";

				const mergeDownButton = document.createElement("div");
				mergeDownButton.classList.add("button");
				mergeDownButton.classList.add("mini-button");
				mergeDownButton.classList.add("layer-merge-button");
				mergeDownButton.innerHTML = `<img src="icons/solid/angles-down.svg" alt="merge up">`;
				mergeDownButton.addEventListener("click", () => {
					layers.mergeDown({layer}).save().refreshController().refreshEasel();
				});
				mergeDownButton.addEventListener("mouseenter", () => {
					layers.infoTipElement.innerHTML = 'Merge down.';
				});
				mergeDownButton.addEventListener("mouseleave", () => {
					layers.infoTipElement.innerHTML = 'mixx.';
				});


				mergeButtons.appendChild(mergeDownButton);


				const deleteButton = document.createElement("div");
				deleteButton.classList.add("button");
				deleteButton.classList.add("mini-button");
				deleteButton.classList.add("layer-delete-button");
				deleteButton.innerHTML = `<img src="icons/regular/trash-can.svg" alt="delete">`;
				deleteButton.addEventListener("click", () => {
					layers.remove({layer}).save().refreshController().refreshEasel();
				});
				deleteButton.addEventListener("mouseenter", () => {
					layers.infoTipElement.innerHTML = 'Delete layer.';
				});
				deleteButton.addEventListener("mouseleave", () => {
					layers.infoTipElement.innerHTML = 'mixx.';
				});

				mergeButtons.appendChild(deleteButton);

				controllerElement.appendChild(mergeButtons);
			}

			layers.controllerElement.appendChild(controllerElement);

		});

		const addLayerButton = document.createElement("div");
		addLayerButton.classList.add("layer-add-button");
		addLayerButton.classList.add("button");
		addLayerButton.innerHTML = `<img src="icons/solid/plus.svg" alt="add layer">`;
		addLayerButton.addEventListener("click", () => {
			layers.add().save().refresh();
		});
		addLayerButton.addEventListener("mouseenter", () => {
			layers.infoTipElement.innerHTML = 'Add a new layer.';
		});
		addLayerButton.addEventListener("mouseleave", () => {
			layers.infoTipElement.innerHTML = 'mixx.';
		});

		layers.controllerElement.appendChild(addLayerButton)

		return layers;
	}; // }}}

	layers.refreshSizeController = function() { // {{{
		layers.sizeControllerElement.innerHTML = "";

		const heightInputWrapper = document.createElement("div");
		heightInputWrapper.classList.add("size-input-wrapper");
		const heightInput = document.createElement("input");
		heightInput.classList.add("size-input");
		heightInput.type = "number";
		heightInput.value = layers.height;
		heightInput.addEventListener("change", () => {
			layers.resize({height: parseInt(heightInput.value), width: layers.width}).save().refresh();
		});

		heightInputWrapper.addEventListener("mouseenter", () => {
			layers.infoTipElement.innerHTML = 'Change canvas height.';
		});
		heightInputWrapper.addEventListener("mouseleave", () => {
			layers.infoTipElement.innerHTML = 'mixx.';
		});

		heightInputWrapper.appendChild(heightInput);
		layers.sizeControllerElement.appendChild(heightInputWrapper);

		const widthInputWrapper = document.createElement("div");
		widthInputWrapper.classList.add("size-input-wrapper");
		const widthInput = document.createElement("input");
		widthInput.classList.add("size-input");
		widthInput.type = "number";
		widthInput.value = layers.width;
		widthInput.addEventListener("change", () => {
			layers.resize({height: layers.height, width: parseInt(widthInput.value)}).save().refresh();
		});

		widthInputWrapper.addEventListener("mouseenter", () => {
			layers.infoTipElement.innerHTML = 'Change canvas width.';
		});
		widthInputWrapper.addEventListener("mouseleave", () => {
			layers.infoTipElement.innerHTML = 'mixx.';
		});

		widthInputWrapper.appendChild(widthInput);
		layers.sizeControllerElement.appendChild(widthInputWrapper);

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
			.refreshPreviews();

		return layers;
	}; // }}}


	// init
	
	layers.destruct = function() { // {{{
		layers.clear();
		layers.easelElement.innerHTML = "";
		layers.controllerElement.innerHTML = "";
	}; // }}}

	layers.reset = function() { // {{{
		layers.backgroundColor = backgroundColor;
		layers.height = height;
		layers.width = width;
		layers.easelElement = easelElement;
		layers.controllerElement = controllerElement;
		layers.infoTipElement = infoTipElement;
		layers.sizeControllerElement = sizeControllerElement;
		layers.activeIndex = 1;
		layers.clear();
		layers.zoom({scale: 1});
		layers.push(makeLayer({height: layers.height, width: layers.width}).fill({color: layers.backgroundColor}));
		layers.push(makeLayer({height: layers.height, width: layers.width}));

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
