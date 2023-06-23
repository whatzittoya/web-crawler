import { mock } from "jest-mock-extended";
import mockConsole from "jest-mock-console";

import { App, DEFAULT_URL, DEFAULT_LEVEL } from "./app";
import { UrlLoaderService } from "./services/url-loader.service";

process.argv = [];

describe("App", () => {
  const urlLoader = mock<UrlLoaderService>();
  const app = new App(urlLoader);

  it("should call url loader and return 0 when word not present", async () => {
    // given

    urlLoader.crawlWebsiteBFS.mockResolvedValue([
      {
        url: "https://www.sample.com",
        count: 0,
      },
    ]);
    mockConsole();

    // when
    await app.run();

    // then
    expect(urlLoader.crawlWebsiteBFS).toHaveBeenCalledTimes(1);
    expect(urlLoader.crawlWebsiteBFS).toHaveBeenCalledWith(
      DEFAULT_URL,
      parseInt(DEFAULT_LEVEL),
      'kayako'
    );
    expect(console.log).toHaveBeenLastCalledWith(
      "Found Total 0 of 'kayako' instances in All websites"
    );
  });

  it("should call url loader and return count when word present", async () => {
    // given
    urlLoader.crawlWebsiteBFS.mockResolvedValue([
      {
        url: "https://www.kayako.com",
        count: 2,
      },
    ]);
    mockConsole();

    // when
    await app.run();

    // then
    expect(urlLoader.crawlWebsiteBFS).toHaveBeenCalledTimes(1);
    expect(urlLoader.crawlWebsiteBFS).toHaveBeenCalledWith(
      "https://www.kayako.com/",
      2,
      'kayako'
    );
    expect(console.log).toHaveBeenLastCalledWith(
      "Found Total 2 of 'kayako' instances in All websites"
    );
  });

  it("should return default URL when no url passed", async () => {
    // when
    const appParameters = app.parseCli(["node", "main.js"]);

    // then
    expect(appParameters.url).toBe("https://www.kayako.com/");
  });

  it("should return specified URL", async () => {
    const url = "https://www.google.com/";
    expect(app.parseCli(["node", "main.js", "--url", url]).url).toBe(url);
    expect(app.parseCli(["node", "main.js", "-u", url]).url).toBe(url);
  });
});
