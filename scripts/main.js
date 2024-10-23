const version = '1.0.0';

// CONSTANTS {{{
const topBarElement = document.getElementById('top-bar');
const toolTipElement = document.getElementById('tool-tip');
const infoTipElement = document.getElementById('info-tip');
const commandsElement = document.getElementById('commands');
const optionsElement = document.getElementById('options');
const sizeElement = document.getElementById('size');
const zoomElement = document.getElementById('zoom');
const brushSizeElement = document.getElementById('brush-size');
const versionElement = document.getElementById('version');
const leftBarElement = document.getElementById('left-bar');
const brushColorElement = document.getElementById('brush-color');
const canvasColorElement = document.getElementById('canvas-color');
const studioElement = document.getElementById('studio');
const easelElement = document.getElementById('easel');
const layersElement = document.getElementById('layers');
const layerCommandsElement = document.getElementById('layer-commands');
const colorsElement = document.getElementById('colors');

const dBrushSize = 2;
const initialWidth = 800;
const initialHeight = 600;
const maxBrushSize = 500;
const tolerance = 1;
const brushBuffer = 4;
var firstStroke = true;

// }}}

// VARIABLES {{{

let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;
let xBuffer = [];	
let yBuffer = [];
let dX = 0;
let dY = 0;
let canvasStartX = 0;
let canvasStartY = 0;
let canvasEndX = 0;
let canvasEndY = 0;
let canvasDX = 0;
let canvasDY = 0;
let isKeyDown = false;
let isMouseDown = false;
let interval;
let startTime;
var tempScale = 1;
const shape = {};
shape.polygonStart = false;
shape.polygonStartX = 0;
shape.polygonStartY = 0;
shape.lineStart = false;
shape.lineStartX = 0;
shape.lineStartY = 0;
var pressure = 1;
var twist = 0;
var angle = 0;

// }}}

// HELPERS {{{

function home() {
	const rect = studioElement.getBoundingClientRect();
	// easelElement.style.left = `${rect.left + 2}px`;
	// easelElement.style.top = `${rect.top + 2}px`;
	easelElement.style.left = 0;
	easelElement.style.top = 0;
}

// }}}

const brush = makeBrush({
	sizeControllerElement: brushSizeElement,
	infoTipElement: infoTipElement
});

brush.refresh();

// LAYERS {{{

const layers = makeLayers({
	layersElement: layersElement,
	easelElement: easelElement,
	sizeControllerElement: sizeElement,
	zoomControllerElement: zoomElement,
	infoTipElement: infoTipElement,
	height: initialHeight,
	width: initialWidth,
	shape: shape
});

layers.loadFromLocalStorage().updateActive().refresh();

// }}}

// COLORS {{{

const black = makeColor({r: 0, g: 0, b: 0, name: 'Black'});
const white = makeColor({r: 255, g: 255, b: 255, name: 'White'});
const cadmiumYellow = makeColor({r: 254, g: 236, b: 0, name: 'Cadmium Yellow'});
const hansaYellow = makeColor({r: 252, g: 211, b: 0, name: 'Hansa Yellow'});
const cadmiumOrange = makeColor({r: 255, g: 105, b: 0, name: 'Cadmium Orange'});
const cadmiumRed = makeColor({r: 255, g: 39, b: 2, name: 'Cadmium Red'});
const quinacridoneMagenta = makeColor({r: 128, g: 2, b: 46, name: 'Quinacridone Magenta'});
const cobaltViolet = makeColor({r: 78, g: 0, b: 66, name: 'Cobalt Violet'});
const ultramarineBlue = makeColor({r: 25, g: 0, b: 89, name: 'Ultramarine Blue'});
const cobaltBlue = makeColor({r: 0, g: 33, b: 133, name: 'Cobalt Blue'});
const phthaloBlue = makeColor({r: 13, g: 27, b: 68, name: 'Phthalo Blue'});
const phthaloGreen = makeColor({r: 0, g: 60, b: 50, name: 'Phthalo Green'});
const permanentGreen = makeColor({r: 7, g: 109, b: 22, name: 'Permanent Green'});
const sapGreen = makeColor({r: 107, g: 148, b: 4, name: 'Sap Green'});
const burntSienna = makeColor({r: 123, g: 72, b: 0, name: 'Burnt Sienna'});
const red = makeColor({r: 255, g: 0, b: 0, name: 'Red'});
const green = makeColor({r: 0, g: 255, b: 0, name: 'Green'});
const blue = makeColor({r: 0, g: 0, b: 255, name: 'Blue'});
const cyan = makeColor({r: 0, g: 255, b: 255, name: 'Cyan'});
const yellow = makeColor({r: 255, g: 255, b: 0, name: 'Yellow'});
const magenta = makeColor({r: 255, g: 0, b: 255, name: 'Magenta'});

const tempColor = makeColor({r: 0, g: 0, b: 0});
const brushColor = makeColor({r: 0, g: 0, b: 0, previewElement: brushColorElement, toolTipElement: toolTipElement, name: 'Current brush color', infoTipElement: infoTipElement}).refresh();
const canvasColor = makeColor({r: 0, g: 0, b: 0, previewElement: canvasColorElement, name: 'Color under cursor', infoTipElement: infoTipElement}).refresh();

// }}}

// PUCKS {{{
//
const pucks = makePucks({
	controllerElement: colorsElement,
	brushColor: brushColor,
	infoTipElement: infoTipElement,
	toolTipElement: toolTipElement,
	interval: interval
});

pucks.push({color: black});
pucks.push({color: white});
pucks.push({color: cadmiumYellow});
pucks.push({color: hansaYellow});
pucks.push({color: cadmiumOrange});
pucks.push({color: cadmiumRed});
pucks.push({color: quinacridoneMagenta});
pucks.push({color: cobaltViolet});
pucks.push({color: ultramarineBlue});
pucks.push({color: cobaltBlue});
pucks.push({color: phthaloBlue});
pucks.push({color: phthaloGreen});
pucks.push({color: permanentGreen});
pucks.push({color: sapGreen});
pucks.push({color: burntSienna});
pucks.push({color: red});
pucks.push({color: green});
pucks.push({color: blue});
pucks.push({color: cyan});
pucks.push({color: yellow});
pucks.push({color: magenta});

pucks.refresh();

// }}}

// COMMANDS {{{

const commands = makeCommands({
	controllerElement: commandsElement,
	infoTipElement: infoTipElement
});

commands.add({ // save {{{
	name: 'Save',
	info: 'Save your project.',
	icon: 'file-line',
	subIcon: 'save-2-fill',
	func: () => {
		layers.exportBlob();
	}
}); // }}}

commands.add({ // open {{{
	name: 'Open',
	info: 'Open a project.',
	icon: 'file-line',
	subIcon: 'folder-open-fill',
	func: () => {
		layers.importBlob({add: false});
	}
}); // }}}

commands.add({ // import {{{
	name: 'Import',
	info: 'Import a project.',
	icon: 'file-line',
	subIcon: 'add-fill',
	func: () => {
		layers.importBlob({add: true});
	}
}); // }}}

