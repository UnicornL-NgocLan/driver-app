import { combineReducers} from '@reduxjs/toolkit';
import authReducer from './authReducer'
import companyReducer from './companyReducer'
import driverReducer from './driverReducer'

const combinedReducer = combineReducers({
    auth: authReducer,
    companies:companyReducer,
    drivers:driverReducer
});

export const rootReducer = (state: Partial<{ auth: null | undefined; }> | undefined, action: any) => {
    if (action.type === "logout") {
       state = {};
    }
    return combinedReducer(state, action);
};