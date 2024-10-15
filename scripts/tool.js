function makeTool({name, toolClass, info, key, quickKey, iconPath, subIconPath, mouseDown=undefined, mouseMove=undefined, mouseDrag=undefined, mouseUp=undefined, mouseLeave=undefined, mouseDoubleClick=undefined}) {
	if (!name || !iconPath) {
		throw new Error("name and iconPath are required to make a tool");
	}

	const tool = {};

	tool.init = function() { // {{{
		tool.name = name;
		tool.toolClass = toolClass;
		tool.info = info;
		tool.key = key;
		tool.quickKey = quickKey;
		tool.subIconPath = subIconPath;
		tool.iconPath = iconPath;
		tool.mouseDown = mouseDown;
		tool.mouseMove = mouseMove;
		tool.mouseDrag = mouseDrag;
		tool.mouseUp = mouseUp;
		tool.mouseLeave = mouseLeave;
		tool.mouseDoubleClick = mouseDoubleClick;

		return tool;
	} // }}}

	tool.init();

	return tool;
}

function makeTools({controllerElement, toolTipElement, infoTipElement}) {
	if (!controllerElement || !toolTipElement) {
		throw new Error("controllerElement and toolTipElement are required to make tools");
	}

	const tools = [];

	tools.get = function({name}) { // {{{
		return tools.find(tool => tool.name === name);
	}; // }}}

	tools.getByClass = function({toolClass}) { // {{{
		return tools.find(tool => tool.toolClass === toolClass);
	} // }}}

	tools.remove = function({name}) { // {{{
		const tool = tools.get({name});
		if (tool) {
			tools.splice(tools.indexOf(tool), 1);
		}
		return tools;
	} // }}}

	tools.replace = function({toolClass, tool}) { // {{{
		const oldTool = tools.getByClass({toolClass});
		if (oldTool) {
			tools.splice(tools.indexOf(oldTool), 1, tool);
		}
		return tools;
	} // }}}

	tools.activate = function({tool}) { // {{{
		console.log(`activating ${tool.name}`);
		if (tools.active) {
			tools.previous = tools.active;
		}
		tools.active = tool;
		return tools;
	}; // }}}

	tools.activateByName = function({name}) { // {{{
		const tool = tools.get({name});
		if (tool) {
			tools.activate({tool});
		}

		return tools;
	}; // }}}

	tools.revert = function() { // {{{
		if (tools.previous) {
			tools.active = tools.previous;
		}
		return tools;
	}; // }}}

	tools.refreshController = function() { // {{{
		tools.controllerElement.innerHTML = "";
		tools.forEach(tool => {
			const button = document.createElement("div");
			button.classList.add("button");
			button.classList.add("tool-button");
			if (tool === tools.active) {
				button.classList.add("active");
			}
			button.innerHTML = `<img src="${tool.iconPath}" alt="${tool.name}" draggable="false">`;
			if (tool.subIconPath) {
				button.innerHTML += `<img class="sub-icon" src="${tool.subIconPath}" alt="${tool.name}" draggable="false">`;
			}
			button.addEventListener("pointerdown", () => {
				tools.activate({tool}).refresh();
			});

			button.addEventListener("pointerenter", () => {
				tools.infoTipElement.innerHTML = tool.info;
				if (tool.key) {
					tools.infoTipElement.innerHTML += ` Hotkey: '${tool.key.toUpperCase()}' (temporary: '${tool.key.toLowerCase()}')`;
				}

			});

			button.addEventListener("pointerleave", () => {
				// tools.infoTipElement.style.display = "none";
				tools.infoTipElement.innerHTML = 'mixx.';
			});

			// button.addEventListener("mousemove", (event) => {
			// 	tools.infoTipElement.style.left = `${event.clientX + 20}px`;
			// 	tools.infoTipElement.style.top = `${event.clientY + 20}px`;
			// });

			if (tool.key) {
				const keyHint = document.createElement("div");
				keyHint.classList.add("key-hint");
				keyHint.innerHTML = tool.key;
				button.appendChild(keyHint);
			}
			if (tool.quickKey) {
				const quickKeyHint = document.createElement("div");
				quickKeyHint.classList.add("quick-key-hint");
				quickKeyHint.innerHTML = tool.quickKey;
				button.appendChild(quickKeyHint);
			}

			tools.controllerElement.appendChild(button);
		});

		return tools;
	}; // }}}

	tools.refreshToolTip = function() { // {{{
		if (tools.active) {
			tools.toolTipElement.innerHTML = `<img src="${tools.active.iconPath}" alt="${tools.active.name}" draggable="false">`;
		}
		return tools;
	}; // }}}
	
	tools.refresh = function() { // {{{
		tools.refreshController();
		tools.refreshToolTip();

		return tools;
	}; // }}}

	tools.init = function() { // {{{
		tools.controllerElement = controllerElement;
		tools.toolTipElement = toolTipElement;
		tools.infoTipElement = infoTipElement;
		tools.active = null;
		tools.previous = null;

		return tools;
	} // }}}

	tools.init();

	return tools;

}
