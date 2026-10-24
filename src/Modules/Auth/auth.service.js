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
import { ProviderEnum } from '../../utils/enums/user.enum.js';
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
    const newUser = await dbService.create({
        model: UserModel,
        data: [{
            userName,
            email,
            password: hashedPassword,
            phone :encryptedPhone,
            gender,
            role,
            DOB
        }]
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
    const user = await dbService.findOne({model: UserModel, filter: { email } });
    if(!user) throw NotFoundException("User not found");
    const token = await getNewLoginCredentials(user);
    const isMatch = await compareHash({
        plainText: password,
        cipherText: user.password,
        algorithm: HashEnum.BCRYPT
    });

    if(!isMatch) throw BadRequestException("Invalid credentials");
    if(user.phone) user.phone = decrypt(user.phone);
    return successResponse({res, message : "User logged in successfully",statusCode: 200,  data: {token}});
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