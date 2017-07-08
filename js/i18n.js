// Copyright (c) 2017 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under AGPL v3 or later
// http://github.com/workhorsy/comic_book_reader
"use strict";


const g_lang = (window.navigator.userLanguage || window.navigator.language).split('-')[0].trim();

let g_i18n_storage = {};
const importString = function(lang, key, value) {
	g_i18n_storage[lang] = g_i18n_storage[lang] || {};

	g_i18n_storage[lang][key] = value;
};

function translateElementLanguages() {
	const all = document.querySelectorAll("*");
	const lang = g_lang || 'en';
	all.forEach(function(element) {
		const before = element.innerHTML.trim();
		if (g_i18n_storage.hasOwnProperty(lang) && g_i18n_storage[lang].hasOwnProperty(before)) {
			element.innerHTML = g_i18n_storage[lang][before];
		}
	});
}

function L(string) {
	const before = string.trim();
	const lang = g_lang || 'en';
	if (g_i18n_storage.hasOwnProperty(lang) && g_i18n_storage[lang].hasOwnProperty(before)) {
		return g_i18n_storage[lang][before];
	} else {
		return string;
	}
}