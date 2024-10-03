import Account from '../db/model/account.js'

const get = async (key) => {
    const details = await Account.findOne({ username: key })
    return details
}
const fetchByClientId = async (key) => {
    const detail = await Account.findOne({ client_id: key })
    return detail
}
const set = async (value) => {
    const newAccount = new Account(value)
    return await newAccount.save()
}
const getAll = async () => {
    try {
        const detail = await Account.find({}).lean()
        return detail
    } catch (e) {
        console.log(e)
    }

}


export default {
    get,
    set,
    getAll,
    fetchByClientId
}