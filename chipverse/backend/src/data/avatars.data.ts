export type AvatarCategory = 'anime' | 'marvel' | 'dc';
export type AvatarGender = 'male' | 'female';

export interface PresetAvatar {
  id: string;
  name: string;
  series: string;
  category: AvatarCategory;
  gender: AvatarGender;
  imagePath: string; // Devansh places images here in public/avatars/
}

export const PRESET_AVATARS: PresetAvatar[] = [
  // ── ANIME (10) ── 7M / 3F
  { id: 'eren',    name: 'Eren Yeager',    series: 'Attack on Titan', category: 'anime',  gender: 'male',   imagePath: '/avatars/anime/eren.png'    },
  { id: 'levi',    name: 'Levi Ackerman',  series: 'Attack on Titan', category: 'anime',  gender: 'male',   imagePath: '/avatars/anime/levi.png'    },
  { id: 'mikasa',  name: 'Mikasa Ackerman',series: 'Attack on Titan', category: 'anime',  gender: 'female', imagePath: '/avatars/anime/mikasa.png'  },
  { id: 'naruto',  name: 'Naruto Uzumaki', series: 'Naruto',          category: 'anime',  gender: 'male',   imagePath: '/avatars/anime/naruto.png'  },
  { id: 'sasuke',  name: 'Sasuke Uchiha',  series: 'Naruto',          category: 'anime',  gender: 'male',   imagePath: '/avatars/anime/sasuke.png'  },
  { id: 'kakashi', name: 'Kakashi Hatake', series: 'Naruto',          category: 'anime',  gender: 'male',   imagePath: '/avatars/anime/kakashi.png' },
  { id: 'itachi',  name: 'Itachi Uchiha',  series: 'Naruto',          category: 'anime',  gender: 'male',   imagePath: '/avatars/anime/itachi.png'  },
  { id: 'goku',    name: 'Goku',           series: 'Dragon Ball Z',   category: 'anime',  gender: 'male',   imagePath: '/avatars/anime/goku.png'    },
  { id: 'nezuko',  name: 'Nezuko Kamado',  series: 'Demon Slayer',    category: 'anime',  gender: 'female', imagePath: '/avatars/anime/nezuko.png'  },
  { id: 'hinata',  name: 'Hinata Hyuga',   series: 'Naruto',          category: 'anime',  gender: 'female', imagePath: '/avatars/anime/hinata.png'  },

  // ── MARVEL (6) ── 5M / 1F
  { id: 'spiderman',       name: 'Spider-Man',       series: 'Marvel', category: 'marvel', gender: 'male',   imagePath: '/avatars/marvel/spiderman.png'       },
  { id: 'thor',            name: 'Thor',             series: 'Marvel', category: 'marvel', gender: 'male',   imagePath: '/avatars/marvel/thor.png'            },
  { id: 'ironman',         name: 'Iron Man',         series: 'Marvel', category: 'marvel', gender: 'male',   imagePath: '/avatars/marvel/ironman.png'         },
  { id: 'captainamerica',  name: 'Captain America',  series: 'Marvel', category: 'marvel', gender: 'male',   imagePath: '/avatars/marvel/captainamerica.png'  },
  { id: 'hulk',            name: 'Hulk',             series: 'Marvel', category: 'marvel', gender: 'male',   imagePath: '/avatars/marvel/hulk.png'            },
  { id: 'blackwidow',      name: 'Black Widow',      series: 'Marvel', category: 'marvel', gender: 'female', imagePath: '/avatars/marvel/blackwidow.png'      },

  // ── DC (5) ── 3M / 2F
  { id: 'batman',      name: 'Batman',       series: 'DC', category: 'dc', gender: 'male',   imagePath: '/avatars/dc/batman.png'      },
  { id: 'superman',    name: 'Superman',     series: 'DC', category: 'dc', gender: 'male',   imagePath: '/avatars/dc/superman.png'    },
  { id: 'flash',       name: 'The Flash',    series: 'DC', category: 'dc', gender: 'male',   imagePath: '/avatars/dc/flash.png'       },
  { id: 'wonderwoman', name: 'Wonder Woman', series: 'DC', category: 'dc', gender: 'female', imagePath: '/avatars/dc/wonderwoman.png' },
  { id: 'harleyquinn', name: 'Harley Quinn', series: 'DC', category: 'dc', gender: 'female', imagePath: '/avatars/dc/harleyquinn.png' },
];

// ── CUSTOM AVATAR CONFIG ──────────────────────────────────────────────────────

export const SKIN_TONES    = ['light', 'medium', 'tan', 'dark', 'deep'] as const;
export const HAIR_STYLES   = ['short', 'long', 'curly', 'wavy', 'bald', 'ponytail', 'spiky', 'braids'] as const;
export const FACE_SHAPES   = ['oval', 'round', 'square', 'heart', 'diamond'] as const;
export const FACIAL_HAIR   = ['none', 'stubble', 'beard', 'mustache', 'goatee'] as const;
export const ACCESSORIES   = ['none', 'glasses', 'sunglasses', 'earrings', 'cap', 'headband'] as const;
export const OUTFITS       = ['casual', 'hoodie', 'suit', 'uniform', 'jacket', 'traditional'] as const;

export interface CustomAvatarConfig {
  skinTone:    typeof SKIN_TONES[number];
  hairStyle:   typeof HAIR_STYLES[number];
  hairColor:   string; // hex e.g. "#1a1a1a"
  eyeColor:    string; // hex e.g. "#4a90d9"
  faceShape:   typeof FACE_SHAPES[number];
  facialHair:  typeof FACIAL_HAIR[number];
  accessories: typeof ACCESSORIES[number];
  outfit:      typeof OUTFITS[number];
}

export const CUSTOM_AVATAR_OPTIONS = {
  skinTones:   SKIN_TONES,
  hairStyles:  HAIR_STYLES,
  faceShapes:  FACE_SHAPES,
  facialHair:  FACIAL_HAIR,
  accessories: ACCESSORIES,
  outfits:     OUTFITS,
};