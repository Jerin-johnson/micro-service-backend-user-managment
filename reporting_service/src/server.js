import app from "./app.js";
import { connectDB } from "./config/mongoose.connect.js";
import { consumeUserEvents } from "./consumers/user.consumer.js";

connectDB().then(() => {
  app.listen(5003, () => {
    console.log("Reporting Service running on 5003");
  });
});
