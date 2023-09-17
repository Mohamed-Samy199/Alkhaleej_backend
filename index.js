import { config } from "dotenv";
import express from "express";
import initApp from "./src/initApp.js";
import chalk from "chalk";


const app = express();
config({ path: "./config/.env" })
const port = process.env.PORT;
// app.set('case sensitive routing' , true);
initApp(app, express)


app.listen(port, () => console.log(chalk.blue(`server is running on port ${port}`)));