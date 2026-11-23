import UserModel from "../../DB/Models/user.model.js"
import * as dbService from '../../DB/database.repository.js';
import successResponse from "../../utils/response/success.response.js"
export const getProfile = async (req,res)=>{
    successResponse({res , message:"Done" , data:{user:req.user}})
}
export const uploadProfilePic = async (req,res)=>{
    const user = await dbService.findByIdAndUpdate({model:UserModel , 
        id:req.user._id,
        update:{profilePic:req.file.finalPath},
    })
    successResponse({res , message:"Profile picture uploaded successfully" , data:{file:req.file}})
}

export const uploadCoverImages = async (req,res)=>{
    const user = await dbService.findByIdAndUpdate({model:UserModel , 
        id:req.user._id,
        update:{coverPic:req.files?.map((file)=>file.finalPath)},
    })
    successResponse({res , message:"Cover images uploaded successfully" , data:{user:user}})
}
