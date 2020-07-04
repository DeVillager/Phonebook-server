require('dotenv').config()
const Person = require('./models/person')
const express = require('express')
const { json } = require('express')
const cors = require('cors');
var morgan = require('morgan');
const bodyParser = require('body-parser')
const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(express.static('build'))
// app.use(express.json())

// Configuring morgan logger
morgan.token('person', function (req, res) {
  return JSON.stringify(req.body)
})
var logger = morgan(':method :url :status :res[content-length] - :response-time ms :person')
app.use(logger)


app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => {
    res.json(people)
  })
})

app.get('/info', (req, res) => {
  Person.find({}).then(people => {
    res.send(`Phonebook has info for ${people.length} people <br/> ${Date()}`)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).send({ error: 'wrong id' })
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(person => {
      if (person) {
        res.status(204).end()
      } else {
        res.status(404).send({ error: 'wrong id for delete' })
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const person = {
    name: body.name,
    number: body.number,
  }
  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      // response.status(100).end()
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

//recusive function to find unused id
const generateId = () => {
  let id = Math.ceil(Math.random() * 100)
  if (persons.map(p => p.id).includes(id)) {
    id = generateId()
  }
  return id
}

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  console.log(JSON.stringify(body))
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number missing'
    })
  }
  const person = new Person({
    name: body.name,
    number: body.number,
    date: new Date(),
    // id: generateId(),
  })
  person
    .save()
    .then(savedPerson => savedPerson.toJSON())
    .then(savedAndFormattedPerson => {
      res.json(savedAndFormattedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})