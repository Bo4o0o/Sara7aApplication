import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { BadRequestException } from "../response/error.response.js";

const DETECTION_SAMPLING_SIZE = 4100;

const collectFiles = (req) => {
    if(req.file) return [req.file];
    if(Array.isArray(req.files)) return req.files;
    if(req.files) return Object.values(req.files).flat();
    return [];
}

const readMagicNumber = async (filePath) => {
    const handle = await fs.promises.open(filePath, 'r');
    try{
        const buffer = Buffer.alloc(DETECTION_SAMPLING_SIZE);
        const { bytesRead } = await handle.read(buffer, 0, DETECTION_SAMPLING_SIZE, 0);
        return await fileTypeFromBuffer(buffer.subarray(0, bytesRead));
    } finally {
        await handle.close();
    }
}

const removesFiles = (files) =>{
    Promise.all(files.map((f)=> fs.promises.unlink(f.path).catch(()=>{})));
}

export const validationMagicNumbers = (allowedTypes = [])=>{
    const allowed = allowedTypes.map((t)=>{
        t ==="image/jpg" ? "image/jpg" : t;
    })
    return async (req, file, next) => {
        const files = collectFiles(req);
        if(!files.length) return next();
        try{
            for (const file of files){
            const type = await readMagicNumber(file.path);
            if(!type || !allowed.includes(type.mime)){
                throw BadRequestException({message: `Invalid file type ${file.originalname} content does not match its extension`});
            }
        }
        return next();
        }catch(err){
            await removesFiles(files);
            return next(err);
        }
        
    }
}
export const fileValidation = {
    images:["image/png" , "image/jpg" , "image/jpeg"],
    videos:["video/mp4" , "video/mpeg" , "video/jpeg"], 
    audios:["audio/webm" , "audio/mpeg" , "audio/mp4"],  
    documents:["application/pdf" , "application/msword" , "application/vnd.ms-excel"],
}

export const localFileUpload = ({customPath = "general" , validation = []})=>{
    const basePath = `uploads/${customPath}`;
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            let userBasePath = basePath;
            if(req.user?._id) userBasePath += `/${req.user._id}`;
            const fullPath = path.resolve(`./src/${userBasePath}`);
            if(!fs.existsSync(fullPath)){
                fs.mkdirSync(fullPath, { recursive: true });
            }
            cb(null, path.resolve( fullPath));
        },
        filename: (req, file, cb) => {
            const uniqueFilename = 
            Date.now() + '__' + Math.random() +'__'+ file.originalname;
            file.finalPath = `${basePath}/${req.user._id}/${uniqueFilename}`;
            cb(null, uniqueFilename);
        }
    });
    const fileFilter = (req, file, cb) => {
        if(!validation.includes(file.mimetype)){
            return cb(new Error("Invalid file type. Only PNG files are allowed."), false);
        } else {
            cb(null, true);
        }
    }
    return multer({ fileFilter , storage  });
}