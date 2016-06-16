// get an instance of mongoose and mongoose.Schema
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const User = mongoose.model('User', new Schema({ 
    name: String, 
    password: String, 
    admin: Boolean 
}));

export default User;