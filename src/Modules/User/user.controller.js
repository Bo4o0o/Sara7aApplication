import {Router} from 'express';
import * as userService from"./user.service.js"
import { authentication, authoraization } from '../../Middlewares/auth.middleware.js';
import { RoleEnum, TokenTypeEnum } from '../../utils/enums/user.enum.js';
import { fileValidation, localFileUpload, validationMagicNumbers } from '../../utils/multer/local.multer.js';
const router = Router();

router.get("/profile" ,authentication({tokenType:TokenTypeEnum.ACCESS}),
                        authoraization({accessRole:[RoleEnum.ADMIN]}),
                    userService.getProfile )
router.patch(
    "/update-profile-pic",
    authentication({ tokenType: TokenTypeEnum.ACCESS }), 
    authoraization({ accessRole: [RoleEnum.ADMIN] }),
    localFileUpload({ customPath: "User" , validation: [...fileValidation.images , ...fileValidation.documents] }).single("attachments"),
    userService.uploadProfilePic,
);
router.patch(
    "/update-cover-images",
    authentication({ tokenType: TokenTypeEnum.ACCESS }), 
    authoraization({ accessRole: [RoleEnum.ADMIN] }),
    localFileUpload({ customPath: "User" , validation: [...fileValidation.images , ...fileValidation.documents] }).array("attachments" , 10),
    validationMagicNumbers(fileValidation.images),
    userService.uploadCoverImages,
);
export default router;