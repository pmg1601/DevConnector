import {
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    USER_LOADED,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
    DELETE_ACCOUNT
} from '../actions/type'

/* -------------------------------------------------------------------------- */

// Initial State
const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null
}

// Auth Actions
export default function auth(state = initialState, action) {
    const { type, payload } = action

    switch (type) {
        // When user is loaded
        case USER_LOADED:
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: payload
            }

        // 1. When registration is successful
        // 2. When Log in is successful
        case REGISTER_SUCCESS:
        case LOGIN_SUCCESS:
            localStorage.setItem('token', payload.token)
            return {
                ...state,
                ...payload,
                isAuthenticated: true,
                loading: false
            }

        // 1. When resistration fails
        // 2. Log in fails
        // 3. Logout user
        // 4. There is error while authorization
        // 5. Delete account
        case REGISTER_FAIL:
        case LOGIN_FAIL:
        case LOGOUT:
        case AUTH_ERROR:
        case DELETE_ACCOUNT:
            localStorage.removeItem('token')
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false
            }

        default:
            return state
    }
}
