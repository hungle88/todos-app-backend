var express = require('express');
var router = express.Router();
const jwtManager = require('../jwt/jwtManager');



router.post('/login', (req, res) => {
    
    req.db.collection("users")
        .findOne({ 'email': req.body.email })
        .then(data => {
            if (data) {
                const payload = {};
                payload.role = data.role;
                payload.fname = data.fname; 
                // console.log(payload);
                // console.log(data.todos[0].comment[0].fname);
                // payload.fname = data.todos.comment.fname;
                const token = jwtManager.generate(payload);
                res.json({ status: 'success', result: token });
            } else{
                res.json({status:'user not found'})
            }
            
        })
        .catch(err=>{
            res.json({status:"error"})
        })
 
});

router.post('/', (req, res) => {
    console.log("hung")
    req.db.collection("users")
        .findOne({ 'todos.comment.commentId': new objectID(req.body.commentId)})
        .then(data => {
            if (data) {
                console.log(`umer`,data)
                const payload = {};
                payload.role = data.fname; 
                console.log(data.todos[0].comment[0].fname);
                // payload.fname = data.todos.comment.fname;
                const token = jwtManager.generate(payload);
                res.json({ status: 'success', result: token });
            } else{
                res.json({status:'user not found'})
            }
            
        })
        .catch(err=>{
            res.json({status:"err"})
        })
 
});






module.exports = router;