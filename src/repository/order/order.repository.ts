import Order from '../../schemas/Orders/Orders.schema'

export const findOrderAndUpdate = async(data : any) => {
    try
    {
        const dts = await Order.findById(data._id)
        if(dts){
            dts.quantity = data.quantity
            const saveddts = await dts.save()
            return {
                status : 'success',
                data : saveddts,
                statusCode : 200,
                message : 'order has been successfully'
            }
        }
        else {
            return {
                status : 'error',
                data : null,
                message : 'no such records exists',
                statusCode : 400
            }
        }
    }
    catch(err : any)
    {
        throw new Error(err?.message)
    }
}

export const findOrder = async(data : any) => {
    try
    {
        const orderdt = await Order.findOne(data)
        if(orderdt){
            return {
                status : 'success',
                data : orderdt
            }
        }
        else {
            return {
                status : 'error',
                data : null,
                message : 'No such record exists'
            }
        }
    }
    catch(err : any)
    {
        return {
            status : 'error',
            data : null,
            message : err?.message
        }
    }
}

export const createOrder = async(data : any) => {
    try
    {
        const orderData = new Order(data)
        const savedOrder = await orderData.save()
        return {
            status : 'success',
            data : savedOrder,
            statusCode : 201,
            message : 'Order has been created'
        }
    }
    catch(err : any)
    {
        throw new Error(err?.message)
    }
}

export const getAllOrders = async (data : any) => {
    try
    {
        const pipeline : any = [{
            $match : {...data.matchConditions}
        }]

        pipeline.push(
            {
                $lookup: {
                  from: "users",
                  let: { userId: "$user" },
                  pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                    { $project: { username: 1, _id: 1, code: 1, pic: 1, name: 1 } },
                  ],
                  as: "user",
                },
              },
        )

        const orderdetails = await Order.aggregate(pipeline)

        return {
            status : 'success',
            data : orderdetails,
            statusCode : 200
        }
    }
    catch(err : any)
    {
        return {
            status : 'error',
            data : err?.message,
            statusCode : 500
        }
    }
}
