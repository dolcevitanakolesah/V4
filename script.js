const cars=[
{folder:'01',prefix:'AlfaGTJunior',year:'1970',name:'Alfa Romeo GT 1300 Junior'},
{folder:'02',prefix:'Testarossa',year:'1991',name:'Ferrari Testarossa'},
{folder:'03',prefix:'Fiat500',year:'1970',name:'Fiat 500L'},
{folder:'04',prefix:'Montreal',year:'1972',name:'Alfa Romeo Montreal'},
{folder:'05',prefix:'DinoSpider',year:'1967',name:'Fiat Dino Spider'},
{folder:'06',prefix:'Fulvia',year:'1974',name:'Lancia Fulvia Coupé'},
{folder:'07',prefix:'Ghibli',year:'1969',name:'Maserati Ghibli'},
{folder:'08',prefix:'Spider',year:'1971',name:'Alfa Romeo Spider'},
{folder:'09',prefix:'Lamborghini350GT',year:'1965',name:'Lamborghini 350 GT'},
{folder:'10',prefix:'Flaminia',year:'1962',name:'Lancia Flaminia Coupé'},
{folder:'11',prefix:'Pantera',year:'1973',name:'De Tomaso Pantera'},
{folder:'12',prefix:'Ferrari308GTB',year:'1984',name:'Ferrari 308 GTB'}];
const grid=document.getElementById('carGrid'),dialog=document.getElementById('galleryDialog'),galleryGrid=document.getElementById('galleryGrid'),lightbox=document.getElementById('lightbox'),lightboxContent=document.getElementById('lightboxContent');
let activeItems=[],activeIndex=0;
function path(car,file){return `assets/${car.folder}/${file}`}
function loadImage(src){return new Promise(resolve=>{const img=new Image();img.onload=()=>resolve({src,ok:true});img.onerror=()=>resolve({src,ok:false});img.src=src})}
async function discoverSequence(car,extension,start=1,max=200){
  const found=[];
  for(let n=start;n<=max;n++){
    const filename=`${car.prefix}-${String(n).padStart(2,'0')}.${extension}`;
    const result=await loadImage(path(car,filename));
    if(!result.ok)break;
    found.push({src:result.src,number:n});
  }
  return found;
}
function makeCard(car,index){const card=document.createElement('article');card.className='car-card';card.tabIndex=0;card.setAttribute('role','button');card.innerHTML=`<div class="car-image-wrap"><img class="car-image" src="${path(car,car.prefix+'-Main.jpg')}" alt="${car.year} ${car.name}" loading="${index<3?'eager':'lazy'}"></div><p class="car-title">${car.year} ${car.name}</p>`;card.addEventListener('click',()=>openGallery(car));card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openGallery(car)}});return card}
async function openGallery(car){
  document.getElementById('galleryTitle').textContent=`${car.year} ${car.name}`;
  galleryGrid.innerHTML='<p class="gallery-loading">Loading photographs…</p>';
  activeItems=[];
  if(!dialog.open)dialog.showModal();
  const photos=await discoverSequence(car,'jpg',1,200);
  activeItems=photos.map((p)=>({type:'image',src:p.src,title:`Photograph ${String(p.number).padStart(2,'0')}`}));
  // Optional locally hosted videos can be named PREFIX-10.mp4, PREFIX-11.mp4, etc.
  // Scan from 10 to keep the existing naming convention; stop at the first missing video.
  for(let n=10;n<=30;n++){
    const src=path(car,`${car.prefix}-${n}.mp4`);
    const ok=await mediaExists(src);
    if(!ok)break;
    activeItems.push({type:'video',src,title:`Video ${String(n).padStart(2,'0')}`});
  }
  galleryGrid.innerHTML='';
  if(!activeItems.length){galleryGrid.innerHTML='<p>No numbered photographs found. Check the folder, prefix, and filenames.</p>';return}
  activeItems.forEach((item,index)=>{
    const fig=document.createElement('figure');fig.className='gallery-item';
    if(item.type==='image'){
      const img=document.createElement('img');img.src=item.src;img.alt=item.title;img.loading='lazy';img.addEventListener('click',()=>showLightbox(index));fig.appendChild(img);
    } else {
      const v=document.createElement('video');v.className='gallery-video';v.src=item.src;v.controls=true;v.preload='metadata';v.playsInline=true;fig.appendChild(v);
      const open=document.createElement('button');open.className='video-open';open.type='button';open.textContent='Open video';open.addEventListener('click',()=>showLightbox(index));fig.appendChild(open);
    }
    const cap=document.createElement('figcaption');cap.textContent=`${String(index+1).padStart(2,'0')} · ${item.title}`;fig.appendChild(cap);galleryGrid.appendChild(fig);
  });
}
function mediaExists(src){return new Promise(resolve=>{const v=document.createElement('video');v.preload='metadata';v.onloadedmetadata=()=>resolve(true);v.onerror=()=>resolve(false);v.src=src})}
function showLightbox(i){activeIndex=i;renderLightbox();if(!lightbox.open)lightbox.showModal()}
function renderLightbox(){const item=activeItems[activeIndex];if(!item)return;lightboxContent.innerHTML='';if(item.type==='video'){const v=document.createElement('video');v.src=item.src;v.controls=true;v.autoplay=true;v.playsInline=true;lightboxContent.appendChild(v)}else{const img=document.createElement('img');img.src=item.src;img.alt=item.title;lightboxContent.appendChild(img)}document.getElementById('lightboxCounter').textContent=`${activeIndex+1} / ${activeItems.length} · ${item.title}`}
function move(d){if(!activeItems.length)return;activeIndex=(activeIndex+d+activeItems.length)%activeItems.length;renderLightbox()}
document.getElementById('closeGallery').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});document.getElementById('closeLightbox').addEventListener('click',()=>lightbox.close());document.getElementById('prevImage').addEventListener('click',()=>move(-1));document.getElementById('nextImage').addEventListener('click',()=>move(1));lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close()});document.addEventListener('keydown',e=>{if(!lightbox.open)return;if(e.key==='ArrowLeft')move(-1);if(e.key==='ArrowRight')move(1)});cars.forEach((c,i)=>grid.appendChild(makeCard(c,i)));
