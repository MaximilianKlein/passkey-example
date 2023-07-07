"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateChallenge = exports.login = exports.register = exports.verifyChallenge = exports.signature = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const server_1 = require("@simplewebauthn/server");
const db_1 = require("./db");
const signature = (challenge) => challenge.split("").reverse().join("");
exports.signature = signature;
const verifyChallenge = (challenge, signature) => {
    if (challenge === signature.split("").reverse().join("")) {
        return true;
    }
    return false;
};
exports.verifyChallenge = verifyChallenge;
const HOST_SETTINGS = {
    expectedOrigin: process.env.RENDER_EXTERNAL_URL ?? "http://localhost:5000",
    expectedRPID: process.env.RPID ?? "localhost",
};
// Helper function to translate values between
// `@github/webauthn-json` and `@simplewebauthn/server`
function binaryToBase64url(bytes) {
    let str = "";
    bytes.forEach((charCode) => {
        str += String.fromCharCode(charCode);
    });
    return btoa(str);
}
async function register(request) {
    const challenge = request.body.challenge ?? "";
    const signature = request.body.signature ?? ""; //jeah I know empty string is kinda cheating
    const userName = request.body.userName;
    if (!(0, exports.verifyChallenge)(challenge, signature)) {
        throw "Invalid signature!";
    }
    const credential = request.body
        .credential;
    let verification;
    if (credential == null) {
        throw new Error("Invalid Credentials");
    }
    try {
        verification = await (0, server_1.verifyRegistrationResponse)({
            // @ts-ignore
            response: credential,
            expectedChallenge: challenge,
            requireUserVerification: true,
            ...HOST_SETTINGS,
        });
    }
    catch (error) {
        console.error(error);
        throw error;
    }
    if (!verification.verified) {
        throw new Error("Registration verification failed");
    }
    const { credentialID, credentialPublicKey } = verification.registrationInfo ?? {};
    if (credentialID == null || credentialPublicKey == null) {
        throw new Error("Registration failed");
    }
    const externalId = clean(binaryToBase64url(credentialID));
    (0, db_1.db)()[externalId] = {
        userName,
        authenticator: {
            counter: 0,
            credentialPublicKey: Buffer.from(credentialPublicKey),
        },
        credentials: {
            create: {
                externalId,
                publicKey: Buffer.from(credentialPublicKey),
            },
        }
    };
    return userName;
}
exports.register = register;
async function login(request) {
    console.log(request.body);
    const challenge = request.body.challenge ?? "";
    const signature = request.body.signature ?? ""; //jeah I know empty string is kinda cheating
    if (!(0, exports.verifyChallenge)(challenge, signature)) {
        throw "Invalid signature!";
    }
    const externalId = request.body.credential.id;
    const credential = (0, db_1.db)()[externalId]?.credentials;
    let verification;
    if (credential == null) {
        throw new Error("Invalid Credentials");
    }
    try {
        // @ts-ignore
        verification = await (0, server_1.verifyAuthenticationResponse)({
            // @ts-ignore
            authenticator: (0, db_1.db)()[externalId].authenticator,
            response: request.body.credential,
            expectedChallenge: challenge,
            requireUserVerification: true,
            ...HOST_SETTINGS,
        });
    }
    catch (error) {
        console.error(error);
        throw error;
    }
    if (!verification.verified) {
        throw new Error("Registration verification failed");
    }
    console.log(verification);
    // const { newCounter } =
    //     verification.registrationInfo ?? {};
    // if (credentialID == null || credentialPublicKey == null) {
    //     throw new Error("Login failed");
    // }
    if (!(0, db_1.db)()[externalId]) {
        throw new Error("couldn't find user in database!!");
    }
    (0, db_1.db)()[externalId].counter = ((0, db_1.db)()[externalId].counter ?? 0) + 1;
    return (0, db_1.db)()[externalId].userName;
}
exports.login = login;
function clean(str) {
    return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function generateChallenge() {
    return clean(node_crypto_1.default.randomBytes(32).toString("base64"));
}
exports.generateChallenge = generateChallenge;
//# sourceMappingURL=auth.js.map