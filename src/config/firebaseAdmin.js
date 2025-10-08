import admin from "firebase-admin";

const saB64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
if (!saB64) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_B64");

const sa = JSON.parse(Buffer.from(saB64, "base64").toString("utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(sa),
  });
}

export default admin;