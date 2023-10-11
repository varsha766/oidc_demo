import mongoose, { Schema } from 'mongoose'
const AccountSchema = new Schema({
    username: { type: String, unique: true },
    password: String,
    email: { type: String, unique: true, sparse: true },
    emailVerified: { type: Boolean, default: true },
    redirect_uris: { type: Array, dafault: false, required: false },
    client_id: { type: String, unique: true, required: true },
    client_secret: { type: String, unique: true, required: true },
    grant_types: { type: Array, dafault: false, required: true },
    scope: { type: String, required: true }
})

const Account = mongoose.model('Account', AccountSchema)
export default Account