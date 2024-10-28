import WebsiteTemplate from "../../schemas/websiteTemplate/websiteTemplate"

export const createWebTemplate = async(data : any) => {
    try
    {
        const webTemp = new WebsiteTemplate(data)
        const savedWebTemp = await  webTemp.save()
        return {
            statusCode : 200,
            status : 'success',
            data : savedWebTemp,
            message : 'Template createed successfully'
        }
    }
    catch(err : any)
    {
        return {
            statusCode : 500,
            status : 'error',
            data : err?.message,
            message : err?.message
        }
    }
}
