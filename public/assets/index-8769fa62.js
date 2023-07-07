(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))r(e);new MutationObserver(e=>{for(const s of e)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function n(e){const s={};return e.integrity&&(s.integrity=e.integrity),e.referrerPolicy&&(s.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?s.credentials="include":e.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(e){if(e.ep)return;e.ep=!0;const s=n(e);fetch(e.href,s)}})();const p=async()=>{if(window.PublicKeyCredential&&PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable&&PublicKeyCredential.isConditionalMediationAvailable){const t=await Promise.all([PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(),PublicKeyCredential.isConditionalMediationAvailable()]);return console.log(t),console.log(t.every(o=>o===!0)),t.every(o=>o===!0)}return!1};let l="",c="";const d=t=>{document.getElementById("successMsg").innerText=t},u="localhost",g=t=>{const o="==".slice(0,(4-t.length%4)%4),n=t.replace(/-/g,"+").replace(/_/g,"/")+o,r=atob(n),e=new ArrayBuffer(r.length),s=new Uint8Array(e);for(let a=0;a<r.length;a++)s[a]=r.charCodeAt(a);return e},i=t=>{const o=new Uint8Array(t);let n="";for(const s of o)n+=String.fromCharCode(s);return btoa(n).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"")},y=async()=>{const t=document.getElementById("userName").value;console.log("create");var o=new TextEncoder;const n={publicKey:{challenge:g(l),rp:{name:"max-does-webauthn",id:u},user:{id:o.encode(t),name:t,displayName:t},pubKeyCredParams:[{alg:-7,type:"public-key"}],timeout:6e4,attestation:"direct",authenticatorSelection:{residentKey:"required",userVerification:"required"}}};console.log(n);const r=await navigator.credentials.create(n);console.log(r);const e={...r,type:"public-key",id:i(r.rawId),rawId:i(r.rawId),response:{attestationObject:i(r.response.attestationObject),clientDataJSON:i(r.response.clientDataJSON)}},s=await fetch("/api/passkey",{method:"POST",body:JSON.stringify({credential:e,challenge:l,signature:c,userName:t}),headers:{"Content-Type":"application/json"}});s.ok?(console.log(s),d("logged in successfully")):console.error(s)},f=async()=>{document.getElementById("userName").value;const t={challenge:g(l),rpId:u},o=new AbortController,n=await navigator.credentials.get({publicKey:t,signal:o.signal});console.log(n);const r={type:"public-key",authenticator:{counter:1e7},id:n.id,authenticatorAttachment:n.authenticatorAttachment,rawId:i(n.rawId),response:{authenticatorData:i(n.response.authenticatorData),clientDataJSON:i(n.response.clientDataJSON),signature:i(n.response.signature),userHandle:i(n.response.userHandle)}},e=await fetch("/api/passkeylogin",{method:"POST",body:JSON.stringify({credential:r,challenge:l,signature:c}),headers:{"Content-Type":"application/json"}});e.ok?(console.log(e),d("logged in successfully")):console.error(e)};document.querySelector("#app").innerHTML=`
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
`;const h=async()=>{var t;await p()&&((t=document.getElementById("passfreeControls"))==null||t.setAttribute("style",""),fetch("/api/challenge").then(async o=>{const{challenge:n,signature:r}=await o.json();l=n,c=r}),document.getElementById("passkeyRegister").addEventListener("click",y),document.getElementById("passkeyLogin").addEventListener("click",f))};h();
