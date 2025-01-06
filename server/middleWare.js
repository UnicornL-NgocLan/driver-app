import Odoo from "odoo-xmlrpc";
import {isTokenValid} from './utils/isTokenValid.js'

import Users from "./models/user.js";
import { decrypt } from "./utils/EnCryptAndDeCrypt.js";
import {getUserData} from "./utils/getOdooUserData.js";

export const authenticateUser = async (req, res, next) => {
  try {
    const {stto} = req.cookies;
    if(!stto){
      return res.status(403).json({msg:'Phiên làm việc không hợp lệ! Vui lòng đăng nhập lại'})}
    
    const payload = isTokenValid(stto);

    if(!payload){
      res.clearCookie('stto');
      return res.status(403).json({msg:'Phiên làm việc không hợp lệ! Vui lòng đăng nhập lại'})}
    
    // Tạo hoặc cập nhật dữ liệu user vào MongoDB
    
    const mongoUser = await Users.findOne({username:payload?.username});
    if(mongoUser){
      const decryptedPassword = decrypt(mongoUser?.password);
      const odoo = new Odoo({ url: process.env.ODOO_URL, db: process.env.ODOO_DB, username: payload.username, password: decryptedPassword});
      const uid = new Promise((resolve, reject) => {
          odoo.connect((err, uid) => {
          if (err) return res.status(403).json({ msg: 'Kết nối thất bại! Tên đăng nhập hoặc mật khẩu không đúng' });
          return resolve(uid)
          });
      })
      
      const isConnected = await Promise.all([uid])
      if (isConnected.includes(undefined)) return res.status(403).json({ msg: 'Kết nối với Odoo gặp trục trặc. Xin liên hệ với nhà phát triển'});
      const user = await getUserData(odoo, isConnected[0]);
      if (!user) return res.status(403).json({ msg: 'Dữ liệu người dùng không lấy được. Xin liên hệ với nhà phát triển' });
      req.user = user;
      req.odoo = odoo;
      return next();
    }else{
      res.status(403).json({msg: 'Dữ liệu người dùng không tìm thấy'}); 
    }
  }
   catch (err) {
    res.status(500).json({msg: err.message});
  }
}