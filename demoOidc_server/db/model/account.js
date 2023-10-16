import mongoose, { Schema } from 'mongoose'
const UserSchema = new Schema({
    username: { type: String, unique: true },
    password: String,
})
const User = mongoose.model('Accounts', UserSchema)
export default User