const { Router } = require('express');
const path = require('path')
const router = Router()
const { userModel, exerciseModel, createAndSave, findItems } = require('../db');


const clearQuery = (query) => {
    let newQuery = {}
    for (const key in query) {
        const newKey = key.replace(/\[/g, '').replace(/\]/g, '');
        let newValue = query[key]

        if (query[key]) {
            newValue = query[key].replace(/\[/g, '').replace(/\]/g, '');
        }

        if (newKey === 'limit') {
            newValue = Number(newValue)
        }
        newQuery[newKey] = newValue;
    }
    return newQuery
}

router.get('/api/users/:_id/logs', async (req, res) => {
    const { _id: _userId } = req.params
    let exerciseError;
    let info = {};

    const urlQuery = clearQuery(req.query);
    let { from, to, limit } = urlQuery;
    if (_userId) {
        await userModel.findById(_userId, (err, user) => {
            if (err) {
                exerciseError = err.message;
            } else {
                if (user == null) {
                    exerciseError = "Error _Id no existente";
                }

                if (!user) {
                    res.status(500).send(exerciseError);
                } else {
                    // Using query builder
                    let query = exerciseModel.find({ _userId: _userId })
                    if (from && to) {
                        query = query.where('date').gte(from).lte(to)
                    }
                    if (limit) {
                        query = query.limit(limit)
                    }
                    query = query.select('description duration date')

                    query.exec((err, data) => {
                        if (err) {
                            console.log(err);
                        } else {
                            const results = data.map(exercise => {

                                let date = new Date(exercise.date);

                                return {
                                    description: exercise.description,
                                    duration: exercise.duration,
                                    date: date.toDateString(),
                                }
                            });


                            info = {
                                _id: user._id,
                                username: user.username,
                                count: results.length,
                                log: results
                            };
                            res.status(200).json(info)
                        }
                    });

                }
            }
        }).catch((err) => {
            exerciseError = err.message;
        });

    } else {
        console.log("Error debe colocar un usuario");
        res.status(304).json({ error: "Error debe colocar un usuario" });
    }

})

router.get('/api/users', async (req, res) => {
    const results = await findItems(userModel, {})
    const data = results.map(user => (
        { username: user.username, _id: user._id }
    ))
    res.status(200).json(data)
})

router.post('/api/users', async (req, res) => {
    let user = {};
    if (req.body?.username.trim()) {
        const userData = {
            username: req.body.username
        }
        await createAndSave(userModel, userData, { username: userData.username }, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                user = { username: data.username, _id: data._id };
            }
        });
    }
    res.status(200).json(user);
})

router.post('/api/users/:_id/exercises', async (req, res) => {
    const _userId = req.params?._id
    let { description, duration, date } = req.body
    let user, exerciseError;
    if (!_userId.trim()) {
        console.log("Error debe colocar un usuario");
        res.status(304).json({ error: "Error debe colocar un usuario" })
    } else {
        await userModel.findById(_userId, (err, data) => {
            if (err) {
                exerciseError = err.message;
            } else {
                if (data == null) {
                    exerciseError = "Error _Id no existente";
                }
                user = data;
            }
        }).catch((err) => {
            exerciseError = err.message;
        });
    }
    if (!user) {
        res.status(500).send(exerciseError);
    } else {
        let info = {};
        if (description.trim() && duration.trim() && _userId.trim()) {
            if (!date.trim()) {
                date = Date.now();
            } else {
                try {
                    date = new Date(date)
                } catch (err) {
                    console.log(err)
                }
            }

            let exerciseData = {
                _userId,
                description,
                duration,
                date
            }
            await createAndSave(exerciseModel, exerciseData, null, (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    info = { _id: user._id, username: user.username, date: data.date?.toDateString(), duration: data.duration, description: data.description };
                }
            }).catch((err) => {
                console.log("Ha ocurrido un error", err)
                res.status(304).json({ msg: "Ha ocurrido un error", err })
            })
        }
        res.status(200).json(info);
    }


})

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'))
});



module.exports = router;