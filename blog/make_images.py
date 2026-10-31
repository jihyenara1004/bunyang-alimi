# 블로그 썸네일(1000x1000)과 문의 배너(1200x315) 생성기 (Pillow 필요, Noto Sans CJK 폰트 사용)
# 사용: python3 -I blog/make_images.py "브라이튼 여의도" "BRIGHTEN YEOUIDO" "반포 다음은" "여의도" "재건축 속도, 완성된 신축을 볼 때" 출력폴더
import sys, math
from PIL import Image, ImageDraw, ImageFont
name, eng, l1, l2, sub, out = sys.argv[1:7]
PHONE='1688-5650'
B='/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc'
Bd='/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
R='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
F=lambda p,s: ImageFont.truetype(p,s,index=0)
GOLD=(214,170,90); PINK=(255,92,150)
def bg(im,w,h,horizontal=False):
    d=ImageDraw.Draw(im)
    for i in range(w if horizontal else h):
        t=i/(w if horizontal else h)
        c=(int(12+16*t),int(24+22*t),int(52+40*t)) if horizontal else (14,int(26+30*t),56+int(40*t))
        d.line([(i,0),(i,h)] if horizontal else [(0,i),(w,i)],fill=c)
    return d
# 1) 썸네일: 글자는 가운데 안전영역, "분양알리미" 문구는 넣지 않음, 맨 아래 대표번호(골드)
W=1000; im=Image.new('RGB',(W,W)); d=bg(im,W,W)
d.rectangle([60,60,W-60,W-60],outline=GOLD,width=4)
def ctr(t,y,f,fill):
    b=d.textbbox((0,0),t,font=f); d.text(((W-(b[2]-b[0]))/2-b[0],y),t,font=f,fill=fill)
ctr(l1,210,F(B,100),'white'); hs=150
while hs>90 and d.textbbox((0,0),l2,font=F(B,hs))[2]>720: hs-=4
ctr(l2,335+(150-hs)//2,F(B,hs),PINK)
ns=84
while ns>48 and d.textbbox((0,0),name,font=F(B,ns))[2]>760: ns-=2
ctr(name,530+(84-ns)//2,F(B,ns),'white')
d.line([(300,660),(700,660)],fill=GOLD,width=3)
ctr(sub,690,F(Bd,36),(220,225,240)); ctr('대표번호 '+PHONE,800,F(B,52),GOLD)
im.save(f'{out}/썸네일.jpg',quality=95)
# 2) 문의 배너 1200x315: 현장명 + 24시간 문의 환영 + 대표번호
W,H=1200,315; bn=Image.new('RGB',(W,H)); d=bg(bn,W,H,True)
d.rectangle([14,14,W-14,H-14],outline=GOLD,width=2)
d.text((60,52),eng,font=F(Bd,24),fill=GOLD)
ns=64
while ns>40 and d.textbbox((0,0),name,font=F(B,ns))[2]>600: ns-=2
d.text((60,92+(64-ns)//2),name,font=F(B,ns),fill='white')
d.text((60,184),'24시간 문의 환영',font=F(Bd,40),fill=(255,110,160))
d.text((60,242),'현장 방문 · 호실별 가격 상담',font=F(R,26),fill=(200,208,230))
d.line([(690,60),(690,255)],fill=GOLD,width=2)
cx,cy=770,158; d.ellipse([cx-52,cy-52,cx+52,cy+52],fill=(230,30,60))
ic=Image.new('RGBA',(160,160),(0,0,0,0)); di=ImageDraw.Draw(ic); c=80; r=46
di.arc([c-r,c-r,c+r,c+r],start=215,end=325,fill='white',width=24)
for a in (215,325):
    x=c+r*math.cos(math.radians(a)); y=c+r*math.sin(math.radians(a))
    di.rounded_rectangle([x-20,y-5,x+20,y+30],radius=9,fill='white')
ic=ic.rotate(40,resample=Image.BICUBIC).resize((84,84),Image.LANCZOS)
bn.paste(ic,(cx-42,cy-42),ic)
d.text((850,100),'대표번호',font=F(Bd,26),fill=GOLD); d.text((850,138),PHONE,font=F(B,62),fill='white')
bn.save(f'{out}/문의배너.jpg',quality=95)
