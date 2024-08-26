function disableImageSmoothing({ctx}) {
	ctx.imageSmoothingEnabled = false;
	if (ctx.imageSmoothingEnabled !== false) {
		ctx.mozImageSmoothingEnabled = false;
		ctx.webkitImageSmoothingEnabled = false;
		ctx.msImageSmoothingEnabled = false;
	}
};

function makeCanvas({height, width}) {
	const canvas = document.createElement("canvas");

	canvas.save = function() { // {{{
		canvas.temp.ctx.clearRect(0, 0, canvas.temp.width, canvas.temp.height);
		canvas.temp.ctx.drawImage(canvas, 0, 0);

		return canvas;
	} // }}}

	canvas.restore = function({x=0, y=0}={}) { // {{{
		canvas.ctx.drawImage(canvas.temp, x, y);

		return canvas;
	} // }}}

	canvas.add = function({canvas2}) { // {{{
		canvas.ctx.drawImage(canvas2, 0, 0);

		return canvas;
	} // }}}

	canvas.getData = function() { // {{{
		return canvas.ctx.getImageData(0, 0, canvas.width, canvas.height).data;
	}; // }}}

	canvas.fromDataUrl = function({dataUrl}) { // {{{
		return new Promise((resolve, reject) => {
			const image = new Image();
			image.src = dataUrl;
			image.onload = () => {
				canvas.width = image.width;
				canvas.height = image.height;
				canvas.style.width = `${image.width}px`;
				canvas.style.height = `${image.height}px`;
				canvas.ctx.drawImage(image, 0, 0);
				disableImageSmoothing({ctx: canvas.ctx});
				resolve(canvas);
			};
			image.onerror = (error) => {
				reject(error); // Reject the promise if an error occurs
			}
		});
	} // }}}

	canvas.toDataUrl = function() { // {{{
		return canvas.toDataURL();
	}; // }}}

	canvas.resize = function({height, width}) { // {{{
		canvas.save();
		canvas.clear();
		canvas.height = height;
		canvas.width = width;
		canvas.style.height = `${height}px`;
		canvas.style.width = `${width}px`;
		disableImageSmoothing({ctx: canvas.ctx});
		canvas.restore();

		canvas.temp.height = height;
		canvas.temp.width = width;
		canvas.temp.style.height = `${height}px`;
		canvas.temp.style.width = `${width}px`;
		disableImageSmoothing({ctx: canvas.temp.ctx});

		return canvas;
	}; // }}}

	canvas.drawRect = function({x, y, width, height, color=makeColor({r: 0, g: 0, b: 0, a: 255}), erase=false}) { // {{{
		x = Math.round(x);
		y = Math.round(y);
		width = Math.round(width);
		height = Math.round(height);
		if (erase === true) {
			canvas.ctx.clearRect(x, y, width, height);
		} else {
			canvas.ctx.fillStyle = color.toRgbaString();
			canvas.ctx.fillRect(x, y, width, height);
		}
		return canvas;
	}; // }}}

	canvas.clear = function() { // {{{
		canvas.drawRect({
			x: 0,
			y: 0,
			width: canvas.width,
			height: canvas.height,
			erase: true,
		});

		return canvas;
	}; // }}}

	canvas.fill = function({color=makeColor({r: 0, g: 0, b: 0, a: 255})}) { // {{{
		canvas.drawRect({
			x: 0,
			y: 0,
			width: canvas.width,
			height: canvas.height,
			color: color,
		});

		return canvas;
	}; // }}}

	canvas.getPixel = function({x, y}) { // {{{
		if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
			return makeColor({r: 0, g: 0, b: 0, a: 0});
		}
		const data = canvas.getData();
		const index = (y * canvas.width + x) * 4;
		const r = data[index];
		const g = data[index + 1];
		const b = data[index + 2];
		const a = data[index + 3];
		return makeColor({r: data[index], g: data[index + 1], b: data[index + 2], a: data[index + 3]});
	}; // }}}

	canvas.drawPixel = function({x, y, color=makeColor({r: 0, g: 0, b: 0, a: 255}), erase=false}) { // {{{
		canvas.drawRect({
			x,
			y,
			width: 1,
			height: 1,
			color,
			erase,
		});

		return canvas;
	}; // }}}

	canvas.drawLineWithPixels = function({x1, y1, x2, y2, color=makeColor({r: 0, g: 0, b: 0, a: 255}), erase=false}) { // {{{
		canvas.ctx.fillStyle = color.toRgbaString();
		const dx = Math.abs(x2 - x1);
		const dy = Math.abs(y2 - y1);
		const sx = x1 < x2 ? 1 : -1;
		const sy = y1 < y2 ? 1 : -1;
		let err = dx - dy;
		while (true) {
			canvas.drawPixel({x: x1, y: y1, color, erase});
			if (x1 === x2 && y1 === y2) break;
			const e2 = err * 2;
			if (e2 > -dy) { err -= dy; x1 += sx; }
			if (e2 < dx) { err += dx; y1 += sy; }
		}

		return canvas;
	}; // }}}

	canvas.drawEmptyRectangle = function({x, y, width, height, color=makeColor({r: 0, g: 0, b: 0, a: 255}), erase=false}) { // {{{
		width = Math.round(width);
		height = Math.round(height);
		canvas.rect({x: x, y: y, width: width, height: 1, color, erase});
		canvas.rect({x: x, y: y, width: 1, height: height, color, erase});
		canvas.rect({x: x, y: y + height, width: width, height: 1, color, erase});
		canvas.rect({x: x + width, y: y, width: 1, height: height, color, erase});

		return canvas;
	}; // }}}

	canvas.drawCircle = function({x, y, diameter, color=makeColor({r: 0, g: 0, b: 0, a: 255}), erase=false}) { // {{{
		if (diameter === 1) {
			canvas.drawPixel({x, y, color, erase});
		}
		let radius = Math.floor(diameter / 2);
		let radiusSquared = radius * radius;
		for (let y1 = -radius; y1 <= radius; y1++) {
			for (let x1 = -radius; x1 <= radius; x1++) {
				if ((x1 * x1 + y1 * y1) <= radiusSquared - radius) {
					canvas.drawRect({x: x + x1, y: y + y1, width: 1, height: 1, color, erase});
				}
			}
		}

		return canvas;
	}; // }}}

	canvas.drawEmptyCircle = function({x, y, diameter, color = makeColor({r: 0, g: 0, b: 0, a: 255}), erase = false}) { // {{{
		if (diameter === 1) {
			canvas.drawPixel({x, y, color, erase});
			return canvas;
		}

		let radius = Math.floor(diameter / 2);
		let radiusSquared = radius * radius;

		for (let y1 = -radius; y1 <= radius; y1++) {
			for (let x1 = -radius; x1 <= radius; x1++) {
				let distanceSquared = x1 * x1 + y1 * y1;

				// Check if the point is on the circumference
				if (distanceSquared >= radiusSquared - radius && distanceSquared <= radiusSquared + radius) {
					canvas.drawRect({x: x + x1, y: y + y1, width: 1, height: 1, color, erase});
				}
			}
		}

		return canvas;
	}; // }}}

	canvas.drawLineWithCircles = function({x1, y1, x2, y2, diameter, color=makeColor({r: 0, g: 0, b: 0, a: 255}), erase=false}) { // {{{
		if (diameter === 1) {
			canvas.drawLineWithPixels({x1, y1, x2, y2, color, erase});
			return canvas;
		}
		const dx = x2 - x1;
		const dy = y2 - y1;
		const distance = Math.sqrt(dx * dx + dy * dy);
		const steps = Math.ceil(distance / (diameter / 3));
		for (let i = 0; i <= steps; i++) {
			const x = Math.round(x1 + (dx * i) / steps);
			const y = Math.round(y1 + (dy * i) / steps);
			canvas.drawCircle({x, y, diameter, color, erase});
		}

		return canvas;
	}; // }}}

	canvas.drawCrossHairs = function({x, y, length=5, color=makeColor({r: 0, g: 0, b: 0, a: 255}), erase=false}) { // {{{
		canvas.drawRect({x: x - length, y, width: length * 2, height: 1, color, erase});
		canvas.drawRect({x, y: y - length, width: 1, height: length * 2, color, erase});

		return canvas;
	} // }}}

	canvas.floodFill = function({x, y, color=makeColor({r: 0, g: 0, b: 0, a: 255})}) { // {{{

		const targetColor = canvas.getPixel({x, y});
		const fillColor = color;

		if (targetColor.match({color2: fillColor})) {
			return;
		}

		const targetColorArray = targetColor.toRgbaArray();
		const fillColorArray = fillColor.toRgbaArray();
		const data = canvas.getData();

		const stack = [{x, y}];

		while (stack.length > 0) {
			const {x, y} = stack.pop();

			const index = (y * canvas.width + x) * 4;
			const currentColorArray = [data[index], data[index + 1], data[index + 2], data[index + 3]];

			if (currentColorArray[0] === targetColorArray[0] && 
				currentColorArray[1] === targetColorArray[1] &&
				currentColorArray[2] === targetColorArray[2] && 
				currentColorArray[3] === targetColorArray[3]
			) {
				data[index] = fillColorArray[0];
				data[index + 1] = fillColorArray[1];
				data[index + 2] = fillColorArray[2];
				data[index + 3] = fillColorArray[3];

				if (x > 0) stack.push({x: x - 1, y});
				if (x < canvas.width - 1) stack.push({x: x + 1, y});
				if (y > 0) stack.push({x, y: y - 1});
				if (y < canvas.height - 1) stack.push({x, y: y + 1});
			}
		}

		canvas.ctx.putImageData(new ImageData(data, canvas.width, canvas.height), 0, 0);

		return canvas;
	}; // }}}

	canvas.getPositionOnCanvas = function(e) { // {{{
		const rect = canvas.getBoundingClientRect();
		return {
			x: Math.round((e.clientX - rect.left) / zoom),
			y: Math.round((e.clientY - rect.top) / zoom),
		};
	} // }}}

	canvas.init = function() { // {{{
		canvas.style.imageRendering = "pixelated";
		canvas.ctx = canvas.getContext("2d", { willReadFrequently: true });
		canvas.temp = document.createElement("canvas");
		canvas.temp.ctx = canvas.temp.getContext("2d", { willReadFrequently: true });
		canvas.resize({height, width});

		return canvas;
	} // }}}

	canvas.init();

	return canvas;

}
