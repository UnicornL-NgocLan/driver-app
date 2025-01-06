import {getAllActiveTransport, getSeaDriver,getAllTransportLine,getAllMyTransports, getAllSeaDriver} from "../utils/getOdooUserData.js"

export const transportCtrl = {
    getActiveTransport: async (req,res) => {
        try {
            const {id,company_id,history} = req.query;
            let data = [];
            if(history){
                data = await getAllMyTransports(req.odoo,company_id);
            } else {
                data = await getAllActiveTransport(req.odoo,company_id);
            }
            const myActiveTransport = data.filter(item => item.sea_driver_id.includes(parseInt(id)));
            res.status(200).json({data:myActiveTransport})
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: error.message });
        }
    },

    getActiveTransportLine: async (req,res) => {
        try {
            const {id,getAll} = req.query;
            const data = await getAllTransportLine(req.odoo,id,getAll);
            res.status(200).json({data})
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: error.message });
        }
    },

    getSeaDriver: async (req,res) => {
        try {
            const {id,company_id} = req.query;
            if(!id) return res.status(400).json({msg:"Tài xế chưa được cấu hình trong hệ thống!"});
            const data = await getSeaDriver(req.odoo,id,company_id);
            res.status(200).json({data})
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: error.message });
        }
    },

    getAllSeaDriver: async (req,res) => {
        try {
            const {company_id} = req.query;
            console.log(company_id)
            const data = await getAllSeaDriver(req.odoo,company_id);
            res.status(200).json({data})
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: error.message });
        }
    }
}