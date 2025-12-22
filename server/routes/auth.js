const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/signup',async(req,res)=>{
	const { fullName,email,password} = req.body;
	if(!fullName || !password || !email){
		return res.status(400).json({message:"All fields are mandatory"});
	}

try{
	let user = await User.findOne({email});
if(user){
	return res.status(400).json({message:"User already exists"});
}

//hashin password
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password,salt);

//new user
user = new User({
	fullName,
	email,
	password:hashedPassword,
});

await user.save();

//create text based token (jwt)
const payload = {userId:user.id};
const token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:'5d'});
res.status(201).json({token,user:{id:user.id,fullName,email}});
}
catch(err){
	console.error(err.message);
	res.status(500).json({message:"Server Error"});
}
});

//login page routingg
router.post('/login',async(req,res)=>{
	const {email,password} = req.body;
	if(!email || !password){
		return res.status(400).json({message:"All field are mandatory"});
	}

	try{
		let user = await User.findOne({email});
		if(!user){
			return res.status(400).json({message:"Invalid credentials"});
		}
		//comapring both the passwords
		const isTrue = await bcrypt.compare(password,user.password);
		if(!isTrue){
			return res.status(400).json({message:"Invalid Password or invalid email id"});
		}
		const payload = {userId:user.id};
		const token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:'5d'});

		res.json({token,user:{id:user.id,fullName:user.fullName,email}});
	}
	catch(err){
		console.error(err.message);
		res.status(400).json({message:"Server Error"});
	}
});


module.exports = router;
