import mongoose, { Schema } from 'mongoose'
const ClientSchema = new Schema({
    userId: { type: String, required: true },
    appName: { type: String, required: true },
    appLogoUrl: { type: String, required: false },
    redirect_uris: { type: Array, dafault: false, required: false },
    client_id: { type: String, unique: true, required: true },
    client_secret: { type: String, unique: true, required: true },
    grant_types: { type: Array, dafault: false, required: true },
    scope: { type: String, required: true }
})

const Clients = mongoose.model('Clients', ClientSchema)
export default Clients