commands.add({ // export png {{{
	name: 'Save as PNG',
	info: 'Export as a PNG.',
	icon: 'file-image-line',
	subIcon: 'save-2-fill',
	func: () => {
		layers.exportPng();
	}
}); // }}}

commands.add({ // import image {{{
	name: 'Import Image',
	info: 'Import an image.',
	icon: 'file-image-line',
	subIcon: 'add-fill',
	func: () => {
		layers.importImage({add: true});
	}
}); // }}}

commands.add({ // reset {{{
	name: 'Reset',
	info: 'Reset the entire project.',
	icon: 'delete-bin-line',
	func: () => {
		layers.reset().save().updateActive().refresh();
	}
}); // }}}

commands.add({ // home {{{
	name: 'Home',
	info: 'Return the easel to the home position.',
	icon: 'home-2-line',
	func: () => {
		layers.zoom({scale: 1}).refresh();
		home();
	}
}); // }}}

commands.add({ // undo {{{
	name: 'Undo',
	info: 'Undo the last action.',
	key: 'z',
	icon: 'arrow-go-back-fill',
	func: () => {
		layers.undo().updateActive().refresh();
	}
}); // }}}

commands.add({ // redo {{{
	name: 'Redo',
	info: 'Redo the last action.',
	key: 'y',
	icon: 'arrow-go-forward-fill',
	func: () => {
		layers.redo().updateActive().refresh();
	}
}); // }}}

commands.add({ // flip all vertical {{{
	name: 'Flip All Vertical',
	info: 'Flip all layers vertically.',
	icon: 'flip-vertical-line',
	func: () => {
		layers.flipAllVertical();
		layers.save().refresh();
	}
}); // }}}

commands.add({ // flip all horizontal {{{
	name: 'Flip All Horizontal',
	info: 'Flip all layers horizontally.',
	icon: 'flip-horizontal-line',
	func: () => {
		layers.flipAllHorizontal();
		layers.save().refresh();
	}
}); // }}}

commands.add({ // size 1 brush {{{
	name: 'Size 1',
	info: 'Set the brush size to 1.',
	icon: 'circle-fill ri-xxs',
	func: () => {
		brush.changeSize({size: 1});
		brush.refresh();
	}
}); // }}}

commands.add({ // size 5 brush {{{
	name: 'Size 5',
	info: 'Set the brush size to 5.',
	icon: 'circle-fill ri-sm',
	func: () => {
		brush.changeSize({size: 5});
		brush.refresh();
	}
}); // }}}

commands.add({ // size 10 brush {{{
	name: 'Size 10',
	info: 'Set the brush size to 10.',
	icon: 'circle-fill',
	func: () => {
		brush.changeSize({size: 10});
		brush.refresh();
	}
}); // }}}

commands.refresh();

// }}}

// }}}

// OPTIONS {{{

const options = makeOptions({
	controllerElement: optionsElement,
	infoTipElement: infoTipElement
});

options.add({ // pressure sensitive {{{
	name: 'pressure',
	info: 'Use pen pressure to control brush size.',
	icon: 'pen-nib-fill',
	defaultValue : false
}); // }}}

options.refresh();

// }}}

// TOOLS {{{

const tools = makeTools({
	controllerElement: leftBarElement,
	toolTipElement: toolTipElement,
	infoTipElement: infoTipElement
});

tools.push(makeTool({ // pen {{{
	name: 'Pen',
	info: 'Pen tool.',
	key: 'p',
	icon: 'ball-pen-fill',
	mouseMove: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear()
			.drawEmptyCircle({
				x: canvasEndX,
				y: canvasEndY,
				diameter: brush.size,
				color: white
			})
			.drawPixel({
				x: canvasEndX,
				y: canvasEndY,
				color: white
			});
	},
	mouseDown: (e) => {
		 layers.getActive()
		 	.drawCanvas
		 	.drawCircle({
		 		x: canvasEndX,
		 		y: canvasEndY,
				diameter: options.value({name: 'pressure'}) ? brush.getSize({pressure}) : brush.size,
		 		color: brushColor
		 	});
	},
	mouseDrag: (e) => {
		layers.getActive()
			.drawCanvas
			.drawLineWithCircles({
				x1: canvasStartX,
				y1: canvasStartY,
				x2: canvasEndX,
				y2: canvasEndY,
				diameter: options.value({name: 'pressure'}) ? brush.getSize({pressure}) : brush.size,
				color: brushColor
			});
		startX = endX;
		startY = endY;
		canvasStartX = canvasEndX;
		canvasStartY = canvasEndY;
	},
	mouseUp: (e) => {
		layers.refreshPreviews().save();
	},
	mouseLeave: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear();
	}
})); // }}}

tools.push(makeTool({ // pen eraser {{{
	name: 'Pen eraser',
	info: 'Pen eraser tool.',
	key: 'e',
	icon: 'ball-pen-line',
	subIcon: 'eraser-line',
	mouseMove: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear()
			.drawEmptyCircle({
				x: canvasEndX,
				y: canvasEndY,
				diameter: brush.size,
				color: white
			})
			.drawPixel({
				x: canvasEndX,
				y: canvasEndY,
				color: white
			});
	},
	mouseDown: (e) => {
		layers.getActive()
			.drawCanvas
			.drawCircle({
				x: canvasEndX,
				y: canvasEndY,
				diameter: options.value({name: 'pressure'}) ? brush.getSize({pressure}) : brush.size,
				erase: true
			});
	},
	mouseDrag: (e) => {
		layers.getActive()
			.drawCanvas
			.drawLineWithCircles({
				x1: canvasStartX,
				y1: canvasStartY,
				x2: canvasEndX,
				y2: canvasEndY,
				diameter: options.value({name: 'pressure'}) ? brush.getSize({pressure}) : brush.size,
				erase: true
			});
		startX = endX;
		startY = endY;
		canvasStartX = canvasEndX;
		canvasStartY = canvasEndY;
	},
	mouseUp: (e) => {
		layers
			.save()
			.refreshPreviews();
	},
	mouseLeave: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear();
	}
})); // }}}

