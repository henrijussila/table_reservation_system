const CryptoJS = require('crypto-js');

// Secret key for encryption (store securely, e.g., in environment variables)
const SECRET_KEY = 'your-very-secure-key';

// Encrypt function
function encrypt(data) {
    console.log("Encrypting...");
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
}

// Decrypt function
function decrypt(ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8); 

}

module.exports = { encrypt, decrypt };
