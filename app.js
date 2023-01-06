const puppeteer = require("puppeteer");
const fs = require("fs/promises");
const { constants } = require("buffer");
const { log } = require("console");

let companiesData = [];

const scrapData = async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(`https://stackoverflow.com/jobs/companies`);

    // let checkNext = await page.$eval(".s-pagination > a:last-child > span", (el) => el.textContent);

    while (true) {
      //getting data from a page
      const companyNames = await getCompanyNames(page);
      const companyDescriptions = await getCompanyDescription(page);
      const companyLocations = await getCompanyLocation(page);
      const companyDomains = await getCompanyDomain(page);
      const companyTags = await getCompanyTags(page);

      //add page data to storage
      setCompaniesData(companyNames, companyDescriptions, companyLocations, companyDomains, companyTags);

      //checking if next page exists
      let checkNext = await page.$eval(".s-pagination > a:last-child > span", (el) => el.textContent);
      if (checkNext !== "next") {
        break;
      }

      //url for next page
      const newPage = await page.$eval(".s-pagination > a:last-child", (el) => el.getAttribute("href"));
      console.log(newPage);

      //load next page
      await page.goto(`https://stackoverflow.com${newPage}`);
    }
    await browser.close();
  } catch (error) {
    console.error(error);
  }
};

const getCompanyNames = async (page) => {
  return await page.$$eval(".company-list > div > div:nth-child(3) > div:last-child > h2 > a", (companies) => {
    return companies.map((company) => company.textContent);
  });
};
const getCompanyDescription = async (page) => {
  return await page.$$eval(".company-list > div > div:nth-child(3) > div:last-child > p", (companies) => {
    return companies.map((company) => company.textContent);
  });
};
const getCompanyLocation = async (page) => {
  return await page.$$eval(
    ".company-list > div > div:nth-child(3) > div:last-child > div:nth-child(2) > div:first-child",
    (companies) => {
      return companies.map((company) => company.textContent);
    }
  );
};
const getCompanyDomain = async (page) => {
  return await page.$$eval(
    ".company-list > div > div:nth-child(3) > div:last-child > div:nth-child(2) > div:last-child",
    (companies) => {
      return companies.map((company) => company.textContent);
    }
  );
};
const getCompanyTags = async (page) => {
  return await page.$$eval(
    ".company-list > div > div:nth-child(3) > div:last-child > div:last-child > a",
    (companies) => {
      return companies.map((company) => company.innerText);
    }
  );
};

const setCompaniesData = (companyNames, companyDescriptions, companyLocations, companyDomains, companyTags) => {
  for (let i = 0; i < companyNames.length; i++) {
    let companyDetail = {
      Name_of_org: companyNames[i],
      Description: companyDescriptions[i],
      Location: companyLocations[i],
      Domain: companyDomains[i],
      Tags: [companyTags[3 * i], companyTags[3 * i + 1], companyTags[3 * i + 2]],
    };
    companiesData.push(companyDetail);
  }
};

scrapData().then(() => {
  console.log("Company_data", companiesData, companiesData.length);
});
