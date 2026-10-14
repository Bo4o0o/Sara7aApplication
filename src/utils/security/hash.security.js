import {SALT_ROUNDS} from '../../../config/config.service.js'; 
import {HashEnum} from '../enums/security.enum.js';
import {hash ,compare } from "bcrypt";
import * as argon2 from 'argon2';
import { BadRequestException } from '../response/error.response.js'; 

export const generateHash = async ({plainText , saltRounds = SALT_ROUNDS , algorithm = HashEnum.BCRYPT}) => {
                    let hashResults ="";
                    switch(algorithm){
                        case HashEnum.BCRYPT:
                            hashResults = await hash(plainText , saltRounds );
                            break;
                        case HashEnum.ARGON2:
                            hashResults = await argon2.hash(plainText);
                            break;
                        default:
                            throw BadRequestException("Invalid hashing algorithm");
                    }
                    return hashResults;
};

export const compareHash = async ({ plainText, cipherText, algorithm = HashEnum.BCRYPT }) => {
                    let match = false;
                    switch(algorithm){
                        case HashEnum.BCRYPT:
                            match  = await compare(plainText , cipherText );
                            break;
                        case HashEnum.ARGON2:
                             match = await argon2.verify(cipherText, plainText);
                            break;
                        default:
                            throw BadRequestException("Invalid hashing algorithm");
                    }
                    return match;
};