# 블로그 본문 사진 생성기 (유사이미지 방지: 정사각형 재구성 + 자르기 + 설명 띠 + 워터마크, 좌우반전 없음)
# 사용: python3 -I blog/make_photos.py spec.json 출력폴더
# spec.json: [{"src": ["a.jpg"] 또는 ["a.jpg","b.jpg"], "crop": [x0,y0,x1,y1](비율 0~1, 생략 가능), "title": "큰 글자", "sub": "작은 글자", "fit": "cover|contain"}]
import sys, json
from PIL import Image, ImageDraw, ImageFont
spec, out = json.load(open(sys.argv[1])), sys.argv[2]
B = '/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc'
Bd = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
F = lambda p, s: ImageFont.truetype(p, s, index=0)
GOLD = (214, 170, 90); NAVY = (16, 34, 70)
W, IH, BAND = 1000, 800, 200
WM = '리치메이커'  # 블로그 사진 워터마크는 리치메이커

def load(path, crop):
    im = Image.open(path).convert('RGB')
    if crop:
        w, h = im.size
        im = im.crop((int(crop[0]*w), int(crop[1]*h), int(crop[2]*w), int(crop[3]*h)))
    return im

def place(im, w, h, fit):
    if fit == 'contain':
        bg = Image.new('RGB', (w, h), 'white'); c = im.copy(); c.thumbnail((w-40, h-40))
        bg.paste(c, ((w-c.width)//2, (h-c.height)//2)); return bg
    r = max(w/im.width, h/im.height); im = im.resize((int(im.width*r)+1, int(im.height*r)+1))
    l, t = (im.width-w)//2, (im.height-h)//2
    return im.crop((l, t, l+w, t+h))

def watermark(im):
    lay = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    t = Image.new('RGBA', (700, 120), (0, 0, 0, 0)); ImageDraw.Draw(t).text((10, 10), WM, font=F(B, 90), fill=(255, 255, 255, 46))
    t = t.rotate(30, expand=True); lay.alpha_composite(t, ((im.width-t.width)//2, (im.height-t.height)//2))
    f = F(Bd, 30); bb = d.textbbox((0, 0), WM, font=f)
    x, y = im.width-bb[2]-24, im.height-bb[3]-20
    d.rounded_rectangle([x-12, y-6, x+bb[2]+12, y+bb[3]+10], 8, fill=(0, 0, 0, 110))
    d.text((x, y), WM, font=f, fill=(255, 255, 255, 235))
    return Image.alpha_composite(im.convert('RGBA'), lay).convert('RGB')

for n, s in enumerate(spec, 1):
    crop = s.get('crop'); srcs = s['src']; fit = s.get('fit', 'cover')
    if len(srcs) == 1:
        top = place(load(srcs[0], crop), W, IH, fit)
    else:  # 2장 합치기 (좌우)
        top = Image.new('RGB', (W, IH), 'white')
        for i, p in enumerate(srcs):
            top.paste(place(load(p, None), W//2-4, IH, fit), (i*(W//2+4), 0))
    top = watermark(top)
    c = Image.new('RGB', (W, IH+BAND), NAVY); c.paste(top, (0, 0)); d = ImageDraw.Draw(c)
    d.rectangle([0, IH, W, IH+6], fill=GOLD)
    def ctr(t, y, f, fill):
        b = d.textbbox((0, 0), t, font=f); d.text(((W-(b[2]-b[0]))/2-b[0], y), t, font=f, fill=fill)
    ctr(s['title'], IH+38, F(B, 52), 'white')
    if s.get('sub'): ctr(s['sub'], IH+118, F(Bd, 32), GOLD)
    c.save(f'{out}/{n:02d}.jpg', quality=92)
print('done', len(spec))
