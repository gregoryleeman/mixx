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

// }}}

// HELPERS {{{

function home() {
	const rect = studioElement.getBoundingClientRect();
	easelElement.style.left = `${rect.left}px`;
	easelElement.style.top = `${rect.top}px`;
}

// }}}

const brush = makeBrush({
	sizeControllerElement: brushSizeElement,
	infoTipElement: infoTipElement
});

brush.refresh();

// LAYERS {{{

const layers = makeLayers({
	controllerElement: layersElement,
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

commands.add({ // clear {{{
	name: 'Clear',
	info: 'Clear the active layer.',
	key: 'c',
	iconPath: 'icons/solid/broom.svg',
	func: () => {
		layers.getActive().drawCanvas.clear();
		layers.save().refresh();
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
		startTime = Date.now();
		interval = setInterval(() => {
			brushColor.copy({color2: canvasColor}).refresh();
			if (!isMouseDown) {
				clearInterval(interval);
				startTime = Date.now();
			}
		}, 50);
        // if (canvasColor.isOpaque()) {
        //     brushColor.copy({color2: canvasColor}).refresh();
        // }
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
		layers.getActive()
			.drawCanvas
			.floodFill({
				x: canvasEndX,
				y: canvasEndY,
				color: brushColor
			});
		layers.refreshPreviews().save();
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
			.restore({x: dX, y: dY});
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

var polygonStart = false
var polygonStartX
var polygonStartY

// tools.push(makeTool({ // polygon {{{
// 	name: 'Polygon',
// 	info: 'Draw a polygon.',
// 	iconPath: 'icons/solid/star.svg',
// 	mouseMove: (e) => {
// 		layers.getActive()
// 			.cursorCanvas
// 			.clear()
// 			.drawCrossHairs({
// 				x: canvasEndX,
// 				y: canvasEndY,
// 				color: white
// 			});
// 		if (polygonStart) {
// 			layers.getActive().selectCanvas.clear().drawLineWithPixels({
// 				x1: canvasStartX,
// 				y1: canvasStartY,
// 				x2: canvasEndX,
// 				y2: canvasEndY,
// 				color: white
// 			});
// 		}
// 	},
// 	mouseDown: (e) => {
// 		const mask = layers.getActive().selectCanvas.getData();
// 		layers.getActive().tempCanvas.fill({maskData: mask, color: brushColor});
// 		if (!polygonStart) {
// 			polygonStart = true;
// 			polygonStartX = canvasStartX;
// 			polygonStartY = canvasStartY;
// 		} else {
// 			if (Math.abs(canvasEndX - polygonStartX) < tolerance && Math.abs(canvasEndY - polygonStartY) < tolerance) {
// 				console.log("test");
// 				const fillMask = layers.getActive().tempCanvas.maskFill({data: layers.getActive.tempCanvas.getData()});
// 				layers.getActive().drawCanvas.fill({maskData: fillMask, color: brushColor});
// 				polygonStart = false;
// 			}
// 		}
// 	}
// })); // }}}


tools.push(makeTool({ // rectangle {{{
	name: 'Rectangle',
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
})); // }}}

tools.push(makeTool({ // erase rectangle {{{
	name: 'Erase Rectangle',
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
})); // }}}

tools.push(makeTool({ // extract rectangle {{{
	name: 'Extract Rectangle',
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
})); // }}}

tools.push(makeTool({ // freeform {{{
	name: 'Freeform',
	info: 'Draw a freeform shape.',
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
			console.log({pathStart});
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
})); // }}}

tools.push(makeTool({ // erase freeform {{{
	name: 'Freeform',
	info: 'Erase a freeform shape',
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
		// if (layers.getActive().selectCanvas._pathComplete) {
		// 	const mask = layers.getActive().selectCanvas.pathFill({path: layers.getActive().selectCanvas._path});
		// 	layers.getActive()
		// 		.drawCanvas
		// 		.fill({maskData: mask, erase: true});
		// 	layers.getActive().selectCanvas._path = [];
		// 	layers.getActive().selectCanvas._pathComplete = false;
		// 	layers.getActive().selectCanvas.clear();
		// 	isMouseDown = false;
		// }
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
})); // }}}

tools.push(makeTool({ // extract freeform {{{
	name: 'Extract',
	info: 'Extract a freeform shape to a new layer.',
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
		// if (layers.getActive().selectCanvas._pathComplete) {
		// 	const mask = layers.getActive().selectCanvas.pathFill({path: layers.getActive().selectCanvas._path});
		// 	const lift = layers.getActive().drawCanvas.lift({maskData: mask});
		// 	layers.getActive().selectCanvas._path = [];
		// 	layers.getActive().selectCanvas._pathComplete = false;
		// 	layers.getActive().selectCanvas.clear();
		// 	layers.getActive().cursorCanvas.clear();
		// 	layers.add();
		// 	layers.getActive().drawCanvas.stamp({maskData: lift});
		// 	layers.save().refresh();
		// 	isMouseDown = false;
		// 	tools.activateByName({name: 'Hand'}).refresh();
		// }
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
})); // }}}

tools.push(makeTool({ // ellipse {{{
	name: 'Ellipse',
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
})); // }}}

tools.push(makeTool({ // erase ellipse {{{
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
})); // }}}

tools.push(makeTool({ // extract ellipse {{{
	name: 'Extract Ellipse',
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

tools.refresh();

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
