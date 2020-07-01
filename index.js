const express = require('express')
const { json } = require('express')
const cors = require('cors');
var morgan = require('morgan');

// Configuring morgan logger
morgan.token('person', function(req, res) {
  return JSON.stringify(req.body)
})
var logger = 
morgan(':method :url :status :res[content-length] - :response-time ms :person')

const app = express()
app.use(express.json())
app.use(logger)
app.use(cors())


let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  }
]


app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/info', (req, res) => {
  console.log(res)
  res.send(`Phonebook has info for ${persons.length} people \n${new Date()}`)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)
  res.status(204).end()
})

//recusive function to find unused id
const generateId = () => {
  let id = Math.ceil(Math.random() * 100)
  if (persons.map(p => p.id).includes(id)) {
    id = generateId()
  }
  return id
}

app.post('/api/persons', (req, res) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number missing'
    })
  }
  // console.log(body.name.toLowerCase())
  if (persons.map(p => p.name.toLowerCase()).includes(body.name.toLowerCase())) {
    return res.status(409).json({
      error: 'name must be unique'
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(person)
  res.json(person)
})


const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})