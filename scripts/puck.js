function makePucks({controllerElement, brushColor, interval, infoTipElement, toolTipElement}) {
	const pucks = [];

	pucks.refreshController = function() { // {{{
		pucks.controllerElement.innerHTML = '';
		pucks.forEach(puck => {
			const element = document.createElement('div');
			element.style.backgroundColor = puck.color.toRgbString();
			element.className = 'puck';

			element.addEventListener('pointerdown', (e) => {
				const startTime = Date.now();
				interval = setInterval(() => {
					const elapsedTime = Date.now() - startTime;
					const t = Math.min(1, elapsedTime / 10000);
					brushColor.mixxColor({color2: puck.color, t});
				}, 50);
			});

			element.addEventListener('pointerenter', (e) => {
				infoTipElement.innerHTML = `${puck.color.name} (click and hold to mix with current brush color).`;
			});

			element.addEventListener('pointermove', (e) => {
				toolTipElement.innerHTML = '<i class="icon ri-palette-fill"></i>';
				toolTipElement.style.display = 'block';
				toolTipElement.style.left = `${e.clientX + 5}px`;
				toolTipElement.style.top = `${e.clientY - 22 - 5}px`;
			});

			element.addEventListener('pointerup', (e) => {
				clearInterval(interval);
			});

			element.addEventListener('pointerleave', (e) => {
				clearInterval(interval);
				infoTipElement.innerHTML = 'mixx.';
				toolTipElement.style.display = 'none';
				tools.refreshToolTip();
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
