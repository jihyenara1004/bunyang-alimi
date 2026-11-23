"""Scoped deployment for the ten dedicated sites. Run in authenticated AWS CloudShell."""
import boto3, pathlib, json, hashlib, mimetypes, sys, time
P=pathlib.Path(__file__).resolve().parent
S=boto3.client('s3'); C=boto3.client('cloudfront')
BUCKET='bunyang-alimi-site-801178768218'; DIST='E32LEWGSB3SNIZ'; FN='bunyang-dedicated-routing'
def save(name,obj): (P/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2,default=str))
def sha(data): return hashlib.sha256(data).hexdigest()
def read(f):return (P/f).read_text()
sites=json.loads(read('after/sites/dedicated/sites.json'))
manifest=json.loads(read('manifest.json'))
baseline=json.loads(read('s3-before.json'))
stage=sys.argv[1]
if stage=='prepare':
 old=json.loads(read('cloudfront-before.json'))
 current=C.get_distribution_config(Id=DIST)
 assert current['ETag']==old['ETag'],'CloudFront changed since snapshot; inspect before continuing'
 cert=read('certificate-arn.txt').strip()
 assert boto3.client('acm',region_name='us-east-1').describe_certificate(CertificateArn=cert)['Certificate']['Status']=='ISSUED'
 # Check all existing source objects before any write; no whole-bucket sync or delete.
 for key,meta in baseline.items():
  assert S.head_object(Bucket=BUCKET,Key=key)['ETag']==meta['ETag'], 'Live object changed: '+key
 code=read('after/sites/dedicated/routing.js').replace("host==='bunyang-alimi.com'||host==='www.bunyang-alimi.com'","false")
 try:
  f=C.create_function(Name=FN,FunctionConfig={'Comment':'Ten dedicated property sites; existing main site preserved','Runtime':'cloudfront-js-2.0'},FunctionCode=code.encode())
 except C.exceptions.FunctionAlreadyExists:
  f=C.describe_function(Name=FN,Stage='DEVELOPMENT')
  f=C.update_function(Name=FN,IfMatch=f['ETag'],FunctionConfig={'Comment':'Ten dedicated property sites; existing main site preserved','Runtime':'cloudfront-js-2.0'},FunctionCode=code.encode())
 event={'version':'1.0','context':{'eventType':'viewer-request'},'viewer':{'ip':'192.0.2.1'},'request':{'method':'GET','uri':'/','headers':{'host':{'value':'brighton.bunyang-alimi.com'}},'cookies':{},'querystring':{}}}
 result=C.test_function(Name=FN,IfMatch=f['ETag'],Stage='DEVELOPMENT',EventObject=json.dumps(event).encode())['TestResult']
 assert not result.get('FunctionErrorMessage'),result
 assert json.loads(result['FunctionOutput'])['request']['uri']=='/brighten/index.html',result
 save('aws-function-test.json',result)
 published=C.publish_function(Name=FN,IfMatch=f['ETag'])
 written=[]
 for entry in manifest:
  key=entry['path']; data=(P/'after'/key).read_bytes();assert sha(data)==entry['sha256']
  mime=mimetypes.guess_type(key)[0] or 'application/octet-stream'
  if key.endswith('.js'): mime='application/javascript'
  if key.endswith(('.html','.js','.json','.txt','.xml','.svg')):mime+='; charset=utf-8'
  kwargs={'Bucket':BUCKET,'Key':key,'Body':data,'ContentType':mime,'CacheControl':'public,max-age=300'}
  if key in baseline:kwargs['IfMatch']=baseline[key]['ETag']
  else:kwargs['IfNoneMatch']='*'
  r=S.put_object(**kwargs);written.append({'path':key,'ETag':r['ETag'],'sha256':entry['sha256']});save('s3-applied.json',written)
 cfg=current['DistributionConfig']
 cfg['Aliases']['Items']+= [s['subdomain']+'.bunyang-alimi.com' for s in sites]
 cfg['Aliases']['Quantity']=len(cfg['Aliases']['Items'])
 cfg['ViewerCertificate']={'ACMCertificateArn':cert,'SSLSupportMethod':'sni-only','MinimumProtocolVersion':'TLSv1.2_2021'}
 assoc=cfg['DefaultCacheBehavior']['FunctionAssociations']['Items']
 for a in assoc:
  if a['EventType']=='viewer-request':a['FunctionARN']=published['FunctionSummary']['FunctionMetadata']['FunctionARN']
 r=C.update_distribution(Id=DIST,IfMatch=current['ETag'],DistributionConfig=cfg);save('cloudfront-applied.json',r)
 paths=['/','/index.html','/outputs/portal/index.html','/outputs/portal/app.js']+['/'+s['id']+'/*' for s in sites]
 inv=C.create_invalidation(DistributionId=DIST,InvalidationBatch={'Paths':{'Quantity':len(paths),'Items':paths},'CallerReference':'dedicated-prepare-'+str(time.time())});save('invalidation.json',inv)
 print(json.dumps({'stage':'prepared','files':len(written),'distributionStatus':r['Distribution']['Status'],'invalidation':inv['Invalidation']['Id']}))
elif stage=='activate':
 # Call only after all ten new DNS names and HTTPS roots are verified.
 import urllib.request
 for s in sites:
  with urllib.request.urlopen(s['url'],timeout=30) as res:
   body=res.read().decode();assert res.status==200 and 'content="'+s['id']+'"' in body,s['url']
 f=C.describe_function(Name=FN,Stage='DEVELOPMENT')
 r=C.update_function(Name=FN,IfMatch=f['ETag'],FunctionConfig=f['FunctionSummary']['FunctionConfig'],FunctionCode=read('after/sites/dedicated/routing.js').encode())
 C.publish_function(Name=FN,IfMatch=r['ETag'])
 save('activation.json',{'time':time.time(),'sites':len(sites),'redirects':'enabled'})
 print('ACTIVATED 10 dedicated sites and legacy URL redirects')
elif stage=='status':
 d=C.get_distribution(Id=DIST)['Distribution'];print(json.dumps({'status':d['Status'],'aliases':d['DistributionConfig']['Aliases']['Items']}))
else:raise ValueError(stage)
