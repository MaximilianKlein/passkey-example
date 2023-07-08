import './style.css'

const hasPasskey = async ():Promise<boolean> => {
  // Availability of `window.PublicKeyCredential` means WebAuthn is usable.  
  // `isUserVerifyingPlatformAuthenticatorAvailable` means the feature detection is usable.  
  // `​​isConditionalMediationAvailable` means the feature detection is usable.  
  if (window.PublicKeyCredential &&  
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable &&  
    PublicKeyCredential.isConditionalMediationAvailable) {  
    // Check if user verifying platform authenticator is available.
    const res = await Promise.all([
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(),
      PublicKeyCredential.isConditionalMediationAvailable(),
    ]);
    console.log(res)
    console.log(res.every(r => r === true))
    return res.every(r => r === true);
  }
  return false;
}

let serverChallenge = '';
let serverSignature = '';
// let error = '';
const setSuccess = (msg: string) => {
  document.getElementById('successMsg')!.innerText = msg;
}
const rpId = "localhost";

const base64urlToBuffer =(
  baseurl64String: string,
): ArrayBuffer => {
  // Base64url to Base64
  const padding = "==".slice(0, (4 - (baseurl64String.length % 4)) % 4);
  const base64String =
    baseurl64String.replace(/-/g, "+").replace(/_/g, "/") + padding;

  // Base64 to binary string
  const str = atob(base64String);

  // Binary string to buffer
  const buffer = new ArrayBuffer(str.length);
  const byteView = new Uint8Array(buffer);
  for (let i = 0; i < str.length; i++) {
    byteView[i] = str.charCodeAt(i);
  }
  return buffer;
}

const bufferToBase64url = (buffer: ArrayBuffer): string => {
  // Buffer to binary string
  const byteView = new Uint8Array(buffer);
  let str = "";
  for (const charCode of byteView) {
    str += String.fromCharCode(charCode);
  }

  // Binary string to base64
  const base64String = btoa(str);

  // Base64 to base64url
  // We assume that the base64url string is well-formed.
  const base64urlString = base64String.replace(/\+/g, "-").replace(
    /\//g,
    "_",
  ).replace(/=/g, "");
  return base64urlString;
}

const passkeyRegister = async () => {
  // @ts-ignore
  const userName = document.getElementById('userName').value;
  console.log('create');
  var enc = new TextEncoder();
  const options = {
    publicKey: {
      challenge: base64urlToBuffer(serverChallenge),
      rp: { // relying party
        name: "max-does-webauthn",
        id: rpId,
      },
      user: {
        // Maybe change these later
        id: enc.encode(userName),
        name: userName,
        displayName: userName,
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }] as PublicKeyCredentialParameters[],
      timeout: 60000,
      attestation: "direct" as AttestationConveyancePreference,
      authenticatorSelection: {
        residentKey: "required" as ResidentKeyRequirement,
        userVerification: "required" as UserVerificationRequirement,
      },
    },
  };
  console.log(options);
  const credential = await navigator.credentials.create(options);
  // const credential = await create({
  //   publicKey: {
  //     challenge: serverChallenge,
  //     rp: { // relying party
  //       name: "max-does-webauthn",
  //       id: rpId,
  //     },
  //     user: {
  //       // Maybe change these later
  //       id: userName,
  //       name: userName,
  //       displayName: userName,
  //     },
  //     pubKeyCredParams: [{ alg: -7, type: "public-key" }],
  //     timeout: 60000,
  //     attestation: "direct",
  //     authenticatorSelection: {
  //       residentKey: "required",
  //       userVerification: "required",
  //     },
  //   },
  // });
  console.log(credential);
  const jsonCredentials = {
    ...credential,
    type: 'public-key',
    // @ts-ignore
    id: bufferToBase64url(credential.rawId),
    // @ts-ignore
    rawId: bufferToBase64url(credential.rawId),
    response: {
      // @ts-ignore
      attestationObject: bufferToBase64url(credential.response.attestationObject),
    // @ts-ignore
      clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
    }
  }

  const res = await fetch('/api/passkey', {
    method: "POST",
    body: JSON.stringify({ credential: jsonCredentials, challenge: serverChallenge, signature: serverSignature, userName }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (res.ok) {
    console.log(res);
    setSuccess('registered successfully');
  } else {
    // error = "unable to login via passkey";
    console.error(res);
  }
}

const passkeyLogin = async () => {
  // @ts-ignore
  const userName = document.getElementById('userName').value;
  // var enc = new TextEncoder();
  const publicKeyCredentialRequestOptions = {
    challenge: base64urlToBuffer(serverChallenge),
    // allowCredentials: [{
    //   type: 'public-key',
    //   id: enc.encode(userName),
    // }] as PublicKeyCredentialDescriptor[],
    rpId,
  };
  const abortController = new AbortController();
  const credential = await navigator.credentials.get({
    publicKey: publicKeyCredentialRequestOptions,
    signal: abortController.signal,
  });
  console.log(credential);
  const credentialJSON = {
    type: 'public-key',
    authenticator: {
      counter: 10000000,
    },
    // @ts-ignore
    id: credential.id,
    // @ts-ignore
    authenticatorAttachment: credential.authenticatorAttachment,
    // @ts-ignore
    rawId: bufferToBase64url(credential.rawId),
    response: {
      // @ts-ignore
      authenticatorData: bufferToBase64url(credential.response.authenticatorData),
      // @ts-ignore
      clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
      // @ts-ignore
      signature: bufferToBase64url(credential.response.signature),
      // @ts-ignore
      userHandle: bufferToBase64url(credential.response.userHandle),
    }
  }
  const res = await fetch('/api/passkeylogin', {
    method: "POST",
    body: JSON.stringify({ credential: credentialJSON, challenge: serverChallenge, signature: serverSignature }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (res.ok) {
    console.log(res);
    setSuccess('logged in successfully');
  } else {
    // error = "unable to login via passkey";
    console.error(res);
  }
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<form onSubmit={normalLogin}>
<div className="{styles.loginform}">
  <span>Login</span>
  <div id="error" class="styles.error"></div>
  <div id="successMsg" style="font-weight: bold; color: green;"></div>
  <div>
    <input type="text" placeholder='user name ...' id="userName" />
  </div>
  <div>
    <input type="password" placeholder='password ...' id="password" />
  </div>
  <div className={styles.right}>
    <button>Login</button>
  </div>
  <hr/>
  <div id="passfreeControls" style="visibility: hidden">
    <button type="button" id="passkeyRegister"><Image src="/passkey-icon.webp" width="16" height="16" alt=""/> Passkey Register</button>
    <button type="button" id="passkeyLogin"><Image src="/passkey-icon.webp" width="16" height="16" alt=""/> Passkey Login</button>
  </div>
</div>
</form>
`

const setup = async () => {
  if (!await hasPasskey()) {
    return;
  }
  document.getElementById('passfreeControls')?.setAttribute("style", "");

  fetch('/api/challenge').then(async (res) => {
      const {challenge, signature} = await res.json();
      serverChallenge = challenge;
      serverSignature = signature;
    });

  document.getElementById('passkeyRegister')!.addEventListener('click', passkeyRegister);
  document.getElementById('passkeyLogin')!.addEventListener('click', passkeyLogin);
}

setup();
