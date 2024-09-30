const version = '1.0.0';

// CONSTANTS {{{
const topBarElement = document.getElementById('top-bar');
const toolTipElement = document.getElementById('tool-tip');
const infoTipElement = document.getElementById('info-tip');
const commandsElement = document.getElementById('commands');
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
const dOpacity = 0.001;
const initialWidth = 800;
const initialHeight = 600;
const maxBrushSize = 500;
const tolerance = 1;

// }}}

// VARIABLES {{{

let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;
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
let polygonStart = false;
let polygonStartX = 0;
let polygonStartY = 0;
let lineStart = false;
let lineStartX = 0;
let lineStartY = 0;


// }}}

// HELPERS {{{

function home() {
	const rect = studioElement.getBoundingClientRect();
	easelElement.style.left = `${rect.left + 2}px`;
	easelElement.style.top = `${rect.top + 2}px`;
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
	width: initialWidth
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
const brushColor = makeColor({r: 0, g: 0, b: 0, controllerElement: brushColorElement, name: 'Current brush color', infoTipElement: infoTipElement}).refresh();
const canvasColor = makeColor({r: 0, g: 0, b: 0, controllerElement: canvasColorElement, name: 'Color under cursor', infoTipElement: infoTipElement}).refresh();

// }}}

// PUCKS {{{
const pucks = makePucks({
	controllerElement: colorsElement,
	infoTipElement: infoTipElement,
	brushColor: brushColor,
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
	info: 'Save as a JSON file.',
	iconPath: 'icons/solid/floppy-disk.svg',
	func: () => {
		layers.exportBlob();
	}
}); // }}}

commands.add({ // open {{{
	name: 'Open',
	info: 'Open a JSON file.',
	iconPath: 'icons/regular/folder-open.svg',
	func: () => {
		layers.importBlob();
	}
}); // }}}

commands.add({ // export png {{{
	name: 'Export PNG',
	info: 'Export as a PNG image.',
	iconPath: 'icons/solid/file-image.svg',
	func: () => {
		layers.exportPng();
	}
}); // }}}

commands.add({ // reset {{{
	name: 'Reset',
	info: 'Reset the entire project.',
	iconPath: 'icons/regular/trash-can.svg',
	func: () => {
		layers.reset().save().updateActive().refresh();
	}
}); // }}}

commands.add({ // home {{{
	name: 'Home',
	info: 'Return the easel to the home position.',
	iconPath: 'icons/solid/house.svg',
	func: () => {
		layers.zoom({scale: 1}).refresh();
		home();
	}
}); // }}}

commands.add({ // undo {{{
	name: 'Undo',
	info: 'Undo the last action.',
	key: 'z',
	iconPath: 'icons/solid/rotate-left.svg',
	func: () => {
		layers.undo().updateActive().refresh();
		// layers.zoom({scale: layers.zoomScale}).refresh(); // FIX THIS




		// layers.undo().updateActive().refresh();

		// layers.zoom({scale: layers.zoomScale}).refresh();
	}
}); // }}}

commands.add({ // redo {{{
	name: 'Redo',
	info: 'Redo the last action.',
	key: 'y',
	iconPath: 'icons/solid/rotate-right.svg',
	func: () => {
		layers.redo().updateActive().refresh();
	}
}); // }}}

commands.add({ // change shape {{{
	name: 'Change Shape',
	info: 'Change the shape tool.',
	iconPath: 'icons/solid/shapes.svg',
	func: () => {
		const currentShape = tools.getByClass({toolClass: 'shape'});
		const shapeIndex = shapes.findIndex(shape => shape.name === currentShape.name);
		const nextShapeIndex = (shapeIndex + 1) % shapes.length;
		const nextShape = shapes[nextShapeIndex];

		tools.replace({toolClass: 'shape', tool: nextShape.shape});
		tools.replace({toolClass: 'erase', tool: nextShape.erase});
		tools.replace({toolClass: 'extract', tool: nextShape.extract});
		tools.refreshController();
	}
}); // }}}

commands.add({ // flip all vertical {{{
	name: 'Flip All Vertical',
	info: 'Flip all layers vertically.',
	iconPath: 'icons/solid/arrow-up-arrow-down.svg',
	func: () => {
		layers.flipAllVertical();
		layers.save().refresh();
	}
}); // }}}

commands.add({ // flip all horizontal {{{
	name: 'Flip All Horizontal',
	info: 'Flip all layers horizontally.',
	iconPath: 'icons/solid/arrow-right-arrow-left.svg',
	func: () => {
		layers.flipAllHorizontal();
		layers.save().refresh();
	}
}); // }}}



commands.refresh();

// }}}

// TOOLS {{{

const tools = makeTools({
	controllerElement: leftBarElement,
	toolTipElement: toolTipElement,
	infoTipElement: infoTipElement
});

tools.push(makeTool({ // brush {{{
	name: 'Brush',
	info: 'Brush tool.',
	key: 'b',
	iconPath: 'icons/solid/pen.svg',
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
				diameter: brush.size,
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
				diameter: brush.size,
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

tools.push(makeTool({ // eraser {{{
	name: 'Eraser',
	info: 'Eraser tool.',
	key: 'e',
	iconPath: 'icons/solid/eraser.svg',
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
				diameter: brush.size,
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
				diameter: brush.size,
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

tools.push(makeTool({ // brush-size {{{
	name: 'Brush Size',
	info: 'Change the size of the brush.',
	key: 's',
	iconPath: 'icons/regular/circle-dot.svg',
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
		brush.changeSize({size: Math.min(Math.max(brush.size + dX * dBrushSize, 1), maxBrushSize)});
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
    info: 'Select a color from the canvas.',
    key: 'p',
	quickKey: 'i',
    iconPath: 'icons/solid/eye-dropper.svg',
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
	info: 'Mix the current brush color with the color on the canvas (click and hold).',
	key: 'x',
	quickKey: 'v',
	iconPath: 'icons/solid/mortar-pestle.svg',
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
	info: 'Flood-fill an area.',
	key: 'k',
	iconPath: 'icons/solid/fill.svg',
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
	info: 'Move the easel.',
	key: 'm',
	iconPath: 'icons/solid/arrows-up-down-left-right.svg',
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
	info: 'Move the content of the active canvas.',
	key: 'h',
	iconPath: 'icons/regular/hand.svg',
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
	info: 'Draw a line.',
	iconPath: 'icons/solid/minus.svg',
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
			.drawLineWithPixels({
				x1: canvasStartX,
				y1: canvasStartY,
				x2: canvasEndX,
				y2: canvasEndY,
				color: brushColor
			});
	},
	mouseUp: (e) => {
		layers.getActive()
			.drawCanvas
			.drawLineWithPixels({
				x1: canvasStartX,
				y1: canvasStartY,
				x2: canvasEndX,
				y2: canvasEndY,
				color: brushColor
			});
		layers.getActive().tempCanvas.clear();
		layers.refreshPreviews().save();
	},
	mouseLeave: (e) => {
		layers.getActive().cursorCanvas.clear();
	}
})); // }}}

tools.push(makeTool({ // distort {{{
	name: 'Distort',
	info: 'Squeeze and stretch the content of the active layer.',
	iconPath: 'icons/solid/down-left-and-up-right-to-center.svg',
	mouseDown: (e) => {
		layers.getActive()
			.drawCanvas
			.save();
	},
	mouseDrag: (e) => {
		let newWidth = layers.width - dX;
		let newHeight = layers.height - dY;
		layers.getActive().drawCanvas.distort({height: newHeight, width: newWidth, anchorX: canvasStartX, anchorY: canvasStartY});
		// startX = endX;
		// startY = endY;
	},
	mouseUp: (e) => {
		layers.save().refreshPreviews();
	}
})); // }}}

tools.push(makeTool({ // resize {{{
	name: 'Resize',
	info: 'Resize the easel.',
	iconPath: 'icons/solid/ruler-combined.svg',
	mouseDrag: (e) => {
		let newWidth = layers.width + dX;
		let newHeight = layers.height + dY;
		layers.resize({height: newHeight, width: newWidth, save: false}).refreshSizeController();
		startX = endX;
		startY = endY;
	},
	mouseUp: (e) => {
		layers.save().refreshPreviews();
	}
})); // }}}

tools.push(makeTool({ // zoom {{{
	name: 'Zoom',
	info: 'Zoom in on the easel.',
	iconPath: 'icons/solid/magnifying-glass.svg',
	mouseDown: (e) => {
		tempScale = layers.zoomScale;
	},
	mouseDrag: (e) => {
		tempScale = tempScale + dX / 100;
		var scale = Math.floor(tempScale);
		if (scale !== layers.zoomScale) {
			layers.zoom({scale}).refreshZoomController();
		}
		startX = endX;
	},
	mouseUp: (e) => {
		tempScale = layers.zoomScale;
		layers.save().refreshPreviews();
	}
})); // }}}

const shapes = [
	{
		name: 'Polygon',
		shape: makeTool({ // polygon {{{
			toolClass: 'shape',
			name: 'Polygon',
			info: 'Draw a polygon (double click to complete).',
			iconPath: 'icons/solid/star.svg',
			mouseMove: (e) => {
				layers.getActive()
					.cursorCanvas
					.clear()
					.drawCrossHairs({
						x: canvasEndX,
						y: canvasEndY,
						color: white
					});
				if (lineStart) {
					layers.getActive().tempCanvas.clear().drawLineWithPixels({
						x1: lineStartX,
						y1: lineStartY,
						x2: canvasEndX,
						y2: canvasEndY,
						color: brushColor
					});
				}
			},
			mouseDrag: (e) => {
				layers.getActive().tempCanvas.clear().drawLineWithPixels({
					x1: lineStartX,
					y1: lineStartY,
					x2: canvasEndX,
					y2: canvasEndY,
					color: brushColor
				});
			},
			mouseDown: (e) => {
				if (!polygonStart) {
					if (layers.inBounds({x: canvasEndX, y: canvasEndY})) {
						console.log("polygonStart");
						polygonStart = true;
						polygonStartX = canvasEndX;
						polygonStartY = canvasEndY;
					}
				}
				if (lineStart) {
					layers.getActive().temp2Canvas.drawLineWithPixels({
						x1: lineStartX,
						y1: lineStartY,
						x2: canvasStartX,
						y2: canvasStartY,
						color: brushColor
					});
				}
				if (polygonStart) {
					lineStart = true;
					lineStartX = canvasEndX;
					lineStartY = canvasEndY;
				}
			},
			mouseUp: (e) => {
				if (lineStart) {
					layers.getActive().temp2Canvas.drawLineWithPixels({
						x1: lineStartX,
						y1: lineStartY,
						x2: canvasEndX,
						y2: canvasEndY,
						color: brushColor
					});
				}
				if (layers.inBounds({x: canvasEndX, y: canvasEndY})) {
					lineStart = true;
					lineStartX = canvasEndX;
					lineStartY = canvasEndY;
				}	
			},
			mouseDoubleClick: (e) => {
				if (polygonStart) {
					layers.getActive().temp2Canvas.drawLineWithPixels({
						x1: lineStartX,
						y1: lineStartY,
						x2: polygonStartX,
						y2: polygonStartY,
						color: brushColor
					});
					const mask = layers.getActive().temp2Canvas.pathFill({path: layers.getActive().temp2Canvas._path});
					layers.getActive().drawCanvas.fill({maskData: mask, color: brushColor});
					layers.getActive().temp2Canvas.clear();
					layers.getActive().temp2Canvas._path = [];
					layers.getActive().temp2Canvas._pathComplete = false;
					layers.refreshPreviews().save();
				}
				polygonStart = false;
				lineStart = false;
			}
		}), // }}}
		erase: makeTool({ // erase polygon {{{
			toolClass: 'erase',
			name: 'Erase Polygon',
			info: 'Erase a polygon (double click to complete).',
			iconPath: 'icons/regular/star.svg',
			subIconPath: 'icons/solid/eraser.svg',
			mouseMove: (e) => {
				layers.getActive()
					.cursorCanvas
					.clear()
					.drawCrossHairs({
						x: canvasEndX,
						y: canvasEndY,
						color: white
					});
				if (lineStart) {
					layers.getActive().selectCanvas.clear().drawLineWithPixels({
						x1: lineStartX,
						y1: lineStartY,
						x2: canvasEndX,
						y2: canvasEndY,
						color: white
					});
				}
			},
			mouseDrag: (e) => {
				layers.getActive().selectCanvas.clear().drawLineWithPixels({
					x1: lineStartX,
					y1: lineStartY,
					x2: canvasEndX,
					y2: canvasEndY,
					color: white
				});
			},
			mouseDown: (e) => {
				if (!polygonStart) {
					if (layers.inBounds({x: canvasEndX, y: canvasEndY})) {
						polygonStart = true;
						polygonStartX = canvasEndX;
						polygonStartY = canvasEndY;
					}
				}
				if (lineStart) {
					layers.getActive().select2Canvas.drawLineWithPixels({
						x1: lineStartX,
						y1: lineStartY,
						x2: canvasStartX,
						y2: canvasStartY,
						color: white
					});
				}
				if (polygonStart) {
					lineStart = true;
					lineStartX = canvasEndX;
					lineStartY = canvasEndY;
				}
			},
			mouseUp: (e) => {
				if (lineStart) {
					layers.getActive().select2Canvas.drawLineWithPixels({
						x1: lineStartX,
						y1: lineStartY,
						x2: canvasEndX,
						y2: canvasEndY,
						color: brushColor
					});
				}
				if (layers.inBounds({x: canvasEndX, y: canvasEndY})) {
					lineStart = true;
					lineStartX = canvasEndX;
					lineStartY = canvasEndY;
				}
			},
			mouseDoubleClick: (e) => {
				if (polygonStart) {
					layers.getActive().select2Canvas.drawLineWithPixels({
						x1: lineStartX,
						y1: lineStartY,
						x2: polygonStartX,
						y2: polygonStartY,
						color: brushColor
					});
					const mask = layers.getActive().select2Canvas.pathFill({path: layers.getActive().select2Canvas._path});
					layers.getActive().drawCanvas.fill({maskData: mask, erase: true});
					layers.getActive().selectCanvas.clear();
					layers.getActive().select2Canvas.clear();
					layers.getActive().select2Canvas._path = [];
					layers.getActive().select2Canvas._pathComplete = false;
					layers.refreshPreviews().save();
				}
				polygonStart = false;
				lineStart = false;
			}
		}), // }}}
		extract: makeTool({ // extract polygon {{{
			toolClass: 'extract',
			name: 'Extract Polygon',
			info: 'Extract a polygon. (double click to complete)',
			iconPath: 'icons/regular/star.svg',
			subIconPath: 'icons/solid/scissors.svg',
			mouseMove: (e) => {
				layers.getActive()
					.cursorCanvas
					.clear()
					.drawCrossHairs({
						x: canvasEndX,
						y: canvasEndY,
						color: white
					});
				if (lineStart) {
					layers.getActive().selectCanvas.clear().drawLineWithPixels({
						x1: lineStartX,
						y1: lineStartY,
						x2: canvasEndX,
						y2: canvasEndY,
						color: white
					});
				}
			},
			mouseDrag: (e) => {
				layers.getActive().selectCanvas.clear().drawLineWithPixels({
					x1: lineStartX,
					y1: lineStartY,
					x2: canvasEndX,
					y2: canvasEndY,
					color: white
				});
			},
			mouseDown: (e) => {
				if (!polygonStart) {
					if (layers.inBounds({x: canvasEndX, y: canvasEndY})) {
						polygonStart = true;
						polygonStartX = canvasEndX;
						polygonStartY = canvasEndY;
					}
				}
				if (lineStart) {
					layers.getActive().select2Canvas.drawLineWithPixels({
						x1: lineStartX,
						y1: lineStartY,
						x2: canvasStartX,
						y2: canvasStartY,
						color: white
					});
				}
				if (polygonStart) {
					lineStart = true;
					lineStartX = canvasEndX;
					lineStartY = canvasEndY;
				}
			},
			mouseUp: (e) => {
				if (lineStart) {
					layers.getActive().select2Canvas.drawLineWithPixels({
						x1: lineStartX,
						y1: lineStartY,
						x2: canvasEndX,
						y2: canvasEndY,
						color: brushColor
					});
				}
				if (layers.inBounds({x: canvasEndX, y: canvasEndY})) {
					lineStart = true;
					lineStartX = canvasEndX;
					lineStartY = canvasEndY;
				}
			},
			mouseDoubleClick: (e) => {
				if (polygonStart) {
					layers.getActive().select2Canvas.drawLineWithPixels({
						x1: lineStartX,
						y1: lineStartY,
						x2: polygonStartX,
						y2: polygonStartY,
						color: brushColor
					});
					const mask = layers.getActive().select2Canvas.pathFill({path: layers.getActive().select2Canvas._path});
					const lift = layers.getActive().drawCanvas.lift({maskData: mask});
					layers.getActive().select2Canvas._path = [];
					layers.getActive().select2Canvas._pathComplete = false;
					layers.getActive().select2Canvas.clear();
					layers.getActive().selectCanvas.clear();
					layers.getActive().cursorCanvas.clear();
					layers.add();
					layers.getActive().drawCanvas.stamp({maskData: lift});
					layers.save().refresh();
					tools.activateByName({name: 'Hand'}).refresh();
				}
				polygonStart = false;
				lineStart = false;
			}
		}) // }}}
	},
	{
		name: 'Freeform',
		shape: makeTool({ // freeform {{{
			name: 'Freeform',
			toolClass: 'shape',
			info: 'Draw a freeform shape.',
			iconPath: 'icons/solid/heart.svg',
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
				layers.getActive()
					.tempCanvas
					._path = [];
				layers.getActive()
					.tempCanvas
					._pathComplete = false;
			},
			mouseDrag: (e) => {
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
				// if (layers.getActive().tempCanvas._pathComplete) {
				// 	const mask = layers.getActive().tempCanvas.pathFill({path: layers.getActive().tempCanvas._path});
				// 	layers.getActive().drawCanvas.fill({maskData: mask, color: brushColor});
				// 	layers.getActive().tempCanvas._path = [];
				// 	layers.getActive().tempCanvas._pathComplete = false;
				// 	layers.getActive().tempCanvas.clear();
				// 	isMouseDown = false;
				// }
			},
			mouseUp: (e) => {
				// if (!layers.getActive().tempCanvas._pathComplete) {
					const pathStart = layers.getActive().tempCanvas._path[0];
					layers.getActive().tempCanvas.drawLineWithPixels({x1: canvasEndX, y1: canvasEndY, x2: pathStart.x, y2: pathStart.y, color: brushColor});
					const mask = layers.getActive().tempCanvas.pathFill({path: layers.getActive().tempCanvas._path});
					layers.getActive().drawCanvas.fill({maskData: mask, color: brushColor});
				// }
				layers.getActive().tempCanvas._path = [];
				layers.getActive().tempCanvas._pathComplete = false;
				layers.getActive().tempCanvas.clear();
				layers.refreshPreviews().save();
			},
			mouseLeave: (e) => {
				layers.getActive().tempCanvas._path = [];
				layers.getActive().tempCanvas._pathComplete = false;
				layers.getActive().tempCanvas.clear();
				layers.refreshPreviews().save();
			}
		}), // }}}
		erase: makeTool({ // erase freeform {{{
			name: 'Freeform',
			toolClass: 'erase',
			info: 'Erase a freeform shape',
			iconPath: 'icons/regular/heart.svg',
			subIconPath: 'icons/solid/eraser.svg',
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
				layers.getActive()
					.selectCanvas
					._path = [];
				layers.getActive()
					.selectCanvas
					._pathComplete = false;
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
				if (!layers.getActive().selectCanvas._pathComplete) {
					const pathStart = layers.getActive().selectCanvas._path[0];
					layers.getActive().selectCanvas.drawLineWithPixels({x1: canvasEndX, y1: canvasEndY, x2: pathStart.x, y2: pathStart.y, color: brushColor});
					const mask = layers.getActive().selectCanvas.pathFill({path: layers.getActive().selectCanvas._path});
					layers.getActive().drawCanvas.fill({maskData: mask, erase: true});
					layers.refreshPreviews().save();
				}
				layers.getActive().selectCanvas._path = [];
				layers.getActive().selectCanvas._pathComplete = false;
				layers.getActive().selectCanvas.clear();
			},
			mouseLeave: (e) => {
				layers.getActive().selectCanvas._path = [];
				layers.getActive().selectCanvas._pathComplete = false;
				layers.getActive().selectCanvas.clear();
			}
		}), // }}}
		extract: makeTool({ // extract freeform {{{
			name: 'Extract',
			toolClass: 'extract',
			info: 'Extract a freeform shape to a new layer.',
			iconPath: 'icons/regular/heart.svg',
			subIconPath: 'icons/solid/scissors.svg',
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
				layers.getActive()
					.selectCanvas
					._path = [];
				layers.getActive()
					.selectCanvas
					._pathComplete = false;
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
				if (!layers.getActive().selectCanvas._pathComplete) {
					const pathStart = layers.getActive().selectCanvas._path[0];
					layers.getActive().selectCanvas.drawLineWithPixels({x1: canvasEndX, y1: canvasEndY, x2: pathStart.x, y2: pathStart.y, color: brushColor});
					const mask = layers.getActive().selectCanvas.pathFill({path: layers.getActive().selectCanvas._path});
					const lift = layers.getActive().drawCanvas.lift({maskData: mask});
					layers.getActive().selectCanvas._path = [];
					layers.getActive().selectCanvas._pathComplete = false;
					layers.getActive().selectCanvas.clear();
					layers.getActive().cursorCanvas.clear();
					layers.add();
					layers.getActive().drawCanvas.stamp({maskData: lift});
					layers.save().refresh();
					tools.activateByName({name: 'Hand'}).refresh();
				}
			},
			mouseLeave: (e) => {
				layers.getActive().selectCanvas._path = [];
				layers.getActive().selectCanvas._pathComplete = false;
				layers.getActive().selectCanvas.clear();
				layers.refreshPreviews().save();
			}
		}) // }}}
	},
	{
		name: 'Rectangle',
		shape: makeTool({ // rectangle {{{
			name: 'Rectangle',
			toolClass: 'shape',
			info: 'Draw a rectangle.',
			iconPath: 'icons/solid/square-full.svg',
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
					.drawRect({
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
					.drawRect({
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
		}), // }}}
		erase: makeTool({ // erase rectangle {{{
			name: 'Erase Rectangle',
			toolClass: 'erase',
			info: 'Erase a rectangle.',
			iconPath: 'icons/regular/square-full.svg',
			subIconPath: 'icons/solid/eraser.svg',
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
					.drawRect({
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
					.drawRect({
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
		}), // }}}
		extract: makeTool({ // extract rectangle {{{
			name: 'Extract Rectangle',
			toolClass: 'extract',
			info: 'Extract a rectangle to a new layer.',
			iconPath: 'icons/regular/square-full.svg',
			subIconPath: 'icons/solid/scissors.svg',
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
		}) // }}}
	},
	{
		name: 'Ellipse',
		shape:	makeTool({ // ellipse {{{
			name: 'Ellipse',
			toolClass: 'shape',
			info: 'Draw an ellipse.',
			iconPath: 'icons/solid/circle.svg',
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
		}), // }}}
		erase: makeTool({ // erase ellipse {{{
			toolClass: 'erase',
			name: 'Erase Ellipse',
			info: 'Erase an ellipse.',
			iconPath: 'icons/regular/circle.svg',
			subIconPath: 'icons/solid/eraser.svg',
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
		}), // }}}
		extract: makeTool({ // extract ellipse {{{
			name: 'Extract Ellipse',
			toolClass: 'extract',
			info: 'Extract an ellipse to a new layer.',
			iconPath: 'icons/regular/circle.svg',
			subIconPath: 'icons/solid/scissors.svg',
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
		}) // }}}
	},
]

tools.push(shapes[0].shape);
tools.push(shapes[0].erase);
tools.push(shapes[0].extract);

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
	iconPath: 'icons/solid/plus.svg',
	func: () => {
		layers.add().save().refreshController().refreshEasel();
	}
}); // }}}

layerCommands.add({ // move up {{{
	name: 'Move Up',
	info: 'Move the active layer up.',
	iconPath: 'icons/solid/arrow-up.svg',
	func: () => {
		layers.moveUp({index: layers.activeIndex}).save().refreshController().refreshEasel();
	}
}); // }}}

layerCommands.add({ // move down {{{
	name: 'Move Down',
	info: 'Move the active layer down.',
	iconPath: 'icons/solid/arrow-down.svg',
	func: () => {
		layers.moveDown({index: layers.activeIndex}).save().refreshController().refreshEasel();
	}
}); // }}}

layerCommands.add({ // merge down {{{
	name: 'Merge Down',
	info: 'Merge the active layer down.',
	iconPath: 'icons/solid/angles-down.svg',
	func: () => {
		layers.mergeDown({index: layers.activeIndex}).save().refreshController().refreshEasel().refreshPreviews();
	}
}); // }}}

layerCommands.add({ // duplicate layer {{{
	name: 'Duplicate Layer',
	info: 'Duplicate the active layer.',
	iconPath: 'icons/solid/clone.svg',
	func: () => {
		layers.duplicate({index: layers.activeIndex}).save().refreshController().refreshEasel().refreshPreviews();
	}
}); // }}}

layerCommands.add({ // delete layer {{{
	name: 'Delete Layer',
	info: 'Delete the active layer.',
	iconPath: 'icons/solid/trash.svg',
	func: () => {
		layers.remove({index: layers.activeIndex}).save().refreshController().refreshEasel();
	}
}); // }}}

layerCommands.add({ // clear {{{
	name: 'Clear',
	info: 'Clear the active layer.',
	key: 'c',
	iconPath: 'icons/solid/broom.svg',
	func: () => {
		layers.getActive().drawCanvas.clear();
		layers.save().refresh();
	}
}); // }}}

layerCommands.add({ // flip vertical {{{
	name: 'Flip Vertical',
	info: 'Flip the active layer vertically.',
	iconPath: 'icons/solid/arrow-up-arrow-down.svg',
	func: () => {
		layers.getActive().flipVertical();
		layers.save().refresh();
	}
}); // }}}

layerCommands.add({ // flip horizontal {{{
	name: 'Flip Horizontal',
	info: 'Flip the active layer horizontally.',
	iconPath: 'icons/solid/arrow-right-arrow-left.svg',
	func: () => {
		layers.getActive().flipHorizontal();
		layers.save().refresh();
	}
}); // }}}

layerCommands.refresh();

// }}}

// MOUSE EVENTS {{{

studioElement.addEventListener('mousemove', (e) => { // {{{
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

		if (tools.active.mouseMove) {
			tools.active.mouseMove(e);
		}

		if (isMouseDown) {

			if (tools.active.mouseDrag) {
				tools.active.mouseDrag(e);
			}

		}

	}

	toolTipElement.style.display = 'block';
	toolTipElement.style.left = `${e.clientX + 5}px`;
	toolTipElement.style.top = `${e.clientY - 16 - 5}px`;

}); // }}}

studioElement.addEventListener('mousedown', (e) => { // {{{
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

}); // }}}

studioElement.addEventListener('mouseup', (e) => { // {{{
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

}); // }}}

studioElement.addEventListener('mouseleave', (e) => { // {{{
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

}); // }}}

studioElement.addEventListener('dblclick', (e) => { // {{{
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
});

// }}}

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

infoElement = document.createElement('div');
infoElement.classList.add('button');
infoElement.classList.add('command-button');
infoElement.classList.add('info-button');
infoElement.innerHTML = `<img src="icons/solid/info.svg" alt="info">`;
infoElement.addEventListener('click', (e) => {
	window.open('https://github.com/gregoryleeman/mixx', '_blank');
});

infoElement.addEventListener('mouseenter', (e) => {
	infoTipElement.innerHTML = 'Documentation.';
});

infoElement.addEventListener('mouseleave', (e) => {
	infoTipElement.innerHTML = 'mixx.';
});

topBarElement.appendChild(infoElement);

versionElement.innerHTML = `v${version}`;

home();
tools.activateByName({name: 'Brush'}).refresh();
