"""Generate 30 Bahamas-themed pixel boards. All artwork is original grid art."""
import json,random,collections
from PIL import Image, ImageDraw
from pathlib import Path
ROOT=Path(__file__).parent
base=json.loads((ROOT/'source-levels.json').read_text())
order=[0,10,4,7,1,2,6,8,12,13,5,3,11,15,9,14,16,17]
size=[(24,18),(26,21),(27,22),(28,23),(28,23),(30,24),(31,25),(32,26),(32,26),(32,26),(33,27),(34,28),(34,28),(35,29),(35,29),(36,30),(36,30),(36,30)]
levels=[]
for n,j in enumerate(order):
 e=base[j]; w,h=size[n]; src=Image.new('P',(32,26)); pix=src.load();
 for y,row in enumerate(e['art']):
  for x,v in enumerate(row):pix[x,y]=ord(v)
 dest=src.resize((w,h),Image.Resampling.NEAREST); art=[]
 for y in range(h):art.append(''.join(chr(dest.getpixel((x,y))) for x in range(w)))
 levels.append({'name':e['name'],'caption':e['caption'],'art':art,'tier':1 if n<5 else 2 if n<11 else 3})

P={'.':(0,0,0),'X':(65,64,78),'A':(36,166,169),'Y':(241,200,82),'P':(236,117,179),'C':(241,142,121),'W':(255,249,232),'B':(82,148,189),'O':(243,171,97),'G':(97,170,115),'R':(229,95,100),'L':(151,125,184),'S':(220,181,136),'D':(87,82,103),'H':(247,223,129),'N':(42,83,123),'T':(33,121,133),'V':(136,198,196)}
seed=random.Random(145)

def painter():
 im=Image.new('RGB',(44,34),P['.']);d=ImageDraw.Draw(im)
 def rect(x0,y0,x1,y1,c):d.rectangle((x0,y0,x1,y1),fill=P[c])
 def poly(pts,c):d.polygon(pts,fill=P[c])
 def ell(box,c):d.ellipse(box,fill=P[c])
 def line(pts,c,width=1):d.line(pts,fill=P[c],width=width)
 return im,rect,poly,ell,line

