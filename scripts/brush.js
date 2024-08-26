function makeBrush({sizeControllerElement, infoTipElement}) {
	const brush = {};

	brush.refreshSizeController = function() { // {{{
		brush.sizeControllerElement.innerHTML = "";

		const sizeInputWrapper = document.createElement("div");
		sizeInputWrapper.classList.add("brush-size-input-wrapper");
		const sizeInput = document.createElement("input");
		sizeInput.classList.add("brush-size-input");
		sizeInput.type = "number";
		sizeInput.value = brush.size;
		sizeInput.min = 1;
		sizeInput.max = 150;
		sizeInput.step = 1;
		sizeInput.addEventListener("change", () => {
			let newSize = Math.max(1, Math.min(150, parseInt(sizeInput.value, 10))); // Clamp value between 1 and 150
			sizeInput.value = newSize; // Update the input field to the clamped value
			brush.changeSize({size: newSize});
			// brush.changeSize({size: sizeInput.value});
		});

		sizeInputWrapper.addEventListener("pointerenter", () => {
			brush.infoTipElement.innerHTML = 'Change brush size.';
		});
		sizeInputWrapper.addEventListener("pointerleave", () => {
			brush.infoTipElement.innerHTML = 'mixx.';
		});

		sizeInputWrapper.appendChild(sizeInput);
		brush.sizeControllerElement.appendChild(sizeInputWrapper);

		return brush;
	} // }}}

	brush.changeSize = function({size}) {
		if (size <= 1) {
			size = 1;
		}
		if (size >= 150) {
			size = 150;
		}
		brush.size = size;
	}

	brush.refresh = function() {
		brush.refreshSizeController();
		 
		return brush;
	}

	brush.getSize = function({pressure}) {
		if (pressure !== undefined) {
			const size = Math.round(Math.max(1, brush.size*2*pressure));
			return size;
		}
		return brush.size;
	}

	brush.init = function() {
		brush.size = 10;
		brush.sizeControllerElement = sizeControllerElement;
		brush.infoTipElement = infoTipElement;

		return brush;
	}

	brush.init();

	return brush;

}
