export const planets = [
  {
    id: 'mercury',
    name: 'Mercury',
    radius: 1.9,
    position: [40, 0, -40], // distance ~56
    textures: {
      albedo: '/textures/planets/2k_mercury.jpg',
    },
    facts: {
      diameter: '4,879 km',
      distance: '57.9 million km',
      description: 'A scorched, cratered world closest to the Sun.',
    }
  },
  {
    id: 'venus',
    name: 'Venus',
    radius: 4.7,
    position: [80, 0, -80], // distance ~113
    textures: {
      albedo: '/textures/planets/2k_venus_surface.jpg',
    },
    facts: {
      diameter: '12,104 km',
      distance: '108.2 million km',
      description: 'Shrouded in thick, toxic clouds that trap heat in a runaway greenhouse effect.',
    }
  },
  {
    id: 'earth',
    name: 'Earth',
    radius: 5,
    position: [160, 0, -80], // distance ~178
    textures: {},
    facts: {
      diameter: '12,742 km',
      distance: '149.6 million km',
      description: 'A vibrant oasis, the only known world to harbor life.',
    }
  },
  {
    id: 'mars',
    name: 'Mars',
    radius: 2.5,
    position: [240, 0, 60],
    textures: {
      albedo: '/textures/planets/2k_mars.jpg',
    },
    facts: {
      diameter: '6,779 km',
      distance: '227.9 million km',
      description: 'A dusty, cold, desert world with a very thin atmosphere.',
    }
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    radius: 15, // Not to scale, but large enough to feel massive
    position: [400, 0, 200],
    textures: {
      albedo: '/textures/planets/2k_jupiter.jpg',
    },
    facts: {
      diameter: '139,820 km',
      distance: '778.5 million km',
      description: 'A gas giant with a Great Red Spot that is a centuries-old storm.',
    }
  },
  {
    id: 'saturn',
    name: 'Saturn',
    radius: 12.5,
    position: [640, 0, 400],
    hasRings: true,
    ringRadius: [15, 25],
    textures: {
      albedo: '/textures/planets/2k_saturn.jpg',
      ringAlpha: '/textures/planets/2k_saturn_ring_alpha.png',
    },
    facts: {
      diameter: '116,460 km',
      distance: '1.4 billion km',
      description: 'Adorned with a dazzling, complex system of icy rings.',
    }
  },
  {
    id: 'uranus',
    name: 'Uranus',
    radius: 10,
    position: [960, 0, 700],
    textures: {
      albedo: '/textures/planets/2k_uranus.jpg',
    },
    facts: {
      diameter: '50,724 km',
      distance: '2.9 billion km',
      description: 'An ice giant that rotates on its side.',
    }
  },
  {
    id: 'neptune',
    name: 'Neptune',
    radius: 9.8,
    position: [1400, 0, 1100],
    textures: {
      albedo: '/textures/planets/2k_neptune.jpg',
    },
    facts: {
      diameter: '49,244 km',
      distance: '4.5 billion km',
      description: 'Dark, cold, and whipped by supersonic winds.',
    }
  }
];
