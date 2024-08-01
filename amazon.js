const fetch = require("node-fetch");
const { optionalRequire } = require("optional-require");
const config = optionalRequire("./config");
let canopyapiKey = config?.canopyapiKey || process.env.CANOPYAPI_KEY;
const pool = require("./db");

const fixPriceData = (data) => {
  if (data.price) {
    let currPriceData = data.price.value;
    if (typeof currPriceData === "string") {
      currPriceData = currPriceData.replace(/[^0-9.]/g, "");
    }
    data.price.value = `$${currPriceData}`;
    return data;
  } else {
    return "";
  }
};

const sortProducts = (list) => {
  for (const g of list) {
    g.productdata = fixPriceData(JSON.parse(g.productdata));
    g.displayImage = g.productdata.imageUrls ? g.productdata.imageUrls[0] : "";
  }
  const amazonProducts = list.filter(
    (product) => product.productdata.retailer === "amazon"
  );
  const gcProducts = list.filter(
    (product) => product.productdata.retailer === "gc"
  );

  const merged = [amazonProducts, gcProducts]
    .reduce((r, a) => (a.forEach((a, i) => (r[i] = r[i] || []).push(a)), r), [])
    .reduce((a, b) => a.concat(b));
  return merged;
};

const getGuitars = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM guitars", (error, results) => {
      if (error) {
        console.log("ERROR", error);
        reject(error);
      }
      if (results.rows) {
        const sortedProducts = sortProducts(results.rows);
        return resolve(sortedProducts);
      }
    });
  });
};

const insertGuitars = (productList) => {
  for (const productdata of productList) {
    pool.query(
      "INSERT INTO guitars (productdata) VALUES ($1)",
      [productdata],
      (error, results) => {
        if (error) {
          console.log("ERROR", error);
        }
        console.log("SUCCESSFUL AMAZON INSERT");
        return true;
      }
    );
  }
};

const query = `
query amazonProduct {
  amazonProductSearchResults(input: {searchTerm: "electric guitars"}) {
    productResults {
      results {
        price {
          value
        }
        imageUrls
        brand
        url
        title
        subtitle
        ratingsTotal
        rating
      }
    }
  }
}`;

const fetchGuitars = async () => {
  console.log(JSON.stringify({ query }));
  try {
    await fetch("https://graphql.canopyapi.co", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${canopyapiKey}`,
      },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.text())
      .then((res) => {
        const resJson = JSON.parse(res);
        console.log("****", resJson);
        const products = resJson.data.amazonProductSearchResults.productResults;
        const RetailerMap = products.results.map((p) => {
          return { ...p, retailer: "amazon" };
        });
        if (RetailerMap && Array.isArray(RetailerMap)) {
          insertGuitars(RetailerMap);
        }
      });
  } catch (error) {
    console.log("ERROR Fetching Amazon Data", error);
  }
};

module.exports = {
  fetchGuitars,
  getGuitars,
};
