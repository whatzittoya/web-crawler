export function generateReports(
  result: { url: string; count: number }[],
  url: string
) {
  const resultSameSite: { url: string; count: number }[] = [];
  const resultSameDomain: { url: string; count: number }[] = [];
  const resultDiffSite: { url: string; count: number }[] = [];
  const u = url
    .replace("http://", "")
    .replace("https://", "")
    .replace("www.", "");
  const targetDomain = u.split("/")[0];
  result?.forEach((elem) => {
    const url_parse = elem.url
      .replace("http://", "")
      .replace("https://", "")
      .replace("www.", "");

    if (url_parse.startsWith(targetDomain)) {
      resultSameSite.push(elem);
    } else if (url_parse.match(targetDomain)) {
      resultSameDomain.push(elem);
    } else {
      resultDiffSite.push(elem);
    }
  });
  return { resultSameSite, resultSameDomain, resultDiffSite };
}

export function printReport(
  results: { url: string; count: number }[],
  name: String,
  word:String
) {
  let total = 0;
  console.log(`------${name}------`);

  results.forEach((element) => {
    console.log(element.url);
    total += element.count;
  });
  console.log(`Found ${total} instances of '${word}' in the ${name}`);
  console.log("");
  return total;
}
