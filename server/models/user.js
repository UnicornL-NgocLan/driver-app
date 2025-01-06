import mongoose from 'mongoose';

const UserSchema = mongoose.Schema({
    username:{type:String},
    password:{type:String}
},{timestamps:true})

export default mongoose.model('User',UserSchema);