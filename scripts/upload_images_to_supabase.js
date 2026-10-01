import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cosnhycbvsxedogtejos.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const images = [
  {
    localPath: 'C:\\Users\\mhdsamxn\\.gemini\\antigravity-ide\\brain\\0999d010-3f8d-481a-9c3e-c86aff0842dc\\white_oblong_tablet_1790888934074.jpg',
    storageName: 'white-oblong-tablet.jpg',
    type: 'image/jpeg'
  },
  {
    localPath: 'C:\\Users\\mhdsamxn\\.gemini\\antigravity-ide\\brain\\0999d010-3f8d-481a-9c3e-c86aff0842dc\\orange_white_capsule_1790888951559.jpg',
    storageName: 'orange-white-capsule.jpg',
    type: 'image/jpeg'
  },
  {
    localPath: 'C:\\Users\\mhdsamxn\\.gemini\\antigravity-ide\\brain\\0999d010-3f8d-481a-9c3e-c86aff0842dc\\pink_round_tablet_1790888977185.jpg',
    storageName: 'pink-round-tablet.jpg',
    type: 'image/jpeg'
  },
  {
    localPath: 'C:\\Users\\mhdsamxn\\.gemini\\antigravity-ide\\brain\\0999d010-3f8d-481a-9c3e-c86aff0842dc\\yellow_oblong_tablet_1790888996200.jpg',
    storageName: 'yellow-oblong-tablet.jpg',
    type: 'image/jpeg'
  },
  {
    localPath: 'C:\\Users\\mhdsamxn\\.gemini\\antigravity-ide\\brain\\0999d010-3f8d-481a-9c3e-c86aff0842dc\\white_round_tablet_1790889041583.jpg',
    storageName: 'white-round-tablet.jpg',
    type: 'image/jpeg'
  },
  {
    localPath: 'C:\\Users\\mhdsamxn\\.gemini\\antigravity-ide\\brain\\0999d010-3f8d-481a-9c3e-c86aff0842dc\\medical_inhaler_1790889056221.jpg',
    storageName: 'medical-inhaler.jpg',
    type: 'image/jpeg'
  }
];

async function uploadAll() {
  console.log('Uploading images to Supabase Storage "medicine-images"...');
  
  for (const img of images) {
    if (!fs.existsSync(img.localPath)) {
      console.error(`File missing: ${img.localPath}`);
      continue;
    }
    const fileBuffer = fs.readFileSync(img.localPath);
    const { data, error } = await supabase.storage
      .from('medicine-images')
      .upload(img.storageName, fileBuffer, {
        contentType: img.type,
        upsert: true
      });

    if (error) {
      console.error(`Error uploading ${img.storageName}:`, error.message);
    } else {
      const { data: pubData } = supabase.storage
        .from('medicine-images')
        .getPublicUrl(img.storageName);
      console.log(`Uploaded ${img.storageName} -> ${pubData.publicUrl}`);
    }
  }
}

uploadAll();
