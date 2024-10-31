
import { storageService } from './async-storage.service.js'
import { utilService } from './util.service.js'
import EventEmitter from 'node:events'
import fs from 'fs'

// const STORAGE_KEY = 'bugDB'
// _createBugs()
const bugs = utilService.readJsonFile('data/bugs.json')


export const bugService = {
    query,
    getById,
    remove,
    save,
}

function query() {
    return Promise.resolve(bugs)

}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject('Cannot find bug - ' + bugId)
        return Promise.resolve(bug)
}

function remove(bugId) {
    const bugIdx = bugs.findIndex(bug => bug._id === bugId)
    if (bugIdx < 0) return Promise.reject('Cannot find bug - ' + bugId)
        bugs.splice(bugIdx, 1)
    return _saveBugsToFile()
}

function save(bugToSave) {
    if (bugToSave._id) {
        const bugIdx = bugs.findIndex(bug => bug._id === bugToSave._id)
        bugToSave = {...bugs[bugIdx], ...bugToSave, updatedAt: Date.now()}
        bugs[bugIdx] = bugToSave
    } else {
        bugToSave._id = utilService.makeId()
        bugToSave.createdAt = Date.now()
        bugs.unshift(bugToSave)
    }
    return _saveBugsToFile().then(() => bugToSave)
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


function _createBugs() {
    let bugs = utilService.loadFromStorage(STORAGE_KEY)
    if (!bugs || !bugs.length) {
        bugs = [
            {
                title: "Infinite Loop Detected",
                severity: 4,
                _id: "1NF1N1T3"
            },
            {
                title: "Keyboard Not Found",
                severity: 3,
                _id: "K3YB0RD"
            },
            {
                title: "404 Coffee Not Found",
                severity: 2,
                _id: "C0FF33"
            },
            {
                title: "Unexpected Response",
                severity: 1,
                _id: "G0053"
            }
        ]
        utilService.saveToStorage(STORAGE_KEY, bugs)
    }
    
    // const eventBus = new EventEmitter()
    // setTimeout(() => {
    //     eventBus.emit('say_hello', ['12345'])
    // }, 2000)
    
    
    
}
