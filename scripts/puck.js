function makePucks({controllerElement, brushColor, interval, infoTipElement}) {
	const pucks = [];

	pucks.refreshController = function() { // {{{
		pucks.controllerElement.innerHTML = '';
		pucks.forEach(puck => {
			const element = document.createElement('div');
			element.style.backgroundColor = puck.color.toRgbString();
			element.className = 'puck';

			element.addEventListener('mousedown', (e) => {
				const startTime = Date.now();
				interval = setInterval(() => {
					const elapsedTime = Date.now() - startTime;
					const t = Math.min(1, elapsedTime / 10000);
					brushColor.mixxColor({color2: puck.color, t});
				}, 50);
			});

			element.addEventListener('mouseenter', (e) => {
				infoTipElement.innerHTML = `${puck.color.name} (click and hold to mix with current brush color).`;
			});

			element.addEventListener('mouseup', (e) => {
				clearInterval(interval);
			});

			element.addEventListener('mouseleave', (e) => {
				clearInterval(interval);
				infoTipElement.innerHTML = 'mixx.';
			});

			controllerElement.appendChild(element);

		});

		return pucks;
	}; // }}}

	pucks.refresh = function() { // {{{
		pucks.refreshController();

		return pucks;
	} // }}}

	pucks.init = function() { // {{{
		pucks.controllerElement = controllerElement;

		return pucks;
	} // }}}

	pucks.init();

	return pucks;
}
