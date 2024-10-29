import express from 'express'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import cookieParser from 'cookie-parser'
import EventEmitter from 'node:events'
const app = express()
app.use(cookieParser())

app.use(express.static('public'))


app.get('/api/bug', (req, res) => {
    bugService.query()
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get bugs:', err)
            res.status(500).send('Cannot get bugs')
        })
})

app.get('/api/bug/save', (req, res) => {
    const bugToSave = {
        _id: req.query._id,
        title: req.query.title,
        description: req.query.description,
        severity: +req.query.severity,
        createdAt: req.query.createdAt || Date.now(),
    }
    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot save bug:', err)
            res.status(500).send('Cannot save bug')
        })
})

app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params

    let visitedBugs = req.cookies.visitedBugs ? JSON.parse(req.cookies.visitedBugs) : []
    console.log('Visited Bug:', visitedBugs)

    if (!visitedBugs.includes(bugId)) {
        visitedBugs.push(bugId)
    }

    if (visitedBugs.length > 3) {
        loggerService.error(`User reached visited bugs limit: ${visitedBugs}`)
        return res.status(401).send('Wait for a bit')
    }

    res.cookie('visitedBugs', JSON.stringify(visitedBugs), { maxAge: 7000 })
    res.cookie('lastVisitedBugId', bugId, { maxAge: 7000 })

    console.log('User visited at the following bugs:', visitedBugs)

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

// Log in browser (temporary - will not be used later)
app.get('/api/logs', (req, res) => {
    const path = process.cwd()
    res.sendFile(path + '/logs/backend.log')
})


// const eventBus = new EventEmitter()
// eventBus.on('say_hello', (data) => {
//     console.log('started', data)

//   })

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