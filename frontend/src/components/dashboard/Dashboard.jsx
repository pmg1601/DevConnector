import React, { Fragment, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { deleteAccount, getCurrentProfile } from '../../actions/profile'
import DashboardActions from './DashboardActions'
import Experience from './Experience'
import Education from './Education'
import Spinner from '../layout/Spinner'

/* -------------------------------------------------------------------------- */

const Dashboard = ({
    getCurrentProfile,
    deleteAccount,
    auth: { user },
    profile: { profile, loading }
}) => {
    useEffect(() => {
        getCurrentProfile()
    }, [getCurrentProfile])

    // Show profile is exists else make them complete their profile
    return loading && profile === null ? (
        <Spinner />
    ) : (
        <Fragment>
            <h1 className='large text-primary'>Dashboard</h1>

            <p className='lead'>
                <i className='fas fa-user'> Welcome, {user && user.name}</i>
            </p>
            {profile !== null ? (
                <Fragment>
                    <DashboardActions />
                    <Experience experience={profile.experience} />
                    <Education education={profile.education} />
                </Fragment>
            ) : (
                <Fragment>
                    <p>
                        You have not setup a profile yet! Please add some info!
                    </p>
                    <Link to='/create-profile' className='btn btn-primary my-1'>
                        Create Profile
                    </Link>
                </Fragment>
            )}
            <div className='my-2'>
                <button
                    className='btn btn-danger'
                    onClick={() => deleteAccount()}>
                    <i className='fas fa-user-minus'> </i> Delete My Account
                </button>
            </div>
        </Fragment>
    )
}

Dashboard.propTypes = {
    getCurrentProfile: PropTypes.func.isRequired,
    deleteAccount: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    profile: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    profile: state.profile
})

export default connect(mapStateToProps, { getCurrentProfile, deleteAccount })(
    Dashboard
)
