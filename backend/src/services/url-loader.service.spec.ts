import { Browser, Page } from "puppeteer";
import { mock } from "jest-mock-extended";

import { UrlLoaderService } from "./url-loader.service";
import { generateReports } from "./reports";
const testUrl = "https://www.kayako.com/";

const pageMock = mock<Page>();
const mockBrowser = mock<Browser>();
mockBrowser.newPage.mockResolvedValue(pageMock);

jest.mock("puppeteer", () => ({
  launch: () => mockBrowser,
}));

const pageValue = "Hello World";
describe("UrlLoaderService", () => {
  it("should return singleton", async () => {
    // when
    const instance1 = await UrlLoaderService.getInstance();
    const instance2 = await UrlLoaderService.getInstance();

    // then
    expect(instance1).toBe(instance2);
  });

  it("should load website text and links", async () => {
    // given
    pageMock.evaluate.mockResolvedValueOnce(pageValue);
    pageMock.evaluate.mockResolvedValueOnce(["test.html"]);
    // when

    const instance = await UrlLoaderService.getInstance();
    const stringPromise = instance.crawlWebsiteBFS(testUrl, 0,'kayako');
    // then
    await expect(stringPromise).resolves.toEqual([
      {
        url: "https://www.kayako.com/",
        count: 0,
      },
    ]);
    const checkHash = instance.checkHashTag(testUrl + "#hello");
    // then
    expect(checkHash).toEqual(testUrl);

    const result = [{ url: "google.com", count: 1 }];
    const report = generateReports(result, "google.com");
    const result2 = [{ url: "sub.google.com", count: 1 }];

    const report2 = generateReports(result2, "google.com");

    expect(report).toEqual({
      resultDiffSite: [],
      resultSameDomain: [],
      resultSameSite: [{ count: 1, url: "google.com" }],
    });

    expect(report2).toEqual({
      resultDiffSite: [],
      resultSameDomain: [{ count: 1, url: "sub.google.com" }],
      resultSameSite: [],
    });

    const visitedUrls: Set<string> = new Set();
    const queue: { url: string; level: number; parent: string }[] = [];
    const urlLevels: Map<string, number> = new Map();
    visitedUrls.add("google.com");
    const checkHref = instance.checkUrl(
      "google.com",
      visitedUrls,
      queue,
      urlLevels,
      0,
      "google.com"
    );
    expect(checkHref).toEqual(false);

    expect(mockBrowser.newPage).toHaveBeenCalledTimes(1);
    expect(pageMock.goto).toHaveBeenCalledTimes(1);
    expect(pageMock.goto).toHaveBeenCalledWith(testUrl);
  });
});
