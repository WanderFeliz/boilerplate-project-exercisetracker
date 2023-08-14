const { Router } = require('express');
const path = require('path')
const router = Router()
const { userModel, exerciseModel, createAndSave, findItems } = require('../db');


router.get('/api/users/:_id/logs', async (req, res) => {
    const _userId = req.params?._id
    let user, exerciseError;
    let info = {};

    let urlVals = req.url.split('?')?.[1]?.replace(/\[/g,'')?.replace(/\]/g,'');
    let urlParams = {};
    
    urlVals.split('&')?.forEach(element => {
        const [key, val] = element?.split('=')
        urlParams[key] = val
    });

    let {from, to, limit} = urlParams

    

    console.log(urlParams)
    

    // Getting info from url params

    // Using query builder
    // Person.
    //     find({ occupation: /host/ }).
    //     where('name.last').equals('Ghost').
    //     where('age').gt(17).lt(66).
    //     where('likes').in(['vaporizing', 'talking']).
    //     limit(10).
    //     sort('-occupation').
    //     select('name occupation').
    //     exec(callback);
    if (!_userId.trim()) {
        res.status(304)
        console.log("Error debe colocar un usuario");
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
        // Using query builder
        let query = exerciseModel.find({ _userId: _userId })
        if (from && to) {
            query = query.where('date').gte(from).lte(to)
        }
        if (limit) {
            query = query.limit(limit)
        }
        query = query.select('description duration date')
        
        console.log(query._conditions, query._fields);
        await query.exec((err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    info = { _id: user._id, username: user.username, count: data.length, log: data };
                    res.json(info)
                }
            });
        
    }

    

    

    // res.send('Test')
})

router.get('/api/users', async (req, res) => {
    const results = await findItems(userModel, {})
    const data = results.map(user => (
        { username: user.username, _id: user._id }
    ))
    res.json(data)
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
    res.json(user);
})

router.post('/api/users/:_id/exercises', async (req, res) => {
    const _userId = req.params?._id
    let { description, duration, date } = req.body
    let user, exerciseError;
    if (!_userId.trim()) {
        res.status(304)
        console.log("Error debe colocar un usuario");
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
                res.status(304)
                console.log("Ha ocurrido un error", err)
            })
        }
        res.json(info)
    }


})

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'))
});



module.exports = router;