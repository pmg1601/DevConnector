import React from 'react'
import PropTypes from 'prop-types'
import Moment from 'react-moment'
import { connect } from 'react-redux'

const Education = ({ education }) => {
    const educations = education.map((edu) => (
        <tr key={edu._id}>
            <td>{edu.school}</td>
            <td className='hide-sm'>{edu.degree}</td>
            <td>
                <Moment format='YYYY/MM'>{edu.from}</Moment> -{' '}
                {edu.to === null ? (
                    ' Now'
                ) : (
                    <Moment format='YYYY/MM'>{edu.to}</Moment>
                )}
            </td>

            <td>
                <button className='btn btn-danger'>Delete</button>
            </td>
        </tr>
    ))

    return (
        <div>
            <h2 className='my-2'>Education</h2>
            <table className='table'>
                <thead>
                    <tr>
                        <th>School</th>
                        <th className='hide-sm'>Degree</th>
                        <th>Years</th>
                        <th />
                    </tr>
                </thead>
                <tbody>{educations}</tbody>
            </table>
        </div>
    )
}

Education.propTypes = {
    education: PropTypes.array.isRequired
}

export default connect()(Education)
