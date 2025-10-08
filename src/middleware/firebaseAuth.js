import admin from "../config/firebaseAdmin.js";


export const verifyFirebaseIdToken = async (req, res, next) => {
  try {
    // 1) Authorization: Bearer <idToken> বা req.body.idToken - যেটা ঠিক করো
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : (req.body?.idToken || req.query?.idToken);

    if (!token) return res.status(401).json({ ok: false, error: "ID token missing" });

    // 2) Verify with firebase-admin
    const decoded = await admin.auth().verifyIdToken(token);

    // decoded: { uid, email, name, picture, auth_time, ... }
    req.firebaseUser = decoded;
    next();
  } catch (e) {
    console.error("verifyFirebaseIdToken error:", e.message);
    res.status(401).json({ ok: false, error: "Invalid ID token" });
  }
};