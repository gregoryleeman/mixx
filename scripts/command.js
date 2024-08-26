function makeCommand({name, key=undefined, iconPath, func}) {
	const command = {};
	command.name = name;
	command.key = key;
	command.iconPath = iconPath;
	command.func = function() {
		func();
	}

	return command;
}

function makeCommands({controllerElement}) {
	const commands = [];
	commands.controllerElement = controllerElement;

	commands.add = function({name, key, iconPath, func}) {
		const command = makeCommand({name, key, iconPath, func});
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
			button.innerHTML = `<img src="${command.iconPath}" alt="${command.name}">`;
			button.onclick = () => {
				command.func();
			};

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
