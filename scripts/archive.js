const moveButtons = document.createElement("div");
				moveButtons.classList.add("layer-move-buttons");
				moveButtons.className = "layer-move-buttons";

				const moveUpButton = document.createElement("div");
				moveUpButton.classList.add("button");
				moveUpButton.classList.add("mini-button");
				moveUpButton.classList.add("layer-move-button");
				moveUpButton.innerHTML = `<img src="icons/solid/arrow-up.svg" alt="move up">`;
				moveUpButton.addEventListener("click", () => {
					layers.moveUp({layer}).save().refreshController().refreshEasel();
				});
				moveUpButton.addEventListener("mouseenter", () => {
					layers.infoTipElement.innerHTML = 'Move layer up.';
				});
				moveUpButton.addEventListener("mouseleave", () => {
					layers.infoTipElement.innerHTML = 'mixx.';
				});

				moveButtons.appendChild(moveUpButton);

				const moveDownButton = document.createElement("div");
				moveDownButton.classList.add("button");
				moveDownButton.classList.add("mini-button");
				moveDownButton.classList.add("layer-move-button");
				moveDownButton.innerHTML = `<img src="icons/solid/arrow-down.svg" alt="move down">`;
				moveDownButton.addEventListener("click", () => {
					layers.moveDown({layer}).save().refreshController().refreshEasel();
				});
				moveDownButton.addEventListener("mouseenter", () => {
					layers.infoTipElement.innerHTML = 'Move layer down.';
				});
				moveDownButton.addEventListener("mouseleave", () => {
					layers.infoTipElement.innerHTML = 'mixx.';
				});

				moveButtons.appendChild(moveDownButton);

				layersElement.appendChild(moveButtons);

				const mergeButtons = document.createElement("div");
				mergeButtons.classList.add("layer-merge-buttons");
				mergeButtons.className = "layer-merge-buttons";

				const mergeDownButton = document.createElement("div");
				mergeDownButton.classList.add("button");
				mergeDownButton.classList.add("mini-button");
				mergeDownButton.classList.add("layer-merge-button");
				mergeDownButton.innerHTML = `<img src="icons/solid/angles-down.svg" alt="merge up">`;
				mergeDownButton.addEventListener("click", () => {
					layers.mergeDown({layer}).save().refresh();
				});
				mergeDownButton.addEventListener("mouseenter", () => {
					layers.infoTipElement.innerHTML = 'Merge down.';
				});
				mergeDownButton.addEventListener("mouseleave", () => {
					layers.infoTipElement.innerHTML = 'mixx.';
				});

				mergeButtons.appendChild(mergeDownButton);

				const duplicateButton = document.createElement("div");
				duplicateButton.classList.add("button");
				duplicateButton.classList.add("mini-button");
				duplicateButton.classList.add("layer-duplicate-button");
				duplicateButton.innerHTML = `<img src="icons/solid/clone.svg" alt="duplicate">`;
				duplicateButton.addEventListener("click", () => {
					layers.duplicate({layer}).save().refresh();
				});
				duplicateButton.addEventListener("mouseenter", () => {
					layers.infoTipElement.innerHTML = 'Duplicate layer.';
				});
				duplicateButton.addEventListener("mouseleave", () => {
					layers.infoTipElement.innerHTML = 'mixx.';
				});

				mergeButtons.appendChild(duplicateButton);

				const deleteButton = document.createElement("div");
				deleteButton.classList.add("button");
				deleteButton.classList.add("mini-button");
				deleteButton.classList.add("layer-delete-button");
				deleteButton.innerHTML = `<img src="icons/regular/trash-can.svg" alt="delete">`;
				deleteButton.addEventListener("click", () => {
					layers.remove({layer}).save().refreshController().refreshEasel();
				});
				deleteButton.addEventListener("mouseenter", () => {
					layers.infoTipElement.innerHTML = 'Delete layer.';
				});
				deleteButton.addEventListener("mouseleave", () => {
					layers.infoTipElement.innerHTML = 'mixx.';
				});

				mergeButtons.appendChild(deleteButton);

				layersElement.appendChild(mergeButtons);
			}

		const addLayerButton = document.createElement("div");
		addLayerButton.classList.add("layer-add-button");
		addLayerButton.classList.add("button");
		addLayerButton.innerHTML = `<img src="icons/solid/plus.svg" alt="add layer">`;
		addLayerButton.addEventListener("click", () => {
			layers.add().save().refresh();
		});
		addLayerButton.addEventListener("mouseenter", () => {
			layers.infoTipElement.innerHTML = 'Add a new layer.';
		});
		addLayerButton.addEventListener("mouseleave", () => {
			layers.infoTipElement.innerHTML = 'mixx.';
		});

		layers.layersElement.appendChild(addLayerButton)

