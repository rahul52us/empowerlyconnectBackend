import { NextFunction } from "express"
import Token from "../../schemas/Token/Token"

export const createToken = async (data : any) => {
    try
    {
        const tkon = new Token({...data, is_active : true})
        const savedToken = await tkon.save()
        return {
            status : 'success',
            data : savedToken
        }
    }
    catch(err : any)
    {
        return {
            status : 'error',
            data : err?.message
        }
    }
}

export const findToken = async(data : any) => {
    try
    {
        const tkon = await Token.findOne({token : data.token , is_active : true, ...data})
        if(tkon){
            return {
                status : 'success',
                data : tkon
            }
        }
        else {
            return {
                status : 'error',
                data : 'Token does not exists'
            }
        }
    }
    catch(err : any)
    {
        return {
            status : 'error',
            data : err?.message
        }
    }
}

export const verifyToken = async (req : any , res : any, next : NextFunction) => {
    try
    {
        const tkon = await Token.findOne({company : req.body.company , userId : req.body.userId, token : req.body.token, type : req.body.type, deletedAt : {$exists : false}})
        if(tkon){
            tkon.deletedAt = new Date()
            await tkon.save()
            return res.status(200).send({
                message : 'Token has been verified',
                data : 'Token has been verified',
                status : 'success'
            })
        }
        else{
            return res.status(300).send({
                message : 'Invalid token',
                data : 'Invalid token',
                status : 'error'
            })
        }
    }
    catch(err)
    {
        next(err)
    }
}
