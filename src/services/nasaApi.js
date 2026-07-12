const NASA_API_KEY = 'vw3eIZq5zQ0vSAHxT6Y5gdOlA7y03FEZLhMdMNk5';

// CORS-friendly space images from Unsplash (these always work as WebGL textures)
const corsImages = [
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1536697246787-1f27d3540d46?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f41?q=80&w=1200&auto=format&fit=crop',
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
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&count=20`);
    
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
    
    if (imageResults.length >= 17) {
      // Use NASA metadata (title, explanation, date) but pair with CORS-safe images
      // This gives us real NASA descriptions while ensuring textures always load
      return imageResults.slice(0, 17).map((img, i) => ({
        title: img.title,
        url: corsImages[i % corsImages.length],
        explanation: img.explanation,
        date: img.date,
      }));
    } else {
      console.warn('Not enough valid image results from NASA API, using fallbacks.');
      // Make sure fallback provides at least 17 by repeating if necessary
      const fullFallback = [];
      for(let i=0; i<17; i++) {
        fullFallback.push(fallbackImages[i % fallbackImages.length]);
      }
      return fullFallback;
    }
  } catch (error) {
    console.error('Error fetching from NASA API:', error);
    const fullFallback = [];
    for(let i=0; i<17; i++) {
      fullFallback.push(fallbackImages[i % fallbackImages.length]);
    }
    return fullFallback;
  }
}
