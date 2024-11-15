
import { utilService } from './util.service.js'
import EventEmitter from 'node:events'
import PDFDocument from 'pdfkit-table'
import fs from 'fs'

const PAGE_SIZE = 5

const bugs = utilService.readJsonFile('data/bugs.json')


export const bugService = {
    query,
    getById,
    remove,
    save,
}

function query(filterBy = {}) {
    let filteredBugs = bugs
    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        filteredBugs = filteredBugs.filter((bug) => regExp.test(bug.title))
    }
    if (filterBy.severity) {
        filteredBugs = filteredBugs.filter((bug) => bug.severity >= filterBy.severity)
    }

    if (filterBy.labels) {
        filteredBugs = filteredBugs.filter(bug =>
            filterBy.labels.every(label => bug.labels.includes(label))
        )
    }

     // Sorting
    //  TODO getEmptyFilter - in front
     const sortBy = filterBy.sortBy || {}
     const { type, desc = 1 } = sortBy
     if (type === 'title') {
        filteredBugs.sort((b1, b2) => desc * (b1.title.localeCompare(b2.title)))
    }
    if (type === 'createdAt') {
        filteredBugs.sort((b1, b2) => desc * (b1.createdAt - b2.createdAt))
    }
    if (type === 'severity') {
        filteredBugs.sort((b1, b2) => desc * (b1.severity - b2.severity))
    }
 
    // Pagination
    if (filterBy.pageIdx !== undefined) {
        const startIdx = filterBy.pageIdx * PAGE_SIZE
        filteredBugs = filteredBugs.slice(startIdx, startIdx + PAGE_SIZE)
    }

    getNextBug(filteredBugs)

    return Promise.resolve(filteredBugs)
}

function getNextBug(bugs) {
    bugs.forEach((bug, idx) => {
        bug.prevId = bugs[idx - 1] ? bugs[idx - 1]._id : bugs[bugs.length - 1]._id
        bug.nextId = bugs[idx + 1] ? bugs[idx + 1]._id : bugs[0]._id
    })
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject('Cannot find bug - ' + bugId)
    return Promise.resolve(bug)
}

function remove(bugId, user) {
    console.log('user:', user)
    const bugIdx = bugs.findIndex(bug => bug._id === bugId)

    if (bugIdx < 0) return Promise.reject('Cannot find bug - ' + bugId)
    if (!user.isAdmin && bugs[bugIdx].owner._id !== user._id) return Promise.reject('Not your bug')

    bugs.splice(bugIdx, 1)
    return _saveBugsToFile()
}

function save(bugToSave, user) {
    const allowedKeys = ["title", "description", "severity", "createdAt", "labels", "owner"]

    const filteredBug = allowedKeys.reduce((acc, key) => {
        if (key in bugToSave) acc[key] = bugToSave[key]
        return acc
    }, {})

    // Validate required fields
    if (typeof filteredBug.title !== 'string') throw new Error('Title must be a string')
    if (typeof filteredBug.description !== 'string') throw new Error('Description must be a string')
    if (typeof filteredBug.severity !== 'number') throw new Error('Severity must be a number')
    
    if (!Array.isArray(filteredBug.labels)) {
        filteredBug.labels = filteredBug.labels === undefined ? [] : (() => { throw new Error('Labels must be an array') })()
    }

    // Update existing bug
    if (bugToSave._id) {
        if (!user.isAdmin && bugToSave.owner._id !== user._id) {
            return Promise.reject('Not your bug')
        }

        const bugIdx = bugs.findIndex(bug => bug._id === bugToSave._id)
        filteredBug._id = bugToSave._id
        filteredBug.updatedAt = Date.now()
        bugs[bugIdx] = { ...bugs[bugIdx], ...filteredBug }
    } 
    // Create new bug
    else {
        const newBug = {
            ...getEmptyBug(),
            ...filteredBug,
            _id: utilService.makeId(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            owner: user
        }
        bugs.unshift(newBug)
        return _saveBugsToFile().then(() => newBug)
    }

    return _saveBugsToFile().then(() => filteredBug)
}


function _saveBugsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 4)
        fs.writeFile('data/bugs.json', data, (err) => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    })
}

function getEmptyBug() {
    return {
        title: "",
        description: "",
        severity: 0,
        labels: [],
        _id: "",
        createdAt: null,
        updatedAt: null,
        owner: null
    }
}
