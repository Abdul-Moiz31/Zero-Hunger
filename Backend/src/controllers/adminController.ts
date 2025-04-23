import User from "../models/User"

// @ts-ignore
export const getDashboardStats = async (req, res) => {
    try {


        // all users

        const users=await User.find({role: {$ne: "admin"}});

        const ngoCount=await User.countDocuments({role:"ngo"});
        const donorCount=await User.countDocuments({role:"donor"});
        const volunteerCount=await User.countDocuments({role:"volunteer"});

        return res.status(200).json({ngoCount,donorCount,volunteerCount,users})
    }catch(error){
        res.status(500).json(error)
    }
}


export const updateUserStatus=async (req,res)=>{
    try{
       const {userId,status}=req.body;

       if(!userId){
        return res.status(400).json({message:"User Id required"})

       }

       if(status==undefined){
         return res.status(400).json({message:"Bad Request"})

       }


       const userExist=await User.findById(userId);

       if(!userExist){
        throw new Error("User does not exist.");
       }


       await User.findByIdAndUpdate(userId,{
        isApproved:status
       })
       
    res.status(200).json({message:"Status Updated Sucessfully"});       
    }catch(error){
        res.status(500).json(error)
    }
}


export const deleteUser=async (req,res)=>{
    try{
        const {userId}=req.params;
 
        if(!userId){
         return res.status(400).json({message:"User Id required"})
 
        }
 
        const userExist=await User.findById(userId);
 
        if(!userExist){
         throw new Error("User does not exist.");
        }
 
 
        await User.findByIdAndDelete(userId)
        
     res.status(200).json({message:"User Deleted Sucessfully"});       
     }catch(error){
         res.status(500).json(error)
     }
}