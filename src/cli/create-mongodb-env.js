import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envFilePath = path.join(__dirname, "..", "../.env");


const envContent = `
MONGODB_URI=<uri> 
#sample: mongodb+srv://project1.ispbzwv.mongodb.net

MONGODB_USERNAME=<username>
MONGODB_PASSWORD=<password>
MONGODB_DATABASE=<database>
`;

if (fs.existsSync(envFilePath)) {
  console.log(`⛔.env file already exists at ${envFilePath}⛔`);
} else {
  fs.writeFileSync(envFilePath, envContent.trim() + "\n", "utf8");
  console.log(`✅.env file created successfully at ${envFilePath}✅`);
}
