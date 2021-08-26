import axios from 'axios'
import { setAlert } from './alert'
import {
    ADD_POST,
    DELETE_POST,
    GET_POSTS,
    POST_ERROR,
    UPDATE_LIKES
} from './type'

/* -------------------------------- Get posts ------------------------------- */
export const getPosts = () => async (dispatch) => {
    try {
        const res = await axios.get('/api/post')

        dispatch({
            type: GET_POSTS,
            payload: res.data
        })
    } catch (err) {
        dispatch({
            type: POST_ERROR,
            payload: {
                msg: err.response.statusText,
                status: err.response.status
            }
        })
    }
}

/* -------------------------------- Add Like ------------------------------- */
export const addLike = (postId) => async (dispatch) => {
    try {
        const res = await axios.put(`/api/post/like/${postId}`)

        dispatch({
            type: UPDATE_LIKES,
            payload: { postId, likes: res.data }
        })
    } catch (err) {
        dispatch({
            type: POST_ERROR,
            payload: {
                msg: err.response.statusText,
                status: err.response.status
            }
        })
    }
}

/* -------------------------------- Remove Like ------------------------------- */
export const removeLike = (postId) => async (dispatch) => {
    try {
        const res = await axios.put(`/api/post/unlike/${postId}`)

        dispatch({
            type: UPDATE_LIKES,
            payload: { postId, likes: res.data }
        })
    } catch (err) {
        dispatch({
            type: POST_ERROR,
            payload: {
                msg: err.response.statusText,
                status: err.response.status
            }
        })
    }
}

/* -------------------------------- Delete Post ------------------------------- */
export const deletePost = (id) => async (dispatch) => {
    try {
        await axios.delete(`/api/post/${id}`)

        dispatch({
            type: DELETE_POST,
            payload: id
        })

        dispatch(setAlert('Post Removed!', 'success'))
    } catch (err) {
        dispatch({
            type: POST_ERROR,
            payload: {
                msg: err.response.statusText,
                status: err.response.status
            }
        })
    }
}

/* -------------------------------- Add Post ------------------------------- */
export const addPost = (formData) => async (dispatch) => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    try {
        const res = await axios.post(`/api/post`, formData, config)

        dispatch({
            type: ADD_POST,
            payload: res.data
        })

        dispatch(setAlert('Post Created!', 'success'))
    } catch (err) {
        console.log('This is error too much!', err)
        dispatch({
            type: POST_ERROR,
            payload: {
                msg: err.response.statusText,
                status: err.response.status
            }
        })
    }
}