tools.push(makeTool({ // brush {{{
	name: 'Brush',
	info: 'Brush tool.',
	icon: 'brush-2-fill',
	mouseMove: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear()
			.drawPixel({
				x: canvasEndX,
				y: canvasEndY,
				color: white
			});
	},
	mouseDown: (e) => {
		// layers.getActive()
		// 	.drawCanvas
		// 	.drawRotatedSquare({
		// 		x: canvasEndX,
		// 		y: canvasEndY,
		// 		width: brush.getSize({pressure}),
		// 		color: brushColor,
		// 		angle: angle
		// 	});
	},
	mouseDrag: (e) => {
		// if (canvasStartX !== xBuffer[xBuffer.length - 1] || canvasStartY !== yBuffer[yBuffer.length - 1]) {
			if (xBuffer.length == brushBuffer) {
				angle = Math.atan2(yBuffer[brushBuffer - 1] - yBuffer[0], xBuffer[brushBuffer - 1] - xBuffer[0]);
				xBuffer.shift();
				yBuffer.shift();
				if (firstStroke) {
					layers.getActive()
						.drawCanvas
						.drawLineWithRotatedSquares({
							x1: xBuffer[0],
							y1: yBuffer[0],
							x2: canvasEndX,
							y2: canvasEndY,
							width: options.value({name: 'pressure'}) ? brush.getSize({pressure}) : brush.size,
							color: brushColor,
							angle: angle
						});
					firstStroke = false;
				} else {
					layers.getActive()
						.drawCanvas
						.drawLineWithRotatedSquares({
							x1: canvasStartX,
							y1: canvasStartY,
							x2: canvasEndX,
							y2: canvasEndY,
							width: options.value({name: 'pressure'}) ? brush.getSize({pressure}) : brush.size,
							color: brushColor,
							angle: angle
						});
				}
			}
			xBuffer.push(canvasEndX);
			yBuffer.push(canvasEndY);
		// }
		startX = endX;
		startY = endY;
		canvasStartX = canvasEndX;
		canvasStartY = canvasEndY;
	},
	mouseUp: (e) => {
		layers.refreshPreviews().save();
		xBuffer = [];
		yBuffer = [];
		firstStroke = true;
	},
	mouseLeave: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear();
		xBuffer = [];
		yBuffer = [];
		firstStroke = true;
	}
})); // }}}

tools.push(makeTool({ // brush eraser {{{
	name: 'Brush eraser',
	info: 'Brush eraser tool.',
	icon: 'brush-2-line',
	subIcon: 'eraser-line',
	mouseMove: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear()
			.drawPixel({
				x: canvasEndX,
				y: canvasEndY,
				color: white
			});
	},
	mouseDown: (e) => {
		// layers.getActive()
		// 	.drawCanvas
		// 	.drawRotatedSquare({
		// 		x: canvasEndX,
		// 		y: canvasEndY,
		// 		width: brush.getSize({pressure}),
		// 		color: brushColor,
		// 		angle: angle
		// 	});
	},
	mouseDrag: (e) => {
		// if (canvasStartX !== xBuffer[xBuffer.length - 1] || canvasStartY !== yBuffer[yBuffer.length - 1]) {
			if (xBuffer.length == brushBuffer) {
				angle = Math.atan2(yBuffer[brushBuffer - 1] - yBuffer[0], xBuffer[brushBuffer - 1] - xBuffer[0]);
				xBuffer.shift();
				yBuffer.shift();
				layers.getActive()
					.drawCanvas
					.drawLineWithRotatedSquares({
						x1: canvasStartX,
						y1: canvasStartY,
						x2: canvasEndX,
						y2: canvasEndY,
						width: options.value({name: 'pressure'}) ? brush.getSize({pressure}) : brush.size,
						angle: angle,
						erase: true
					});
			}
			xBuffer.push(canvasEndX);
			yBuffer.push(canvasEndY);
		// }
		startX = endX;
		startY = endY;
		canvasStartX = canvasEndX;
		canvasStartY = canvasEndY;
	},
	mouseUp: (e) => {
		layers.refreshPreviews().save();
		xBuffer = [];
		yBuffer = [];
	},
	mouseLeave: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear();
		xBuffer = [];
		yBuffer = [];
	}
})); // }}}

tools.push(makeTool({ // brush-size {{{
	name: 'Point size',
	info: 'Brush size tool. Drag to change the size of the brush.',
	key: 's',
	icon: 'focus-2-line',
	mouseMove: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear()
			.drawEmptyCircle({
				x: canvasEndX,
				y: canvasEndY,
				diameter: brush.size,
				color: white
			})
			.drawPixel({
				x: canvasEndX,
				y: canvasEndY,
				color: white
			});
	},
	mouseDrag: (e) => {
		brush.changeSize({size: Math.round(Math.min(Math.max(brush.size + dX * dBrushSize, 1)), maxBrushSize)});
		brush.refresh();
		startX = endX;
	},
	mouseLeave: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear();
	}
})); // }}}

tools.push(makeTool({ // color-picker {{{
    name: 'Color Picker',
    info: 'Color picker tool. Click to pick a color from the canvas.',
    key: 'p',
	quickKey: 'i',
    icon: 'dropper-fill',
    mouseMove: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear()
			.drawCrossHairs({
				x: canvasEndX,
				y: canvasEndY,
				color: white
			});
    },
    mouseDown: (e) => {
		if (layers.inBounds({x: canvasEndX, y: canvasEndY})) {
			startTime = Date.now();
			interval = setInterval(() => {
				if (layers.inBounds({x: canvasEndX, y: canvasEndY})) {
					if (canvasColor.isOpaque()) {
						brushColor.copy({color2: canvasColor}).refresh();
					}
				}
				if (!isMouseDown) {
					clearInterval(interval);
					startTime = Date.now();
				}
			}, 50);
		}
    },
	mouseUp: (e) => {
		clearInterval(interval);
	},
    mouseLeave: (e) => {
		clearInterval(interval);
        layers.getActive()
            .cursorCanvas
            .clear();
    }
})); // }}}

tools.push(makeTool({ // color-mix {{{
	name: 'color-mix',
	info: 'Color mixxing tool. Click and hold to mix the current brush color with the color on the canvas.',
	key: 'x',
	quickKey: 'v',
	icon: 'palette-fill',
	mouseMove: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear()
			.drawCrossHairs({
				x: canvasEndX,
				y: canvasEndY,
				color: white
			});
	},
	mouseDown: function(e) {
		tempColor.copy({color2: canvasColor});
		startTime = Date.now();
		interval = setInterval(() => {
			if (!tempColor.match({color2: canvasColor})) {
				startTime = Date.now();
				tempColor.copy({color2: canvasColor});
			}
			if (!canvasColor.isOpaque()) {
				startTime = Date.now();
			} else {
				const elapsedTime = Date.now() - startTime;
				const t = Math.min(1, elapsedTime / 10000);
				brushColor.mixxColor({color2: tempColor, t}).refresh();
				if (!isMouseDown) {
					clearInterval(interval);
					startTime = Date.now();
				}
			}
		}, 50);
	},
	mouseUp: function(e) {
		clearInterval(interval);
	},
	mouseLeave: function(e) {
		clearInterval(interval);
		layers.getActive()
			.cursorCanvas
			.clear();
	}
})); // }}}

tools.push(makeTool({ // bucket {{{
	name: 'Bucket',
	info: 'Bucket tool. Click to flood-fill an area.',
	key: 'k',
	icon: 'paint-fill',
	mouseMove: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear()
			.drawCrossHairs({
				x: canvasEndX,
				y: canvasEndY,
				color: white
			});
	},
	mouseDown: (e) => {
		if (layers.inBounds({x: canvasEndX, y: canvasEndY})) {
			layers.getActive()
				.drawCanvas
				.floodFill({
					x: canvasEndX,
					y: canvasEndY,
					color: brushColor
				});
			layers.refreshPreviews().save();
		}
	},
	mouseLeave: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear();
	}
})); // }}}

