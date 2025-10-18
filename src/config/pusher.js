import Pusher from "pusher";
import dotenv from "dotenv";

dotenv.config();

// ✅ Debugging: check environment variables
// console.log("PUSHER_APP_ID:", process.env.PUSHER_APP_ID);
// console.log("PUSHER_KEY:", process.env.PUSHER_KEY);
// console.log("PUSHER_SECRET:", process.env.PUSHER_SECRET);
// console.log("PUSHER_CLUSTER:", process.env.PUSHER_CLUSTER);
// console.log("PUSHER_USE_TLS:", process.env.PUSHER_USE_TLS);

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: process.env.PUSHER_USE_TLS === "true",
});

export default pusher;
