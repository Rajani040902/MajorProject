if (process.env.NODE_ENV != "production") {
    require('dotenv').config({ path: '../.env' });
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

main()
.then(() => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
        ...obj, 
        owner: "6a2d5c746d56779fffdf1292"
    }));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();