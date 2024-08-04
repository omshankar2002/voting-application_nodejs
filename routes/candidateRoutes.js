const express =  require("express");
const router =  express.Router();
const {jwtAuthMiddleware, generateToken} = require('../jwt');
const Candidate =  require('../models/candidate');
const User = require("../models/user");


const checkAdminRole = async (userID) => {
    try{
        const user = await User.findById(userID);
        if(user.role === 'admin'){
            return true;
        }
    
    }catch(err){
        return false;
    }
}

//post route to add a candidate
router.post('/',jwtAuthMiddleware, async(req,res) => {
    try{
        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({message : 'user does not have admin role'});
        }
        const data = req.body //Assuming the request body contains the candidate data

        //create a new person document using the Mongoose model
        const newCandidate = new Candidate(data);
       
        //save the new candidate to the database
        const response = await newCandidate.save();
        console.log('data saved');
        res.status(200).json({response: response});
    }
    catch(err) {
        console.log(err);
        res.status(500).json({error: 'Internal server error'})
    }
})


router.put('/:candidateID',jwtAuthMiddleware, async(req,res) => {
    try{
        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({message : 'user does not have admin role'});
        }
        const candidateID = req.params.candidateID;
        const updateCandidateData = req.body;

        const response = await Person.findByIdAndUpdate(candidateID, updateCandidateData, {
            new: true, // return the updated document
            runValidators : true, //Run mongoose validation

        })

        if(!response){
            return res.status(404).json({error: 'Candidate not found'});
        }
        console.log("Candidate data updated");
        res.status(200).json(response);

    }catch(err){

        console.log(err);
        res.status(500).json({error : 'Internal server error'});
    }
})


router.delete('/:candidateID',jwtAuthMiddleware, async(req,res) => {
    try{
        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({message : 'user does not have admin role'});
        }
        const candidateID = req.params.candidateID;

        const response = await Person.findByIdAndDelete(candidateID);

        if(!response){
            return res.status(404).json({error: 'Candidate not found'});
        }
        console.log("Candidate Deleted");
        res.status(200).json(response);

    }catch(err){

        console.log(err);
        res.status(500).json({error : 'Internal server error'});
    }
})

//lets start voting
router.post('/vote/:candidateID', jwtAuthMiddleware, async(req,res) => {
    //no admin can vote 
    //user can only vote once
    candidateID = req.params.candidateID;
    userId = req.user.id;

    try{
        //find the candidate document by the candidate specified candidateID
        const candidate = await Candidate.findById(candidateID) ;
        if(!candidate){
            return res.status(404).json({message : "Candidate not found"});
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message: 'user not found'});
        }
        if(user.isVoted){
            return res.status(404).json({message: "You have already voted"});
        }

        if(user.role == 'admin'){
            res.status(404).json({message : 'admin is not allowed'});
        }

        //update the candidate documnet to record the votes
        candidate.votes.push({user: userId});
        candidate.voteCount++;
        await candidate.save();

        //update the user document
        user.isVoted = true;
        await user.save();

        res.status(200).json({message: 'votes recorded successfully'});
        
    }catch(err){
       console.error(err);
       res.status(500).josn({error : 'Internal Server Error'});
    }
})

//vote count
router.get('/vote/count', async(req,res) => {
    try {
         const candidate =  await Candidate.find().sort({voteCount: 'desc'});

         //Map the candidate to only return their name and voteCount
         const voteRecord = candidate.map((data) => {
            return{
                party: data.party,
                count: data.voteCount
            }
         });
         return res.status(200).json(voteRecord);
    }catch(err){
        console.error(err);
        res.status(500).json({error : 'Internal Server Error'});
    }
   

})

router.get('/', async(req,res) => {
    try{
        //list of candidate 
        const candidate = await Candidate.find({},'name party -_id' );
        res.status(200).json(candidate);
    }catch(err){
        console.error(err);
        res.status(500).json({error : 'Internal Server Error'})
    }
})

module.exports = router;