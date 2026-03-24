import {MongoClient} from 'mongodb';

const client = new MongoClient('mongodb+srv://bmskenterprise0:MsGFkaXnxe0Rfume@bmsk-wallet.lmjd0tb.mongodb.net/?appName=bmsk-wallet');
let db;
export default async () =>{
    if(db) return db;
    await client.connect();
    db = client.db('tannimtelecom');
    return db;
}