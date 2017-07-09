// Copyright (c) 2017 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under AGPL v3 or later
// http://github.com/workhorsy/comic_book_reader
"use strict";


const g_lang = (window.navigator.userLanguage || window.navigator.language).split('-')[0].trim();
const g_lang_default = 'en';


function translateElementLanguages() {
	const all = document.querySelectorAll("*");
	for (let i=0; i<all.length; ++i) {
		let element = all[i];
		const original = element.innerHTML;
		const translated = L(original);
		if (original !== translated) {
			element.innerHTML = translated;
		}
	}
}

function L(string) {
	const lang = g_lang || g_lang_default;
	const key = string.trim();
	if (g_i18n_storage.hasOwnProperty(key) && g_i18n_storage[key].hasOwnProperty(lang)) {
		return g_i18n_storage[key][lang];
	} else {
		return string;
	}
}
