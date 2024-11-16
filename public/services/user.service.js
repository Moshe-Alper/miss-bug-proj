const STORAGE_KEY_LOGGEDIN_USER = 'loggedInUser'
const BASE_URL = '/api/user/'

export const userService = {
    query,
    login,
    signup,
    logout,
    getLoggedinUser,

    getById,
    getEmptyCredentials
}

function query() {
    return axios.get('/api/user').then(res => res.data)
  }

function login({ username, password }) {
    return axios.post('/api/auth/login', { username, password })
        .then(res => res.data)
        .then(user => {
            _setLoggedinUser(user)
            return user
        })
}

function signup({ username, password, fullname }) {
    return axios.post('/api/auth/signup', { username, password, fullname })
        .then(res => res.data)
        .then(user => {
            _setLoggedinUser(user)
            return user
        })
}

function logout() {
    return axios.post('/api/auth/logout')
        .then(() => {
            sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN_USER)
        })
}

function getLoggedinUser() {
    return _getUserFromSession()
}

function _getUserFromSession() {
  const entity = sessionStorage.getItem(STORAGE_KEY_LOGGEDIN_USER)
  return JSON.parse(entity)
}

function getById(userId) {
    return axios.get(BASE_URL + userId)
        .then(res => res.data)
}

function getEmptyCredentials() {
    return {
        username: '',
        password: '',
        fullname: ''
    }
}

function _setLoggedinUser(user) {
    const userToSave = { _id: user._id, fullname: user.fullname, isAdmin: user.isAdmin }
    sessionStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(userToSave))
    return userToSave
}