tools.push(makeTool({ // move {{{
	name: 'Move',
	info: 'Move tool. Click and drag to move the easel.',
	key: 'm',
	icon: 'drag-move-2-fill',
	mouseDown: (e) => {
		startX = e.clientX - easelElement.offsetLeft;
		startY = e.clientY - easelElement.offsetTop;
	},
	mouseDrag: (e) => {
		easelElement.style.left = dX + 'px';
		easelElement.style.top = dY + 'px';
	}
})); // }}}

tools.push(makeTool({ // hand {{{
	name: 'Hand',
	info: 'Hand tool. Click and drag to move the content of the active canvas.',
	key: 'h',
	icon: 'hand',
	mouseDown: (e) => {
		layers.getActive()
			.drawCanvas
			.save();
	},
	mouseDrag: (e) => {
		layers.getActive()
			.drawCanvas
			.clear()
			.restore({x: dX/layers.zoomScale, y: dY/layers.zoomScale});
	},
	mouseUp: (e) => {
		layers.save().refreshPreviews();
	}
})); // }}}

tools.push(makeTool({ // line {{{
	name: 'Line',
	info: 'Line tool. Click and drag to draw a line line.',
	icon: 'ruler-line',
	mouseDrag: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear()
			.drawEmptyCircle({
				x: canvasEndX,
				y: canvasEndY,
				diameter: brush.size,
				color: white
			})
			.drawPixel({
				x: canvasEndX,
				y: canvasEndY,
				color: white
			});
		if (shape.lineStart) {
			layers.getActive().tempCanvas.clear().drawLineWithCircles({
				x1: shape.lineStartX,
				y1: shape.lineStartY,
				x2: canvasEndX,
				y2: canvasEndY,
				diameter: options.value({name: 'pressure'}) ? brush.getSize({pressure}) : brush.size,
				color: brushColor
			});
		}
	},
	mouseDown: (e) => {
		// if (shape.lineStart) {
		// 	layers.getActive().drawCanvas.drawLineWithPixels({
		// 		x1: shape.lineStartX,
		// 		y1: shape.lineStartY,
		// 		x2: canvasStartX,
		// 		y2: canvasStartY,
		// 		color: brushColor
		// 	});
		// 	shape.lineStart = false;
		// }
		shape.lineStart = true;
		shape.lineStartX = canvasEndX;
		shape.lineStartY = canvasEndY;
	},
	// mouseDrag: (e) => {
	// 	// layers.getActive()
	// 	// 	.tempCanvas
	// 	// 	.clear()
	// 	// 	.drawLineWithPixels({
	// 	// 		x1: canvasStartX,
	// 	// 		y1: canvasStartY,
	// 	// 		x2: canvasEndX,
	// 	// 		y2: canvasEndY,
	// 	// 		color: brushColor
	// 	// 	});
	// },
	mouseUp: (e) => {
		if (shape.lineStart) {
			layers.getActive()
				.drawCanvas
				.drawLineWithCircles({
					x1: shape.lineStartX,
					y1: shape.lineStartY,
					x2: canvasEndX,
					y2: canvasEndY,
					diameter: options.value({name: 'pressure'}) ? brush.getSize({pressure}) : brush.size,
					color: brushColor
				});
			layers.getActive().tempCanvas.clear();
			layers.refreshPreviews().save();
			shape.lineStart = false;
		} 
	},
	mouseLeave: (e) => {
		layers.getActive().cursorCanvas.clear();
		shape.lineStart = false;
	}
})); // }}}

tools.push(makeTool({ // resize {{{
	name: 'Resize',
	info: 'Resize tool. Click and drag to resize the easel.',
	icon: 'crop-line',
	mouseDrag: (e) => {
		// let newWidth = layers.width + Math.round(dX * layers.zoomScale);
		// let newHeight = layers.height + Math.round(dY * layers.zoomScale);
		let newWidth = layers.width + Math.round(dX / layers.zoomScale);
		let newHeight = layers.height + Math.round(dY / layers.zoomScale);
		layers.resize({height: newHeight, width: newWidth}).refreshSizeController();
		startX = endX;
		startY = endY;
	},
	mouseUp: (e) => {
		layers.save().refreshPreviews();
	}
})); // }}}

tools.push(makeTool({ // zoom {{{
	name: 'Zoom',
	info: 'Zoom tool. Click and drag to zoom in and out.',
	icon: 'zoom-in-line',
	mouseDown: (e) => {
		tempScale = layers.zoomScale;
	},
	mouseDrag: (e) => {
		let distance = Math.sqrt(dX * dX + dY * dY);
		if (dX < 0) {
			distance = -distance
		}
		tempScale = tempScale + distance / 1000;
		let newScale = Math.round(tempScale * 10) / 10;
		if (newScale < 0.1) {
			newScale = 0.1;
		}
		if (newScale > 20) {
			newScale = 20;
		}
		if (layers.zoomScale !== newScale) {
			layers.zoom({scale: newScale}).refreshZoomController();
		}
		startX = endX;
		startY = endY;
	},
	mouseUp: (e) => {
		layers.save().refreshPreviews();
	}
})); // }}}

tools.push(makeTool({ // rectangle {{{
	name: 'Rectangle',
	info: 'Rectangle tool. Click and drag to draw a rectangle.',
	icon: 'rectangle-fill',
	mouseMove: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear()
			.drawCrossHairs({
				x: canvasEndX,
				y: canvasEndY,
				color: white
			});
	},
	mouseDrag: (e) => {
		layers.getActive()
			.tempCanvas
			.clear()
			.drawRectCustom({
				x: canvasStartX,
				y: canvasStartY,
				width: canvasDX,
				height: canvasDY,
				color: brushColor
			});
	},
	mouseUp: (e) => {
		layers.getActive()
			.drawCanvas
			.drawRectCustom({
				x: canvasStartX,
				y: canvasStartY,
				width: canvasDX,
				height: canvasDY,
				color: brushColor
			});
		layers.getActive()
			.tempCanvas
			.clear();
		layers.refreshPreviews().save();
	},
	mouseLeave: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear();
	}
})); // }}}
tools.push(makeTool({ // erase rectangle {{{
	name: 'Erase Rectangle',
	info: 'Erase rectangle tool. Click and drag to erase a rectangle.',
	icon: 'rectangle-line',
	subIcon: 'eraser-line',
	mouseMove: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear()
			.drawCrossHairs({
				x: canvasEndX,
				y: canvasEndY,
				color: white
			});
	},
	mouseDrag: (e) => {
		layers.getActive()
			.selectCanvas
			.clear()
			.drawRectCustom({
				x: canvasStartX,
				y: canvasStartY,
				width: canvasDX,
				height: canvasDY,
				color: white
			});
	},
	mouseUp: (e) => {
		layers.getActive()
			.drawCanvas
			.drawRectCustom({
				x: canvasStartX,
				y: canvasStartY,
				width: canvasDX,
				height: canvasDY,
				erase: true
			});
		layers.getActive()
			.selectCanvas
			.clear();
		layers.refreshPreviews().save();
	},
	mouseLeave: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear();
	}
})); // }}}
tools.push(makeTool({ // extract rectangle {{{
	name: 'Cut rectangle',
	info: 'Cut rectangle tool. Click and drag to cut a rectangle to a new layer.',
	icon: 'rectangle-line',
	subIcon: 'scissors-fill',
	mouseMove: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear()
			.drawCrossHairs({
				x: canvasEndX,
				y: canvasEndY,
				color: white
			});
	},
	mouseDrag: (e) => {
		layers.getActive()
			.selectCanvas
			.clear()
			.drawEmptyRectangle({
				x: canvasStartX,
				y: canvasStartY,
				width: canvasDX,
				height: canvasDY,
				color: white
			});
	},
	mouseUp: (e) => {
		const mask = layers.getActive().selectCanvas.rectFill({x: canvasStartX, y: canvasStartY, width: canvasDX, height: canvasDY});
		const lift = layers.getActive().drawCanvas.lift({maskData: mask});
		layers.getActive().selectCanvas._path = [];
		layers.getActive().selectCanvas._pathComplete = false;
		layers.getActive().selectCanvas.clear();
		layers.getActive().cursorCanvas.clear();
		layers.add();
		layers.getActive().drawCanvas.stamp({maskData: lift});
		layers.save().refresh();
		tools.activateByName({name: 'Hand'}).refresh();
	},
	mouseLeave: (e) => {
		layers.getActive().selectCanvas.clear();
		layers.getActive().cursorCanvas.clear();
	}
})); // }}}

