let baseURL : any = undefined
import dotenv from'dotenv'

dotenv.config()

if(process.env.NODE_ENV === "production"){
    baseURL = process.env.FRONTEND_BASE_PROD_URL
}
else {
    baseURL = process.env.FRONTEND_BASE_DEV_URL
}

export {baseURL}