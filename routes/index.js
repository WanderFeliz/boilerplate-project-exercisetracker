const {Router} = require('express');
const path = require('path')
const router = Router()



router.get('/api/users/:_id/logs', (req, res)=>{
    res.send('Test')
})

router.get('/api/users', (req, res)=>{
    res.send('Test')
})

router.post('/api/users', (req, res)=>{
    res.send('Test')
})

router.post('/api/users/:_id/exercises', (req, res)=>{
    res.send('Test')
})

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'))
  });



module.exports = router;