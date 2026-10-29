import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { rmSync } from 'node:fs';
import path from 'node:path';

export default defineConfig(({mode})=>{
  const environment=loadEnv(mode,process.cwd(),'VITE_');
  const liveConfigured=Boolean(environment.VITE_SUPABASE_URL?.trim()||environment.VITE_SUPABASE_PUBLISHABLE_KEY?.trim());
  
  return {
    // Render and local preview serve the application from the domain root.
    base: '/',
    plugins: [react(),{
      name:'private-gallery-storage',apply:'build',
      closeBundle(){
        if(!liveConfigured)return;
        // Live galleries use private Supabase storage; do not leave public copies
        // that would bypass unpublishing. Delete only these verified dist folders.
        const dist=path.resolve(process.cwd(),'dist');
        for(const relative of ['assets/gallery','gallery-data']){
          const target=path.resolve(dist,relative);
          if(!target.startsWith(dist+path.sep))throw new Error('Invalid gallery output path');
          rmSync(target,{recursive:true,force:true});
        }
      },
    }],
    build: { chunkSizeWarningLimit: 650 },
  };
});
