const { useState, useEffect } = React
const { useParams, useNavigate } = ReactRouterDOM

import { userService } from "../services/user.service.js"
import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugList } from '../cmps/BugList.jsx'

export function UserDetails() {
    const [bugs, setBugs] = useState([])
    const [user, setUser] = useState(null)
    const params = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        loadUser()
    }, [params.userId])

    useEffect(() => {
        if (user && user._id) {
            loadUserBugs()
        }
    }, [user])

    function loadUser() {
        userService.getById(params.userId)
            .then(setUser)
            .catch(err => {
                console.log('err:', err)
                navigate('/')
            })
    }

    function loadUserBugs() {
        bugService.query({ userId: user._id }).then(res => {
            const userBugs = res.filter(bug => bug.owner._id === user._id)
            setBugs(userBugs)
        }).catch(err => {
            console.log('Error loading user bugs:', err)
            showErrorMsg('Failed to load bugs')
        })
    }

    function onBack() {
        navigate('/')
    }

    function onRemoveBug(bugId) {
        bugService
            .remove(bugId)
            .then(() => {
                console.log('Deleted Successfully!')
                const bugsToUpdate = bugs.filter((bug) => bug._id !== bugId)
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug removed')
            })
            .catch((err) => {
                console.log('Error from onRemoveBug ->', err)
                showErrorMsg('Cannot remove bug')
            })
    }

    function onAddBug() {
        const bug = {
            title: prompt('Bug title?'),
            severity: +prompt('Bug severity?'),
            description: prompt('Add description'),
            labels: getLabels(),
        }
        bugService
            .save(bug)
            .then((savedBug) => {
                console.log('Added Bug', savedBug)
                setBugs([...bugs, savedBug])
                loadBugs()
                showSuccessMsg('Bug added')
            })
            .catch((err) => {
                console.log('Error from onAddBug ->', err)
                showErrorMsg('Cannot add bug')
            })
    }

    function onEditBug(bug) {
        const title = prompt('New Title?', bug.title)
        const severity = +prompt('New severity?', bug.severity)
        const bugToSave = { ...bug, title, severity }
        bugService
            .save(bugToSave)
            .then((savedBug) => {
                console.log('Updated Bug:', savedBug)
                const bugsToUpdate = bugs.map((currBug) =>
                    currBug._id === savedBug._id ? savedBug : currBug
                )
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug updated')
            })
            .catch((err) => {
                console.log('Error from onEditBug ->', err)
                showErrorMsg('Cannot update bug')
            })
    }

    if (!user) return <div>Loading...</div>

    return <section className="user-details">
        <h1>User {user.fullname}</h1>
        {/* <pre>
            {JSON.stringify(user, null, 2)}
        </pre> */}
        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Enim rem accusantium, itaque ut voluptates quo? Vitae animi maiores nisi, assumenda molestias odit provident quaerat accusamus, reprehenderit impedit, possimus est ad?</p>
        {!bugs || (!bugs.length && <h2>No bugs to show</h2>)}
        {bugs && bugs.length > 0 && <h3>Manage your bugs</h3>}
        <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
        <button onClick={onBack} >Back</button>
    </section>
}