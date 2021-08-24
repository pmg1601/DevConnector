import React, { Fragment, useEffect } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import './App.css'

// Components
import Navbar from './components/layout/Navbar'
import Landing from './components/layout/Landing'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Alert from './components/layout/Alert'
import Dashboard from './components/dashboard/Dashboard'
import PrivateRoute from './components/routing/PrivateRoute'
import CreateProfile from './components/profile-forms/CreateProfile'

// Redux
import { Provider } from 'react-redux'
import store from './store'

// Actions
import { loadUser } from './actions/auth'
import setAuthToken from './utils/setAuthToken'

/* -------------------------------------------------------------------------- */

// Set/unset "x-auth-token" header
if (localStorage.token) {
    setAuthToken(localStorage.token)
}

const App = () => {
    // Load user if present in localStorage at start
    useEffect(() => {
        store.dispatch(loadUser())
    }, [])

    return (
        <Provider store={store}>
            <Router>
                <Fragment>
                    <Navbar />
                    <Route exact path='/' component={Landing} />
                    <section className='container'>
                        <Alert />
                        <Switch>
                            <Route
                                exact
                                path='/register'
                                component={Register}
                            />
                            <Route exact path='/login' component={Login} />
                            <PrivateRoute
                                exact
                                path='/dashboard'
                                component={Dashboard}
                            />
                            <PrivateRoute
                                exact
                                path='/create-profile'
                                component={CreateProfile}
                            />
                        </Switch>
                    </section>
                </Fragment>
            </Router>
        </Provider>
    )
}

export default App
