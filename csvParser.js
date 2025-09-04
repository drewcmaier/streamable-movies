import fs from "fs";
import { parse } from 'csv-parse';

export function parseCSV(filePath) {
    return new Promise((resolve, reject) => {
        const titles = [];
        fs.createReadStream(filePath)
            .pipe(parse({ columns: true }))
            .on("data", (row) => {
                if (row["Name"]) titles.push(row["Name"]);
            })
            .on("end", () => resolve(titles))
            .on("error", reject);
    });
}