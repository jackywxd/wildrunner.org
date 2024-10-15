import axios from "axios";
import * as cheerio from "cheerio";

async function crawlMeipian(
  url: string
): Promise<{ content: string; images: string[] }> {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Extract content
    const content = $(".mp-article-content-area").text().trim();
    console.log(content);
    // Extract image URLs
    const images: string[] = [];
    $(".mp-article-images img").each((index, element) => {
      const imgSrc = $(element).attr("src");
      console;
      if (imgSrc) {
        images.push(imgSrc);
      }
    });

    return { content, images };
  } catch (error) {
    console.error("Error crawling Meipian:", error);
    throw error;
  }
}

const url =
  "https://www.meipian.cn/56qiwr07?first_share_uid=2506412&first_share_to=copy_link&share_depth=1";

crawlMeipian(url)
  .then((data) => {
    console.log("Content:", data.content);
    console.log("Images:", data.images);
  })
  .catch((error) => {
    // Handle error
  });
