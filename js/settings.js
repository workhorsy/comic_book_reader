// Copyright (c) 2015 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under GPL v3 or later
// http://github.com/workhorsy/comic_book_reader
"use strict";

function generate_random_user_id() {
	// Get a 20 character user id
	var code_table = "0123456789";
	var user_id = "";
	for (var i = 0; i < 20; ++i) {
		// Get a random number between 0 and 10
		var num = Math.floor((Math.random() * code_table.length));

		// Get the character that corresponds to the number
		user_id += code_table[num];
	}

	return user_id;
}

function settings_delete_all() {
	localStorage.removeItem('install_updates_enabled');
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

function settings_has(name) {
	var value = localStorage.getItem(name);
	if (value) {
		return true;
	} else {
		return false;
	}
}

function settings_get_install_updates_enabled() {
	return settings_get('install_updates_enabled', true);
}

function settings_set_install_updates_enabled(value) {
	settings_set('install_updates_enabled', value);
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

function settings_get_user_id() {
	return settings_get('user_id', []);
}

function settings_get_user_id() {
	if (! settings_has('user_id')) {
		var user_id = generate_random_user_id();
		settings_set('user_id', user_id);
	}

	return settings_get('user_id');

}
