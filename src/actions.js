
export function addComic(text) {
	return {
		type: 'ADD_COMIC',
		text
	};
}

export function removeComic(comic) {
	return {
		type: 'REMOVE_COMIC',
		comic
	};
}
