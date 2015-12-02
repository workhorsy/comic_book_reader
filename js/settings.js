// Copyright (c) 2015 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under GPL v3 or later
// http://github.com/workhorsy/comic_book_reader


function settings_delete_all() {
	localStorage.removeItem('right_click_enabled');
	localStorage.removeItem('db_names');
}

function settings_set(name, value) {
	localStorage.setItem(name, JSON.stringify(value));
}

function settings_get(name, default_value) {
	var value = localStorage.getItem(name);
	if (value) {
		return JSON.parse(value);
	} else {
		return default_value;
	}
}

function settings_get_right_click_enabled() {
	return settings_get('right_click_enabled', false);
}

function settings_set_right_click_enabled(value) {
	settings_set('right_click_enabled', value);
}

function settings_get_db_names() {
	return settings_get('db_names', []);
}

function settings_set_db_names(value) {
	settings_set('db_names', value);
}
