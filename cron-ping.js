const { fetchGuitars } = require("./amazon");
const { processGcJson } = require("./gc-fromjson");
const cron = require("node-cron");
const { fetchSweetwater } = require("./sweetwater");

cron.schedule("* * * * *", async function () {
  console.log("running task every 24 hours");
  await processGcJson();
  await fetchSweetwater();
  fetchGuitars();
});
