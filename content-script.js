function getImages() {
	const imgs = Array.from(document.images);
	return imgs.map(img => ({
		src: img.src,
		width: img.naturalWidth,
		height: img.naturalHeight,
		alt: img.alt || '',
		type: img.src.split('.').pop().split('?')[0].toLowerCase() // FIXME: Read byte signatures for better type detection
	}));
}

// Send images data to extension popup via message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "getImages") {
		sendResponse(getImages());
	}
});