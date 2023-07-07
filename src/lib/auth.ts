import crypto from "node:crypto";
import type {
    VerifiedAuthenticationResponse,
    VerifiedRegistrationResponse,
  } from "@simplewebauthn/server";
  import {
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
  } from "@simplewebauthn/server";
  import type {
    PublicKeyCredentialWithAssertionJSON,
    PublicKeyCredentialWithAttestationJSON,
  } from "@github/webauthn-json";
import { db } from "./db";

export const signature = (challenge:string) => challenge.split("").reverse().join("");
export const verifyChallenge = (challenge:string, signature:string) => {
    if (challenge === signature.split("").reverse().join("")) {
        return true;
    }
    return false;
}

const HOST_SETTINGS = {
    expectedOrigin: process.env.RENDER_EXTERNAL_URL ?? "http://localhost:5000",
    expectedRPID: process.env.RPID ?? "localhost",
};

// Helper function to translate values between
// `@github/webauthn-json` and `@simplewebauthn/server`
function binaryToBase64url(bytes: Uint8Array) {
let str = "";

bytes.forEach((charCode) => {
    str += String.fromCharCode(charCode);
});

return btoa(str);
}

export async function register(request: any) {
  const challenge = request.body.challenge ?? "";
  const signature = request.body.signature ?? ""; //jeah I know empty string is kinda cheating
  const userName = request.body.userName;
  if (!verifyChallenge(challenge, signature)) {
    throw "Invalid signature!";
  }
  const credential = request.body
    .credential as PublicKeyCredentialWithAttestationJSON;

  let verification: VerifiedRegistrationResponse;

  if (credential == null) {
      throw new Error("Invalid Credentials");
  }

  try {
      verification = await verifyRegistrationResponse({
          // @ts-ignore
      response: credential,
      expectedChallenge: challenge,
      requireUserVerification: true,
      ...HOST_SETTINGS,
      });
  } catch (error) {
      console.error(error);
      throw error;
  }

  if (!verification.verified) {
      throw new Error("Registration verification failed");
  }

  const { credentialID, credentialPublicKey } =
      verification.registrationInfo ?? {};

  if (credentialID == null || credentialPublicKey == null) {
      throw new Error("Registration failed");
  }

  const externalId = clean(binaryToBase64url(credentialID));
  db()[externalId] = {
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

export async function login(request: any) {
  console.log(request.body);
  const challenge = request.body.challenge ?? "";
  const signature = request.body.signature ?? ""; //jeah I know empty string is kinda cheating
  if (!verifyChallenge(challenge, signature)) {
    throw "Invalid signature!";
  }
  const externalId = request.body.credential.id;
  const credential = db()[externalId]?.credentials as PublicKeyCredentialWithAttestationJSON;

  let verification: VerifiedRegistrationResponse;

  if (credential == null) {
      throw new Error("Invalid Credentials");
  }

  try {
    // @ts-ignore
      verification = await verifyAuthenticationResponse({
          // @ts-ignore
          authenticator: db()[externalId].authenticator,
          response: request.body.credential,
          expectedChallenge: challenge,
          requireUserVerification: true,
          ...HOST_SETTINGS,
      });
  } catch (error) {
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

  if (!db()[externalId]) {
    throw new Error("couldn't find user in database!!")
  }
  db()[externalId].counter = (db()[externalId].counter ?? 0) + 1;
  return db()[externalId].userName;
}

function clean(str: string) {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function generateChallenge() {
  return clean(crypto.randomBytes(32).toString("base64"));
}
