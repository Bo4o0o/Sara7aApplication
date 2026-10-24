import jwt from "jsonwebtoken";
import {RoleEnum, SignatureEnum, TokenTypeEnum} from "../enums/user.enum.js"
import { EXPIRES_IN, JWT_ADMIN_SECRET_ACCESS, JWT_ADMIN_SECRET_REFRESH, JWT_USER_SECRET_ACCESS, JWT_USER_SECRET_REFRESH, JWT_EXPIRES_IN_ACCESS, JWT_EXPIRES_IN_REFRESH } from "../../../config/config.service.js";
import {BadRequestException, NotFoundException} from "../../utils/response/error.response.js"
import {findById} from "../../DB/database.repository.js"
import UserModel from "../../DB/Models/user.model.js"
export const generateToken = ({payload, secretKey = JWT_SECRET , options = {expiresIn :Number(EXPIRES_IN)}})=>{
    return jwt.sign(payload,secretKey,options)
}


export const verifyToken = ({ token, secretKey = JWT_USER_SECRET_ACCESS }) => {
    return jwt.verify(token, secretKey);
};


export const getSignature = ({signatureLevel = SignatureEnum.USER}) =>{
    let signature = {accessSignature : undefined , refreshSignature : undefined}
    switch (signatureLevel) {
        case SignatureEnum.ADMIN:
            signature.accessSignature = JWT_ADMIN_SECRET_ACCESS;
            signature.refreshSignature = JWT_ADMIN_SECRET_REFRESH
            break;
        case SignatureEnum.USER:
            signature.accessSignature = JWT_USER_SECRET_ACCESS;
            signature.refreshSignature = JWT_USER_SECRET_REFRESH;
            break;
        default:
            signature.accessSignature = JWT_USER_SECRET_ACCESS;
            signature.refreshSignature = JWT_USER_SECRET_REFRESH;
    }
    return signature;
}

export const getNewLoginCredentials = async (user) => {
    const signature = await getSignature({
        signatureLevel : user.role != RoleEnum.ADMIN?SignatureEnum.USER : SignatureEnum.ADMIN
    });
    const accessToken = generateToken({
        payload:{id:user._id},
        secretKey:signature.accessSignature,
        options:{expiresIn:JWT_EXPIRES_IN_ACCESS}
    });
    const refreshToken = generateToken({
        payload:{id:user._id},
        secretKey:signature.refreshSignature,
        options:{expiresIn:JWT_EXPIRES_IN_REFRESH}
    });
    return {accessToken , refreshToken };
}

export const decodedToken = async ({authorization ,tokenType =  TokenTypeEnum.ACCESS})=>{
    const [Bearer , token ] = authorization.split(" ") || [];
    if(!Bearer || !token) throw BadRequestException({message:"Invalid token"});
    let signature = await getSignature({signatureLevel: Bearer === "ADMIN" ? SignatureEnum.ADMIN : SignatureEnum.USER ,  });
    const decoded = verifyToken({token , secretKey : tokenType === TokenTypeEnum.ACCESS ? signature.accessSignature : signature.refreshSignature});
    const user = await findById({model : UserModel , id :decoded.id });
    if(!user) throw NotFoundException({message:"Not Registered Account "});
    return {user , decoded};
}