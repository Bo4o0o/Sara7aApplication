import {Router} from 'express';
import * as authService from './auth.service.js';
import { authentication, authoraization } from '../../Middlewares/auth.middleware.js';
import { RoleEnum, TokenTypeEnum } from '../../utils/enums/user.enum.js';
const router = Router();

router.post('/signup', authService.signup);
router.post('/login', authService.login);
router.post('/refresh-token',authentication({tokenType: TokenTypeEnum.REFRESH}),authoraization({accessRole:[RoleEnum.ADMIN ,RoleEnum.USER ]}) ,authService.refreshToken);
router.post('/social-login' ,authService.loginWithGmail )
export default router;