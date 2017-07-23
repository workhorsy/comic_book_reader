import { createStore } from 'redux';

let ACTIONS = {
	ADD_COMIC: ({ comics, ...state }, { text }) => ({
		comics: [...comics, {
			id: Math.random().toString(36).substring(2),
			text
		}],
		...state
	}),

	REMOVE_COMIC: ({ comics, ...state }, { comic }) => ({
		comics: comics.filter( i => i!==comic ),
		...state
	})
};

const INITIAL = {
	comics: []
};

export default createStore( (state, action) => (
	action && ACTIONS[action.type] ? ACTIONS[action.type](state, action) : state
), INITIAL, window.devToolsExtension && window.devToolsExtension());
