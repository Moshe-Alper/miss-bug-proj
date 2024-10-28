import express from 'express'
import { bugService } from './services/bug.service.js'

const app = express()


app.get('/api/bug', (req, res) => {
    bugService.query()
        .then(bugs => res.send(bugs))
        .catch(err => {
            console.log('Cannot get bugs:', err)
            res.status(500).send('Cannot get bugs')
        })
})


app.get('/api/bug/:bugId', (req, res) => {
    console.log('req.params:', req.params)
    const { bugId } = req.params
    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            console.log('Cannot get bug:', err)
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

// app.get('/api/bug/save', (req, res) => {})

// import EventEmitter from 'node:events'

// const eventBus = new EventEmitter()
// eventBus.on('say_tal', (data) => {
//     console.log('started', data)

//   })

// setTimeout(() => {
//     eventBus.emit('say_tal', ['12345'])
// }, 2000)

app.use((req, res, next) => {
    // console.log('Time:', Date.now())
    console.log('req:', req.host)
    console.log('req:', req.hostname)
    console.log('req:', req.headers)
    next()
})


const port = 3030
app.listen(port, () =>
    console.log(`Server listening on port http://127.0.0.1:${port}/`)
)