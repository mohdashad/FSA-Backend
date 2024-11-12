const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');


router.post('/', async (req, res) => {    
    const jwtSecret = process.env.JWT_SECRET;
    const { email, password } = req.body;
    const user = await User.findOne({ email });
  
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send('Invalid credentials');
    }
    //const user1 = await User.findById(decoded.id).select('-password'); 
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ token,'user':userObj });
});


    
module.exports = router;
