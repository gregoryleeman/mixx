function makeCommand({name, info, key=undefined, icon, subIcon=undefined, func}) {
	const command = {};
	command.name = name;
	command.info = info;
	command.key = key;
	command.icon = icon;
	command.subIcon = subIcon;
	command.func = function() {
		func();
	}


	return command;
}

function makeCommands({controllerElement, infoTipElement}) {
	const commands = [];
	commands.controllerElement = controllerElement;
	commands.infoTipElement = infoTipElement;

	commands.add = function({name, info, key, icon, func, subIcon=undefined}) {
		const command = makeCommand({name, info, key, icon, func, subIcon});
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
			button.innerHTML = `<i class="icon ri-${command.icon}"></i>`;
			console.log(command.subIcon);
			if (command.subIcon) {
				button.innerHTML += `<i class="sub-icon ri-${command.subIcon}"></i>`;
			}
			button.addEventListener("pointerdown", () => {
				command.func();
			});
			button.addEventListener("pointerenter", () => {
				commands.infoTipElement.innerHTML = command.info;
				// if (command.key) {
				// 	commands.infoTipElement.innerHTML += ` Hotkey: '${command.key}'.`;
				// }
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
