const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const http = require("http");
const cards = require("./model/cards");
const setCards = require("./model/setCards");
const destroCards = require("./model/destroyCards");

const app = express();
const port = 3003;

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  ws.on("message", (message) => {
    console.log("Received message:", message);

    try {
      const parsedMessage = JSON.parse(message);
      if (parsedMessage.type === "ping") {
        console.log("Received ping from client");
        ws.send(JSON.stringify({ type: "pong" }));
      }
    } catch (error) {
      console.error("Invalid message format:", error);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/allCards", async (req, res) => {
  const allCards = await cards();
  return res.send(allCards);
});
app.delete("/", async (req, res) => {
  await destroCards();
  const allCards = await cards();
  return res.send(allCards);
});

app.post("/", async (req, res) => {
  // console.log("Received data:", req.body.data);

  try {
    if (req.body.data.length > 0) {
      const timing = new Date().getTime();
      await setCards(req.body.data, timing);
    }

    const allCards = await cards();

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({ message: "New data received", data: allCards })
        );
      }
    });

    res.send("Data processed successfully!");
  } catch (error) {
    console.error("Error processing data:", error);
    res.status(500).send("Internal Server Error");
  }
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
