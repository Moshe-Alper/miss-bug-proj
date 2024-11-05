import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'
import EventEmitter from 'node:events'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
const app = express()

const eventBus = new EventEmitter()

// Express Config
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

// TAILWIND

app.get('/api/bug', (req, res) => {
    const filterBy = {
        txt: req.query.txt || '',
        severity: req.query.severity || 0, //SEVERITY
        labels: Array.isArray(req.query.labels) ? req.query.labels : [],
        pageIdx: req.query.pageIdx
    }
    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get bugs:', err)
            res.status(500).send('Cannot get bugs')
        })
})

app.post('/api/bug', (req, res) => {

    const bugToSave = req.body

    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot add bug:', err)
            res.status(500).send('Cannot add bug')
        })
})

app.put('/api/bug/:bugId', (req, res) => {
    const bugToSave = req.body

    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot update bug:', err)
            res.status(500).send('Cannot update bug')
        })
})

app.get('/api/bug/:bugId', trackVisitedBugs, (req, res) => {
    const { bugId } = req.params

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error('Cannot get bug:', err)
            res.status(500).send('Cannot get bug')
        })
})

app.delete('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => res.send(bugId + ' Removed Successfully!'))
        .catch(err => {
            loggerService.error('Cannot remove bug', err)
            res.status(500).send('Cannot remove bug')
        })
})

// Get a pdf file
app.get('/pdf', (req, res) => {
    const path = './pdfs/test.pdf'
    bugService.generatePdfStream().then(() => {
        console.log('PDF ready')
    })
    // res.download(path, 'modPdf.pdf')

    res.send('Downloading Pdf')
})
// Log in browser (temporary - will not be used later)
app.get('/api/logs', (req, res) => {
    const path = process.cwd()
    res.sendFile(path + '/logs/backend.log')
})

// visit limit event
eventBus.on('userExceededBugLimit', (visitedBugs) => {
    loggerService.error(`User reached visited bugs limit: ${visitedBugs}`)
})

function trackVisitedBugs(req, res, next) {
    const { bugId } = req.params
    let visitedBugs = req.cookies.visitedBugs || []

    console.log('Visited Bugs:', visitedBugs)

    if (!visitedBugs.includes(bugId)) {
        visitedBugs.push(bugId)
    }

    if (visitedBugs.length > 3) {
        eventBus.emit('userExceededBugLimit', visitedBugs)
        return res.status(401).send('Wait for a bit')
    }

    res.cookie('visitedBugs', visitedBugs, { maxAge: 7000 })
    res.cookie('lastVisitedBugId', bugId, { maxAge: 7000 })

    next()
}

app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = 3030
app.listen(port, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
)

// setTimeout(() => {
//     eventBus.emit('say_hello', ['12345'])
// }, 2000)

// app.use((req, res, next) => {
//     // console.log('Time:', Date.now())
//     console.log('req:', req.host)
//     console.log('req:', req.hostname)
//     console.log('req:', req.headers)
//     next()
// })