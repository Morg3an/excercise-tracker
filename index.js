const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



{/* Project solution starts here */}
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let users = [];
let exercises = [];

// POST /api/users to create a new user
app.post('/api/users', (req, res) => {
    const username = req.body.username;
    const newUser = { username, _id: uuidv4() };
    users.push(newUser);
    res.json(newUser);
});

// GET /api/users to get a list of all users
app.get('/api/users', (req, res) => {
    res.json(users);
});

// POST /api/users/:_id/exercises to add an exercise to a user
app.post('/api/users/:_id/exercises', (req, res) => {
    const userId = req.params._id;
    const { description, duration, date } = req.body;

    const user = users.find(u => u._id === userId);
    if (!user) {
        return res.json({ error: 'User not found' });
    }

    const exerciseDate = date ? new Date(date) : new Date();
    if (isNaN(exerciseDate)) {
        return res.json({ error: 'Invalid date' });
    }

    const newExercise = {
        _id: uuidv4(),
        userId,
        description,
        duration: parseInt(duration),
        date: exerciseDate.toDateString()
    };

    exercises.push(newExercise);

    res.json({
        username: user.username,
        description: newExercise.description,
        duration: newExercise.duration,
        date: newExercise.date,
        _id: user._id
    });
});

// GET /api/users/:_id/logs to get a user's exercise log
app.get('/api/users/:_id/logs', (req, res) => {
    const userId = req.params._id;
    const user = users.find(u => u._id === userId);
    if (!user) {
        return res.json({ error: 'User not found' });
    }

    let userExercises = exercises.filter(e => e.userId === userId);

    // Filter by date if from and/or to parameters are provided
    if (req.query.from) {
        const fromDate = new Date(req.query.from);
        if (!isNaN(fromDate)) {
            userExercises = userExercises.filter(e => new Date(e.date) >= fromDate);
        }
    }

    if (req.query.to) {
        const toDate = new Date(req.query.to);
        if (!isNaN(toDate)) {
            userExercises = userExercises.filter(e => new Date(e.date) <= toDate);
        }
    }

    // Limit the number of results if the limit parameter is provided
    if (req.query.limit) {
        const limit = parseInt(req.query.limit);
        if (!isNaN(limit) && limit > 0) {
            userExercises = userExercises.slice(0, limit);
        }
    }

    const log = userExercises.map(e => ({
        description: e.description,
        duration: e.duration,
        date: e.date
    }));

    res.json({
        username: user.username,
        _id: user._id,
        count: log.length,
        log
    });
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
