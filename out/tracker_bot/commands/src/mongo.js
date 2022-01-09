var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MongoClient } from "mongodb";
const uri = "mongodb+srv://bodo_server:future19@cluster0.psalv.mongodb.net?retryWrites=true&w=majority";
const client = new MongoClient(uri, {});
/*
async function main(){
    await client.connect()

    const collection = client.db("sample_training").collection("companies");
    console.log(await collection.count())
    const arr = await collection.find({}).toArray()
    for(const x of arr){
        console.log(x['name'])
    }
    return await client.close()
}*/
function main(db = "discord_data", coll = "playtimes") {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.connect();
        const collection = client.db(db).collection(coll);
        const data = [
            {
                'user_id': "asda",
                "game_id": "gm1",
                "user_name": "peter",
                "game_name": "something",
                "playtime": 10
            },
            {
                'user_id': "dsa",
                "game_id": "gm1",
                "user_name": "denes",
                "game_name": "something",
                "playtime": 1
            }
        ];
        yield collection.insertMany(data);
        return client.close();
    });
}
/*
client.connect((err, result) => {
    if(err){
        console.log(`We have an error with connection ${err}`)
    }
    const collection = client.db("sample_training").collection("companies");
    // perform actions on the collection object
    console.log(collection)
    const f = async () => {return await collection.count()}
    client.close();
})*/
main();
