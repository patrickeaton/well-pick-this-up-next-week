/** Achievements, kept across every session and every playthrough. */
export interface AchievementDef {
  id: string;
  /** A Material Symbols icon name. */
  icon: string;
  name: string;
  desc: string;
  /** Shown as ??? until unlocked. */
  secret?: boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Endings
  { id: 'end-tpk', icon: 'skull', name: 'Technically Finished', desc: 'Reach the Total Party Kill ending.' },
  { id: 'end-bad', icon: 'payments', name: 'Worth It', desc: 'Reach The Long Sleep ending.' },
  { id: 'end-good', icon: 'notifications_active', name: 'Harrowmere Wakes', desc: 'Reach the good ending.' },
  { id: 'end-secret', icon: 'auto_awesome', name: "The Groundhog's Rest", desc: 'Reach the secret ending.', secret: true },

  // The story
  { id: 'snooze', icon: 'bedtime', name: 'Five More Minutes', desc: 'Find the Amulet of the Groundhog.' },
  { id: 'deja-vu', icon: 'pets', name: 'Déjà Vu', desc: "Use the amulet to take a path you've seen before." },
  { id: 'loaded', icon: 'my_location', name: 'Loaded Die', desc: 'Use the amulet to choose your own roll.' },
  { id: 'ham', icon: 'kebab_dining', name: 'Bring a Ham', desc: 'Feed the mimic something other than yourself.' },
  { id: 'thirteen', icon: 'looks_one', name: 'Unlucky for Some', desc: 'Open the mimic chest with a real 13.' },
  { id: 'eaten', icon: 'sentiment_stressed', name: 'Snack-Sized', desc: 'Get eaten by the mimic.' },
  { id: 'chute', icon: 'south', name: 'Graceful? No.', desc: 'Slide down the coal chute.' },
  { id: 'stuck', icon: 'block', name: 'Stuck', desc: 'Get stuck in the coal chute.' },
  { id: 'secret-spot', icon: 'search', name: 'Nothing to See Here', desc: 'Find a hidden spot that the map never highlights.' },
  { id: 'flipped', icon: 'flip', name: 'Other Side', desc: 'Flip a page over and read the back.' },
  { id: 'grind', icon: 'cottage', name: 'Rise and Grind', desc: 'Wake the miller.', secret: true },
  { id: 'honk', icon: 'egg', name: 'Honk', desc: 'Make friends with the goose.', secret: true },
  { id: 'brawler', icon: 'swords', name: 'Brawler', desc: 'Win three fights in one night.' },
  { id: 'rise', icon: 'alarm', name: 'Rise and Shine', desc: 'Wake someone with smelling salts.' },
  { id: 'curious', icon: 'lightbulb', name: 'Curious', desc: 'Find something useful by taking a closer look.' },
  { id: 'explorer', icon: 'map', name: 'Explorer', desc: 'Visit every location in Harrowmere.' },
  { id: 'nobody-leaves', icon: 'block', name: 'Nobody Leaves', desc: 'Try to walk out of the town gate.' },
  { id: 'all-pages', icon: 'library_books', name: 'Completionist', desc: 'Collect every page for your binder.' },

  // Dice
  { id: 'nat20', icon: 'star', name: 'Natural 20', desc: 'Roll a 20.' },
  { id: 'nat1', icon: 'sentiment_dissatisfied', name: 'Natural 1', desc: 'Roll a 1.' },

  // The table
  { id: 'repeat', icon: 'replay', name: 'I Literally Just Told You', desc: 'Make Marcus repeat himself.' },
  { id: 'barrel', icon: 'inventory_2', name: 'Everything Is a Barrel', desc: 'Push the table to the end of its patience.' },
  { id: 'rally', icon: 'fitness_center', name: 'One More Scene', desc: 'Have a friend rally instead of falling asleep.' },
  { id: 'midnight', icon: 'dark_mode', name: 'Past Midnight', desc: 'Keep the table going until midnight.' },
  { id: 'best-friend', icon: 'favorite', name: 'Best Friends', desc: 'Reach five hearts with someone.' },
  { id: 'know-them', icon: 'menu_book', name: 'Know Your Table', desc: "Learn every one of a friend's tastes." },
  { id: 'long-gap', icon: 'calendar_month', name: 'Life Got in the Way', desc: 'Go ten weeks between sessions.' },
];
