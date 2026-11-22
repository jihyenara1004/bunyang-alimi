"""Deploy three GD HTML objects and three explicitly allowed GD introduction images."""
import argparse
import hashlib
import json
import pathlib
import subprocess
import uuid
from datetime import datetime, timezone
import boto3
from botocore.exceptions import ClientError

ROOT = pathlib.Path(__file__).resolve().parent
REPO = ROOT.parent.parent
MAIN = 'bunyang-alimi-site-801178768218'
DEDICATED = 'gdmetro-site-801178768218'
TARGETS = {
    (MAIN, 'outputs/portal/assets/gd-intro-day-20261123.png'): 'outputs/portal/assets/gd-intro-day-20261123.png',
    (MAIN, 'outputs/portal/assets/gd-intro-night-20261123.jpg'): 'outputs/portal/assets/gd-intro-night-20261123.jpg',
    (MAIN, 'outputs/portal/assets/gd-intro-wide-20261123.jpg'): 'outputs/portal/assets/gd-intro-wide-20261123.jpg',
    (MAIN, 'gdmetro/index.html'): 'gdmetro/index.html',
    (MAIN, 'outputs/portal/properties/gdmetro.html'): 'outputs/portal/properties/gdmetro.html',
    (DEDICATED, 'index.html'): 'sites/gdmetro/site/index.html',
}
DISTRIBUTIONS = {MAIN: 'E32LEWGSB3SNIZ', DEDICATED: 'E3M5DDZ45DY2F9'}
INVALIDATION_PATHS = {
    MAIN: ['/gdmetro', '/gdmetro/*', '/outputs/portal/properties/gdmetro.html*', '/outputs/portal/assets/gd-intro-*-20261123.*'],
    DEDICATED: ['/', '/index.html*'],
}
META_FIELDS = ('ContentType', 'CacheControl', 'ContentDisposition', 'ContentEncoding', 'ContentLanguage', 'Expires', 'Metadata', 'WebsiteRedirectLocation')
sha = lambda data: hashlib.sha256(data).hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true', help='Upload both sites; otherwise only check')
    args = parser.parse_args()
    subprocess.run(['node', str(ROOT / 'test.mjs')], check=True)
    subprocess.run(['node', str(ROOT / 'build.mjs')], check=True, stdout=subprocess.DEVNULL)
    manifest = json.loads((ROOT / 'build-report.json').read_text(encoding='utf-8'))
    actual = {(f['bucket'], f['key']): f['path'] for f in manifest['files']}
    if actual != TARGETS or len(manifest['files']) != len(TARGETS):
        raise RuntimeError('Deployment allowlist mismatch')
    if boto3.client('sts').get_caller_identity()['Account'] != '801178768218':
        raise RuntimeError('Wrong AWS account')
    s3 = boto3.client('s3', region_name='ap-southeast-2')
    cf = boto3.client('cloudfront')
    def read_object(pair):
        try:
            obj = s3.get_object(Bucket=pair[0], Key=pair[1])
            return {'body': obj['Body'].read(), 'metadata': {k: obj[k] for k in META_FIELDS if k in obj}}
        except ClientError as error:
            if error.response['Error']['Code'] in ('NoSuchKey', '404'):
                return None
            raise
    expected = json.loads((ROOT / 'deployed-hashes.json').read_text(encoding='utf-8'))
    def census(bucket):
        out = {}
        for page in s3.get_paginator('list_objects_v2').paginate(Bucket=bucket):
            for obj in page.get('Contents', []):
                if (bucket, obj['Key']) not in TARGETS:
                    out[obj['Key']] = [obj['ETag'], obj['Size'], obj['LastModified'].isoformat()]
        return out
    before = {bucket: census(bucket) for bucket in DISTRIBUTIONS}
    backups = {}
    uploads = []
    for f in manifest['files']:
        pair = (f['bucket'], f['key'])
        data = (REPO / f['path']).read_bytes()
        if sha(data) != f['sha256']:
            raise RuntimeError('Generated file hash mismatch')
        remote = read_object(pair)
        if remote is None and f['kind'] != 'image':
            raise RuntimeError('Existing GD HTML missing: ' + '/'.join(pair))
        current = sha(remote['body']) if remote else None
        if current not in (expected.get('/'.join(pair)), f['sha256']):
            raise RuntimeError('Live GD changed since last snapshot: ' + '/'.join(pair))
        backups[pair] = remote
        if current != f['sha256']:
            uploads.append((f, data))
    print(json.dumps({'mode': 'apply' if args.apply else 'check', 'sourceSha256': manifest['sourceSha256'], 'plannedUploads': [f['bucket'] + '/' + f['key'] for f, _ in uploads], 'unrelatedObjectCount': {b: len(v) for b, v in before.items()}}), flush=True)
    if not args.apply:
        return
    release = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ') + '-' + uuid.uuid4().hex[:8]
    backup_dir = ROOT / '.deploy-backups' / release
    backup_dir.mkdir(parents=True)
    for (bucket, key), old in backups.items():
        if old is None:
            continue
        p = backup_dir / bucket / key
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(old['body'])
    report = {'release': release, 'sourceSha256': manifest['sourceSha256'], 'changed': [], 'invalidations': [], 'status': 'pending'}
    (backup_dir / 'metadata.json').write_text(json.dumps({b+'/'+k: x['metadata'] if x else None for (b,k),x in backups.items()}, default=str, indent=2), encoding='utf-8')
    attempted = []
    try:
        for f, data in uploads:
            pair = (f['bucket'], f['key'])
            # Recheck immediately before each write to avoid overwriting a concurrent edit.
            now = read_object(pair)
            if (sha(now['body']) if now else None) != (sha(backups[pair]['body']) if backups[pair] else None):
                raise RuntimeError('Concurrent change: ' + '/'.join(pair))
            attempted.append(pair)
            s3.put_object(Bucket=pair[0], Key=pair[1], Body=data, ContentType=f['contentType'], CacheControl='public,max-age=300')
            if sha(s3.get_object(Bucket=pair[0], Key=pair[1])['Body'].read()) != f['sha256']:
                raise RuntimeError('S3 readback mismatch')
            report['changed'].append('/'.join(pair))
    except Exception:
        for pair in attempted:
            if backups[pair] is not None:
                s3.put_object(Bucket=pair[0], Key=pair[1], Body=backups[pair]['body'], **backups[pair]['metadata'])
        report['newUnreferencedAssetsRetained'] = ['/'.join(pair) for pair in attempted if backups[pair] is None]
        report['status'] = 'rolled-back-upload-failure'
        (ROOT / 'deployment-report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
        raise
    # Cache invalidation can be resumed by rerunning after a successful upload.
    for bucket, distribution in DISTRIBUTIONS.items():
        paths = INVALIDATION_PATHS[bucket]
        inv = cf.create_invalidation(DistributionId=distribution, InvalidationBatch={'Paths': {'Quantity': len(paths), 'Items': paths}, 'CallerReference': release + '-' + distribution})['Invalidation']
        report['invalidations'].append({'distribution': distribution, 'id': inv['Id'], 'paths': paths})
    after = {bucket: census(bucket) for bucket in DISTRIBUTIONS}
    report['unrelatedObjectsUnchanged'] = before == after
    report['unrelatedObjectCount'] = {b: len(v) for b, v in before.items()}
    report['status'] = 'uploaded-cache-refresh-pending'
    (ROOT / 'deployed-hashes.json').write_text(json.dumps({f['bucket']+'/'+f['key']:f['sha256'] for f in manifest['files']}, indent=2)+'\n', encoding='utf-8')
    (ROOT / 'deployment-report.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(report), flush=True)
    if before != after:
        raise RuntimeError('Unrelated S3 object changes detected; inspect before declaring complete')
    print('Wait for the listed invalidations, then run node sites/gdmetro/verify.mjs. Save the updated reports to GitHub and Drive.', flush=True)

if __name__ == '__main__':
    main()
