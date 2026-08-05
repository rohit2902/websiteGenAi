import express from "express"
import {  getMe, loginUser, logoutUser } from "../controllers/auth.controller.js"
import { authenticateUser } from "../middlewares/auth.middleware.js"
const authRoute = express.Router()


authRoute.post("/login", loginUser)
authRoute.get("/logout" , logoutUser)
authRoute.get("/me" ,authenticateUser ,  getMe)
// authRoute.get("/gem" ,  getDemo)

export default authRoute