import {createHmac,createHash,pbkdf2Sync,randomBytes,timingSafeEqual} from 'node:crypto';
const COOKIE='__Host-atelie_session',DURATION=8*60*60;
export function json(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff',...extra}})}
export function settings(env=process.env){
 const secret=env.SESSION_SECRET||'',hash=env.APP_PASSWORD_HASH||'';
 const parts=hash.split('$');
 if(secret.length<43||parts.length!==4||parts[0]!=='pbkdf2'||!Number.isInteger(Number(parts[1]))||Number(parts[1])<310000||Number(parts[1])>1000000||!/^[-\w]{22,86}$/.test(parts[2])||!/^[-\w]{43}$/.test(parts[3]))throw Error('Configure APP_PASSWORD_HASH e SESSION_SECRET no Netlify e publique novamente. Use configurar-acesso.html para gerar os valores.');
 return {secret,hash};
}
export function verifyPassword(password,hash){if(typeof password!=='string'||password.length<12||password.length>1024)return false;const [,iterations,salt,expected]=hash.split('$');const digest=pbkdf2Sync(password,Buffer.from(salt,'base64url'),Number(iterations),32,'sha256');const target=Buffer.from(expected,'base64url');return digest.length===target.length&&timingSafeEqual(digest,target)}
const signature=(s,secret)=>createHmac('sha256',secret).update(s).digest('base64url');
const fingerprint=hash=>createHash('sha256').update(hash).digest('base64url');
const key=nonce=>createHash('sha256').update(nonce).digest('hex');
export async function createSession(store,config,now=Date.now()){
 const payload={nonce:randomBytes(32).toString('base64url'),exp:Math.floor(now/1000)+DURATION,auth:fingerprint(config.hash)};
 const encoded=Buffer.from(JSON.stringify(payload)).toString('base64url');
 await store.setJSON(key(payload.nonce),{exp:payload.exp});
 return {token:encoded+'.'+signature(encoded,config.secret),expires:payload.exp};
}
export function cookie(token,maxAge=DURATION){return COOKIE+'='+token+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age='+maxAge}
export function readToken(req){return (req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||''}
export function decodeSession(token,config,now=Date.now()){
 try{if(typeof token!=='string'||token.length>2048)return null;const [encoded,sign,...rest]=token.split('.');if(rest.length||!encoded||!sign)return null;const expected=Buffer.from(signature(encoded,config.secret)),actual=Buffer.from(sign);if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return null;const p=JSON.parse(Buffer.from(encoded,'base64url').toString());if(!Number.isSafeInteger(p.exp)||p.exp<=now/1000||p.auth!==fingerprint(config.hash)||typeof p.nonce!=='string'||p.nonce.length!==43)return null;return p}catch{return null}
}
export async function authorize(req,store,config){const p=decodeSession(readToken(req),config);if(!p)return null;const row=await store.get(key(p.nonce),{type:'json'});return row&&row.exp===p.exp?p:null}
export async function revoke(req,store,config){const p=decodeSession(readToken(req),config);if(p)await store.delete(key(p.nonce))}
export function sameOrigin(req){const origin=req.headers.get('origin');return (!origin||origin===new URL(req.url).origin)&&req.headers.get('sec-fetch-site')!=='cross-site'}
