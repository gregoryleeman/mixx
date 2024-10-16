function makeOption({name, info, key=undefined, icon, defaultValue}) {
	const option = {};
	option.name = name;
	option.info = info;
	option.key = key;
	option.icon = icon;
	option.value = defaultValue;
	option.toggle = function() {
		option.value = !option.value;
	};
	return option;
}

function makeOptions({controllerElement, infoTipElement}) {
	const options = [];
	options.controllerElement = controllerElement;
	options.infoTipElement = infoTipElement;

	options.add = function({name, info, key, icon, defaultValue}) {
		const option = makeOption({name, info, key, icon, defaultValue});
		options.push(option);
	};

	options.get = function({name}) {
		return options.find(option => option.name === name);
	};

	options.value = function({name}) {
		const option = options.get({name});
		return option.value;
	};

	options.refreshController = function() {
		options.controllerElement.innerHTML = '';
		options.forEach(option => {
			const button = document.createElement('button');
			button.classList.add('button');
			button.classList.add('option-button');
			button.classList.add(option.value ? 'active' : 'inactive');
			button.innerHTML = `<i class="icon ri-${option.icon}"></i>`;
			button.addEventListener("pointerdown", () => {
				option.toggle();
				options.refreshController();
			});
			button.addEventListener("pointerenter", () => {
				options.infoTipElement.innerHTML = option.info;
			});
			button.addEventListener("pointerleave", () => {
				options.infoTipElement.innerHTML = 'mixx.';
			});
			options.controllerElement.appendChild(button);
		});
	};

	options.refresh = function() {
		options.refreshController();
	};

	return options;
}

