import express from 'express'
import { createContactService, getContactsService } from "../services/contact/contact.service";
import authenticate from "../modules/config/authenticate";

const contactRouting = express.Router()
contactRouting.post('/create',createContactService)
contactRouting.get(`/get`,authenticate,getContactsService)
export default contactRouting;