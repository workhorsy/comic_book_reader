// Copyright (c) 2017 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under AGPL v3 or later
// http://github.com/workhorsy/comic_book_reader
"use strict";


let g_lang = (window.navigator.userLanguage || window.navigator.language).split('-')[0].trim();
const g_lang_default = 'en';


function translateElementLanguages() {
	const all = document.querySelectorAll("*[translatable=true]");
	for (let i=0; i<all.length; ++i) {
		let element = all[i];
		const original = element.innerHTML;
		const translated = L(original);
		if (original !== translated) {
			element.innerHTML = translated;
		}
	}
}

function L(original) {
	const curr_lang = g_lang || g_lang_default;
	const trimmed = original.trim();

	// English -> Translated
	if (g_i18n_storage.hasOwnProperty(trimmed) && g_i18n_storage[trimmed].hasOwnProperty(curr_lang)) {
		return g_i18n_storage[trimmed][curr_lang];
	}

	// Translated -> Translated
	let keys = Object.keys(g_i18n_storage);
	for (let i=0; i<keys.length; ++i) {
		let key = keys[i];
		let langs = Object.keys(g_i18n_storage[key]);
		for (let j=0; j<langs.length; ++j) {
			let lang = langs[j];
			if (g_i18n_storage[key][lang] === trimmed) {
				if (g_i18n_storage[key].hasOwnProperty(curr_lang)) {
					return g_i18n_storage[key][curr_lang];
				}
			}
		}
	}

	// Translated -> English
	keys = Object.keys(g_i18n_storage);
	for (let i=0; i<keys.length; ++i) {
		let key = keys[i];
		let langs = Object.keys(g_i18n_storage[key]);
		for (let j=0; j<langs.length; ++j) {
			let lang = langs[j];
			if (g_i18n_storage[key][lang] === trimmed) {
				return key;
			}
		}
	}

	// Otherwise return the original
	return original;
}
