const { encrypt, decrypt } = require('./utils/crypto');

const testData = { email: 'test@example.com', password: '123456' };

const encrypted = encrypt(testData);
console.log('Encrypted:', encrypted);

//console.log(encrypt(testData.email));

const decrypted = decrypt(encrypted);
console.log('Decrypted:', decrypted);