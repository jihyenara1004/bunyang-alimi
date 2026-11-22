"""Deploy isolated GD site; never modifies the main site's resources."""
import boto3, json, pathlib, hashlib
from botocore.exceptions import ClientError
ROOT = pathlib.Path(__file__).resolve().parent
ACCOUNT = '801178768218'
BUCKET = 'gdmetro-site-801178768218'
REGION = 'ap-southeast-2'
DOMAIN = 'gdmetro.bunyang-alimi.com'
CERT = 'arn:aws:acm:us-east-1:801178768218:certificate/45958a92-2cf6-4137-aee3-779c86291e1c'
assert boto3.client('sts').get_caller_identity()['Account'] == ACCOUNT
s3 = boto3.client('s3', region_name=REGION)
cf = boto3.client('cloudfront')
state_file = ROOT / 'deployment-state.json'
state = json.loads(state_file.read_text()) if state_file.exists() else {}
if state:
    assert state.get('bucket') == BUCKET
    assert state.get('distribution') == 'E3M5DDZ45DY2F9'
def save():
    state_file.write_text(json.dumps(state, indent=2))
if not state.get('bucket'):
    # Refuse to repurpose a bucket that was not created by this deployment.
    try:
        s3.head_bucket(Bucket=BUCKET)
        raise RuntimeError('Bucket already exists; review before adoption')
    except ClientError as e:
        if e.response['Error']['Code'] not in ['404', 'NoSuchBucket']:
            raise
    s3.create_bucket(Bucket=BUCKET, CreateBucketConfiguration={'LocationConstraint':REGION}, ObjectOwnership='BucketOwnerEnforced')
    state['bucket'] = BUCKET
    save()
    s3.put_public_access_block(Bucket=BUCKET, PublicAccessBlockConfiguration={x:True for x in ['BlockPublicAcls','IgnorePublicAcls','BlockPublicPolicy','RestrictPublicBuckets']})
    s3.put_bucket_encryption(Bucket=BUCKET, ServerSideEncryptionConfiguration={'Rules':[{'ApplyServerSideEncryptionByDefault':{'SSEAlgorithm':'AES256'}}]})
for name, mime in [('index.html','text/html; charset=utf-8'),('favicon.svg','image/svg+xml'),('robots.txt','text/plain; charset=utf-8'),('sitemap.xml','application/xml')]:
    data = (ROOT / 'site' / name).read_bytes()
    s3.put_object(Bucket=BUCKET, Key=name, Body=data, ContentType=mime, CacheControl='public,max-age=300')
    state.setdefault('sha256', {})[name] = hashlib.sha256(data).hexdigest()
save()
if not state.get('oac'):
    oac = cf.create_origin_access_control(OriginAccessControlConfig={'Name':'gdmetro-site-oac-20261122','Description':'Dedicated GD Metro site S3 access','SigningProtocol':'sigv4','SigningBehavior':'always','OriginAccessControlOriginType':'s3'})
    state['oac'] = oac['OriginAccessControl']['Id']
    save()
if not state.get('distribution'):
    config = {
      'CallerReference':'gdmetro-site-20261122', 'Comment':'GD Metro dedicated site gdmetro.bunyang-alimi.com',
      'DefaultRootObject':'index.html','Enabled':True,'HttpVersion':'http2','IsIPV6Enabled':True,
      'Origins':{'Quantity':1,'Items':[{'Id':'gdmetro-s3','DomainName':f'{BUCKET}.s3.{REGION}.amazonaws.com','S3OriginConfig':{'OriginAccessIdentity':''},'OriginAccessControlId':state['oac']}]},
      'DefaultCacheBehavior':{'TargetOriginId':'gdmetro-s3','ViewerProtocolPolicy':'redirect-to-https','AllowedMethods':{'Quantity':2,'Items':['GET','HEAD'],'CachedMethods':{'Quantity':2,'Items':['GET','HEAD']}},'Compress':True,'CachePolicyId':'658327ea-f89d-4fab-a63d-7e88639e58f6','TrustedSigners':{'Enabled':False,'Quantity':0},'TrustedKeyGroups':{'Enabled':False,'Quantity':0}},
      'ViewerCertificate':{'CloudFrontDefaultCertificate':True},'Aliases':{'Quantity':0},'PriceClass':'PriceClass_All'
    }
    dist = cf.create_distribution(DistributionConfig=config)['Distribution']
    state.update(distribution=dist['Id'], distributionArn=dist['ARN'], cloudfrontDomain=dist['DomainName'])
    save()
policy={'Version':'2012-10-17','Statement':[{'Sid':'AllowOnlyDedicatedCloudFront','Effect':'Allow','Principal':{'Service':'cloudfront.amazonaws.com'},'Action':'s3:GetObject','Resource':f'arn:aws:s3:::{BUCKET}/*','Condition':{'StringEquals':{'AWS:SourceArn':state['distributionArn']}}}]}
s3.put_bucket_policy(Bucket=BUCKET, Policy=json.dumps(policy))
cert = boto3.client('acm',region_name='us-east-1').describe_certificate(CertificateArn=CERT)['Certificate']
state['certificateStatus']=cert['Status']
if cert['Status']=='ISSUED':
    current=cf.get_distribution_config(Id=state['distribution'])
    config=current['DistributionConfig']
    if DOMAIN not in config.get('Aliases',{}).get('Items',[]):
        config['Aliases']={'Quantity':1,'Items':[DOMAIN]}
        config['ViewerCertificate']={'ACMCertificateArn':CERT,'SSLSupportMethod':'sni-only','MinimumProtocolVersion':'TLSv1.2_2021'}
        cf.update_distribution(Id=state['distribution'],IfMatch=current['ETag'],DistributionConfig=config)
    state['customDomain']=DOMAIN
invalidation = cf.create_invalidation(DistributionId=state['distribution'], InvalidationBatch={'Paths':{'Quantity':1,'Items':['/*']},'CallerReference':__import__('uuid').uuid4().hex})
state['lastInvalidation'] = invalidation['Invalidation']['Id']
save()
print(json.dumps(state,indent=2))
