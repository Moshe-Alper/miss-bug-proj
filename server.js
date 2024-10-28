import express from 'express'
import { utilService } from './services/util.service.js'

const bugs = utilService.readJsonFile('data/bugs.json')
console.log('bugs:', bugs)

const app = express()
app.get('/api/bug', (req, res) => {
    res.send(bugs)
})


app.listen(3030, () => console.log('Server ready at port 3030'))