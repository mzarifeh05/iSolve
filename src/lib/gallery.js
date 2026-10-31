export const GALLERY_PAGE_SIZE=6;
export const galleryCategories=['all','training','zcc','moments'];

/** Load one prepared static metadata page. Full images load only when opened. */
export async function loadGallery({category='all',offset=0}={}){
  if(!galleryCategories.includes(category)||!Number.isInteger(offset)||offset<0||offset%GALLERY_PAGE_SIZE!==0)throw new Error('Invalid gallery page');
  const response=await fetch(`/gallery-data/v1/${category}-${offset}.json`);
  if(!response.ok)throw new Error('Could not load gallery photos');
  return response.json();
}
export async function galleryLightbox(photo){const image=photo.variants.lightbox;return{...image,url:image.path,fallback_url:image.fallback_path};}