tools.push(makeTool({ // freeform {{{
	name: 'Freeform',
	info: 'Freeform tool. Click and/or drag to draw a shape (double-click to complete the shape).',
	icon: 'heart-fill',
	mouseMove: (e) => {
		// cursor
		layers.getActive()
			.cursorCanvas
			.clear()
			.drawCrossHairs({
				x: canvasEndX,
				y: canvasEndY,
				color: white
			});

		// if linestart, draw preview line on temp2Canvas
		if (shape.lineStart) {
			layers.getActive().temp2Canvas.clear().drawLineWithPixels({
				x1: shape.lineStartX,
				y1: shape.lineStartY,
				x2: canvasEndX,
				y2: canvasEndY,
				color: brushColor
			});
		}

	},

	mouseDown: (e) => {
		
		// if haven't started polygon, start polygon and prepare temp canvas
		if (!shape.polygonStart) {
			if (layers.inBounds({x: canvasEndX, y: canvasEndY})) {

				layers.getActive()
					.tempCanvas
					._path = [];

				layers.getActive()
					.tempCanvas
					._pathComplete = false;

				shape.polygonStart = true;
				shape.polygonStartX = canvasEndX;
				shape.polygonStartY = canvasEndY;

			}
		}

		// if started a line, save line to tempCanvas
		if (shape.lineStart) {
			layers.getActive().tempCanvas.drawLineWithPixels({
				x1: shape.lineStartX,
				y1: shape.lineStartY,
				x2: canvasStartX,
				y2: canvasStartY,
				color: brushColor
			});
		}

		// make sure line isnt started
		shape.lineStart = false;

	},
	mouseDrag: (e) => {
		console.log("test");
		layers.getActive()
			.tempCanvas
			.drawLineWithPixels({
				x1: canvasStartX,
				y1: canvasStartY,
				x2: canvasEndX,
				y2: canvasEndY,
				color: brushColor
			});
		startX = endX;
		startY = endY;
		canvasStartX = canvasEndX;
		canvasStartY = canvasEndY;
	},
	mouseUp: (e) => {

		// start line
		if (layers.inBounds({x: canvasEndX, y: canvasEndY})) {
			shape.lineStart = true;
			shape.lineStartX = canvasEndX;
			shape.lineStartY = canvasEndY;
		}	

		// const pathStart = layers.getActive().tempCanvas._path[0];
		// layers.getActive().tempCanvas.drawLineWithPixels({x1: canvasEndX, y1: canvasEndY, x2: pathStart.x, y2: pathStart.y, color: brushColor});
		// const mask = layers.getActive().tempCanvas.pathFill({path: layers.getActive().tempCanvas._path});
		// layers.getActive().drawCanvas.fill({maskData: mask, color: brushColor});
		// layers.getActive().tempCanvas._path = [];
		// layers.getActive().tempCanvas._pathComplete = false;
		// layers.getActive().tempCanvas.clear();
		// layers.refreshPreviews().save();
	},

	mouseDoubleClick: (e) => {

		// finish shape
		if (shape.polygonStart) {
			layers.getActive().tempCanvas.drawLineWithPixels({
				x1: shape.lineStartX,
				y1: shape.lineStartY,
				x2: shape.polygonStartX,
				y2: shape.polygonStartY,
				color: brushColor
			});
			const mask = layers.getActive().tempCanvas.pathFill({path: layers.getActive().tempCanvas._path});
			layers.getActive().drawCanvas.fill({maskData: mask, color: brushColor});
			layers.getActive().tempCanvas.clear();
			layers.getActive().tempCanvas._path = [];
			layers.getActive().tempCanvas._pathComplete = false;
			layers.refreshPreviews().save();
		}
		shape.polygonStart = false;
		shape.lineStart = false;

	},

	mouseLeave: (e) => {
		// shape.polygonStart = false;
		// shape.lineStart = false;
		// layers.getActive().tempCanvas._path = [];
		// layers.getActive().tempCanvas._pathComplete = false;
		// layers.getActive().tempCanvas.clear();
		// layers.getActive().temp2Canvas.clear();
		// layers.refreshPreviews().save();
	}
})); // }}}
tools.push(makeTool({ // erase freeform {{{
	name: 'Freeform',
	info: 'Freeform erase tool. Click and/or drag to erase a shape (double-click to complete the shape).',
	icon: 'heart-line',
	subIcon: 'eraser-line',
	mouseMove: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear()
			.drawCrossHairs({
				x: canvasEndX,
				y: canvasEndY,
				color: white
			});

		if (shape.lineStart) {
			layers.getActive().select2Canvas.clear().drawLineWithPixels({
				x1: shape.lineStartX,
				y1: shape.lineStartY,
				x2: canvasEndX,
				y2: canvasEndY,
				color: white
			});
		}

	},
	mouseDown: (e) => {

		// if haven't started polygon, start polygon and prepare selectCanvas
		if (!shape.polygonStart) {
			if (layers.inBounds({x: canvasEndX, y: canvasEndY})) {

				layers.getActive()
					.selectCanvas
					._path = [];

				layers.getActive()
					.selectCanvas
					._pathComplete = false;

				shape.polygonStart = true;
				shape.polygonStartX = canvasEndX;
				shape.polygonStartY = canvasEndY;

			}
		}

		// if started a line, save line to selectCanvas
		if (shape.lineStart) {
			layers.getActive().selectCanvas.drawLineWithPixels({
				x1: shape.lineStartX,
				y1: shape.lineStartY,
				x2: canvasStartX,
				y2: canvasStartY,
				color: white
			});
		}

		shape.lineStart = false;


	},
	mouseDrag: (e) => {
		layers.getActive()
			.selectCanvas
			.drawLineWithPixels({
				x1: canvasStartX,
				y1: canvasStartY,
				x2: canvasEndX,
				y2: canvasEndY,
				color: white
			});
		startX = endX;
		startY = endY;
		canvasStartX = canvasEndX;
		canvasStartY = canvasEndY;
	},
	mouseUp: (e) => {

		if (layers.inBounds({x: canvasEndX, y: canvasEndY})) {
			shape.lineStart = true;
			shape.lineStartX = canvasEndX;
			shape.lineStartY = canvasEndY;
		}	


		// if (!layers.getActive().selectCanvas._pathComplete) {
		// 	const pathStart = layers.getActive().selectCanvas._path[0];
		// 	layers.getActive().selectCanvas.drawLineWithPixels({x1: canvasEndX, y1: canvasEndY, x2: pathStart.x, y2: pathStart.y, color: brushColor});
		// 	const mask = layers.getActive().selectCanvas.pathFill({path: layers.getActive().selectCanvas._path});
		// 	layers.getActive().drawCanvas.fill({maskData: mask, erase: true});
		// 	layers.refreshPreviews().save();
		// }
		// layers.getActive().selectCanvas._path = [];
		// layers.getActive().selectCanvas._pathComplete = false;
		// layers.getActive().selectCanvas.clear();
	},

	mouseDoubleClick: (e) => {

		// finish shape
		if (shape.polygonStart) {
			layers.getActive().selectCanvas.drawLineWithPixels({
				x1: shape.lineStartX,
				y1: shape.lineStartY,
				x2: shape.polygonStartX,
				y2: shape.polygonStartY,
				color: brushColor
			});
			const mask = layers.getActive().selectCanvas.pathFill({path: layers.getActive().selectCanvas._path});
			layers.getActive().drawCanvas.fill({maskData: mask, erase: true});
			layers.getActive().selectCanvas.clear();
			layers.getActive().selectCanvas._path = [];
			layers.getActive().selectCanvas._pathComplete = false;
			layers.refreshPreviews().save();
		}
		shape.polygonStart = false;
		shape.lineStart = false;

		layers.getActive().selectCanvas.clear();
		layers.getActive().select2Canvas.clear();
	},

	mouseLeave: (e) => {
		shape.polygonStart = false;
		shape.lineStart = false;
		layers.getActive().selectCanvas._path = [];
		layers.getActive().selectCanvas._pathComplete = false;
		layers.getActive().selectCanvas.clear();
		layers.getActive().select2Canvas.clear();
	}
})); // }}}
tools.push(makeTool({ // extract freeform {{{
	name: 'Extract',
	info: 'Freeform cut tool. Click and/or drag to cut a shape to a new layer (double-click to complete the shape).',
	icon: 'heart-line',
	subIcon: 'scissors-fill',
	mouseMove: (e) => {

		layers.getActive()
			.cursorCanvas
			.clear()
			.drawCrossHairs({
				x: canvasEndX,
				y: canvasEndY,
				color: white
			});

		if (shape.lineStart) {
			layers.getActive().select2Canvas.clear().drawLineWithPixels({
				x1: shape.lineStartX,
				y1: shape.lineStartY,
				x2: canvasEndX,
				y2: canvasEndY,
				color: white
			});
		}
	},

	mouseDown: (e) => {

		// if haven't started polygon, start polygon and prepare selectCanvas
		if (!shape.polygonStart) {
			if (layers.inBounds({x: canvasEndX, y: canvasEndY})) {

				layers.getActive()
					.selectCanvas
					._path = [];

				layers.getActive()
					.selectCanvas
					._pathComplete = false;

				shape.polygonStart = true;
				shape.polygonStartX = canvasEndX;
				shape.polygonStartY = canvasEndY;

			}
		}

		// if started a line, save line to selectCanvas
		if (shape.lineStart) {
			layers.getActive().selectCanvas.drawLineWithPixels({
				x1: shape.lineStartX,
				y1: shape.lineStartY,
				x2: canvasStartX,
				y2: canvasStartY,
				color: white
			});
		}

		shape.lineStart = false;

	},
	mouseDrag: (e) => {
		layers.getActive()
			.selectCanvas
			.drawLineWithPixels({
				x1: canvasStartX,
				y1: canvasStartY,
				x2: canvasEndX,
				y2: canvasEndY,
				color: white
			});
		startX = endX;
		startY = endY;
		canvasStartX = canvasEndX;
		canvasStartY = canvasEndY;
	},

	mouseUp: (e) => {

		if (layers.inBounds({x: canvasEndX, y: canvasEndY})) {
			shape.lineStart = true;
			shape.lineStartX = canvasEndX;
			shape.lineStartY = canvasEndY;
		}	

	},

	mouseDoubleClick: (e) => {

		if (shape.polygonStart) {
			layers.getActive().select2Canvas.drawLineWithPixels({
				x1: shape.lineStartX,
				y1: shape.lineStartY,
				x2: shape.polygonStartX,
				y2: shape.polygonStartY,
				color: brushColor
			});
			const mask = layers.getActive().selectCanvas.pathFill({path: layers.getActive().selectCanvas._path});
			const lift = layers.getActive().drawCanvas.lift({maskData: mask});
			layers.getActive().selectCanvas._path = [];
			layers.getActive().selectCanvas._pathComplete = false;
			layers.getActive().selectCanvas.clear();
			layers.getActive().select2Canvas.clear();
			layers.getActive().cursorCanvas.clear();
			layers.add();
			layers.getActive().drawCanvas.stamp({maskData: lift});
			layers.save().refresh();
			tools.activateByName({name: 'Hand'}).refresh();
		}
		shape.polygonStart = false;
		shape.lineStart = false;

		layers.getActive().selectCanvas._path = [];
		layers.getActive().selectCanvas._pathComplete = false;
		layers.getActive().select2Canvas._path = [];
		layers.getActive().select2Canvas._pathComplete = false;

	},

	mouseLeave: (e) => {
		shape.lineStart = false;
		shape.polygonStart = false;
		layers.getActive().selectCanvas._path = [];
		layers.getActive().selectCanvas._pathComplete = false;
		layers.getActive().selectCanvas.clear();
		layers.getActive().select2Canvas.clear();
		layers.refreshPreviews().save();
	}
})); // }}}

