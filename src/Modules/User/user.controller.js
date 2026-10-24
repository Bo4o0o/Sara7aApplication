import {Router} from 'express';
import * as userService from"./user.service.js"
import { authentication, authoraization } from '../../Middlewares/auth.middleware.js';
import { RoleEnum, TokenTypeEnum } from '../../utils/enums/user.enum.js';
const router = Router();

router.get("/profile" ,authentication({tokenType:TokenTypeEnum.ACCESS}),
                        authoraization({accessRole:[RoleEnum.ADMIN]}),
                    userService.getProfile )

export default router;