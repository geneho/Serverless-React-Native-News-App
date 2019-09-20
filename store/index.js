//The Redux store is used to store the current state for our app
import { createStore } from 'redux';
import rootReducer from '../reducers';

export default store = createStore(rootReducer);