/*
tools.push(makeTool({ // ellipse {{{
	name: 'Ellipse',
	info: 'Draw an ellipse.',
	icon: 'circle',
	mouseMove: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear()
			.drawCrossHairs({
				x: canvasEndX,
				y: canvasEndY,
				color: white
			});
	},
	mouseDrag: (e) => {
		layers.getActive()
			.tempCanvas
			.clear()
			.drawEllipse({
				x: canvasStartX,
				y: canvasStartY,
				width: canvasDX,
				height: canvasDY,
				color: brushColor
			});
	},
	mouseUp: (e) => {
		layers.getActive().drawCanvas.drawEllipse({x: canvasStartX, y: canvasStartY, width: canvasDX, height: canvasDY, color: brushColor});
		layers.getActive().tempCanvas.clear();
		layers.refreshPreviews().save();
	},
	mouseLeave: (e) => {
		layers.getActive().cursorCanvas.clear();
	}
}));  // }}}
tools.push(makeTool({ // erase ellipse {{{
	name: 'Erase Ellipse',
	info: 'Erase an ellipse.',
	icon: 'circle',
	subIcon: 'eraser',
	mouseMove: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear()
			.drawCrossHairs({
				x: canvasEndX,
				y: canvasEndY,
				color: white
			});
	},
	mouseDrag: (e) => {
		layers.getActive()
			.selectCanvas
			.clear()
			.drawEllipse({
				x: canvasStartX,
				y: canvasStartY,
				width: canvasDX,
				height: canvasDY,
				color: white
			});
	},
	mouseUp: (e) => {
		layers.getActive().drawCanvas.drawEllipse({x: canvasStartX, y: canvasStartY, width: canvasDX, height: canvasDY, erase: true});
		layers.getActive().selectCanvas.clear();
		layers.refreshPreviews().save();
	},
	mouseLeave: (e) => {
		layers.getActive().cursorCanvas.clear();
	}
})); // }}}
tools.push(makeTool({ // extract ellipse {{{
	name: 'Extract Ellipse',
	info: 'Extract an ellipse to a new layer.',
	icon: 'circle',
	subIcon: 'scissors',
	mouseMove: (e) => {
		layers.getActive()
			.cursorCanvas
			.clear()
			.drawCrossHairs({
				x: canvasEndX,
				y: canvasEndY,
				color: white
			});
	},
	mouseDrag: (e) => {
		layers.getActive()
			.selectCanvas
			.clear()
			.drawEllipse({
				x: canvasStartX,
				y: canvasStartY,
				width: canvasDX,
				height: canvasDY,
				color: white
			});
	},
	mouseUp: (e) => {
		const mask = layers.getActive().selectCanvas.getData();
		const lift = layers.getActive().drawCanvas.lift({maskData: mask});
		layers.getActive().selectCanvas.clear();
		layers.add();
		layers.getActive().drawCanvas.stamp({maskData: lift});
		layers.save().refresh();
		tools.activateByName({name: 'Hand'}).refresh();
	},
	mouseLeave: (e) => {
		layers.getActive().selectCanvas.clear();
		layers.getActive().cursorCanvas.clear();
	}
})); // }}}
*/

