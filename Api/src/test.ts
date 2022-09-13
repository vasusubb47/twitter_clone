
const str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
const bufStr = Buffer.from(str);

console.log(bufStr.toString());
