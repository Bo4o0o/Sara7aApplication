import * as dbService from '../../DB/database.repository.js';
import UserModel from "../../DB/Models/user.model.js";
import { NotFoundException , ConflictException , BadRequestException} from '../../utils/response/error.response.js';
import successResponse from '../../utils/response/success.response.js';
import { generateHash , compareHash } from '../../utils/security/hash.security.js';
import  {HashEnum}  from '../../utils/enums/security.enum.js';
import { decrypt, encrypt } from '../../utils/security/encryption.security.js';
import {  getNewLoginCredentials } from '../../utils/token/token.js';
import {OAuth2Client} from "google-auth-library"
import { CLIENT_ID } from '../../../config/config.service.js';
import { LogoutTypeEnum, ProviderEnum } from '../../utils/enums/user.enum.js';
import { emailEvent } from '../../utils/events/email.events.js';
import { generateOTP } from '../../utils/generateOTP.js';
import TokenModel from '../../DB/Models/token.model.js'
export const signup = async (req, res) => {
    const {
        userName,
        email,
        password,
        phone,
        gender,
        role,
        DOB
    } = req.body;
    const user = await dbService.findOne({
        model: UserModel,
        filter: { email }
    });
    if (user) {
        throw ConflictException("User already exists");
    }
    const hashedPassword = await generateHash({
        plainText: password,
        algorithm: HashEnum.BCRYPT
    });
    const encryptedPhone = encrypt(phone);
    const otp = generateOTP();
    const hashedOtp = await generateHash({
        plainText: JSON.stringify(otp),
        algorithm: HashEnum.ARGON2
    });
    const newUser = await dbService.create({
        model: UserModel,
        data: [{
            userName,
            email,
            password: hashedPassword,
            phone :encryptedPhone,
            confirmEmailOtp: hashedOtp,
            gender,
            role,
            DOB
        }]
    });
    emailEvent.emit("sendEmail", {
        to: email,
        code: otp,
        firstName: userName
    });
    return successResponse({
        res,
        message: "User created successfully",
        statusCode: 201,
        data: { newUser }
    });
};


export const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await dbService.findOneAndUpdate({model: UserModel, filter: { email , confirmEmail: { $exists: true } } , update: { $unset: {changeCredentialTime:true}} });
    if(!user) throw NotFoundException("User not found");
    const isMatch = await compareHash({
        plainText: password,
        cipherText: user.password,
        algorithm: HashEnum.ARGON2
    });
    const token = await getNewLoginCredentials(user);
    if(!isMatch) throw BadRequestException("Invalid credentials");
    if(user.phone) user.phone = decrypt(user.phone);
    return successResponse({res, message : "User logged in successfully",statusCode: 200,  data: {token}});
}

export const confirmEmail = async (req,res) => {
    const {email,otp} = req.body;
    const user = await dbService.findOne({model:UserModel , filter:{email , confirmEmail:{$exists:false} , confirmEmailOtp:{$exists:true}}})
    if(!user) throw BadRequestException("User not found or already confirmed");
    const isOtpValid = await compareHash({plainText: otp , cipherText:user.confirmEmailOtp , algorithm:HashEnum.ARGON2});
    if(!isOtpValid) throw BadRequestException("Invalid OTP");
    await dbService.updateOne({model:UserModel , filter:{email} , update:{confirmEmail:Date.now() , $unset:{confirmEmailOtp:true}}});
    successResponse({res , message:"Email confirmed successfully" })
}

export const refreshToken = async (req,res) => {
    const tokens = await getNewLoginCredentials(req.user);

    successResponse({res , message : "Done" , data: {tokens}})
}

async function verifyGoogleAccount({idToken}) {
    const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID, 
  });
  const payload = ticket.getPayload();
  return payload
}

export const loginWithGmail = async(req,res) =>{
    const {idToken} = req.body;

    const {email,picture,given_name,family_name,email_verified} = await verifyGoogleAccount({idToken})
    if (!email_verified) {
        throw BadRequestException({message:"Email not verified"})
    }

    const user = await dbService.findOne({model:UserModel , filter:{email}})
    if(user){
        if (user.provider === ProviderEnum.GOOGLE) {
            const tokens = await getNewLoginCredentials(user)
            successResponse({res , message:"Done" , data:{tokens}})
        }
    }else{
        const newUser = await dbService.create({model:UserModel , data:[{
            firstName:given_name,
            lastName:family_name,
            email,
            profilePic:picture,
            provider:ProviderEnum.GOOGLE
        }]})
        const tokens = await getNewLoginCredentials(newUser)
            successResponse({res , message:"Done", statusCode:201 , data:{tokens}})
    }
}

export const forgetPassword = async(req,res) => {
    const {email} = req.body;
    const otp = generateOTP();
    const hashedOtp = await generateHash({
        plainText: JSON.stringify(otp),
        algorithm: HashEnum.ARGON2
    });
    const user = await dbService.findOneAndUpdate({model:UserModel , filter:{email , provider:ProviderEnum.SYSTEM , confirmEmail:{$exists:true}} , update:{forgetPasswordOtp:hashedOtp}});
    if(!user) throw BadRequestException("Invalid account");
    emailEvent.emit("forgetPassword", {
        to: email,
        code: otp,
        firstName: user.firstName
    });
    successResponse({res , message:"OTP sent to your email"})
};

export const resetPassword = async(req,res) => {
    const {email,otp,newPassword} = req.body;
    const user = await dbService.findOne({model:UserModel ,
         filter:{email , provider:ProviderEnum.SYSTEM , confirmEmail:{$exists:true} , forgetPasswordOtp:{$exists:true}}});
         if(!user) throw BadRequestException("Invalid account");
    const  isOtpValid = await compareHash({plainText: otp , cipherText:user.forgetPasswordOtp , algorithm:HashEnum.ARGON2});
            if(!isOtpValid) throw BadRequestException("Invalid OTP");
            const hashedPassword = await generateHash({
                plainText: newPassword,
                algorithm: HashEnum.ARGON2
            });
            await dbService.updateOne({model:UserModel , filter:{email} , update:{password:hashedPassword , $unset:{forgetPasswordOtp:true}}});
            successResponse({res , message:"Password reset successfully"})
}

export const logout = async(req,res) => {
    const {flag} = req.query;
    let status = 200;
    switch (flag) {
        case LogoutTypeEnum.Logout:
            await dbService.create({model:TokenModel ,
                data: [
                    {
                        jti:req.decoded.jti,
                        userId:req.user._id,
                        expiresIn:new Date(req.decoded.exp * 1000)
                    },
                ],
             });
             status = 201;
            break;
        case LogoutTypeEnum.LogoutFromAll:
            await dbService.updateOne({model:UserModel , filter:{_id:req.user._id} , update:{changeCredentialTime:Date.now()}});
            status = 200;
            break;
        default:
            status = 400;
            throw BadRequestException("Invalid flag");
    }
    successResponse({res , message:"Logged out successfully" , statusCode:status})
}