tools.refresh();

// }}}

// LAYER COMMANDS {{{

const layerCommands = makeCommands({
	controllerElement: layerCommandsElement,
	infoTipElement: infoTipElement,
	toolTipElement: toolTipElement
});

layerCommands.add({ // add layer {{{
	name: 'Add Layer',
	info: 'Add a new layer.',
	icon: 'add-fill',
	func: () => {
		layers.add().save().refreshController().refreshEasel();
	}
}); // }}}

layerCommands.add({ // move up {{{
	name: 'Move Up',
	info: 'Move the active layer up.',
	icon: 'arrow-up-line',
	func: () => {
		layers.moveUp({index: layers.activeIndex}).save().refreshController().refreshEasel();
	}
}); // }}}

layerCommands.add({ // move down {{{
	name: 'Move Down',
	info: 'Move the active layer down.',
	icon: 'arrow-down-line',
	func: () => {
		layers.moveDown({index: layers.activeIndex}).save().refreshController().refreshEasel();
	}
}); // }}}

layerCommands.add({ // merge down {{{
	name: 'Merge Down',
	info: 'Merge the active layer down.',
	icon: 'arrow-down-double-line',
	func: () => {
		layers.mergeDown({index: layers.activeIndex}).save().refreshController().refreshEasel().refreshPreviews();
	}
}); // }}}

layerCommands.add({ // duplicate layer {{{
	name: 'Duplicate Layer',
	info: 'Duplicate the active layer.',
	icon: 'file-copy-line',
	func: () => {
		layers.duplicate({index: layers.activeIndex}).save().refreshController().refreshEasel().refreshPreviews();
	}
}); // }}}

layerCommands.add({ // delete layer {{{
	name: 'Delete Layer',
	info: 'Delete the active layer.',
	icon: 'delete-bin-line',
	func: () => {
		layers.remove({index: layers.activeIndex}).save().refreshController().refreshEasel();
	}
}); // }}}

layerCommands.add({ // flip vertical {{{
	name: 'Flip Vertical',
	info: 'Flip the active layer vertically.',
	icon: 'flip-vertical-line',
	func: () => {
		layers.getActive().flipVertical();
		layers.save().refresh();
	}
}); // }}}

layerCommands.add({ // flip horizontal {{{
	name: 'Flip Horizontal',
	info: 'Flip the active layer horizontally.',
	icon: 'flip-horizontal-line',
	func: () => {
		layers.getActive().flipHorizontal();
		layers.save().refresh();
	}
}); // }}}

layerCommands.add({ // fill {{{
	name: 'Fill',
	info: 'Fill the active layer with a color.',
	icon: 'paint-brush-fill',
	func: () => {
		layers.getActive().drawCanvas.fillAll({color: brushColor});
		layers.save().refresh();
	}
}); // }}}

layerCommands.add({ // hide {{{
	name: 'Hide',
	info: 'Hide the active layer.',
	icon: 'eye-off-fill',
	func: () => {
		layers.getActive().toggleHide();
		layers.refresh();
	}
}); // }}}

layerCommands.add({ // clear {{{
	name: 'Clear',
	info: 'Clear the active layer.',
	key: 'c',
	icon: 'sparkling-line',
	func: () => {
		layers.getActive().drawCanvas.clear();
		layers.save().refresh();
	}
}); // }}}

layerCommands.refresh();

// }}}

// MOUSE EVENTS {{{

// window.addEventListener('touchmove', function(e) {
// 	e.preventDefault();
// }, { passive: false });

window.addEventListener('touchend', function(e) {
	e.preventDefault();  // Prevents the default double-tap behavior (zoom)
}, { passive: false });

let mouseEventBuffer = [];

function studioPointerMove(e) { // {{{
	if (e.touches) {
        e = e.touches[0]; // Get the first touch point
    }
	// pressure = 0;
	endX = e.clientX;
	endY = e.clientY;
	dX = endX - startX;
	dY = endY - startY;
	const canvas = layers.getActive().drawCanvas;

	canvasEndX = canvas.getPositionOnCanvas(e).x;
	canvasEndY = canvas.getPositionOnCanvas(e).y;
	canvasDX = canvasEndX - canvasStartX;
	canvasDY = canvasEndY - canvasStartY;
	// canvasColor.copy({color2: canvas.getPixel({x: canvasEndX, y: canvasEndY})}).refresh();
	canvasColor.copy({color2: layers.getColor({x: canvasEndX, y: canvasEndY})}).refresh();

	if (tools.active) {

		if (tools.active.mouseMove) {
			tools.active.mouseMove(e);
		}

		if (isMouseDown) {
			var pointerType = e.pointerType || 'mouse';
			if (pointerType === 'pen') {
				pressure = e.pressure || 0;
			}
			if (tools.active.mouseDrag) {
				tools.active.mouseDrag(e);
			}

		}

	}

	toolTipElement.style.left = `${e.clientX + 5}px`;
	toolTipElement.style.top = `${e.clientY - 22 - 5}px`;

	toolTipElement.style.display = 'block';

}

