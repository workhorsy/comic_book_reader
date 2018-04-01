export const defaultSettings = {
    'theme': 'dark',
    'is_first_run': true,
    'use_higher_quality_previews': false,
    'use_smoothing_when_resizing_images': false,
    'right_click_enabled': false,
    'db_names': null,
};

export function settingsSet(name, value) {
	localStorage.setItem(name, JSON.stringify(value));
}

export function settingsGet(name) {
	let value = localStorage.getItem(name);
	if (value) {
		return JSON.parse(value);
	} else {
		return defaultSettings[name];
	}
}

export function settingsSetAll() {
    // Set settings to default
    Object.entries(defaultSettings).forEach(([key, value]) => {
        settingsSet(key, value);
    });
}

export function settingsGetAll() {
    // Get all settings from localStorage
    let settings = {};
     Object.entries(defaultSettings).forEach(([key, value]) => {
        settings[key] = settingsGet(key, value);
    });
    // If no previous settings found set to default
    if (!Object.entries(settings).length) {
        settingsSetAll();
        return defaultSettings;
    }
    return settings;
}

export function settingsResetAll() {
    // Clear localStorage and set to default
    localStorage.clear();
    settingsSetAll();
}
