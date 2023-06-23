import puppeteer, { Browser } from "puppeteer";

import {
  domExtractHyperlinks,
  domExtractText,
  pageEval,
} from "./page-eval.service.js";

export interface TextAndLinks {
  text: string;
  links: string[];
}

export class UrlLoaderService {
  private static instance: UrlLoaderService;

  static async getInstance(): Promise<UrlLoaderService> {
    if (UrlLoaderService.instance === undefined) {
      const browser = await puppeteer.launch();
      UrlLoaderService.instance = new UrlLoaderService(browser);
    }
    return UrlLoaderService.instance;
  }

  private constructor(private readonly browser: Browser) {}

  async crawlWebsiteBFS(
    startingUrl: string,
    maxLevel: number,
    word: string
  ): Promise<{ url: string; count: number }[]> {
    const visitedUrls: Set<string> = new Set();
    const queue: { url: string; level: number; parent: string }[] = [];
    const result: { url: string; count: number }[] = [];
    const urlLevels: Map<string, number> = new Map();

    // Add the starting URL to the queue with level 0
    queue.push({ url: startingUrl, level: 0, parent: "" });
    urlLevels.set(startingUrl, 0);
    while (queue.length > 0) {
      const { url, level, parent } = queue.shift()!;

      if (visitedUrls.has(url) || level > maxLevel) {
        continue; // Skip if the URL has already been visited or reached the maximum level
      }

      visitedUrls.add(url);

      try {
        const page = await this.browser.newPage();
        await page.goto(url);
        await page.waitForSelector("body");
        const [text, links] = await Promise.all([
          await pageEval(page, domExtractText),
          await pageEval(page, domExtractHyperlinks),
        ]);
        //Extract all anchor tags and enqueue new URLs with the next level
        links.forEach((element) => {
          const href = this.checkHashTag(element);
          this.checkUrl(href, visitedUrls, queue, urlLevels, level, url);
          // if (checkedUrl) {
          //   queue.push({ url: href, level: level + 1, parent: url });
          //   urlLevels.set(href, level + 1);
          // }
        });
        const re = new RegExp(word, 'gi')

        const count: number = (
          text?.toLocaleLowerCase().match(re) ?? []
        ).length;
        result.push({ url, count });
      } catch (error) {
        //console.error(`Error crawling URL: ${url}`, error);
      }
    }

    return result;
  }
  checkHashTag(element: string): string {
    if (element.includes("#")) {
      const arr_el = element.split("#");
      element = arr_el[0];
    }
    return element;
  }
  checkUrl(
    href: string,
    visitedUrls: Set<string>,
    queue: { url: string; level: number; parent: string }[],
    urlLevels: Map<string, number>,
    level: number,
    url: string
  ) {
    if (href && !visitedUrls.has(href)) {
      queue.push({ url: href, level: level + 1, parent: url });
      urlLevels.set(href, level + 1);
      return true;
    }
    return false;
  }
}
