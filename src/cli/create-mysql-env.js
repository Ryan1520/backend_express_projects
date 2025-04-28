import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envFilePath = path.join(__dirname, "..", "../.env");


const envContent = `
MYSQL_HOST=localhost # MySQL host
MYSQL_PORT=3306 # MySQL port

MYSQL_USERNAME=<username>
MYSQL_PASSWORD=<password>
MYSQL_DATABASE=<database>
`;

if (fs.existsSync(envFilePath)) {
  console.log(`⛔.env file already exists at ${envFilePath}⛔`);
} else {
  fs.writeFileSync(envFilePath, envContent.trim() + "\n", "utf8");
  console.log(`✅.env file created successfully at ${envFilePath}✅`);
}
