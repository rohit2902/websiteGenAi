import dotenv from "dotenv";
dotenv.config()
import app from "./src/app.js";
import connectToDb from "./src/config/database.js";

const port = process.env.PORT || 5000

app.listen(port , ()=>{
    connectToDb()
    console.log(`server is start on port number ${port}`)
})

