function makeTool({name, info, key, iconPath, mouseDown=undefined, mouseMove=undefined, mouseDrag=undefined, mouseUp=undefined, mouseLeave=undefined}) {
	if (!name || !key || !iconPath) {
		throw new Error("name, key, and iconPath are required to make a tool");
	}

	const tool = {};

	tool.init = function() { // {{{
		tool.name = name;
		tool.info = info;
		tool.key = key;
		tool.iconPath = iconPath;
		tool.mouseDown = mouseDown;
		tool.mouseMove = mouseMove;
		tool.mouseDrag = mouseDrag;
		tool.mouseUp = mouseUp;
		tool.mouseLeave = mouseLeave;

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

	tools.activate = function({tool}) { // {{{
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
			button.innerHTML = `<img src="${tool.iconPath}" alt="${tool.name}">`;
			button.addEventListener("click", () => {
				tools.activate({tool}).refresh();
			});

			button.addEventListener("mouseenter", () => {
				tools.infoTipElement.innerHTML = tool.info;
				// tools.infoTipElement.style.display = "block";
			});

			button.addEventListener("mouseleave", () => {
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

			tools.controllerElement.appendChild(button);
		});

		return tools;
	}; // }}}

	tools.refreshToolTip = function() { // {{{
		if (tools.active) {
			tools.toolTipElement.innerHTML = `<img src="${tools.active.iconPath}" alt="${tools.active.name}">`;
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
