import Odoo from "odoo-xmlrpc";
import {getUserData,getUserCompanies} from "../utils/getOdooUserData.js"
import {hangeChangeUserCompany} from "../utils/updateOdooUserData.js"
import {attachCookiesToResponse} from '../utils/jwtAttachmentAndCreation.js'
import {encrypt,decrypt } from "../utils/EnCryptAndDeCrypt.js";
import {isTokenValid} from '../utils/isTokenValid.js';
import Users from "../models/user.js";

export const authCtrl = {
    login: async (req,res) => {
        try {
            const { username, password } = req.body;
            // Check if providing all information
            if (!username || !password) return res.status(400).json({ msg: "Vui lòng cung cấp đầy đủ thông tin" });

            // Create a new Odoo instance
            const odoo = new Odoo({ url: process.env.ODOO_URL, db: process.env.ODOO_DB, username: username, password: password});
            // Connect to Odoo
            const uid = new Promise((resolve, reject) => {
                odoo.connect((err, uid) => {
                if (err) return res.status(400).json({ msg: 'Kết nối thất bại! Tên đăng nhập hoặc mật khẩu không đúng' });
                return resolve(uid)
                });
            })

            const isConnected = await Promise.all([uid]);
            if (isConnected.includes(undefined)) return res.status(400).json({ msg: 'Kết nối với Odoo gặp trục trặc. Xin liên hệ với nhà phát triển'});

            const user = await getUserData(odoo, isConnected[0]);
            if (!user) return res.status(400).json({ msg: 'Dữ liệu người dùng không lấy được. Xin liên hệ với nhà phát triển' });
            
            // Tạo hoặc cập nhật dữ liệu user vào MongoDB
            const encryptedPassword = encrypt(password);

            const mongoUser = await Users.findOne({username});
            if(mongoUser){
                await Users.findOneAndUpdate({username},{password:encryptedPassword})
            }else{
                await Users.create({
                    username,password:encryptedPassword
                })
            }

            attachCookiesToResponse({res,data:{username}})
            res.status(200).json({msg:"Đăng nhập thành công!",data:user})
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: error.message });
        }
    },

    getUserCompanies: async (req, res) => {
        try {
            const userCompanies = await getUserCompanies(req.odoo,req.user)
            res.status(200).json({data:userCompanies});
        } catch (error) {
            res.status(500).json({ msg: error.message });   
        }
    },

    changeOdooCompany: async (req, res) => {
        try {
            const { companyId } = req.body;
            const result = await hangeChangeUserCompany(req.odoo,companyId,req?.user[0]?.id);
            return res.status(200).json({data:result});
        } catch (error) {
          res.status(500).json({ msg: error.message });
        }
    },

    checkAuth: async (req,res) => {
        try {
            const {stto} = req.cookies;
            if(!stto) return res.status(200).json({msg:"Cần phải đăng nhập để tiếp tục"})
            const payload = isTokenValid(stto);

            if(!payload) return res.status(403).json({msg:'Phiên làm việc không hợp lệ! Vui lòng đăng nhập lại'})
            
            // Tạo hoặc cập nhật dữ liệu user vào MongoDB
            
            const mongoUser = await Users.findOne({username:payload?.username});
            if(mongoUser && mongoUser.password){
                const decryptedPassword = decrypt(mongoUser?.password);
                const odoo = new Odoo({ url: process.env.ODOO_URL, db: process.env.ODOO_DB, username: payload.username, password: decryptedPassword});
                const uid = new Promise((resolve, reject) => {
                    odoo.connect((err, uid) => {
                    if (err) return res.status(400).json({ msg: 'Kết nối thất bại! Tên đăng nhập hoặc mật khẩu không đúng' });
                    return resolve(uid)
                    });
                })
                
                const isConnected = await Promise.all([uid])
                if (isConnected.includes(undefined)) return res.status(400).json({ msg: 'Kết nối với Odoo gặp trục trặc. Xin liên hệ với nhà phát triển'});
                const user = await getUserData(odoo, isConnected[0]);
                if (!user) return res.status(400).json({ msg: 'Dữ liệu người dùng không lấy được. Xin liên hệ với nhà phát triển' });

                res.status(200).json({data:user})
            } else{
                res.status(400).json({msg: 'Dữ liệu người dùng không tìm thấy'}); 
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: error.message });
        }
    },

    getUserData: async (req,res)=>{
        try {
            res.status(200).json({data:req.user[0]})
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: error.message });
        }
    },

    logout: async (req,res) => {
        try {
            res.clearCookie('stto')
        
            res.status(200).json({ msg: 'user logged out!' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: error.message });
        }
    }
}