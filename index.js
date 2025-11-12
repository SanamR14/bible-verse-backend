const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Swagger
const swaggerDocument = YAML.load(path.join(__dirname, "openapi.yaml"));

// Routes
const plansRoute = require("./routes/plans");
const verseRoute = require("./routes/verse");
const userRoute = require("./routes/user");
const homeRoute = require("./routes/home");
const prayerRequestRoute = require("./routes/prayer");
const devotions = require("./routes/devotions");
const savedRoutes = require("./routes/saved");
const testimonyRoutes = require("./routes/testimony");
const quizRoutes = require("./routes/quiz");
const eventsRoutes = require("./routes/events");
const rotaRoutes = require("./routes/rota");
const folderRoutes = require("./routes/folders");

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/home", homeRoute);
app.use("/bibleverse", verseRoute);
app.use("/auth", userRoute);
app.use("/plans", plansRoute);
app.use("/prayer-requests", prayerRequestRoute);
app.use("/devotions", devotions);
app.use("/saved", savedRoutes);
app.use("/testimonies", testimonyRoutes);
app.use("/quiz", quizRoutes);
app.use("/churchevent", eventsRoutes);
app.use("/churchrota", rotaRoutes);
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads")); // serve files publicly
app.use("/folders", folderRoutes);
// Socket setup
const http = require("http");
const { Server } = require("socket.io");
const quizSocket = require("./sockets/quizSocket");

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

quizSocket(io); // <-- mount socket events

// Start server
server.listen(port, () => {
  console.log(`Server running at ${port}`);
});

// Default route
app.get("/", (req, res) => {
  res.send("API is running 🚀 - Visit /docs for API documentation");
});

module.exports = app;
