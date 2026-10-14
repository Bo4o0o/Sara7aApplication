import { authRouter , userRouter , messageRouter } from './Modules/index.js';
import{ globalErrorHandler , BadRequestException } from './utils/response/error.response.js';
import connectDB from './DB/connection.js';
const bootstrap = async (app, express) => {
  app.use(express.json());

  await connectDB();
  
  app.use('/api/v1/auth' , authRouter);
  app.use('/api/v1/user' , userRouter);
  app.use('/api/v1/messages' , messageRouter);

  app.all('/*dummy', (req, res) => {
    throw BadRequestException({message: "Route Not Found !!" });
  });
  
  app.use(globalErrorHandler);
}

export default bootstrap;