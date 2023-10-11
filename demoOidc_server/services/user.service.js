import Account from '../db/model/users.js'

const get = async (key) => {
    const details = await Account.findOne({ username: key })
    return details
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
    getAll
}