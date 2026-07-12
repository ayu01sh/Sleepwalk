import { useStore } from '../store/useStore';
import { monoliths } from '../data/nebulaData';
import Monolith from './Monolith';
import { Suspense } from 'react';

export default function MonolithGallery() {
  const nasaImages = useStore(state => state.nasaImages);
  const nasaImagesLoaded = useStore(state => state.nasaImagesLoaded);

  // Don't render until we have images
  if (!nasaImagesLoaded || nasaImages.length === 0) return null;

  return (
    <>
      {monoliths.map((monolithData, index) => {
        const imageData = nasaImages[index % nasaImages.length];
        
        return (
          <Suspense key={monolithData.id} fallback={null}>
            <Monolith data={monolithData} imageData={imageData} />
          </Suspense>
        );
      })}
    </>
  );
}
