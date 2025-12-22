const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');


// get route for the current user
//reoved the password field to improve security 
router.get('/me',auth,async(req,res)=>{
	try{
		const user  = await User.findById(req.user).select('-password');
		if(!user){
			return res.status(404).json({message:"User not found"});
		}
		res.json(user);
	}
	catch(err){
		console.error(err.message);
		res.status(404).json({message:"User not found"});
	}
});

router.put('/me',auth,async(req,res)=>{
	const bio = req.body.bio;
	const skills = req.body.skills;
	const interests = req.body.interests;
	const availability = req.body.availability;

	const profileFields = {};
	if(bio)profileFields.bio = bio;
	if(skills)profileFields.skills = skills;
	if(interests)profileFields.interests = interests;
	if(availability)profileFields.availability = availability;

	try{
		let user= await User.findById(req.user);
		if(!user){
			return res.status(404).json({message:"User not found"});
		}
		user = await User.findByIdAndUpdate(
		req.user,
		{ $set: profileFields }, // The data to update
		{ new: true }            // Return the updated document
		).select('-password');		res.json(user);
	}
	catch(err){
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

router.get('/:id',auth,async(req,res)=>{
	try{
		const user = await User.findById(req.params.id).select('-password');
		if(!user){
			return res.status(404).json({msg:"User not found"});
		}
		res.json(user);

	}catch(err){
		console.error(err.message);
		if(err.kind == 'ObjectId'){
			return res.status(404).json({msg:"Profile not found"});
		}
		res.status(500).send('Server error');
	}
});


module.exports = router;