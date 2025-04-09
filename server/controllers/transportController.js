import {
    getAllActiveTransport, 
    getSeaDriver,
    getAllTransportLine,
    getAllMyTransports, 
    getAllSeaDriver,
    getAllVehicles, 
    checkCurrentTransportLineIsDone,
    checkCurrentTransportLineIsReady,
    getAllTransportLineJustStateAndSequence,
    getAllOdometers,
} from "../utils/getOdooUserData.js"
import {
    updateActualEndDate,
    doneTransportLine,
    cancelTransportLine,
    updateSequenceAndStatusTransportLine,
    addVehicleOdometerValue,
} from "../utils/updateOdooUserData.js"

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
            const data = await getAllSeaDriver(req.odoo,company_id);
            res.status(200).json({data})
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: error.message });
        }
    },

    handleDoneTransportLine: async (req,res) => {
        try {
            const {id,date_end}  = req.body;
            const updateData = {date_end_actual:date_end};
            const result = await checkCurrentTransportLineIsDone(req.odoo,id);
            if(result.length > 0) return res.status(400).json({msg:"Dữ liệu đơn hàng này đã có ai đó tác động. Vui lòng tải lại trang!"})
            await updateActualEndDate(req.odoo,updateData,id);
            await doneTransportLine(req.odoo,id);
            res.status(200).json({data:"Cập nhật thành công!"})
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: error.message });
            
        }
    },

    handleCancelTransportLine: async (req,res) => {
        try {
            const {id}  = req.body;
            const result = await checkCurrentTransportLineIsReady(req.odoo,id);
            if(result.length > 0) return res.status(400).json({msg:"Dữ liệu đơn hàng này đã có ai đó tác động. Vui lòng tải lại trang!"})
            await cancelTransportLine(req.odoo,id);
            res.status(200).json({data:"Cập nhật thành công!"})
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: error.message });
            
        }
    },

    getAllVehicles: async (req,res) => {
        try {
            const {company_id} = req.query;
            const data = await getAllVehicles(req.odoo,company_id);
            res.status(200).json({data})
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: error.message });
        }
    },

    updateSequenceTransportLine: async (req,res) => {
        try {
            const {lines,transportId} = req.body;
            if(lines.length === 0) return res.status(400).json({msg:"Không có dữ liệu để cập nhật thứ tự!"});
            const allTransportLines = await getAllTransportLineJustStateAndSequence(req.odoo,transportId[0]);
            const getAllDoneCancelLines = [...allTransportLines].filter(item => item.state === "done" || item.state === "cancel");
            const stateLines = [...lines].map((item) => {
                return {id: item.id,}
            });

            const finalLines = [...getAllDoneCancelLines,...stateLines].map((line,index) => {
                return {
                    id: line.id,
                    sequence:index,
                }
            })
            for (const line of finalLines) {
                await updateSequenceAndStatusTransportLine(
                    req.odoo,
                    {sequence:line.sequence},
                    line.id
                );
            }
            res.status(200).json({msg:"Cập nhật thành công!"})
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: error.message });
        }
    },

    addVehicleOdometerValue: async (req,res) => {
        try {
            const {vehicle_id,odometer_value,date} = req.body;
            if(!odometer_value) return res.status(400).json({msg:"Giá trị đồng hồ xe không được để trống!"});
            if(!vehicle_id) return res.status(400).json({msg:"Vui lòng cung cấp tên phương tiện!"});
            
            const data = {
                value: odometer_value,
                date,
                vehicle_id,
            };
            await addVehicleOdometerValue(req.odoo,data);
            res.status(200).json({data:"Đã tạo thành công!"})
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: error.message });
        }
    },

    getVehicleOdometerLines: async (req,res) => {
        try {
            const {vehicle_id} = req.query;
            if(!vehicle_id) return res.status(400).json({msg:"Vui lòng cung cấp tên phương tiện!"});
            const data = await getAllOdometers(req.odoo,vehicle_id);
            res.status(200).json({data})
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: error.message });
        }
    }
}