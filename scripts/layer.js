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


function makeLayers({easelElement, controllerElement, height=600, width=800, backgroundColor=makeColor({r: 255, g: 255, b: 255})}) {
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
		const historyData = JSON.stringify(layers.historyStack);
		const redoData = JSON.stringify(layers.redoStack);
		localStorage.setItem('layersHistory', historyData);
		localStorage.setItem('layersRedo', redoData);

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
		layers.redoStack = [];
		layers.saveToLocalStorage();
		
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


	// export and import

	layers.exportPng = function() { // {{{
		const mergedCanvas = document.createElement('canvas');
		mergedCanvas.width = layers.width;
		mergedCanvas.height = layers.height;
		const mergedCtx = mergedCanvas.getContext('2d');

		layers.forEach(layer => {
			if (layer === layers[0]) return;
			mergedCtx.drawImage(layer.drawCanvas, 0, 0);
		});

		const pngDataUrl = mergedCanvas.toDataURL('image/png');

		const link = document.createElement('a');
		link.href = pngDataUrl;
		link.download = 'layers.png';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		return layers;
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
				previewElement.addEventListener("click", () => {
					layers.activate({layer}).refreshController().refreshEasel();
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

				moveButtons.appendChild(moveUpButton);

				const moveDownButton = document.createElement("div");
				moveDownButton.classList.add("button");
				moveDownButton.classList.add("mini-button");
				moveDownButton.classList.add("layer-move-button");
				moveDownButton.innerHTML = `<img src="icons/solid/arrow-down.svg" alt="move down">`;
				moveDownButton.addEventListener("click", () => {
					layers.moveDown({layer}).save().refreshController().refreshEasel();
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

				mergeButtons.appendChild(mergeDownButton);


				const deleteButton = document.createElement("div");
				deleteButton.classList.add("button");
				deleteButton.classList.add("mini-button");
				deleteButton.classList.add("layer-delete-button");
				deleteButton.innerHTML = `<img src="icons/regular/trash-can.svg" alt="delete">`;
				deleteButton.addEventListener("click", () => {
					layers.remove({layer}).save().refreshController().refreshEasel();
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
		layers.controllerElement.appendChild(addLayerButton)

		return layers;
	}; // }}}

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
		layers.activeIndex = 1;
		layers.clear();
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
