const cheerio = require("cheerio");
const axios = require("axios");
const htmlparser2 = require("htmlparser2");

const website = "https://www.guitarcenter.com/Electric-Guitars.gc?icid=LP5276";

try {
  axios(website).then((res) => {
    const data = res.data;
    const dom = htmlparser2.parseDocument(data);
    const $ = cheerio.load(dom);

    let content = [];

    $(".product-item", data).each(function () {
      const divs = $(this).find(".plp-product-gallery").find(".swiper");
      //   const imgDiv = divs[1].attribs;
      //   const image = images[0].attribs.src;
      const href = $(this).find("a").attr("href");
      const url = `https://www.guitarcenter.com${href}`;
      const title = $(this).find("h3").text();
      const price = $(this).find(".price").find("span").text();

      content.push({
        divs,
        url,
        title,
        price,
      });
      //   content.filter((item) => )
      //   app.get("/", (req, res) => {
      //     res.json(content);
      //   });
    });
  });
} catch (error) {
  console.log(error, error.message);
}
