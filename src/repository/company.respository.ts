import Company from "../schemas/company/Company";

export const getCompanyDetailsByName = async (data : any) => {
    try
    {
        const company = await Company.findOne({ company_name: new RegExp(data.company, 'i'), is_active : true })
        if(company){
            return {
                status : 'success',
                data : company,
                statusCode : 200
            }
        }
        else {
            return {
                status : 'error',
                data : `${data.company} No Such Are Found`,
                statusCode : 400
            }
        }
    }
    catch(err : any)
    {
        return {
            status : 'error',
            data : err,
            statusCode:err.statusCode
        }
    }
}