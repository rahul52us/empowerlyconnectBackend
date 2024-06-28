import "./db/db";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import errorMiddleware from "./modules/config/errorHandler";
import importRoutings from "./routing/routingIndex";
import http from "http";
import * as path from 'path'
import { setupSocket } from "./modules/chatSocket/chatSocket";
import { statusCode } from "./config/helper/statusCode";
// import './learning'

const app = express();
dotenv.config();

// create the server
const server = http.createServer(app);
setupSocket(server);

// use the body-parser
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/notes', express.static(path.join(__dirname,'src','../public/notes')));


// Enable CORS for all routes and all origins
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
}));

// import routing function
importRoutings(app);

app.use('/',(req,res) => {
  res.status(statusCode.info).send("Welcome to our app")
})


// To handle the error which is throw by the next
app.use(errorMiddleware);


server.listen(process.env.PORT, () => {
  console.log(`The server is running on port ${process.env.PORT}`);
});

const today = new Date().getDay();
if (today === 0 || today === 6) {
  console.log('Today is a weekend. Punching in/out is not allowed.');
} else {
  console.log('Today is a weekday. Punching in/out is allowed.');
}