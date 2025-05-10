const startTime = Date.now();

const axios = require("axios");
const fs = require("fs");

async function getCarsData() {
    axios
        .get("https://lm-models.s3.ir-thr-at1.arvanstorage.ir/cars.json")
        .then((res) => {
            console.log(res.data);
        })
        .catch((error) => {
            console.log(error.message);
        });
}

async function getMarketPriceData() {
    axios
        .get(
            "Get https://lm-models.s3.ir-thr-at1.arvanstorage.ir/market_prices.json"
        )
        .then((res) => {
            console.log(res.data);
        })
        .catch((error) => {
            console.log(error.message);
        });
}
console.log("hi");

async function getCurrencyData() {
    fetch("https://baha24.com/api/v1/price")
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    "Network response was not ok: " + response.status
                );
            }
            return response.json();
        })
        .then((data) => {
            console.log(data);
        })
        .catch((error) => {
            console.log("Fetch error:", error.message);
        });
}
function enrichCarData(cars, marketPrices, usdRate) {
    return cars.map((car) => {
        const marketData = marketPrices.find(
            (item) =>
                item.brand === car.brand &&
                item.model === car.model &&
                item.year === car.year
        );

        const price_diff_from_average = marketData
            ? car.price - marketData.average_price
            : 0;

        const mileage_diff_from_average = marketData
            ? car.mileage - marketData.average_mileage
            : 0;

        const price_usd = car.price / usdRate;

        return {
            ...car,
            price_diff_from_average,
            mileage_diff_from_average,
            price_usd: parseFloat(price_usd.toFixed(2)), // Round
        };
    });
}

async function processData() {
    try {
        console.log("Fetching data from APIs...");
        const [cars, marketPrices, currencyData] = await Promise.all([
            getCarsData(),
            getMarketPriceData(),
            getCurrencyData(),
        ]);

        console.log("Enriching car data...");
        const usdRate = currencyData.USD.buy;
        const enrichedCars = enrichCarData(cars, marketPrices, usdRate);

        console.log("Saving data to file...");
        fs.writeFileSync(
            "cars_data.json",
            JSON.stringify(enrichedCars, null, 2)
        );

        return enrichedCars;
    } catch (error) {
        console.error("Data processing failed:", error.message);
        throw error;
    }
}

// 4. Analysis functions (Q1-Q7)
function analyzeData(carsData) {
    //Q1 (I use AI for this question)
    function getMostCommonCar() {
        const countCar = {};

        carsData.forEach((car) => {
            const key = `${car.brand}|${car.model}`;
            countCar[key] = (countCar[key] || 0) + 1;
        });

        const [brandModel, count] = Object.entries(countCar).reduce((a, b) =>
            a[1] > b[1] ? a : b
        );
        const [brand, model] = brandModel.split("|");

        return { brand, model, count };
    }

    console.log("Q1: Which car brand & model exists the most?");
    console.table([getMostCommonCar()]);

    // Q2 (I got help AI for this question)
    function getTop3MostExpensive() {
        return [...carsData]
            .sort((a, b) => b.price_usd - a.price_usd)
            .slice(0, 3)
            .map((car) => ({
                brand: car.brand,
                model: car.model,
                price_usd: car.price_usd,
            }));
    }
    // Q3
    function getPriceRange() {
        const sorted = [...carsData].sort((a, b) => b.price_usd - a.price_usd);
        return sorted[0].price_usd - sorted[sorted.length - 1].price_usd;
    }
    console.log(
        "Q3: What is the USD price difference between the most expensive and cheapest car?"
    );
    console.log(`${getPriceRange()}`);

    // Q4
    function getColorDistribution() {
        const colorCount = {};

        carsData.forEach((car) => {
            colorCount[car.color] = (colorCount[car.color] || 0) + 1;
        });

        return Object.entries(colorCount).sort((a, b) => b[1] - a[1]);
    }

    console.log("Q4: How many cars exist for each color?");
    console.table(getColorDistribution());

    // Q5 (I use AI for this question)
    function getBestDeals() {
        const bestDeals = {};

        carsData.forEach((car) => {
            const key = `${car.brand}|${car.model}`;
            if (
                !bestDeals[key] ||
                (car.price_usd < bestDeals[key].price_usd &&
                    car.mileage < bestDeals[key].mileage)
            ) {
                bestDeals[key] = car;
            }
        });

        return Object.values(bestDeals).map((car) => ({
            brand: car.brand,
            model: car.model,
            price_usd: car.price_usd,
            mileage: car.mileage,
        }));
    }
    console.log(
        "Q5: For each car (brand & model), which one has the lowest price and mileage?"
    );
    console.table(getBestDeals());

    // Q6 (I use AI for this question)
    function getMostFairPriced() {
        return [...carsData]
            .map((car) => ({
                ...car,
                absPriceDiff: Math.abs(car.price_diff_from_average),
            }))
            .sort((a, b) => a.absPriceDiff - b.absPriceDiff)
            .slice(0, 5)
            .map((car) => ({
                brand: car.brand,
                model: car.model,
                price_diff_from_average: car.price_diff_from_average,
                price_usd: car.price_usd,
            }));
    }
    console.log(
        "Q6: What are the top 5 most fair-priced cars? (Smallest price_diff_from_average)"
    );
    console.table(getMostFairPriced());

    // Q7 (I use AI for this question)
    function getMostFairMileage() {
        return [...carsData]
            .map((car) => ({
                ...car,
                absMileageDiff: Math.abs(car.mileage_diff_from_average),
            }))
            .sort((a, b) => a.absMileageDiff - b.absMileageDiff)
            .slice(0, 5)
            .map((car) => ({
                brand: car.brand,
                model: car.model,
                mileage_diff_from_average: car.mileage_diff_from_average,
                mileage: car.mileage,
            }));
    }

    console.log(
        "Q7: What are the top 5 cars with most fair mileage? (Smallest mileage_diff_from_average)"
    );
    console.table(getMostFairMileage());
}
(async () => {
    try {
        const enrichedData = await processData();
        analyzeData(enrichedData);

        const endTime = Date.now();
        const executionTime = ((endTime - startTime) / 1000).toFixed(2);
        console.log(`\nExecution completed in ${executionTime} seconds.`);
    } catch (error) {
        console.error("Error in main execution:", error.message);
    }
})();
