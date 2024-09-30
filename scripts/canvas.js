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

	canvas.distort = function({height, width,  anchorX = canvas.width / 2, anchorY = canvas.height / 2 }) { // {{{
		canvas.clear();
		const scaleX = canvas.width / width;
		const scaleY = canvas.height / height;

		// const offsetX = (canvas.width - width) / 2;
		// const offsetY = (canvas.height - height) / 2;
		
		const offsetX = anchorX - (anchorX * scaleX);
		const offsetY = anchorY - (anchorY * scaleY);

		canvas.ctx.drawImage(canvas.temp, 0, 0, canvas.width, canvas.height, offsetX, offsetY, canvas.width * scaleX, canvas.height * scaleY);
		// canvas.ctx.drawImage(canvas.temp, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width * scaleX, canvas.height * scaleY);

		return canvas;
	}; // }}}

	canvas.flipVertical = function() { // {{{
		canvas.save();
		canvas.clear();
		canvas.ctx.scale(1, -1);
		canvas.ctx.drawImage(canvas.temp, 0, -canvas.height);
		canvas.ctx.scale(1, -1);
		return canvas;
	} // }}}

	canvas.flipHorizontal = function() { // {{{
		canvas.save();
		canvas.clear();
		canvas.ctx.scale(-1, 1);
		canvas.ctx.drawImage(canvas.temp, -canvas.width, 0);
		canvas.ctx.scale(-1, 1);
		return canvas;
	} // }}}

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

	canvas.fillAll = function({color=makeColor({r: 0, g: 0, b: 0, a: 255})}) { // {{{
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

		if (!canvas._path) {
			canvas._path = [];
		}

		if (canvas._path == []) {
			canvas._pathComplete = false;
		}

		let err = dx - dy;
		while (true) {
			sx1 = x1;
			sy1 = y1;
			if (sx1 < 0 || sx1 >= canvas.width || sy1 < 0 || sy1 >= canvas.height) {
				// sx1 = canvas._path[canvas._path.length - 1].x;
				// sy1 = canvas._path[canvas._path.length - 1].y;
			} else {
				// sx1 = Math.min(Math.max(x1, 0), canvas.width - 1)
				// sy1 = Math.min(Math.max(y1, 0), canvas.height)
				canvas._path.push({x: sx1, y: sy1});
			}

			canvas.drawPixel({x: x1, y: y1, color, erase});
			if (x1 === x2 && y1 === y2) break;
			const e2 = err * 2;
			if (e2 > -dy) { err -= dy; x1 += sx; }
			if (e2 < dx) { err += dx; y1 += sy; }
		}

		return canvas;
	}; // }}}

	canvas.lift = function({maskData}) { // {{{
		const lifted = canvas.ctx.createImageData(canvas.width, canvas.height).data;
		const canvasData = canvas.getData();
		for (let i = 0; i < maskData.length; i += 4) {
			if (maskData[i + 3] > 0) {
				lifted[i] = canvasData[i];
				lifted[i + 1] = canvasData[i + 1];
				lifted[i + 2] = canvasData[i + 2];
				lifted[i + 3] = canvasData[i + 3];
			}
		}

		canvas.stamp({maskData: lifted, erase: true});

		return lifted;
	} // }}}	

	canvas.stamp = function({maskData, erase = false}) { // {{{
		const data = canvas.getData();
		for (let i = 0; i < maskData.length; i += 4) {
			if (maskData[i + 3] > 0) {
				if (erase) {
					data[i] = 0;
					data[i + 1] = 0;
					data[i + 2] = 0;
					data[i + 3] = 0;
				} else {
					data[i] = maskData[i];
					data[i + 1] = maskData[i + 1];
					data[i + 2] = maskData[i + 2];
					data[i + 3] = 255;
				}
			}
		}
		canvas.ctx.putImageData(new ImageData(data, canvas.width, canvas.height), 0, 0);
		return canvas;
	} // }}}

	canvas.fill = function({maskData, color=makeColor({r: 0, g: 0, b: 0, a: 255}), erase=false}) { // {{{
		for (let i = 0; i < maskData.length; i += 4) {
			if (maskData[i + 3] > 0) {
				maskData[i] = color.r;
				maskData[i + 1] = color.g;
				maskData[i + 2] = color.b;
				maskData[i + 3] = 255;
			}
		}
		canvas.stamp({maskData, erase});

		return canvas;
	} // }}}

	canvas.rectFill = function({x, y, width, height}) { // {{{
		const data = new ImageData(canvas.width, canvas.height).data;
		for (let y1 = y; y1 < y + height; y1++) {
			for (let x1 = x; x1 < x + width; x1++) {
				let index = (y1 * canvas.width + x1) * 4;
				data[index] = 255;
				data[index + 1] = 0;
				data[index + 2] = 0;
				data[index + 3] = 255;
			}
		}
		return data;
	} // }}}

	canvas.pathFill = function({path}) { // {{{
		if (path === undefined) {
			return canvas;
		}

		// Find the bounding box of the path
		let minX = Math.min(...path.map(p => p.x));
		let maxX = Math.max(...path.map(p => p.x));
		let minY = Math.min(...path.map(p => p.y));
		let maxY = Math.max(...path.map(p => p.y));

		const data = new ImageData(width, height).data;

		// Use a simple scanline filling method
		for (let y = minY; y <= maxY; y++) {
			let intersections = [];

			// Find intersections with path edges
			for (let i = 0; i < path.length; i++) {
				let p1 = path[i];
				let p2 = path[(i + 1) % path.length];
				if ((p1.y <= y && p2.y > y) || (p1.y > y && p2.y <= y)) {
					let x = p1.x + (y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y);
					intersections.push(Math.round(x));
				}
			}

			// Sort intersections
			intersections.sort((a, b) => a - b);

			// Fill between pairs of intersections
			for (let i = 0; i < intersections.length; i += 2) {
				let startX = intersections[i];
				let endX = intersections[i + 1];

				// Fill pixels between the two x coordinates
				for (let x = startX; x <= endX; x++) {
					let index = (y * canvas.width + x) * 4;
					data[index + 3] = 255;

				}
			}
		}

		return data;
	}; // }}}

	canvas.maskFill = function({data}) { // {{{
		if (!data) {
			return;
		}

		// Function to determine if a pixel is part of the shape's border
		function isBorder(x, y) {
			const index = (y * canvas.width + x) * 4;
			return data[index + 3] > 0; // Check if alpha channel is greater than 0
		}

		// Use a simple scanline filling method
		for (let y = 0; y < canvas.height; y++) {
			let inside = false;
			for (let x = 0; x < canvas.width; x++) {
				if (isBorder(x, y)) {
					inside = !inside; // Toggle inside/outside when hitting a border
				}

				if (inside) {
					const index = (y * canvas.width + x) * 4;
					data[index + 3] = 255; // Set alpha channel to 255 (fully opaque)
				}
			}
		}

		return data;
	}; // }}}

	canvas.drawEmptyRectangle = function({x, y, width, height, color=makeColor({r: 0, g: 0, b: 0, a: 255}), erase=false}) { // {{{
		width = Math.round(width);
		height = Math.round(height);
		canvas.drawRect({x: x, y: y, width: width + 1, height: 1, color, erase});
		canvas.drawRect({x: x, y: y, width: 1, height: height + 1, color, erase});
		canvas.drawRect({x: x, y: y + height, width: width + 1, height: 1, color, erase});
		canvas.drawRect({x: x + width, y: y, width: 1, height: height + 1, color, erase});
		return canvas, x, y, width, height
	}; // }}}

	canvas.drawCircle = function({x, y, diameter, color = makeColor({r: 0, g: 0, b: 0, a: 255}), erase = false}) { // {{{
		if (diameter === 1) {
			canvas.drawPixel({x, y, color, erase});
			return canvas;
		}

		let radius = Math.floor(diameter / 2);
		let radiusSquared = radius * radius;

		for (let y1 = -radius; y1 <= radius; y1++) {
			for (let x1 = -radius; x1 <= radius; x1++) {
				if ((x1 * x1 + y1 * y1) < radiusSquared) {
					canvas.drawRect({x: x + x1, y: y + y1, width: 1, height: 1, color, erase});
				}
			}
		}

		return canvas;
	}; // }}}

	canvas.drawEllipse = function({x, y, width, height, color=makeColor({r: 0, g: 0, b: 0, a: 255}), erase=false}) { // {{{
		let radiusX = Math.abs(width);
		let radiusY = Math.abs(height);
		let radiusXSquared = radiusX * radiusX;
		let radiusYSquared = radiusY * radiusY;

		for (let y1 = -radiusY; y1 <= radiusY; y1++) {
			for (let x1 = -radiusX; x1 <= radiusX; x1++) {
				if ((x1 * x1 / radiusXSquared + y1 * y1 / radiusYSquared) <= 1) {
					canvas.drawRect({x: x + x1, y: y + y1, width: 1, height: 1, color, erase});
				}
			}
		}

		return canvas;
	} // }}}

	canvas.drawEmptyEllipse = function({x, y, width, height, color=makeColor({r: 0, g: 0, b: 0, a: 255}), erase=false}) { // {{{
		let radiusX = width / 2;
		let radiusY = height / 2;
		let radiusXSquared = radiusX * radiusX;
		let radiusYSquared = radiusY * radiusY;

		for (let y1 = -radiusY; y1 <= radiusY; y1++) {
			for (let x1 = -radiusX; x1 <= radiusX; x1++) {
				if ((x1 * x1 / radiusXSquared + y1 * y1 / radiusYSquared) <= 1 && (x1 * x1 / radiusXSquared + y1 * y1 / radiusYSquared) >= 0.9) {
					canvas.drawRect({x: x + x1, y: y + y1, width: 1, height: 1, color, erase});
				}
			}
		}

		return canvas;
	} // }}}

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

				// Check if the point is exactly on the circumference of the filled circle
				if (distanceSquared >= radiusSquared - radius && distanceSquared < radiusSquared) {
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
		const steps = Math.ceil(distance / (diameter / 4));
		for (let i = 0; i <= steps; i++) {
			const x = Math.round(x1 + (dx * i) / steps);
			const y = Math.round(y1 + (dy * i) / steps);
			canvas.drawCircle({x, y, diameter, color, erase});
		}

		return canvas;
	}; // }}}

	canvas.drawCrossHairs = function({x, y, length=5, color=makeColor({r: 0, g: 0, b: 0, a: 255}), erase=false}) { // {{{
		canvas.drawRect({x: x - length, y, width: length * 2 + 1, height: 1, color, erase});
		canvas.drawRect({x, y: y - length, width: 1, height: length * 2 +1, color, erase});

		return canvas;
	} // }}}

	canvas.floodFill = function({x, y, color=makeColor({r: 0, g: 0, b: 0, a: 255}), tolerance = 5}) { // {{{

		const targetColor = canvas.getPixel({x, y});
		const fillColor = color;

		if (targetColor.match({color2: fillColor})) {
			return;
		}

		const targetColorArray = targetColor.toRgbaArray();
		const fillColorArray = fillColor.toRgbaArray();
		const data = canvas.getData();

		const stack = [{x, y}];

		// Function to check if the color matches with some tolerance
		function colorMatch(c1, c2, tol) {
			return Math.abs(c1[0] - c2[0]) <= tol &&
				   Math.abs(c1[1] - c2[1]) <= tol &&
				   Math.abs(c1[2] - c2[2]) <= tol &&
				   Math.abs(c1[3] - c2[3]) <= tol;
		}

		while (stack.length > 0) {
			const {x, y} = stack.pop();

			const index = (y * canvas.width + x) * 4;
			const currentColorArray = [data[index], data[index + 1], data[index + 2], data[index + 3]];

			// Use the colorMatch function to compare colors with tolerance
			if (colorMatch(currentColorArray, targetColorArray, tolerance)) {
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
			x: Math.round((e.clientX - rect.left) / canvas.zoomScale),
			y: Math.round((e.clientY - rect.top) / canvas.zoomScale),
		};
	} // }}}

	canvas.zoom = function({scale}) { // {{{
		canvas.zoomScale = scale;
		canvas.style.width = `${canvas.width * scale}px`;
		canvas.style.height = `${canvas.height * scale}px`;
		return canvas;
	} // }}}	

	canvas.init = function() { // {{{
		canvas.style.imageRendering = "pixelated";
		canvas.ctx = canvas.getContext("2d", { willReadFrequently: true });
		canvas.temp = document.createElement("canvas");
		canvas.temp.ctx = canvas.temp.getContext("2d", { willReadFrequently: true });
		canvas.resize({height, width});
		canvas._path = [];
		canvas._pathComplete = false;
		canvas.zoomScale = 1;

		return canvas;
	} // }}}

	canvas.init();

	return canvas;

}
