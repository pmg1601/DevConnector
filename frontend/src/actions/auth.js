import axios from 'axios'

import { setAlert } from './alert'
import { REGISTER_SUCCESS, REGISTER_FAIL } from './type'

/* -------------------------------------------------------------------------- */

// Register User
export const register =
    ({ name, email, password }) =>
    async (dispatch) => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        const body = JSON.stringify({ name, email, password })

        try {
            const res = await axios.post('/api/users', body, config)

            dispatch({
                type: REGISTER_SUCCESS,
                payload: res.data
            })
        } catch (err) {
            const errs = err.response.data.errors

            if (errs) {
                errs.forEach((err) => dispatch(setAlert(err.msg, 'danger')))
            }
            dispatch({
                type: REGISTER_FAIL
            })
        }
    }