def scene(idx):
 im,rect,poly,ell,line=painter(); rng=random.Random(idx*93)
 # Frame-spanning scenes gradually grow in color detail; the distinct foreground is the puzzle.
 rect(0,0,43,19,'B');rect(0,20,43,33,'A')
 rect(0,0,43,4,'V')
 for k in range(15):
  x=rng.randrange(44);y=rng.randrange(5,18);rect(x,y,min(43,x+rng.randrange(1,4)),y,'V')
 for k in range(30):
  x=rng.randrange(44);y=rng.randrange(21,34);rect(x,y,min(43,x+rng.randrange(1,5)),y,'T' if k%2 else 'B')
 if idx==19: # underwater reef / lucayan park
  rect(0,0,43,33,'N');rect(0,0,43,4,'A');rect(0,5,43,14,'B');rect(0,15,43,33,'T')
  for x,y,r in [(5,29,6),(16,31,8),(32,32,10)]:ell((x-r,y-r,x+r,y+r),'S');ell((x-r+2,y-r+2,x+r-2,y+r-2),'G')
  for x,y in [(7,17),(13,24),(25,20),(37,17)]:poly([(x,y+12),(x-3,y+5),(x,y+8),(x+2,y),(x+3,y+12)],'C')
  for x,y in [(8,9),(18,13),(29,8),(35,23)]:ell((x-3,y-1,x+3,y+1),'Y');poly([(x+3,y),(x+6,y-2),(x+6,y+2)],'O');rect(x-1,y,x,y,'X')
 if idx==20: # pig beach
  rect(0,18,43,23,'H');poly([(0,23),(18,21),(32,24),(43,22),(43,33),(0,33)],'S')
  rect(0,15,43,18,'A');ell((4,13,16,20),'G');ell((12,14,23,19),'G')
  for x,y,s in [(10,21,1),(27,25,2)]:
   ell((x,y,x+12*s//2,y+5*s//2),'P');ell((x+7*s//2,y-3*s//2,x+12*s//2,y+2*s//2),'P');ell((x+11*s//2,y,x+13*s//2,y+1*s//2),'C')
   rect(x+1,y+4,x+2,y+7,'D');rect(x+6,y+4,x+7,y+7,'D');rect(x+10*s//2,y-1,x+10*s//2,y-1,'X')
 if idx==21: # fish fry stalls
  rect(0,0,43,33,'H');rect(0,20,43,33,'S');rect(2,10,20,25,'C');rect(24,10,41,25,'A')
  poly([(0,11),(11,4),(23,11)],'R');poly([(22,11),(32,4),(43,11)],'Y')
  for x,c in [(4,'Y'),(10,'W'),(16,'Y'),(26,'W'),(33,'Y'),(39,'W')]:rect(x,13,x+2,17,c)
  rect(4,18,18,20,'D');rect(25,18,39,20,'D');ell((17,21,27,25),'W');ell((19,22,24,24),'O')
  for x in range(6,39,6):rect(x,27,x+3,27,'G')
 if idx==22: # glass window bridge
  rect(0,0,21,33,'N');rect(22,0,43,33,'A')
  for y in range(2,32,4):rect(0,y,20,y,'B');rect(23,y+1,43,y+1,'V')
  poly([(0,11),(12,13),(24,15),(37,16),(43,20),(43,24),(28,19),(12,18),(0,16)],'S')
  poly([(0,12),(13,14),(25,16),(43,20),(43,21),(24,17),(10,15),(0,14)],'D')
  for x in (8,18,28,38):rect(x,15,x+2,17,'Y')
 if idx==23: # harbour
  rect(0,0,43,15,'B');rect(0,16,43,33,'T');rect(0,15,43,16,'V')
  for x,w,h,c in [(0,8,6,'P'),(9,7,10,'Y'),(17,8,7,'W'),(26,7,11,'C'),(34,9,9,'H')]:
   rect(x,15-h,x+w,15,c);rect(x+1,15-h+2,x+2,15-h+3,'D');rect(x+4,15-h+2,x+5,15-h+3,'D')
  for x,y in [(4,23),(24,27),(33,22)]:poly([(x-5,y),(x+7,y),(x+4,y+3),(x-2,y+3)],'W');line([(x+1,y),(x+1,y-10)],'D');poly([(x+2,y-9),(x+7,y-1),(x+2,y-1)],'Y')
 if idx==24: # Junkanoo
  rect(0,0,43,33,'D');rect(0,23,43,33,'S')
  for x,main in [(9,'Y'),(23,'P'),(36,'A')]:
   poly([(x,4),(x-9,14),(x-5,17),(x,11),(x+4,17),(x+8,13)],main)
   ell((x-3,12,x+3,18),'C');rect(x-2,15,x-1,15,'X');rect(x+1,15,x+2,15,'X');poly([(x-4,18),(x+4,18),(x+7,28),(x-7,28)],main)
   for yy in range(20,27,2):rect(x-5,yy,x+5,yy,'W' if yy%4==0 else 'O')
   rect(x-6,29,x-4,32,'N');rect(x+4,29,x+6,32,'N')
  for x in range(1,42,6):rect(x,0,x+2,2,'Y')
 if idx==25: # Queen's staircase
  rect(0,0,43,33,'G');poly([(7,0),(37,0),(32,33),(12,33)],'S');
  for y in range(5,34,3):
   l=7+y//6;r=37-y//6;rect(l,y,r,y+1,'W');rect(l,y+2,r,y+2,'D')
  rect(1,0,5,33,'D');rect(39,0,43,33,'D')
  for x in (3,41):
   line([(x,20),(x,0)],'S',2)
   for dx in [-6,-3,3,6]:line([(x,5),(x+dx,1)],'G',2)
 if idx==26: # atlantis
  rect(0,0,43,33,'B');rect(0,28,43,33,'A');rect(0,25,43,28,'G')
  rect(3,8,15,26,'C');rect(29,8,41,26,'C');rect(15,15,29,26,'H')
  for x in [3,29]:
   poly([(x-1,8),(x+6,1),(x+13,8)],'O');rect(x+3,3,x+9,6,'Y')
   for wx in range(x+2,x+12,4):
    for wy in range(10,25,4):rect(wx,wy,wx+1,wy+2,'N')
  for xx in range(18,28,3):rect(xx,17,xx+1,24,'D')
  for x in (17,25):rect(x,12,x+2,14,'O')
 if idx==27: # bay street
  rect(0,0,43,33,'V');rect(0,26,43,33,'S')
  for x,w,h,c in [(0,8,14,'P'),(9,9,19,'Y'),(19,9,16,'C'),(29,7,20,'A'),(37,7,15,'R')]:
   rect(x,26-h,x+w-1,26,c);rect(x,25-h,x+w-1,26-h,'W')
   for wx in range(x+2,x+w-2,4):
    for wy in range(29-h,24,5):rect(wx,wy,wx+1,wy+2,'D')
  for x in range(5,43,13):poly([(x-4,23),(x+5,23),(x+7,28),(x-6,28)],'G')
 if idx==28: # exuma sandbars
  rect(0,0,43,33,'A');
  for x,y in [(0,13),(16,24),(32,8)]:ell((x-11,y-6,x+16,y+4),'H');ell((x-7,y-4,x+12,y+2),'W')
  for x,y in [(10,12),(33,26)]:poly([(x-6,y),(x+7,y),(x+4,y+3),(x-3,y+3)],'D');rect(x,y-5,x,y,'S');poly([(x+1,y-5),(x+6,y),(x+1,y)],'Y')
  for k in range(30):
   x=rng.randrange(44);y=rng.randrange(34);
   if im.getpixel((x,y))==P['A']:rect(x,y,x+1,y,'B')
 if idx==29: # mixed bahamian postcard
  rect(0,0,43,33,'H');rect(0,23,43,33,'A');rect(0,21,43,22,'S')
  poly([(0,18),(11,8),(21,18)],'P');rect(4,18,18,24,'C');rect(10,19,13,23,'D')
  rect(29,8,33,24,'W');rect(28,7,34,9,'R');rect(28,12,34,14,'R');rect(28,17,34,19,'R')
  for dx in (21,25,37,41):line([(dx,23),(dx,9)],'D');line([(dx,9),(dx-5,4)],'G',2)
  poly([(15,29),(28,29),(25,32),(17,32)],'Y')
  for x in range(0,44,5):rect(x,0,x+1,1,'P')
 if idx==30: # Junkanoo festival night
  rect(0,0,43,33,'N');rect(0,26,43,33,'D')
  for cx,cy,co in [(8,6,'Y'),(23,3,'P'),(36,8,'A')]:
   for dx,dy in [(-5,0),(5,0),(0,5),(0,-2),(-3,-3),(3,3),(3,-3),(-3,3)]:line([(cx,cy),(cx+dx,cy+dy)],co)
  for x,co in [(10,'R'),(23,'Y'),(36,'P')]:
   poly([(x,9),(x-8,19),(x-3,22),(x,16),(x+3,22),(x+8,19)],co);ell((x-2,17,x+2,21),'C')
   poly([(x-5,23),(x+5,23),(x+8,33),(x-8,33)],co)
   for yy in (24,27,30):rect(x-5,yy,x+5,yy,'W' if yy==27 else 'O')
  for x in range(1,43,3):rect(x,32,x+1,33,'Y')
 return im

extra=[('Lucayan Reef','A world of colour beneath the sea.'),('Pig Beach','Famous swimmers in the Exumas.'),('Arawak Cay Fish Fry','The smell of Nassau on a Friday.'),('Glass Window Bridge','Where two shades of blue meet.'),('Nassau Harbour','Sailboats under colourful rooftops.'),('Junkanoo Parade','The rhythm of the streets.'),('Queen’s Staircase','Carved in limestone, steeped in history.'),('Atlantis Towers','A landmark on Paradise Island.'),('Bay Street','Colours of downtown Nassau.'),('Exuma Sandbars','A sea of impossible blue.'),('Bahamas Postcard','Island icons, all in one frame.'),('Junkanoo After Dark','A night full of drums and colour.')]
inv={v:k for k,v in P.items()}
for i,(name,caption) in enumerate(extra,19):
 im=scene(i)
 art=[''.join(inv[im.getpixel((x,y))] for x in range(44)) for y in range(34)]
 levels.append({'name':name,'caption':caption,'art':art,'tier':4 if i<25 else 5})
assert len(levels)==30
for i,l in enumerate(levels):
 assert len({len(s) for s in l['art']})==1
 assert set(''.join(l['art'])) <= set(P)
print('TOTAL LEVELS',len(levels))
print('DETAIL:',[(i+1,l['name'],len(l['art'][0])*len(l['art']),len(set(''.join(l['art']))-{'.'})) for i,l in enumerate(levels)])
(ROOT/'levels.js').write_text('window.ISLAND_LEVELS = '+json.dumps(levels,ensure_ascii=False,separators=(',',':'))+';\n')
(ROOT/'levels.json').write_text(json.dumps(levels,ensure_ascii=False,indent=2))
# Draw preview montage: no external imagery
from PIL import ImageFont
out=Image.new('RGB',(5*216,6*214),'#f0e3d3');p=ImageDraw.Draw(out)
for n,l in enumerate(levels):
 rows=l['art'];w=len(rows[0]);h=len(rows);tile=4
 x=(n%5)*216+18;y=(n//5)*214+13
 for j,row in enumerate(rows):
  for i,col in enumerate(row):
   if col!='.':p.rectangle((x+i*tile,y+j*tile,x+(i+1)*tile-1,y+(j+1)*tile-1),fill=P[col])
 p.text((x,y+155),f"{n+1}. {l['name'][:23]}",fill='#333042')
out.save(ROOT/'assets/levels-contact-sheet.png')