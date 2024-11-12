const { Link } = ReactRouterDOM

import { userService } from '../services/user.service.js'

import { BugPreview } from './BugPreview.jsx'

export function BugList({ bugs, onRemoveBug, onEditBug }) {
    const user = userService.getLoggedinUser()

    function isAllowed(bug) {
        if (!user) return false
        if (user.isAdmin) return true
        if (!bug.owner || user._id !== bug.owner._id) return false
        return true
    }

    if (!bugs) return <div>Loading...</div>
    return (
        <ul className="bug-list">
            {bugs.map((bug) => (
                <li className="bug-preview" key={bug._id|| `bug-${index}`}>
                    <BugPreview bug={bug} />
                    {isAllowed(bug) && <div>
                        <button onClick={() => onRemoveBug(bug._id)}>x</button>
                        <button onClick={() => onEditBug(bug)}>Edit</button>
                    </div>}
                    <Link to={`/bug/${bug._id}`}>Details</Link>
                </li>
            ))
            }
        </ul >
    )
}
