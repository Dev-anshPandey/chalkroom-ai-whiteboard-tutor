import http from 'node:http';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
execFileSync(process.execPath,['scripts/build.mjs'],{stdio:'inherit'});
let env={...process.env};
try {for(const line of readFileSync('.env.local','utf8').split('\n')){const m=line.match(/^([A-Z_]+)=(.*)$/);if(m)env[m[1]]=m[2].trim().replace(/^['"]|['"]$/g,'');}}catch{}
const worker=(await import('../dist/server/index.js')).default;
http.createServer(async(req,res)=>{try{const chunks=[];let size=0;for await(const c of req){size+=c.length;if(size>32000){res.writeHead(413);res.end();return;}chunks.push(c);}const request=new Request('http://localhost:4317'+req.url,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})});const r=await worker.fetch(request,env,{});res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));}catch{res.writeHead(500);res.end('Server error');}}).listen(4317,'127.0.0.1',()=>console.log('Local: http://localhost:4317'));
