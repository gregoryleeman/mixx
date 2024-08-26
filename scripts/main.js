// CONSTANTS {{{
const toolTipElement = document.getElementById('tool-tip');
const colorTipElement = document.getElementById('color-tip');
const commandsElement = document.getElementById('commands');
const toolsElement = document.getElementById('tools');
const brushColorElement = document.getElementById('brush-color');
const canvasColorElement = document.getElementById('canvas-color');
const studioElement = document.getElementById('studio');
const easelElement = document.getElementById('easel');
const layersElement = document.getElementById('layers');
const colorsElement = document.getElementById('colors');

const dZoom = 0.001;
const dBrushSize = 0.5;
const dOpacity = 0.001;
const initialWidth = 800;
const initialHeight = 600;
const maxBrushSize = 500;
const tolerance = 1;

// }}}

// VARIABLES {{{

let brushSize = 10;
let zoom = 1;
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

// }}}

// HELPERS {{{

function home() {
	const rect = studioElement.getBoundingClientRect();
	easelElement.style.left = `${rect.left}px`;
	easelElement.style.top = `${rect.top}px`;
}

// }}}

// LAYERS {{{

const layers = makeLayers({
	controllerElement: layersElement,
	easelElement: easelElement,
	height: initialHeight,
	width: initialWidth
});

layers.loadFromLocalStorage().updateActive().refresh();

// }}}

// COLORS {{{

const black = makeColor({r: 0, g: 0, b: 0})
const white = makeColor({r: 255, g: 255, b: 255})
const cadmiumYellow = makeColor({r: 254, g: 236, b: 0})
const hansaYellow = makeColor({r: 252, g: 211, b: 0})
const cadmiumOrange = makeColor({r: 255, g: 105, b: 0})
const cadmiumRed = makeColor({r: 255, g: 39, b: 2})
const quinacridoneMagenta = makeColor({r: 128, g: 2, b: 46})
const cobaltViolet = makeColor({r: 78, g: 0, b: 66})
const ultramarineBlue = makeColor({r: 25, g: 0, b: 89})
const cobaltBlue = makeColor({r: 0, g: 33, b: 133})
const phthaloBlue = makeColor({r: 13, g: 27, b: 68})
const phthaloGreen = makeColor({r: 0, g: 60, b: 50})
const permanentGreen = makeColor({r: 7, g: 109, b: 22})
const sapGreen = makeColor({r: 107, g: 148, b: 4})
const burntSienna = makeColor({r: 123, g: 72, b: 0})
const red = makeColor({r: 255, g: 0, b: 0})
const green = makeColor({r: 0, g: 255, b: 0})
const blue = makeColor({r: 0, g: 0, b: 255})
const cyan = makeColor({r: 0, g: 255, b: 255})
const yellow = makeColor({r: 255, g: 255, b: 0})
const magenta = makeColor({r: 255, g: 0, b: 255})

const tempColor = makeColor({r: 0, g: 0, b: 0});
const brushColor = makeColor({r: 0, g: 0, b: 0, controllerElement: brushColorElement}).refresh();
const canvasColor = makeColor({r: 0, g: 0, b: 0, controllerElement: canvasColorElement}).refresh();

// }}}

// PUCKS {{{
const pucks = makePucks({
	controllerElement: colorsElement,
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
	controllerElement: commandsElement
});

commands.add({ // undo {{{
	name: 'Undo',
	key: 'z',
	iconPath: 'icons/solid/rotate-left.svg',
	func: () => {
		layers.undo().updateActive().refresh();
	}
}); // }}}
commands.add({ // redo {{{
	name: 'Redo',
	key: 'y',
	iconPath: 'icons/solid/rotate-right.svg',
	func: () => {
		layers.redo().updateActive().refresh();
	}
}); // }}}
commands.add({ // reset {{{
	name: 'Reset',
	iconPath: 'icons/regular/trash-can.svg',
	func: () => {
		layers.reset().save().updateActive().refresh();
	}
}); // }}}
commands.add({ // clear {{{
	name: 'Clear',
	key: 'c',
	iconPath: 'icons/solid/broom.svg',
	func: () => {
		layers.getActive().drawCanvas.clear();
		layers.save().refresh();
	}
}); // }}}
commands.add({ // save {{{
	name: 'Save',
	iconPath: 'icons/solid/file-arrow-down.svg',
	func: () => {
		layers.exportPng();
	}
}); // }}}
commands.add({ // home {{{
	name: 'Home',
	iconPath: 'icons/solid/house.svg',
	func: () => {
		home();
	}
}); // }}}

