const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../src/server.cjs');
const env = { PIPEDREAM_CLIENT_ID: 'test-client', PIPEDREAM_CLIENT_SECRET: 'test-secret', CONNECT_ADMIN_PASSWORD: 'test-password-with-at-least-24-characters', APP_ORIGIN: 'https://adorereve.com' };
const headers = { Authorization: `Basic ${Buffer.from('admin:'+env.CONNECT_ADMIN_PASSWORD).toString('base64')}`, Origin: env.APP_ORIGIN, 'Content-Type': 'application/json' };
async function fixture(t, options={}) {
 const server=createServer({env,...options});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(()=>new Promise(resolve=>server.close(resolve)));
 return 'http://127.0.0.1:'+server.address().port;
}
test('missing credentials fail closed without breaking storefront or exposing private files',async t=>{
 const base=await fixture(t,{env:{}});
 assert.equal((await fetch(base+'/admin/integrations')).status,503);
 assert.equal((await fetch(base+'/')).status,200);
 assert.equal((await fetch(base+'/src/connect.cjs')).status,404);
 assert.equal((await fetch(base+'/.env.example')).status,404);
});
test('admin page and token endpoint reject missing and incorrect auth',async t=>{
 const base=await fixture(t);
 for(const route of ['/admin/integrations','/api/pipedream/connect']){
  assert.equal((await fetch(base+route)).status,401);
  assert.equal((await fetch(base+route,{headers:{Authorization:'Basic invalid'}})).status,401);
 }
 const page=await fetch(base+'/admin/integrations',{headers});
 assert.equal(page.status,200);assert.equal(page.headers.get('cache-control'),'no-store');
 assert.match(await page.text(),/proj_ddsvbz5/);
});
test('cross-origin requests, malformed payloads, invalid apps and oversize bodies are rejected before SDK calls',async t=>{
 const base=await fixture(t,{clientFactory:()=>{throw Error('Should not call SDK');}});
 for(const [extra,body,status] of [[{Origin:'https://attacker.example'},'{}',403],[{},'invalid',400],[{},JSON.stringify({app:'../../bad'}),400],[{},'x'.repeat(2100),413]]){
  assert.equal((await fetch(base+'/api/pipedream/connect',{method:'POST',headers:{...headers,...extra},body})).status,status);
 }
});
test('creates owner-scoped production token and only returns hosted URL; repeated calls throttled',async t=>{
 let configuration, tokenOptions;
 const base=await fixture(t,{clientFactory:config=>{configuration=config;return{tokens:{create:async options=>{tokenOptions=options;return{token:'test-token',connectLinkUrl:'https://pipedream.com/_static/connect?token=test-token'};}}};}});
 const request=()=>fetch(base+'/api/pipedream/connect',{method:'POST',headers,body:JSON.stringify({app:'google_drive',externalUserId:'attacker'})});
 const response=await request(); assert.equal(response.status,200);
 const body=await response.json(); assert.deepEqual(Object.keys(body),['connectLinkUrl']);
 assert.equal(new URL(body.connectLinkUrl).searchParams.get('app'),'google_drive');
 assert.equal(configuration.projectEnvironment,'production');assert.equal(configuration.projectId,'proj_ddsvbz5');
 assert.equal(tokenOptions.externalUserId,'adorereve-owner');assert.deepEqual(tokenOptions.allowedOrigins,[env.APP_ORIGIN]);
 assert.equal((await request()).status,429);
});
test('SDK failures and unexpected redirect origins never expose credentials or redirect users',async t=>{
 for(const result of [new Error('test-secret'),{connectLinkUrl:'https://attacker.example/steal'}]){
  const base=await fixture(t,{clientFactory:()=>({tokens:{create:async()=>{if(result instanceof Error)throw result;return result;}}})});
  const response=await fetch(base+'/api/pipedream/connect',{method:'POST',headers,body:JSON.stringify({app:'google_drive'})});
  assert.equal(response.status,502);assert.doesNotMatch(await response.text(),/test-secret|attacker.example/);
 }
});
