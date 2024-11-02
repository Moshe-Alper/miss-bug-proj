
const BASE_URL = '/api/bug/'


export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter,
}

function query(filterBy = {}) {
    return axios
        .get(BASE_URL, {params:{...filterBy}})
        .then(res=>res.data)
}

function getById(bugId) {
    return axios.get(BASE_URL + bugId)
        .then(res=>res.data)
}

function remove(bugId) {
    return axios.get(BASE_URL + bugId + '/remove')
        .then(res=>res.data)
}

function save(bug) {
  const url = BASE_URL + 'save'
  let queryParams = `?title=${bug.title}&severity=${bug.severity}&description=${bug.description}`
  if (bug._id) queryParams += `&_id=${bug._id}`
  return axios.get(url + queryParams)
      .then(res => res.data)
      .catch(err => {
        console.log('err:', err)
      })
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0 }
  }
  