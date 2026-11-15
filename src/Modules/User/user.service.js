import successResponse from "../../utils/response/success.response.js"
export const getProfile = async (req,res)=>{
    successResponse({res , message:"Done" , data:{user:req.user}})
}
export const uploadProfilePic = async (req,res)=>{
    console.log( req.file);
    successResponse({res , message:"Profile picture uploaded successfully" , data:{file:req.file}})
}