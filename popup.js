const minWidthInput = document.getElementById("minWidth");
const minHeightInput = document.getElementById("minHeight");
const imageList = document.getElementById("imageList");
const downloadBtn = document.getElementById("downloadSelected");
const selectFilter = document.getElementById("selectFilter");

let images = [];

function renderImages(filtered) {
	imageList.innerHTML = '';
	filtered.forEach((img, idx) => {
		const bannerClass = `banner-${img.type}`;

		const div = document.createElement("div");
		div.className = "img-item";
		// FIXME: SVG images show 0x0 for image dimensions
		div.innerHTML = `
			<div class="img-preview">
				<img src="${img.src}" />
				<div class="type-banner ${bannerClass}">${img.type.toUpperCase()}</div>
			</div>
			<div class="img-info">
				<div><strong>${img.alt || "(no alt)"}</strong></div>
				<div>${img.width}×${img.height}</div>
			</div>
			<input type="checkbox" data-idx="${idx}" />
		`;
		imageList.appendChild(div);
	});
}

function filterImages() {
	const minW = parseInt(minWidthInput.value) || 0;
	const minH = parseInt(minHeightInput.value) || 0;
	return images.filter(img => img.width >= minW && img.height >= minH);
}

function applySelection(filter) {
	const checkboxes = imageList.querySelectorAll("input[type=checkbox]");
	checkboxes.forEach(cb => {
		const idx = parseInt(cb.dataset.idx);
		const img = images[idx];
		if (filter === "all") cb.checked = true;
		else if (filter === "none") cb.checked = false;
		else cb.checked = img.type === filter;
	});
}

selectFilter.addEventListener("change", () => {
	applySelection(selectFilter.value);
});

[minWidthInput, minHeightInput].forEach(input => {
	input.addEventListener("input", () => {
		renderImages(filterImages());
	});
});

downloadBtn.onclick = () => {
	const checkboxes = imageList.querySelectorAll("input[type=checkbox]");
	checkboxes.forEach(cb => {
		if (cb.checked) {
			const img = images[parseInt(cb.dataset.idx)];
			chrome.downloads.download({
				url: img.src,
				filename: `img-${Math.floor(Math.random() * 1e6)}.${img.type}`,
				conflictAction: "uniquify"
			});
		}
	});
};

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
	chrome.tabs.sendMessage(tabs[0].id, { action: "getImages" }, response => {
		images = (response || []).map(img => ({
			...img,
			type: img.type || "unknown"
		}));
		renderImages(filterImages());
	});
});