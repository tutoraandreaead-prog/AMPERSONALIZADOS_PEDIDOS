import {sessionStore} from '../lib/store.mjs';
import {json,settings,authorize,revoke,cookie,sameOrigin} from '../lib/auth.mjs';
export const config={path:'/api/session',method:['GET','DELETE']};
export function makeSession({sessions=sessionStore,env=process.env}={}){return async req=>{
 try{const cfg=settings(env),store=sessions();if(req.method==='DELETE'){if(!sameOrigin(req))return json({error:'Origem não autorizada.'},403);await revoke(req,store,cfg);return json({ok:true},200,{'Set-Cookie':cookie('',0)})}
  if(req.method!=='GET')return json({error:'Método não permitido.'},405);const p=await authorize(req,store,cfg);return json({authenticated:!!p,expires:p?.exp||null});
 }catch(e){return json({error:e.message?.startsWith('Configure ')?e.message:'Não foi possível verificar a sessão.'},503)}
}}
export default makeSession();
