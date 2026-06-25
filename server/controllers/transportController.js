import { get } from "mongoose";
import {
  getAllActiveTransport,
  getAllReadyTransport,
  getSeaDriver,
  getAllTransportLine,
  getAllMyTransports,
  getAllSeaDriver,
  getAllVehicles,
  checkCurrentTransportLineIsDone,
  checkCurrentTransportLineIsReady,
  getAllTransportLineJustStateAndSequence,
  getAllOdometers,
  getAllWarningReminder,
  getAllReminders,
  getFuelLogList,
  getTransportLineImages,
  getPickingByQR,
  getTransportWarehouses,
  getLocationWarehouses,
  getTransportById,
  getTransportLineByTransportAndPicking,
  checkActiveTransportLineForPicking,
} from "../utils/getOdooUserData.js";
import {
  updateActualEndDate,
  doneTransportLine,
  cancelTransportLine,
  updateSequenceAndStatusTransportLine,
  addVehicleOdometerValue,
  markAsDoneReminderLine,
  addVehicleFuelLogValue,
  deleteVehicleFuelLogValue,
  createTransportLineImage,
  startTransport,
  addPickingToTransport,
} from "../utils/updateOdooUserData.js";

export const transportCtrl = {
  getActiveTransport: async (req, res) => {
    try {
      const { id, company_id, history } = req.query;
      let data = [];
      if (history) {
        data = await getAllMyTransports(req.odoo, company_id);
      } else {
        data = await getAllActiveTransport(req.odoo, company_id);
      }
      const myActiveTransport = data.filter((item) => item.sea_driver_id.includes(parseInt(id)));
      res.status(200).json({ data: myActiveTransport });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
                                                                                                                                                                                                                                                                                                                          
  },

  getReadyTransport: async (req, res) => {
    try {
      const { id, company_id } = req.query;
      const data = await getAllReadyTransport(req.odoo, company_id);
      let myReadyTransport = data.filter((item) => item.sea_driver_id.includes(parseInt(id)));
      myReadyTransport.sort((a, b) => a.id - b.id);
      res.status(200).json({ data: myReadyTransport });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },

  getActiveTransportLine: async (req, res) => {
    try {
      const { id, getAll } = req.query;
      const data = await getAllTransportLine(req.odoo, id, getAll);
      res.status(200).json({ data });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },

  getSeaDriver: async (req, res) => {
    try {
      const { id, company_id } = req.query;
      if (!id) return res.status(400).json({ msg: "Tài xế chưa được cấu hình trong hệ thống!" });
      const data = await getSeaDriver(req.odoo, id, company_id);
      res.status(200).json({ data });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },

  getAllSeaDriver: async (req, res) => {
    try {
      const { company_id } = req.query;
      const data = await getAllSeaDriver(req.odoo, company_id);
      res.status(200).json({ data });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },

  handleDoneTransportLine: async (req, res) => {
    try {
      const { id, date_end, images } = req.body;
      const updateData = { date_end_actual: date_end };
      const result = await checkCurrentTransportLineIsDone(req.odoo, id);
      if (result.length > 0) return res.status(400).json({ msg: "Dữ liệu đơn hàng này đã có ai đó tác động. Vui lòng tải lại trang!" });
      await updateActualEndDate(req.odoo, updateData, id);

      if (images && images.length > 0) {
        for (const img of images) {
          await createTransportLineImage(req.odoo, {
            transport_line_id: parseInt(id),
            image_url: img
          });
        }
      }

      await doneTransportLine(req.odoo, id);
      res.status(200).json({ data: "Cập nhật thành công!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },

  handleUpdateAddressEnd: async (req, res) => {
    try {
      const { id, address_end } = req.body;
      if (!id) return res.status(400).json({ msg: "Vui lòng cung cấp ID đơn hàng!" });
      if (!address_end || !address_end.trim()) return res.status(400).json({ msg: "Vui lòng nhập địa chỉ đến!" });
      await updateActualEndDate(req.odoo, { address_end: address_end.trim() }, id);
      res.status(200).json({ msg: "Sửa địa chỉ đến thành công!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },

  handleUpdateAddressStart: async (req, res) => {
    try {
      const { id, address_start } = req.body;
      if (!id) return res.status(400).json({ msg: "Vui lòng cung cấp ID đơn hàng!" });
      if (!address_start || !address_start.trim()) return res.status(400).json({ msg: "Vui lòng nhập địa chỉ đi!" });
      await updateActualEndDate(req.odoo, { address_start: address_start.trim() }, id);
      res.status(200).json({ msg: "Sửa địa chỉ đi thành công!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },

  handleCancelTransportLine: async (req, res) => {
    try {
      const { id } = req.body;
      const result = await checkCurrentTransportLineIsReady(req.odoo, id);
      if (result.length > 0) return res.status(400).json({ msg: "Dữ liệu đơn hàng này đã có ai đó tác động. Vui lòng tải lại trang!" });
      await cancelTransportLine(req.odoo, id);
      res.status(200).json({ data: "Cập nhật thành công!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },

  handleStartTransport: async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ msg: "Vui lòng cung cấp ID đơn hàng!" });
      await startTransport(req.odoo, id);
      res.status(200).json({ data: "Bắt đầu giao hàng thành công!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },

  handleAddPickingByQR: async (req, res) => {
    try {
      const { qr_content, transport_id } = req.body;
      const company_id = req.user[0].company_id[0];

      // Tách nội dung QR theo dấu phẩy để hỗ trợ nhiều mã stock picking
      const pickingNames = qr_content
        .split("|")
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

      if (pickingNames.length === 0) {
        return res.status(400).json({ msg: "Nội dung QR không hợp lệ." });
      }

      // Đọc transport's warehouse_id (chỉ cần lấy 1 lần)
      const transport = await getTransportWarehouses(req.odoo, transport_id);
      if (!transport || transport.length === 0) {
        return res.status(400).json({ msg: "Không tìm thấy chuyến xe hiện tại." });
      }
      const warehouseIds = transport[0].warehouse_id;

      const successList = [];
      const errorList = [];

      for (const pickingName of pickingNames) {
        try {
          // 1. Tìm stock.picking
          const pickings = await getPickingByQR(req.odoo, pickingName, company_id);
          if (!pickings || pickings.length === 0) {
            errorList.push(`${pickingName}: Không tìm thấy hoặc không hợp lệ`);
            continue;
          }
          const picking = pickings[0];

          // 2. Kiểm tra đã có trong chuyến xe chưa
          const activeLines = await checkActiveTransportLineForPicking(req.odoo, picking.id, transport_id);
          if (activeLines && activeLines.length > 0) {
            errorList.push(`${pickingName}: Đã có trong chuyến xe`);
            continue;
          }

          // 3. Kiểm tra kho
          const locationIds = [];
          if (picking.location_id) locationIds.push(picking.location_id[0]);
          if (picking.location_dest_id) locationIds.push(picking.location_dest_id[0]);

          let foundWarehouse = false;
          if (locationIds.length > 0) {
            const locations = await getLocationWarehouses(req.odoo, locationIds);
            for (const loc of locations) {
              if (loc.warehouse_id && loc.warehouse_id[0]) {
                if (warehouseIds.includes(loc.warehouse_id[0])) {
                  foundWarehouse = true;
                  break;
                }
              }
            }
          }

          if (!foundWarehouse) {
            errorList.push(`${pickingName}: Kho không nằm trong danh sách kho của chuyến xe`);
            continue;
          }

          // 4. Thêm picking vào picking_ids của transport
          // Lấy danh sách các transport line hiện tại (bao gồm cả cancel)
          const tLinesAll = await getAllTransportLine(req.odoo, transport_id, true);
          let activePickings = [];
          if (tLinesAll && tLinesAll.length > 0) {
            // Chỉ lấy picking_id của các line KHÔNG bị hủy.
            // Tránh truyền lại picking_id đã hủy khiến Odoo tự động tạo lại line cho chúng.
            activePickings = tLinesAll
              .filter(line => line.state !== 'cancel' && line.picking_id)
              .map(line => line.picking_id[0]);
          }
          activePickings = activePickings.filter(id => id !== picking.id);
          activePickings.push(picking.id);
          await addPickingToTransport(req.odoo, transport_id, activePickings);

          // 5. Tìm sea.transport.line vừa được tạo và cập nhật date_end_expected
          const tLines = await getTransportLineByTransportAndPicking(req.odoo, transport_id, picking.id);
          if (tLines && tLines.length > 0) {
            const lineId = tLines[0].id;
            const expectedDate = new Date();
            expectedDate.setHours(expectedDate.getHours() + 12);

            // Chuyển sang chuỗi YYYY-MM-DD HH:mm:ss chuẩn UTC
            const dateStr = expectedDate.toISOString().replace('T', ' ').substring(0, 19);

            await updateActualEndDate(req.odoo, { date_end_expected: dateStr }, lineId);
          }

          successList.push(pickingName);
        } catch (innerError) {
          console.log(`Lỗi xử lý picking ${pickingName}:`, innerError);
          errorList.push(`${pickingName}: ${innerError.message}`);
        }
      }

      // Tổng hợp kết quả
      if (successList.length === 0 && errorList.length > 0) {
        return res.status(400).json({
          msg: `Không thêm được đơn hàng nào.\n${errorList.join("\n")}`,
        });
      }

      let msg = `Đã thêm thành công ${successList.length} đơn hàng.`;
      if (errorList.length > 0) {
        msg += `\nLỗi (${errorList.length}):\n${errorList.join("\n")}`;
      }

      res.status(200).json({ msg, successCount: successList.length, errorCount: errorList.length });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },

  getAllVehicles: async (req, res) => {
    try {
      const { company_id } = req.query;
      const data = await getAllVehicles(req.odoo, company_id);
      res.status(200).json({ data });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },

  getTransportById: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await getTransportById(req.odoo, id);
      if (data && data.length > 0) {
        res.status(200).json({ data: data[0] });
      } else {
        res.status(404).json({ msg: "Không tìm thấy chuyến xe" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },

  updateSequenceTransportLine: async (req, res) => {
    try {
      const { lines, transportId } = req.body;
      if (lines.length === 0) return res.status(400).json({ msg: "Không có dữ liệu để cập nhật thứ tự!" });
      const allTransportLines = await getAllTransportLineJustStateAndSequence(req.odoo, transportId[0]);
      const getAllDoneCancelLines = [...allTransportLines].filter((item) => item.state === "done" || item.state === "cancel");
      const stateLines = [...lines].map((item) => {
        return { id: item.id };
      });

      const finalLines = [...getAllDoneCancelLines, ...stateLines].map((line, index) => {
        return {
          id: line.id,
          sequence: index,
        };
      });
      for (const line of finalLines) {
        await updateSequenceAndStatusTransportLine(req.odoo, { sequence: line.sequence }, line.id);
      }
      res.status(200).json({ msg: "Cập nhật thành công!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },

  addVehicleOdometerValue: async (req, res) => {
    try {
      const { vehicle_id, odometer_value, date } = req.body;
      if (!odometer_value) return res.status(400).json({ msg: "Giá trị đồng hồ xe không được để trống!" });
      if (!vehicle_id) return res.status(400).json({ msg: "Vui lòng cung cấp tên phương tiện!" });

      const data = {
        odometer: odometer_value,
      };
      await addVehicleOdometerValue(req.odoo, data, vehicle_id);
      res.status(200).json({ data: "Đã tạo thành công!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },

  getVehicleOdometerLines: async (req, res) => {
    try {
      const { vehicle_id } = req.query;
      if (!vehicle_id) return res.status(400).json({ msg: "Vui lòng cung cấp tên phương tiện!" });
      const data = await getAllOdometers(req.odoo, vehicle_id);
      res.status(200).json({ data });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },

  getAllWarningReminder: async (req, res) => {
    try {
      const { company_id } = req.query;
      if (!company_id) return res.status(400).json({ msg: "Vui lòng cung cấp công ty!" });
      const data = await getAllWarningReminder(req.odoo, company_id);
      res.status(200).json({ data });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },

  getAllReminders: async (req, res) => {
    try {
      const { vehicle_id } = req.query;
      if (!vehicle_id) return res.status(400).json({ msg: "Vui lòng cung cấp phương tiện!" });
      const data = await getAllReminders(req.odoo, vehicle_id);
      res.status(200).json({ data });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },

  markAsDoneReminderLine: async (req, res) => {
    try {
      const { id } = req.query;
      await markAsDoneReminderLine(req.odoo, id);
      res.status(200).json({ msg: "Đã hoàn tất" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },

  getFuelLogList: async (req, res) => {
    try {
      const { vehicle_id } = req.query;
      if (!vehicle_id) return res.status(400).json({ msg: "Vui lòng cung cấp phương tiện!" });
      const data = await getFuelLogList(req.odoo, vehicle_id);
      res.status(200).json({ data });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },

  createFuelLogLine: async (req, res) => {
    try {
      const { vehicle_id, liter, odometer, is_full, amount } = req.body;
      if (!vehicle_id) return res.status(400).json({ msg: "Vui lòng cung cấp phương tiện!" });
      if (!liter) return res.status(400).json({ msg: "Vui lòng cung cấp số lít xăng đã đổ!" });
      if (!odometer) return res.status(400).json({ msg: "Vui lòng cung cấp số Km trên đồng hồ!" });
      if (!amount) return res.status(400).json({ msg: "Vui lòng cung cấp số tiền đã chi!" });

      await addVehicleFuelLogValue(req.odoo, {
        vehicle_id: parseInt(vehicle_id),
        liter: liter,
        odometer: odometer,
        is_full: is_full,
        amount: amount,
        price_per_liter: amount / liter,
      });
      res.status(200).json({ msg: "Đã tạo thành công!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },
  deleteFuelLogLine: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ msg: "Vui lòng cung cấp dòng cần xóa!" });
      await deleteVehicleFuelLogValue(req.odoo, id);
      res.status(200).json({ msg: "Đã xóa thành công!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },

  getTransportLineImages: async (req, res) => {
    try {
      const { transport_line_id } = req.query;
      if (!transport_line_id) return res.status(400).json({ msg: "Vui lòng cung cấp transport line!" });
      const data = await getTransportLineImages(req.odoo, transport_line_id);
      res.status(200).json({ data });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },
};
