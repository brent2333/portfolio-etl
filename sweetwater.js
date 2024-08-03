const cheerio = require("cheerio");
const axios = require("axios");
const htmlparser2 = require("htmlparser2");
const pool = require("./db");

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
          console.log("SUCCESSFUL SW INSERT");
          return resolve(true);
          // return true;
        }
      );
    }
  });
};

const fetchSweetwater = () => {
  const website = "https://www.sweetwater.com/c590--Solidbody_Guitars";

  try {
    axios(website, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
      },
    }).then((res) => {
      const data = res.data;
      const dom = htmlparser2.parseDocument(data);
      const $ = cheerio.load(dom);

      let content = [];

      $(".product-card", data).each(function () {
        const imgTag = $(this).find(".product-card__img").find("img");
        const image = imgTag["0"] ? imgTag["0"].attribs["data-ll-src"] : "";
        const aTag = $(this).find(".product-card__name").find("a")["0"];
        const link = aTag ? aTag.attribs.href : "";
        const url = link ? `https://www.sweetwater.com${link}` : "";
        const title = $(this)
          .find(".product-card__name")
          .find("span")
          .contents()
          .text();
        const value = $(this).find(".product-card__amount").contents().text();
        const ratingText = $(this).find(".rating__text").contents().text();
        const ratingString = ratingText
          .split("/")[0]
          .replace("Rated", "")
          .trim();
        const rating = ratingString ? parseInt(ratingString) : "";
        const ratingsTotalString = $(this)
          .find(".rating__count")
          .contents()
          .text()
          .replace(/[^\w\s]/gi, "");
        const ratingsTotal = ratingsTotalString
          ? parseInt(ratingsTotalString)
          : "";
        content.push({
          url,
          imageUrls: [image],
          title,
          price: { value },
          rating,
          ratingsTotal,
        });
      });
      const RetailerMap = content.map((p) => {
        return { ...p, retailer: "sweetwater" };
      });
      insertGuitars(RetailerMap.filter((cont) => cont.url));
    });
  } catch (error) {
    console.log(error, error.message);
  }
};

module.exports = {
  fetchSweetwater,
};
