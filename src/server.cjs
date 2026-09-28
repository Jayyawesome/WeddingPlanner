const http=require('node:http');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'../dist');const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
const { createConnectHandler } = require('./connect.cjs');
function createServer(options = {}) {
 const connect = createConnectHandler(options);
 return http.createServer(async(req,res)=>{
  try {
   if(await connect(req,res)) return;
   let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return}
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return}
   const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
   if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
   fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end('Not found');return}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data)});
  }catch{if(!res.headersSent)res.writeHead(500);res.end('Request failed')}
 });
}
module.exports={createServer};