commands.refresh();

// }}}

// TOOLS {{{

const tools = makeTools({
	controllerElement: toolsElement,
	toolTipElement: toolTipElement
});

tools.push(makeTool({ // brush {{{
	name: 'Brush',
	key: 'b',
	iconPath: 'icons/solid/pen.svg',
	mouseMove: (e) => {
		layers.getActive()
			.selectCanvas
			.clear()
			.drawEmptyCircle({
				x: canvasEndX,
				y: canvasEndY,
				diameter: brushSize,
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
				diameter: brushSize,
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
				diameter: brushSize,
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
			.selectCanvas
			.clear();
	}
})); // }}}

tools.push(makeTool({ // eraser {{{
	name: 'Eraser',
	key: 'e',
	iconPath: 'icons/solid/eraser.svg',
	mouseMove: (e) => {
		layers.getActive()
			.selectCanvas
			.clear()
			.drawEmptyCircle({
				x: canvasEndX,
				y: canvasEndY,
				diameter: brushSize,
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
				diameter: brushSize,
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
				diameter: brushSize,
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
			.selectCanvas
			.clear();
	}
})); // }}}

tools.push(makeTool({ // brush-size {{{
	name: 'Brush Size',
	key: 's',
	iconPath: 'icons/regular/circle-dot.svg',
	mouseMove: (e) => {
		layers.getActive()
			.selectCanvas
			.clear()
			.drawEmptyCircle({
				x: canvasEndX,
				y: canvasEndY,
				diameter: brushSize,
				color: white
			})
			.drawPixel({
				x: canvasEndX,
				y: canvasEndY,
				color: white
			});
	},
	mouseDrag: (e) => {
		brushSize += dX * dBrushSize;
		brushSize = Math.min(Math.max(brushSize, 1), maxBrushSize);
		startX = endX;
	},
	mouseLeave: (e) => {
		layers.getActive()
			.selectCanvas
			.clear();
	}
})); // }}}

tools.push(makeTool({ // bucket {{{
	name: 'Bucket',
	key: 'k',
	iconPath: 'icons/solid/fill.svg',
	mouseMove: (e) => {
		layers.getActive()
			.selectCanvas
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
			.selectCanvas
			.clear();
	}
})); // }}}

tools.push(makeTool({ // move {{{
	name: 'Move',
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

tools.push(makeTool({ // resize {{{
	name: 'Resize',
	key: 'r',
	iconPath: 'icons/solid/ruler-combined.svg',
	mouseDrag: (e) => {
		let newWidth = layers.width + dX;
		let newHeight = layers.height + dY;
		layers.resize({height: newHeight, width: newWidth, save: false});
		startX = endX;
		startY = endY;
	},
	mouseUp: (e) => {
		layers.save().refreshPreviews();
	}
})); // }}}

tools.push(makeTool({ // content-move {{{
	name: 'Content Move',
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

tools.push(makeTool({ // color-mix {{{
	name: 'color-mix',
	key: 'x',
	iconPath: 'icons/solid/mortar-pestle.svg',
	mouseMove: (e) => {
		layers.getActive()
			.selectCanvas
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
	toolTipElement.style.left = `${e.clientX + 3}px`;
	toolTipElement.style.top = `${e.clientY - 16 - 3}px`;

}); // }}}

studioElement.addEventListener('mousedown', (e) => { // {{{
	isMouseDown = true;
	startX = e.clientX;
	startY = e.clientY;

	const canvas = layers[0].selectCanvas;
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
	startX = e.clientX;
	startY = e.clientY;

	const canvas = layers[0].selectCanvas;
	canvasStartX = canvas.getPositionOnCanvas(e).x;
	canvasStartY = canvas.getPositionOnCanvas(e).y;

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

	const canvas = layers[0].selectCanvas;
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
			console.log(`Key down: ${e.key} activates tool: ${tool.name}`);
			tools.activate({tool}).refresh();
			layers.getActive().selectCanvas.clear();
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
				console.log(`Key up: ${e.key} reverts from tool: ${tool.name}`);
				tools.revert().refresh();
				layers.getActive().selectCanvas.clear();
			}
		}
	});

});

// }}}

// INIT {{{

home();
tools.activateByName({name: 'Brush'}).refresh();

// }}}
