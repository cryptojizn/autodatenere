import http from 'node:http';
const origin='https://autodatenere.onrender.com';
const port=Number(process.env.PORT||3000);
const backend=process.env.BUSINESS_URL,token=process.env.BUSINESS_SERVICE_TOKEN;
const server=http.createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;
 const allowed=req.headers.origin===origin;
 const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...(allowed?{'access-control-allow-origin':origin,'vary':'Origin'}:{})};
 const send=(status,body)=>{res.writeHead(status,headers);res.end(JSON.stringify(body))};
 if(path==='/health')return send(backend&&token?200:503,{status:backend&&token?'ready':'not_configured',mode:'anonymous_daily_counter'});
 if(path!=='/visit')return send(404,{error:'not_found'});
 if(!allowed)return send(403,{error:'origin_not_allowed'});
 if(req.method==='OPTIONS'){res.writeHead(204,{...headers,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'content-type'});return res.end()}
 if(req.method!=='POST')return send(405,{error:'method_not_allowed'});
 if(!backend||!token)return send(503,{error:'not_configured'});
 try{
  let raw='';for await(const part of req){raw+=part;if(raw.length>150)return send(400,{error:'invalid_request'})}
  const x=JSON.parse(raw);if(x.type!=='page_view'||typeof x.test!=='boolean'||Object.keys(x).some(k=>!['type','test'].includes(k)))return send(400,{error:'invalid_request'});
  // Only a generic increment is forwarded. Never forward client headers, identifiers, addresses, or URLs.
  const response=await fetch(new URL('/api/ingest',backend),{method:'POST',headers:{'content-type':'application/json','OAI-Sites-Authorization':'Bearer '+token,'X-Auto-Bridge':'anonymous-visit-v1'},body:JSON.stringify({type:'page_view',test:x.test}),redirect:'error',signal:AbortSignal.timeout(20000)});
  return response.ok?send(200,{accepted:true}):send(502,{error:'counter_unavailable'});
 }catch{return send(502,{error:'counter_unavailable'})}
});
server.requestTimeout=25000;
server.listen(port,'0.0.0.0');
