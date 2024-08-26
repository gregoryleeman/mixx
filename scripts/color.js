function makeColor({r=0, g=0, b=0, a=255, previewElement=undefined, toolTipElement=undefined, name=undefined, infoTipElement=undefined}) {
	const color = {};

	color.fromRgbaArray = function({rgbaArray}) { // {{{
		color.r = rgbaArray[0];
		color.g = rgbaArray[1];
		color.b = rgbaArray[2];
		color.a = rgbaArray[3];
		if (color.previewElement) {
			color.previewElement.style.backgroundColor = color.toRgbaString();
		}
		if (color.toolTipElement) {
			color.toolTipElement.style.color = color.toRgbaString();
		}

		return color;
	}; // }}}

	color.toRgbaArray = function() { // {{{
		return [color.r, color.g, color.b, color.a];
	}; // }}}

	color.fromRgbArray = function({rgbArray}) { // {{{
		color.r = rgbArray[0];
		color.g = rgbArray[1];
		color.b = rgbArray[2];
		color.a = 255;
		if (color.previewElement) {
			color.previewElement.style.backgroundColor = color.toRgbaString();
		}
		if (color.toolTipElement) {
			color.toolTipElement.style.color = color.toRgbaString();
		}

		return color;
	} // }}}

	color.toRgbArray = function() { // {{{
		return [color.r, color.g, color.b];
	} // }}}

	color.fromRgbaString = function({rgbaString}) { // {{{
		color.r = rgbaString.split(",")[0].split("(")[1];
		color.g = rgbaString.split(",")[1];
		color.b = rgbaString.split(",")[2];
		color.a = rgbaString.split(",")[3].split(")")[0];
		if (color.previewElement) {
			color.previewElement.style.backgroundColor = color.toRgbaString();
		}
		if (color.toolTipElement) {
			color.toolTipElement.style.color = color.toRgbaString();
		}

		return color;;
	}; // }}}

	color.toRgbaString = function() { // {{{
		return `rgba(${color.r},${color.g},${color.b},${color.a})`;
	}; // }}}

	color.fromRgbString = function(rgbString) { // {{{
		color.r = rgbString.split(",")[0].split("(")[1];
		color.g = rgbString.split(",")[1];
		color.b = rgbString.split(",")[2].split(")")[0];
		color.a = 255;
		if (color.previewElement) {
			color.previewElement.style.backgroundColor = color.toRgbaString();
		}
		if (color.toolTipElement) {
			color.toolTipElement.style.color = color.toRgbaString();
		}

		return color;
	}; // }}}

	color.toRgbString = function() { // {{{
		return `rgb(${color.r},${color.g},${color.b})`;
	}; // }}}

	color.matchRgbaArray = function({color2RgbaArray, tolerance = 2}) { // {{{
		const color1RgbaArray = color.toRgbaArray();
		return Math.abs(color1RgbaArray[0] - color2RgbaArray[0]) <= tolerance && 
			Math.abs(color1RgbaArray[1] - color2RgbaArray[1]) <= tolerance && 
			Math.abs(color1RgbaArray[2] - color2RgbaArray[2]) <= tolerance &&
			color1RgbaArray[3] == color2RgbaArray[3];
	}; // }}}

	color.matchRgbArray = function({color2RgbArray, tolerance = 2}) { // {{{
		const color1RgbArray = color.toRgbArray();
		return Math.abs(color1RgbArray[0] - color2RgbArray[0]) <= tolerance && 
			Math.abs(color1RgbArray[1] - color2RgbArray[1]) <= tolerance && 
			Math.abs(color1RgbArray[2] - color2RgbArray[2]) <= tolerance;
	} // }}}

	color.match = function({color2}) { // {{{
		const color2RgbaArray = color2.toRgbaArray();
		return color.matchRgbaArray({color2RgbaArray});
	}; // }}}

	color.mixxRgbArray = function({color2RgbArray, t}) { // {{{
		const color1RgbArray = color.toRgbArray();
		var color3RgbArray;
		if (color.matchRgbArray({color2RgbArray})) {
			color3RgbArray = color2RgbArray;
		} else {
			color3RgbArray = mixbox.lerp(color1RgbArray, color2RgbArray, t);
		}
		color.fromRgbArray({rgbArray: color3RgbArray});

		return color;
	}; // }}}

	color.mixxColor = function({color2, t}) { // {{{
		color.mixxRgbArray({color2RgbArray: color2.toRgbArray(), t});

		return color;
	}; // }}}

	color.isOpaque = function() { // {{{
		return color.a == 255;
	}; // }}}

	color.copy = function({color2}) { // {{{
		color.r = color2.r;
		color.g = color2.g;
		color.b = color2.b;
		color.a = color2.a;

		return color;
	}; // }}}

	color.refreshPreviews = function() { // {{{
		if (color.previewElement) {
			color.previewElement.style.backgroundColor = color.toRgbaString();
			if (name && infoTipElement) {
				color.previewElement.addEventListener("pointerenter", () => {
					infoTipElement.innerHTML = `${name}.`;
				});
				color.previewElement.addEventListener("pointerleave", () => {
					infoTipElement.innerHTML = 'mixx.';
				});
			}
			if (color.toolTipElement) {
				color.toolTipElement.style.color = color.toRgbaString();
			}
		}
		return color;
	} // }}}

	color.refresh = function() { // {{{
		color.refreshPreviews();
		return color;
	} // }}}

	color.init = function() { // {{{
		color.r = r;
		color.g = g;
		color.b = b;
		color.a = a;
		color.name = name;
		color.previewElement = previewElement;
		color.toolTipElement = toolTipElement;
		if (color.previewElement) {
			color.previewElement.style.backgroundColor = color.toRgbaString();
		}
		if (color.toolTipElement) {
			color.toolTipElement.style.color = color.toRgbaString();
		}
		return color;
	} // }}}

	color.init();

	return color;

}
