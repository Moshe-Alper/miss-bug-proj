const { useState, useEffect } = React
const { useParams } = ReactRouterDOM

import { userService } from "../services/user.service.js"
import { UserList } from '../cmps/UserList.jsx'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'

export function AdminDashboard() {
  const user = userService.getLoggedinUser()
  const [users, setUsers] = useState([])

  useEffect(() => {
    userService.query().then(setUsers)
  }, [])

  function onRemoveUser(userId) {
    userService
      .remove(userId)
      .then(() => {
        const usersToUpdate = users.filter(u => u._id !== userId)
        setUsers(usersToUpdate)
        showSuccessMsg('Removed successfully')
      })
      .catch(err => {
        // console.log('here is the msg from the server', err?.response?.data)
        console.log('err', err)
        showErrorMsg('Had issues removing the user')
      })
  }
  
  if (!user || !user.isAdmin) return <div>You are not allowed in this page</div>
  return (
    <section className="admin-dashboard main-layout">
      <h1>Hello, {user.fullname}</h1>
      <h3>User Managment</h3>
      <UserList users={users} onRemoveUser={onRemoveUser} />
    </section>
  )
}
