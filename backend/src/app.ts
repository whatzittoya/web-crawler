import { UrlLoaderService } from "./services/url-loader.service.js";
import { Command } from "commander";
import { generateReports, printReport } from "./services/reports.js";
import { url } from "inspector";
import { report } from "process";
interface AppParameters {
  url: string;
  level: string;
  word:string;
}

export const DEFAULT_URL = "https://www.kayako.com/";
export const DEFAULT_LEVEL = "2";
export const DEFAULT_WORD = "kayako";
//export const DEFAULT_URL = "http://localhost:8080/kayako.com/";

export class App {
  /* istanbul ignore next */
  constructor(
    private readonly urlLoader: UrlLoaderService,
    private readonly command = new Command()
  ) {}

  async run(): Promise<void> {
    const appParameters = this.parseCli();
    await this.process(appParameters);
  }

  async process(appParameters: AppParameters): Promise<void> {
    const startingUrl = appParameters.url; // Specify the starting URL
    const targetDomain = appParameters.url.split(".").slice(-2).join(".");
    const maxLevel = parseInt(appParameters.level);
    const word=appParameters.word
    const result = await this.urlLoader.crawlWebsiteBFS(startingUrl, maxLevel,word);
    const { resultSameSite, resultSameDomain, resultDiffSite } =
      generateReports(result, appParameters.url);

    let total = 0;
    total += printReport(resultSameSite, "Same Site",word);
    total += printReport(resultSameDomain, "Same Domain",word);
    total += printReport(resultDiffSite, "Different Site",word);

    console.log(`Found Total ${total} of '${word}' instances in All websites`);
  }

  parseCli(argv: readonly string[] = process.argv): AppParameters {
    this.command.requiredOption("-u, --url <url>", "URL to load", DEFAULT_URL);
    this.command.requiredOption("-w, --word <word>", "Word", DEFAULT_WORD);
    this.command.requiredOption("-l, --level <level>", "Level", DEFAULT_LEVEL);

    this.command.parse(argv);
    const options = this.command.opts();

    return { url: options.url, level: options.level,word:options.word };
  }
}
