import axios from 'axios'

/**
 * If token is present if localStorage, then add it to headers,
 * else if token is null, we delete from the headers.
 */
const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common['x-auth-token'] = token
    } else {
        delete axios.defaults.headers.common['x-auth-token']
    }
}

export default setAuthToken
