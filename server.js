import express from 'express'
import cookieParser from 'cookie-parser'
import EventEmitter from 'node:events'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
const app = express()
app.use(cookieParser())

const eventBus = new EventEmitter()
app.use(express.static('public'))



app.get('/api/bug', (req, res) => {
    const filterBy = {
        txt: req.query.txt || '',
        minSeverity: req.query.minSeverity || 0
    }
    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get bugs:', err)
            res.status(500).send('Cannot get bugs')
        })
})

app.get('/api/bug/save', (req, res) => {
    const bugToSave = {
        _id: req.query._id || '',
        title: req.query.title || '',
        description: req.query.description || '',
        severity: +req.query.severity || 0,
    }
    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot save bug:', err)
            res.status(500).send('Cannot save bug')
        })
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

app.get('/api/bug/:bugId', trackVisitedBugs, (req, res) => {
    const { bugId } = req.params

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error('Cannot get bug:', err)
            res.status(500).send('Cannot get bug')
        })
})

app.get('/api/bug/:bugId/remove', (req, res) => {
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


const port = 3030
app.listen(port, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
)