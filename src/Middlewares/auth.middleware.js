import { TokenTypeEnum } from "../utils/enums/user.enum.js";
import { ForbiddenException } from "../utils/response/error.response.js";
import { decodedToken } from "../utils/token/token.js";

export const authentication = ({tokenType = TokenTypeEnum.ACCESS})=>{
    return async(req , res , next)=>{
        const {user , decoded} = await decodedToken({
            authorization : req.headers.authorization,
            tokenType
        });
        req.user = user;
        req.decoded = decoded;
        return next();
    };
};
export const authoraization = ({accessRole = []})=>{
    return async(req , res , next)=>{
        if(!accessRole.includes(Number(req.user.role)))
            throw ForbiddenException({message:"Unauthorized Access"})
        return next();
    };
};