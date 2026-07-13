import { planets } from '../data/planets';
import Planet from './Planet';
import Sun from './Sun';
import Earth from './Earth';
import { useProximity } from '../hooks/useProximity';
import { useNebulaProximity } from '../hooks/useNebulaProximity';
import AsteroidBelt from './AsteroidBelt';

export default function MuseumSystem({ astronautRef }) {
  // Calculate proximity to planets to drive UI
  useProximity(astronautRef);
  
  // Calculate proximity to nebula and monoliths
  useNebulaProximity(astronautRef);

  return (
    <>
      <Sun />
      <Earth />
      <AsteroidBelt />
      
      {planets.map((planetData) => (
        planetData.id !== 'earth' && <Planet key={planetData.id} data={planetData} />
      ))}
    </>
  );
}
