import crypto from "crypto";

export const encrypt = (text) => {
    const secretKey = crypto.createHash('sha256')
    .update(process.env.CRYPTO_KEY)                       
    .digest()                                
    .slice(0, 32); 

    const iv = crypto.createHash('sha256')
    .update(process.env.IV)                       
    .digest()                                
    .slice(0, 16); 

    const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
}

export function decrypt(encrypted) {
    const secretKey = crypto.createHash('sha256')
    .update(process.env.CRYPTO_KEY)                       
    .digest()                                
    .slice(0, 32); 
    
    const iv = crypto.createHash('sha256')
    .update(process.env.IV)                       
    .digest()                                
    .slice(0, 16); 
    
    const decipher = crypto.createDecipheriv("aes-256-cbc", secretKey, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

