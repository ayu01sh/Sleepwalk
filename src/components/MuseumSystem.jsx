import { planets } from '../data/planets';
import Planet from './Planet';
import Sun from './Sun';
import Earth from './Earth';
import { useProximity } from '../hooks/useProximity';

export default function MuseumSystem({ astronautRef }) {
  // Calculate proximity to planets to drive UI
  useProximity(astronautRef);

  return (
    <>
      <Sun />
      <Earth />
      
      {planets.map((planetData) => (
        planetData.id !== 'earth' && <Planet key={planetData.id} data={planetData} />
      ))}
    </>
  );
}
