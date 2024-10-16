function makeCommand({name, info, key=undefined, iconPath, subIconPath=undefined, func}) {
	const command = {};
	command.name = name;
	command.info = info;
	command.key = key;
	command.iconPath = iconPath;
	command.subIconPath = subIconPath;
	command.func = function() {
		func();
	}


	return command;
}

function makeCommands({controllerElement, infoTipElement}) {
	const commands = [];
	commands.controllerElement = controllerElement;
	commands.infoTipElement = infoTipElement;

	commands.add = function({name, info, key, iconPath, func, subIconPath=undefined}) {
		const command = makeCommand({name, info, key, iconPath, func, subIconPath});
		commands.push(command);
	};

	commands.get = function(name) {
		return commands.find(command => command.name === name);
	};

	commands.click = function(name) {
		const command = commands.get(name);
		command.func();
	};

	commands.refreshController = function() {
		commands.controllerElement.innerHTML = '';
		commands.forEach(command => {
			const button = document.createElement('button');
			button.classList.add('button');
			button.classList.add('command-button');
			button.innerHTML = `<img src="${command.iconPath}" alt="${command.name}" draggable="false">`;
			console.log(command.subIconPath);
			if (command.subIconPath) {
				button.innerHTML += `<img class="sub-icon" src="${command.subIconPath}" alt="${command.name}" draggable="false" draggable="false">`;
			}
			button.addEventListener("pointerdown", () => {
				command.func();
			});
			button.addEventListener("pointerenter", () => {
				commands.infoTipElement.innerHTML = command.info;
				if (command.key) {
					commands.infoTipElement.innerHTML += ` Hotkey: '${command.key}'.`;
				}
			});
			button.addEventListener("pointerleave", () => {
				commands.infoTipElement.innerHTML = 'mixx.';
			});
			// button.addEventListener("pointermove", (event) => {
			// 	commands.infoTipElement.style.left = `${event.clientX + 20}px`;
			// 	commands.infoTipElement.style.top = `${event.clientY + 20}px`;
			// });

			if (command.key) {
				const keyHint = document.createElement("div");
				keyHint.classList.add("key-hint");
				keyHint.innerHTML = command.key;
				button.appendChild(keyHint);
			}
			
			commands.controllerElement.appendChild(button);
		});

	};

	commands.refresh = function() {
		commands.refreshController();
	};

	return commands;
}
