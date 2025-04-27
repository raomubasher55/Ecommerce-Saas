const crypto = require("crypto");

const algorithm = "aes-256-cbc";
const secretKey = crypto.createHash("sha256").update(String(process.env.JWT_SECRET)).digest("hex"); // Ensure 32-byte key
const ivLength = 16; // AES block size

// 🔐 Encrypt Function
exports.encryptData = (text) => {
    const iv = crypto.randomBytes(ivLength); // Generate a unique IV for each encryption
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, "hex"), iv);
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return `${iv.toString("hex")}:${encrypted}`; // Store IV along with encrypted data
};

// 🔓 Decrypt Function
exports.decryptData = (text) => {
    try {
        const [ivHex, encryptedText] = text.split(":");
        if (!ivHex || !encryptedText) throw new Error("Invalid encrypted data format");

        const iv = Buffer.from(ivHex, "hex"); // Extract IV
        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, "hex"), iv);
        
        let decrypted = decipher.update(encryptedText, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (error) {
        console.error("Decryption error:", error.message);
        return null; // Return null if decryption fails
    }
};
