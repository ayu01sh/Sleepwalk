const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';

// CORS-friendly space images from Unsplash (these always work as WebGL textures)
const corsImages = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Eagle_nebula_pillars.jpg/800px-Eagle_nebula_pillars.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/NGC_3372_by_CTIO.jpg/800px-NGC_3372_by_CTIO.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Andromeda_Galaxy_%28with_h-alpha%29.jpg/800px-Andromeda_Galaxy_%28with_h-alpha%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg/800px-Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Crab_Nebula.jpg/800px-Crab_Nebula.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/NASA-HS201427a-HubbleUltraDeepField2014-20140603.jpg/800px-NASA-HS201427a-HubbleUltraDeepField2014-20140603.jpg',
];

const fallbackImages = [
  {
    title: 'The Pillars of Creation',
    url: corsImages[0],
    explanation: 'A photograph taken by the Hubble Space Telescope of elephant trunks of interstellar gas and dust in the Eagle Nebula, some 6,500–7,000 light years from Earth.',
    date: '1995-04-01',
  },
  {
    title: 'Carina Nebula',
    url: corsImages[1],
    explanation: 'One of the largest diffuse nebulae in our skies. Although it is some four times as large and even brighter than the famous Orion Nebula, the Carina Nebula is much less well known.',
    date: '2010-04-23',
  },
  {
    title: 'Andromeda Galaxy',
    url: corsImages[2],
    explanation: 'A barred spiral galaxy approximately 2.5 million light-years from Earth and the nearest major galaxy to the Milky Way.',
    date: '2012-10-01',
  },
  {
    title: 'Orion Nebula',
    url: corsImages[3],
    explanation: 'A diffuse nebula situated in the Milky Way, being south of Orion\'s Belt in the constellation of Orion. It is one of the brightest nebulae and is visible to the naked eye in the night sky.',
    date: '2006-01-11',
  },
  {
    title: 'Crab Nebula Supernova Remnant',
    url: corsImages[4],
    explanation: 'A supernova remnant and pulsar wind nebula in the constellation of Taurus. The now-Loss nebula was identified as the supernova remnant of SN 1054 in 1731.',
    date: '2005-12-01',
  },
  {
    title: 'Deep Space Field',
    url: corsImages[5],
    explanation: 'A deep field view of distant galaxies spanning billions of light-years. Each point of light represents an entire galaxy, containing billions of stars.',
    date: '2022-07-12',
  }
];

export async function fetchGalleryImages() {
  try {
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&count=100`);
    
    if (!response.ok) {
      console.warn('NASA API fetch failed, using fallback images.', response.status);
      return fallbackImages;
    }

    const data = await response.json();
    
    // Filter to only image-type results with jpg/png URLs (not gif, not video)
    const isValidImageUrl = (url) => {
      if (!url) return false;
      const lower = url.toLowerCase();
      return (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png'));
    };

    const imageResults = data.filter(item => {
      if (item.media_type !== 'image') return false;
      const imgUrl = item.hdurl || item.url;
      return isValidImageUrl(imgUrl);
    });
    
    if (imageResults.length >= 50) {
      // Use actual NASA images but proxy them through a CORS proxy to bypass 'Access-Control-Allow-Origin' errors
      return imageResults.slice(0, 50).map((img) => {
        const targetUrl = img.hdurl || img.url;
        // Use allorigins raw proxy to add CORS headers to the NASA images
        const proxiedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
        return {
          title: img.title,
          url: proxiedUrl,
          explanation: img.explanation,
          date: img.date,
        };
      });
    } else {
      console.warn('Not enough valid image results from NASA API, using fallbacks.');
      // Make sure fallback provides at least 50 by repeating if necessary
      const fullFallback = [];
      for(let i=0; i<50; i++) {
        fullFallback.push(fallbackImages[i % fallbackImages.length]);
      }
      return fullFallback;
    }
  } catch (error) {
    console.error('Error fetching from NASA API:', error);
    const fullFallback = [];
    for(let i=0; i<50; i++) {
      fullFallback.push(fallbackImages[i % fallbackImages.length]);
    }
    return fullFallback;
  }
}
