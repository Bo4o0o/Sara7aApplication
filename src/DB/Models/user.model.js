import {Schema, model , mongoose} from 'mongoose';
import {GenderEnum , RoleEnum ,ProviderEnum } from '../../utils/enums/user.enum.js';

const userSchema = new Schema({
    firstName: {
        type: String,
        required: [true, "First Name is required"],
        minlength: 2,
        maxlength: 25,
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, "Last Name is required"],
        minlength: 2,
        maxlength: 25,
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    DOB: Date,
    phone:String,
    gender: {
        type: String,
        enum: Object.values(GenderEnum),
        default: GenderEnum.MALE,
    },
    role: {
        type: String,
        enum: Object.values(RoleEnum),
        default: RoleEnum.USER,
    },
    provider: {
        type: String,
        enum: Object.values(ProviderEnum),
        default: ProviderEnum.SYSTEM,
    },
    confirmEmail : Date,
    profilePic : String,
    coverPic:[String],
},{
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
});

userSchema.virtual('userName').set(function(value) {
    const [firstName, lastName] = value.split(' ') || [];
    this.set({firstName, lastName})}).get(function() {
    return `${this.firstName} ${this.lastName}`;
});

const UserModel = mongoose.model('User', userSchema);
export default UserModel;
