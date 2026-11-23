// Dedicated property routing; keep legacy main-site index handling below.
function handler(event) {
 var req=event.request, uri=req.uri, host=req.headers.host.value.toLowerCase();
 var hosts={"brighten.bunyang-alimi.com":"brighten","luca831.bunyang-alimi.com":"luca831","byeolnae.bunyang-alimi.com":"byeolnae","lewest.bunyang-alimi.com":"lewest","dkvalleyview.bunyang-alimi.com":"dk","gochon.bunyang-alimi.com":"gochon","thegrid.bunyang-alimi.com":"thegrid","insignia.bunyang-alimi.com":"insignia","ph1603.bunyang-alimi.com":"ph1603","vl-lewest.bunyang-alimi.com":"vl-lewest"}, urls={"brighten":"https://brighten.bunyang-alimi.com/","luca831":"https://luca831.bunyang-alimi.com/","byeolnae":"https://byeolnae.bunyang-alimi.com/","lewest":"https://lewest.bunyang-alimi.com/","dk":"https://dkvalleyview.bunyang-alimi.com/","gochon":"https://gochon.bunyang-alimi.com/","thegrid":"https://thegrid.bunyang-alimi.com/","insignia":"https://insignia.bunyang-alimi.com/","ph1603":"https://ph1603.bunyang-alimi.com/","vl-lewest":"https://vl-lewest.bunyang-alimi.com/"}, aliases={"brighton":"brighten"};
 var qs=[]; for(var k in req.querystring){var v=req.querystring[k];if(v.multiValue){v.multiValue.forEach(function(m){qs.push(k+'='+m.value);});}else{qs.push(k+(v.value!==''?'='+v.value:''));}}
 var suffix=qs.length?'?'+qs.join('&'):'';
 function redirect(url){return {statusCode:301,statusDescription:'Moved Permanently',headers:{location:{value:url+suffix}}};}
 if(host==='brighton.bunyang-alimi.com')return redirect('https://brighten.bunyang-alimi.com'+uri);
 var match=uri.match(/^\/(?:outputs\/portal\/properties\/|properties\/)?([a-z0-9-]+)(?:\/index\.html|\/|\.html)?$/), id=match&&(aliases[match[1]]||match[1]);
 if(hosts[host]){
  var own=hosts[host];
  if(uri==='/'||uri==='/index.html'){req.uri='/'+own+'/index.html';return req;}
  if(uri==='/robots.txt'||uri==='/sitemap.xml'){req.uri='/sites/dedicated/'+own+uri;return req;}
  if(id&&urls[id])return redirect(urls[id]);
 }else if(host==='bunyang-alimi.com'||host==='www.bunyang-alimi.com'){if(id&&urls[id])return redirect(urls[id]);}
 if(uri.endsWith('/')){req.uri=uri+'index.html';return req;}
 var last=uri.substring(uri.lastIndexOf('/')+1);if(last.indexOf('.')===-1)return redirect(uri+'/');
 return req;
}
