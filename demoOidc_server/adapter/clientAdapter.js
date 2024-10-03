import MongoAdapter from 'oidc-provider'
import Clients from '../db/model/client.js'
export class ClientAdapter extends MongoAdapter {
    // constructor(name) {
    //     this.name = (name)
    //     console.log(this.name, "name")
    // }
    // async find(id) {
    //     console.log('inside find method=======================')
    //     console.log(id, "id clent")
    //     const clients = await Clients.findOne({ client_id: id }).lean()
    //     console.log(clients, "clients")
    //     return clients
    // }
    static async connect() {
        const connection = await MongoClient.connect(process.env.DB_URL);
        DB = connection.db(connection.s.options.dbName);
      }

}