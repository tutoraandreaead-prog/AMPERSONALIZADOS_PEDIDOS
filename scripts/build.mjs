import {readFile,readdir,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
for(const directory of ['netlify/functions','netlify/lib']){for(const file of await readdir(path.join(root,directory))){if(!file.endsWith('.mjs'))continue;const result=spawnSync(process.execPath,['--check',path.join(root,directory,file)],{stdio:'inherit'});if(result.status!==0)process.exit(result.status||1)}}
const html=await readFile(path.join(root,'public/index.html'),'utf8');
if(html.includes('Sandra e Vanderley')||html.includes('Elisangela Bradesco')||html.includes('APP_PASSWORD_HASH='))throw Error('Dados privados não devem estar no HTML público.');
if(!html.includes('/api/state')||!html.includes('/api/login'))throw Error('Cliente online incompleto.');
const temporary=await mkdtemp(path.join(tmpdir(),'atelie-build-'));
try{const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');const target=path.join(temporary,'client.js');await writeFile(target,script);const check=spawnSync(process.execPath,['--check',target],{stdio:'inherit'});if(check.status!==0)process.exitCode=check.status||1}finally{if(path.dirname(path.resolve(temporary))!==path.resolve(tmpdir())||!path.basename(temporary).startsWith('atelie-build-'))throw Error('Diretório temporário inesperado.');await rm(temporary,{recursive:true,force:true})}
console.log('Build pronto: HTML público sem registros de clientes; Functions verificadas.');
