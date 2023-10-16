import Clients from '../db/model/client.js'
const get = async (key) => {
    const details = await Clients.findOne({ username: key })
    return details
}
const set = async (value) => {
    const newClient = new Clients(value)
    return await newClient.save()
}
const getAll = async () => {
    try {
        const detail = await Clients.find({}).lean()
        return detail
    } catch (e) {
        console.log(e)
    }

}


export default {
    get,
    set,
    getAll
}