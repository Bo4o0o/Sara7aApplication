import {Schema, model , mongoose} from 'mongoose';
import {GenderEnum , RoleEnum ,ProviderEnum } from '../../utils/enums/user.enum.js';

const tokenSchema = new Schema({
    jti: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type:Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    expiresIn: {
        type: Date,
        required: true,
    }

    }
    ,{
    timestamps: true,
    });

tokenSchema.index('expiresIn', { expireAfterSeconds: 0 });
const TokenModel = mongoose.model('Token', tokenSchema);
export default TokenModel;
