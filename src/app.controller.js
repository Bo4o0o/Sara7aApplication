import { authRouter , userRouter , messageRouter } from './Modules/index.js';
import{ globalErrorHandler , BadRequestException } from './utils/response/error.response.js';
import connectDB from './DB/connection.js';
import cors from "cors"
import {resolve} from "node:path"
const bootstrap = async (app, express) => {
  app.use(express.json() ,cors());

  await connectDB();
  app.use('/uploads', express.static(resolve('./src/uploads')));
  app.use('/api/v1/auth' , authRouter);
  app.use('/api/v1/user' , userRouter);
  app.use('/api/v1/messages' , messageRouter);

  app.all('/*dummy', (req, res) => {
    throw BadRequestException({message: "Route Not Found !!" });
  });
  
  app.use(globalErrorHandler);
}

export default bootstrap;