// }}}
studioElement.addEventListener('pointermove', (e) => {
	e.eventType = 'pointermove';
	mouseEventBuffer.push(e);
});

function studioPointerDown(e) { // {{{
	if (e.touches) {
        e = e.touches[0]; // Get the first touch point
    }

	isMouseDown = true;
	startX = e.clientX;
	startY = e.clientY;

	const canvas = layers[0].cursorCanvas;
	canvasStartX = canvas.getPositionOnCanvas(e).x;
	canvasStartY = canvas.getPositionOnCanvas(e).y;

	if (tools.active) {
		if (tools.active.mouseDown) {
			tools.active.mouseDown(e);
		}
	}

}

// }}}
studioElement.addEventListener('pointerdown', (e) => {
	e.eventType = 'pointerdown';
	mouseEventBuffer.push(e);
});

function studioPointerUp(e) { // {{{
	if (e.changedTouches) {
        e = e.changedTouches[0]; // Get the final touch point
    }
	isMouseDown = false;
	// startX = e.clientX;
	// startY = e.clientY;

	// const canvas = layers[0].cursorCanvas;
	// canvasStartX = canvas.getPositionOnCanvas(e).x;
	// canvasStartY = canvas.getPositionOnCanvas(e).y;
	
	endX = e.clientX;
	endY = e.clientY;
	dX = endX - startX;
	dY = endY - startY;

	const canvas = layers.getActive().drawCanvas;

	canvasEndX = canvas.getPositionOnCanvas(e).x;
	canvasEndY = canvas.getPositionOnCanvas(e).y;
	canvasDX = canvasEndX - canvasStartX;
	canvasDY = canvasEndY - canvasStartY;
	canvasColor.copy({color2: canvas.getPixel({x: canvasEndX, y: canvasEndY})}).refresh();

	if (tools.active) {
		if (tools.active.mouseUp) {
			tools.active.mouseUp(e);
		}
	}


} // }}}
studioElement.addEventListener('pointerup', (e) => {
	e.eventType = 'pointerup';
	mouseEventBuffer.push(e);
});

function studioPointerLeave(e) { // {{{
	isMouseDown = false;
	startX = e.clientX;
	startY = e.clientY;

	const canvas = layers[0].cursorCanvas;
	canvasStartX = canvas.getPositionOnCanvas(e).x;
	canvasStartY = canvas.getPositionOnCanvas(e).y;

	if (tools.active) {
		if (tools.active.mouseLeave) {
			tools.active.mouseLeave(e);
		}
	}

	toolTipElement.style.display = 'none';

} // }}}
studioElement.addEventListener('pointerleave', (e) => {
	e.eventType = 'pointerleave';
	mouseEventBuffer.push(e);
});

function studioDoubleClick(e) { // {{{
	startX = e.clientX;
	startY = e.clientY;

	const canvas = layers[0].cursorCanvas;
	canvasStartX = canvas.getPositionOnCanvas(e).x;
	canvasStartY = canvas.getPositionOnCanvas(e).y;

	if (tools.active) {
		if (tools.active.mouseDoubleClick) {
			tools.active.mouseDoubleClick(e);
		}
	}
} // }}}
studioElement.addEventListener('dblclick', (e) => {
	e.eventType = 'dblclick';
	mouseEventBuffer.push(e);
});
let lastTouchTime = 0;

// document.addEventListener('pointermove', function(e) {
//     if (!studioElement.contains(e.target)) {
// 		shape.polygonStart = false;
// 		shape.lineStart = false;
// 		layers.getActive().tempCanvas.clear();
// 		layers.getActive().temp2Canvas.clear();
// 		layers.getActive().selectCanvas.clear();
// 		layers.getActive().select2Canvas.clear();
//     }
// });

document.addEventListener('pointerdown', function(e) {
    if (!studioElement.contains(e.target)) {
		shape.polygonStart = false;
		shape.lineStart = false;
		layers.getActive().tempCanvas.clear();
		layers.getActive().temp2Canvas.clear();
		layers.getActive().selectCanvas.clear();
		layers.getActive().select2Canvas.clear();
    }
});


const doubleTapThreshold = 300;  // Time in milliseconds to detect double-tap
studioElement.addEventListener('touchend', function(e) {
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - lastTouchTime;
    if (timeDifference < doubleTapThreshold && timeDifference > 0) {
		e.preventDefault();
		e.eventType = 'dblclick';
		mouseEventBuffer.push(e);
    }
    lastTouchTime = currentTime;
});

function processMouseEvents() { 
    while (mouseEventBuffer.length > 0) {
        let e = mouseEventBuffer.shift();
		if (e.eventType === 'pointermove') {
			studioPointerMove(e);
		} else if (e.eventType === 'pointerdown') {
			studioPointerDown(e);
		} else if (e.eventType === 'pointerup') {
			studioPointerUp(e);
		} else if (e.eventType === 'pointerleave') {
			studioPointerLeave(e);
		} else if (e.eventType === 'dblclick') {
			studioDoubleClick(e);
		}
    }
    requestAnimationFrame(processMouseEvents);
}

processMouseEvents();

// }}}

// KEY EVENTS {{{

document.addEventListener('keydown', (e) => {
	if (isKeyDown) {
		return;
	}

	tools.forEach(tool => {
		if (tool.key === e.key.toLowerCase()) {
			tools.activate({tool}).refresh();
			layers.getActive().cursorCanvas.clear();
			isKeyDown = true;
		}
		if (tool.quickKey === e.key.toLowerCase()) {
			tools.activate({tool}).refresh();
			const mouseEvent = new MouseEvent('mousedown', {});
			studioElement.dispatchEvent(mouseEvent);
			isKeyDown = true;
		}
	});

	commands.forEach(command => {
		if (command.key) {
			if (command.key.toLowerCase() === e.key.toLowerCase()) {
				command.func();
			}
		}
	});

	layerCommands.forEach(command => {
		if (command.key) {
			if (command.key.toLowerCase() === e.key.toLowerCase()) {
				command.func();
			}
		}
	});

});

document.addEventListener('keyup', (e) => {
	tools.forEach(tool => {
		if (tool.key === e.key.toLowerCase()) {
			isKeyDown = false;
			if (tool.key === e.key) {
				tools.revert().refresh();
				layers.getActive().cursorCanvas.clear();
			}
		}
		if (tool.quickKey === e.key.toLowerCase()) {
			const mouseEvent = new MouseEvent('mouseup', {});
			studioElement.dispatchEvent(mouseEvent);
			tools.revert().refresh();
			isKeyDown = false;
		}
	});

});

// }}}

home();
tools.activateByName({name: 'Pen'}).refresh();
