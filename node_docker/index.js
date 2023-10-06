const express = require("express")
const mongoose = require("mongoose")
const session = require("express-session")
const redis = require("redis")
var cors = require('cors');
let RedisStore = require("connect-redis").default
const { MONGO_USER, MONGO_IP, MONGO_PORT, REDIS_IP, REDIS_PORT, SESSION_SECRET, MONGO_PASSWORD} = require("./config/config");
let redisClient = redis.createClient({
    url: 'redis://redis:6379',
    host: REDIS_IP, 
    port: REDIS_PORT
})
const app = express()
app.use(cors())
const postRouter = require("./routes/postRoutes")
const mongourl = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`
const authRouter = require("./routes/authRoutes")
const connectWithRetry = () => {
    mongoose.connect(mongourl)
    .then(() => console.log("success"))
    .catch((e) => {
        console.log("error" + e);
        setTimeout(connectWithRetry, 5000)
        
});

}
(async () => {
    await redisClient.connect();
})();

redisClient.on('connect', () => console.log('::> Redis Client Connected'));
redisClient.on('error', (err) => console.log('<:: Redis Client Error', err));

connectWithRetry();
app.enable("trust proxy")
app.use(express.json())
app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: SESSION_SECRET,
    cookie: {
        secure: false,
        resave: false,
        httpOnly: true,
        saveUnintialized: false,
        maxAge: 3000000
    }
}))
app.get("/api/v1", (req, res) => {
    res.send("<h2>abc <h2>");
    console.log("hehe")
})

app.use("/api/v1/posts", postRouter)

app.use("/api/v1/users", authRouter)

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}`))
