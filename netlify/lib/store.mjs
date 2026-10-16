import {getStore} from '@netlify/blobs';
export function dataStore(){return getStore({name:'atelie-am-data',consistency:'strong'})}
export function sessionStore(){return getStore({name:'atelie-am-sessions',consistency:'strong'})}
