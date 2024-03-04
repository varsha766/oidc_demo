"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./routes"));
// import helmet from 'helmet'
const express_1 = __importDefault(require("express"));
const provider_1 = require("./config/provider");
const configuration_1 = require("./config/configuration");
// const __dirname = path.resolve();
dotenv_1.default.config();
const app = express_1.default();
const server = http_1.default.createServer(app);
const provider = provider_1.oidc(process.env.PUBLIC_OIDC_ISSUER, configuration_1.configuration);
// app.use(helmet());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded());
app.use(cookie_parser_1.default());
app.use(express_1.default.static('public'));
app.use(routes_1.default(provider));
app.listen(process.env.PORT, () => {
    console.log(`oidc-provider listening on port ${process.env.PORT}`);
});
