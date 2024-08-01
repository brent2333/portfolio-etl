const pool = require("./db");
const gcData = require("./guitarcenter-nextdata.json");

const getLargerImg = (imageUrl) => {
  return imageUrl.replace("120x120", "640x640");
};

const insertGuitars = (productList) => {
  return new Promise((resolve, reject) => {
    for (const productdata of productList) {
      pool.query(
        "INSERT INTO guitars (productdata) VALUES ($1)",
        [productdata],
        (error, results) => {
          if (error) {
            console.log("ERROR", error);
          }
          console.log("SUCCESSFUL GC INSERT");
          return resolve(true);
          // return true;
        }
      );
    }
  });
};

const processGcJson = async () => {
  console.log("PROCESS GC JSON");
  pool.query("TRUNCATE TABLE guitars", (error, results) => {
    if (error) {
      console.log("ERROR", error);
      reject(error);
    }
  });
  console.log("************** TABLE TRUNCATED *****************");
  const gcMap = gcData.products.map((gc) => {
    gcRating = gc.rating / 2;
    return {
      price: { value: gc.price },
      url: `https://www.guitarcenter.com${gc.linkUrl}`,
      title: gc.displayName,
      imageUrls: [getLargerImg(gc.thumb)],
      brand: gc.linkUrl.split("/")[0],
      ratingsTotal: gc.reviews,
      rating: gcRating,
      retailer: "gc",
    };
  });
  if (gcMap && Array.isArray(gcMap)) {
    insertGuitars(gcMap);
  }
};

module.exports = {
  processGcJson,
};
