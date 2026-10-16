import {dataStore,sessionStore} from '../lib/store.mjs';
import {json,settings,authorize,sameOrigin} from '../lib/auth.mjs';
import {readState,saveState} from '../lib/state-service.mjs';
export const config={path:'/api/state',method:['GET','PUT']};
export function makeState({data=dataStore,sessions=sessionStore,env=process.env}={}){return async req=>{
 try{const cfg=settings(env);if(!await authorize(req,sessions(),cfg))return json({error:'Entre novamente para acessar os dados.'},401);
  if(req.method==='GET')return json((await readState(data())).data);
  if(req.method!=='PUT')return json({error:'Método não permitido.'},405);
  if(!sameOrigin(req))return json({error:'Origem não autorizada.'},403);
  if(!req.headers.get('content-type')?.startsWith('application/json'))return json({error:'Envie JSON válido.'},415);
  if(Number(req.headers.get('content-length')||0)>1500000)return json({error:'O backup excede o limite de 1,5 MB.'},413);
  const raw=await req.text();if(new TextEncoder().encode(raw).length>1500000)return json({error:'Os dados excedem o limite de 1,5 MB. Exporte um backup e reduza o histórico.'},413);
  let input;try{input=JSON.parse(raw)}catch{return json({error:'JSON inválido.'},400)}
  let result;try{result=await saveState(data(),input)}catch(e){if(e.message?.startsWith('VALIDATION:'))return json({error:e.message.slice(11)},400);throw e}
  if(result.conflict)return json({error:'Os dados mudaram em outro aparelho. Sua alteração não foi salva. Guarde o rascunho e atualize a página antes de tentar novamente.'},409);
  return json(result);
 }catch(e){return json({error:e.message?.startsWith('Configure ')?e.message:'Não foi possível acessar o armazenamento online. Nenhuma alteração foi confirmada.'},503)}
}}
export default makeState();
