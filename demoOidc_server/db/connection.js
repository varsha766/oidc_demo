import mongoose from 'mongoose'
import env from 'dotenv'
env.config()

export default async () => {
    const dbUrl = process.env.DB_URL
    try {
        return await mongoose.connect(dbUrl, {})
    } catch (e) {
        console.log(e)
    }
}