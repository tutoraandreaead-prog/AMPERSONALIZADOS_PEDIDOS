import {sessionStore} from '../lib/store.mjs';
import {json,settings,verifyPassword,createSession,cookie,sameOrigin} from '../lib/auth.mjs';
export const config={path:'/api/login',method:'POST',rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:5}};
export function makeLogin({sessions=sessionStore,env=process.env}={}){return async req=>{
 if(req.method!=='POST')return json({error:'Método não permitido.'},405);
 if(!sameOrigin(req))return json({error:'Origem não autorizada.'},403);
 if(!req.headers.get('content-type')?.startsWith('application/json'))return json({error:'Envie JSON.'},415);
 try{const cfg=settings(env);const raw=await req.text();if(raw.length>2048)return json({error:'Dados inválidos.'},413);let input;try{input=JSON.parse(raw)}catch{return json({error:'Dados inválidos.'},400)}
  if(!verifyPassword(input.password,cfg.hash))return json({error:'Senha incorreta.'},401);
  const session=await createSession(sessions(),cfg);return json({ok:true},200,{'Set-Cookie':cookie(session.token)});
 }catch(e){return json({error:e.message?.startsWith('Configure ')?e.message:'Não foi possível iniciar a sessão. Tente novamente.'},503)}
}}
export default makeLogin();
