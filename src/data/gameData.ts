// Fort Lauderdale Intimate Escapes - Game Data

export type IntensityLevel = 'mild' | 'spicy' | 'xxx';
export type GameMode = 'truth-or-dare' | 'never-have-i-ever' | 'escape-adventure';

export interface GameCard {
  id: string;
  type: 'truth' | 'dare' | 'never' | 'clue';
  content: string;
  intensity: IntensityLevel;
  category: string;
}

export interface EscapeStop {
  id: string;
  stopNumber: number;
  name: string;
  image: string;
  clue: string;
  challenge: string;
  hint: string;
  address: string;
  coordinates?: { lat: number; lng: number };
}

export interface EscapeAdventure {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  intensity: IntensityLevel;
  duration: string;
  stops: EscapeStop[];
  reward: string;
}

// Legacy single location type for backwards compatibility
export interface EscapeLocation {
  id: string;
  name: string;
  image: string;
  description: string;
  clue: string;
  challenge: string;
  intensity: IntensityLevel;
  address: string;
  coordinates?: { lat: number; lng: number };
}

// Truth or Dare Cards - More Sexually Explicit
export const truthOrDareCards: GameCard[] = [
  // Mild Truths - Flirty & Suggestive
  { id: 't1', type: 'truth', content: "What part of my body do you fantasize about touching the most?", intensity: 'mild', category: 'Desire' },
  { id: 't2', type: 'truth', content: "What outfit of mine turns you on the most?", intensity: 'mild', category: 'Attraction' },
  { id: 't3', type: 'truth', content: "Where on your body do you secretly want me to kiss you right now?", intensity: 'mild', category: 'Desire' },
  { id: 't4', type: 'truth', content: "What's the sexiest dream you've ever had about me?", intensity: 'mild', category: 'Fantasy' },
  { id: 't5', type: 'truth', content: "What do I do that turns you on without even trying?", intensity: 'mild', category: 'Attraction' },
  { id: 't6', type: 'truth', content: "If you could watch me do anything, what would it be?", intensity: 'mild', category: 'Voyeur' },
  { id: 't7', type: 'truth', content: "What's the first thing you noticed about my body when we met?", intensity: 'mild', category: 'Attraction' },
  { id: 't8', type: 'truth', content: "What's your favorite way to be seduced?", intensity: 'mild', category: 'Seduction' },
  
  // Mild Dares - Teasing & Sensual
  { id: 'd1', type: 'dare', content: "Kiss my neck slowly for 30 seconds while whispering what you want to do to me", intensity: 'mild', category: 'Seduction' },
  { id: 'd2', type: 'dare', content: "Run your hands slowly over my body without touching any intimate areas for 1 minute", intensity: 'mild', category: 'Tease' },
  { id: 'd3', type: 'dare', content: "Give me a lap dance while maintaining eye contact", intensity: 'mild', category: 'Seduction' },
  { id: 'd4', type: 'dare', content: "Blindfold me and kiss me somewhere unexpected", intensity: 'mild', category: 'Surprise' },
  { id: 'd5', type: 'dare', content: "Slowly remove one piece of your clothing while I watch", intensity: 'mild', category: 'Tease' },
  { id: 'd6', type: 'dare', content: "Trace your lips across my collarbone and whisper your dirtiest thought", intensity: 'mild', category: 'Seduction' },
  
  // Spicy Truths - Sexually Charged
  { id: 't9', type: 'truth', content: "Describe in detail how you want me to pleasure you tonight", intensity: 'spicy', category: 'Desire' },
  { id: 't10', type: 'truth', content: "What's the kinkiest thing you've imagined us doing together?", intensity: 'spicy', category: 'Fantasy' },
  { id: 't11', type: 'truth', content: "Where's the riskiest place you've ever wanted to have sex with me?", intensity: 'spicy', category: 'Adventure' },
  { id: 't12', type: 'truth', content: "What sexual act have you been too shy to ask me for?", intensity: 'spicy', category: 'Secrets' },
  { id: 't13', type: 'truth', content: "Describe your favorite position with me and why it drives you wild", intensity: 'spicy', category: 'Pleasure' },
  { id: 't14', type: 'truth', content: "What's the longest you've ever wanted sex to last with me?", intensity: 'spicy', category: 'Desire' },
  { id: 't15', type: 'truth', content: "What do I do during sex that makes you lose control?", intensity: 'spicy', category: 'Pleasure' },
  { id: 't16', type: 'truth', content: "Have you ever touched yourself while thinking about me? Describe it.", intensity: 'spicy', category: 'Confession' },
  { id: 't17', type: 'truth', content: "What's your secret erogenous zone that I haven't discovered yet?", intensity: 'spicy', category: 'Body' },
  { id: 't18', type: 'truth', content: "What role-play scenario turns you on the most?", intensity: 'spicy', category: 'Fantasy' },
  
  // Spicy Dares - Intimate & Bold
  { id: 'd7', type: 'dare', content: "Undress me using only your mouth and teeth", intensity: 'spicy', category: 'Seduction' },
  { id: 'd8', type: 'dare', content: "Give me a sensual massage, getting closer to intimate areas but not touching them", intensity: 'spicy', category: 'Tease' },
  { id: 'd9', type: 'dare', content: "Demonstrate on my body exactly where and how you want to be touched", intensity: 'spicy', category: 'Instruction' },
  { id: 'd10', type: 'dare', content: "Whisper in explicit detail what you're going to do to me later tonight", intensity: 'spicy', category: 'Dirty Talk' },
  { id: 'd11', type: 'dare', content: "Let me watch you touch yourself for 60 seconds", intensity: 'spicy', category: 'Voyeur' },
  { id: 'd12', type: 'dare', content: "Kiss and lick a trail from my neck to my waistline", intensity: 'spicy', category: 'Foreplay' },
  { id: 'd13', type: 'dare', content: "Straddle me and grind slowly while telling me your dirtiest fantasy", intensity: 'spicy', category: 'Seduction' },
  { id: 'd14', type: 'dare', content: "Take a sexy photo of us together (for our eyes only)", intensity: 'spicy', category: 'Adventure' },
  
  // XXX Truths - Explicit & Uninhibited
  { id: 't19', type: 'truth', content: "Describe in explicit detail your ultimate sexual fantasy with me", intensity: 'xxx', category: 'Fantasy' },
  { id: 't20', type: 'truth', content: "What's the dirtiest thing you've ever wanted to say to me during sex?", intensity: 'xxx', category: 'Dirty Talk' },
  { id: 't21', type: 'truth', content: "Have you ever fantasized about adding someone else to our bedroom? Describe it.", intensity: 'xxx', category: 'Fantasy' },
  { id: 't22', type: 'truth', content: "What's the most intense orgasm you've ever had with me? What made it so good?", intensity: 'xxx', category: 'Pleasure' },
  { id: 't23', type: 'truth', content: "What taboo act have you secretly wanted to try with me?", intensity: 'xxx', category: 'Kink' },
  { id: 't24', type: 'truth', content: "Describe exactly how you want me to make you climax tonight", intensity: 'xxx', category: 'Instruction' },
  { id: 't25', type: 'truth', content: "What's your deepest, darkest sexual secret?", intensity: 'xxx', category: 'Confession' },
  { id: 't26', type: 'truth', content: "If we made a private video, what would you want us to do in it?", intensity: 'xxx', category: 'Fantasy' },
  { id: 't27', type: 'truth', content: "What's the most submissive/dominant thing you want to do or have done to you?", intensity: 'xxx', category: 'Kink' },
  { id: 't28', type: 'truth', content: "Describe your perfect night of non-stop sex with me", intensity: 'xxx', category: 'Fantasy' },
  
  // XXX Dares - Explicit & Passionate
  { id: 'd15', type: 'dare', content: "Perform oral pleasure on me for 2 minutes, teasing and building anticipation", intensity: 'xxx', category: 'Pleasure' },
  { id: 'd16', type: 'dare', content: "Let me tie your hands and have my way with you for 5 minutes", intensity: 'xxx', category: 'Bondage' },
  { id: 'd17', type: 'dare', content: "Recreate the hottest sexual moment we've ever shared", intensity: 'xxx', category: 'Memory' },
  { id: 'd18', type: 'dare', content: "Use a toy on me while describing what you're doing", intensity: 'xxx', category: 'Toys' },
  { id: 'd19', type: 'dare', content: "Take complete control and dominate me for the next 10 minutes", intensity: 'xxx', category: 'Dominance' },
  { id: 'd20', type: 'dare', content: "Let me pleasure you in any way I choose until you can't take it anymore", intensity: 'xxx', category: 'Surrender' },
  { id: 'd21', type: 'dare', content: "Act out your favorite position while narrating your fantasy", intensity: 'xxx', category: 'Role-play' },
  { id: 'd22', type: 'dare', content: "Edge me to the brink three times before letting me finish", intensity: 'xxx', category: 'Tease' },
];

// Never Have I Ever Cards - More Sexually Explicit (50 cards total)

export const neverHaveIEverCards: GameCard[] = [
  // Mild - Suggestive & Flirty (17 cards)
  { id: 'n1', type: 'never', content: "Never have I ever fantasized about someone while with my partner", intensity: 'mild', category: 'Secrets' },
  { id: 'n2', type: 'never', content: "Never have I ever been turned on in a completely inappropriate place", intensity: 'mild', category: 'Confession' },
  { id: 'n3', type: 'never', content: "Never have I ever touched myself thinking about my partner", intensity: 'mild', category: 'Solo' },
  { id: 'n4', type: 'never', content: "Never have I ever sent a nude photo", intensity: 'mild', category: 'Digital' },
  { id: 'n5', type: 'never', content: "Never have I ever had a sex dream about a friend", intensity: 'mild', category: 'Fantasy' },
  { id: 'n6', type: 'never', content: "Never have I ever been caught checking someone out by my partner", intensity: 'mild', category: 'Confession' },
  { id: 'n7', type: 'never', content: "Never have I ever faked being tired to avoid sex", intensity: 'mild', category: 'Secrets' },
  { id: 'n8', type: 'never', content: "Never have I ever worn something specifically to seduce my partner", intensity: 'mild', category: 'Seduction' },
  { id: 'n9', type: 'never', content: "Never have I ever had a crush on my partner's friend", intensity: 'mild', category: 'Secrets' },
  { id: 'n10', type: 'never', content: "Never have I ever pretended to be asleep when my partner wanted intimacy", intensity: 'mild', category: 'Confession' },
  { id: 'n11', type: 'never', content: "Never have I ever flirted with someone just to make my partner jealous", intensity: 'mild', category: 'Games' },
  { id: 'n12', type: 'never', content: "Never have I ever read my partner's private messages", intensity: 'mild', category: 'Secrets' },
  { id: 'n13', type: 'never', content: "Never have I ever had a romantic dream about a celebrity", intensity: 'mild', category: 'Fantasy' },
  { id: 'n14', type: 'never', content: "Never have I ever been caught staring at someone's body", intensity: 'mild', category: 'Confession' },
  { id: 'n15', type: 'never', content: "Never have I ever lied about my number of past partners", intensity: 'mild', category: 'Secrets' },
  { id: 'n16', type: 'never', content: "Never have I ever practiced kissing on my hand or pillow", intensity: 'mild', category: 'Confession' },
  { id: 'n17', type: 'never', content: "Never have I ever stalked an ex on social media while in a relationship", intensity: 'mild', category: 'Secrets' },
  
  // Spicy - Sexually Charged (17 cards)
  { id: 'n18', type: 'never', content: "Never have I ever had sex in a public place", intensity: 'spicy', category: 'Adventure' },
  { id: 'n19', type: 'never', content: "Never have I ever watched porn with a partner", intensity: 'spicy', category: 'Shared' },
  { id: 'n20', type: 'never', content: "Never have I ever been walked in on during sex", intensity: 'spicy', category: 'Caught' },
  { id: 'n21', type: 'never', content: "Never have I ever had a one-night stand", intensity: 'spicy', category: 'History' },
  { id: 'n22', type: 'never', content: "Never have I ever used food during sex", intensity: 'spicy', category: 'Kink' },
  { id: 'n23', type: 'never', content: "Never have I ever sexted someone while at work", intensity: 'spicy', category: 'Digital' },
  { id: 'n24', type: 'never', content: "Never have I ever had sex in a car", intensity: 'spicy', category: 'Adventure' },
  { id: 'n25', type: 'never', content: "Never have I ever been tied up during sex", intensity: 'spicy', category: 'Bondage' },
  { id: 'n26', type: 'never', content: "Never have I ever had sex with the lights fully on", intensity: 'spicy', category: 'Confidence' },
  { id: 'n27', type: 'never', content: "Never have I ever used a sex toy with a partner", intensity: 'spicy', category: 'Toys' },
  { id: 'n28', type: 'never', content: "Never have I ever had phone sex or video sex", intensity: 'spicy', category: 'Digital' },
  { id: 'n29', type: 'never', content: "Never have I ever skinny dipped with someone", intensity: 'spicy', category: 'Adventure' },
  { id: 'n30', type: 'never', content: "Never have I ever role-played in the bedroom", intensity: 'spicy', category: 'Fantasy' },
  { id: 'n31', type: 'never', content: "Never have I ever had sex in a hotel room with thin walls", intensity: 'spicy', category: 'Adventure' },
  { id: 'n32', type: 'never', content: "Never have I ever given or received a lap dance", intensity: 'spicy', category: 'Seduction' },
  { id: 'n33', type: 'never', content: "Never have I ever been blindfolded during intimacy", intensity: 'spicy', category: 'Kink' },
  { id: 'n34', type: 'never', content: "Never have I ever had a friends-with-benefits arrangement", intensity: 'spicy', category: 'History' },
  
  // XXX - Explicit & Uninhibited (16 cards)
  { id: 'n35', type: 'never', content: "Never have I ever had a threesome", intensity: 'xxx', category: 'Group' },
  { id: 'n36', type: 'never', content: "Never have I ever filmed myself having sex", intensity: 'xxx', category: 'Digital' },
  { id: 'n37', type: 'never', content: "Never have I ever tried anal play", intensity: 'xxx', category: 'Exploration' },
  { id: 'n38', type: 'never', content: "Never have I ever role-played as strangers meeting for the first time", intensity: 'xxx', category: 'Role-play' },
  { id: 'n39', type: 'never', content: "Never have I ever had sex that lasted more than 2 hours", intensity: 'xxx', category: 'Endurance' },
  { id: 'n40', type: 'never', content: "Never have I ever been completely dominated in bed", intensity: 'xxx', category: 'Power' },
  { id: 'n41', type: 'never', content: "Never have I ever given or received a golden shower", intensity: 'xxx', category: 'Kink' },
  { id: 'n42', type: 'never', content: "Never have I ever had sex with more than one person in the same day", intensity: 'xxx', category: 'History' },
  { id: 'n43', type: 'never', content: "Never have I ever visited a sex club or swingers party", intensity: 'xxx', category: 'Adventure' },
  { id: 'n44', type: 'never', content: "Never have I ever had an orgasm from oral alone", intensity: 'xxx', category: 'Pleasure' },
  { id: 'n45', type: 'never', content: "Never have I ever experimented with BDSM", intensity: 'xxx', category: 'Kink' },
  { id: 'n46', type: 'never', content: "Never have I ever had sex outdoors where someone could see", intensity: 'xxx', category: 'Exhibition' },
  { id: 'n47', type: 'never', content: "Never have I ever used handcuffs or restraints during sex", intensity: 'xxx', category: 'Bondage' },
  { id: 'n48', type: 'never', content: "Never have I ever had a sexual encounter with someone I just met", intensity: 'xxx', category: 'History' },
  { id: 'n49', type: 'never', content: "Never have I ever acted out a scene from an adult film", intensity: 'xxx', category: 'Fantasy' },
  { id: 'n50', type: 'never', content: "Never have I ever had multiple orgasms in one session", intensity: 'xxx', category: 'Pleasure' },
];


// Fort Lauderdale Multi-Stop Escape Adventures
export const escapeAdventures: EscapeAdventure[] = [
  {
    id: 'adventure1',
    name: 'Moonlit Lovers Trail',
    description: 'A romantic journey through Fort Lauderdale\'s most intimate spots under the stars',
    coverImage: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479146840_fad1cb6a.jpg',
    intensity: 'mild',
    duration: '2-3 hours',
    reward: 'Complete this escape to unlock a special couples massage technique guide',
    stops: [
      {
        id: 'a1s1',
        stopNumber: 1,
        name: 'Las Olas Fountain',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479146840_fad1cb6a.jpg',
        clue: "Where palm trees whisper secrets and water dances to the rhythm of love, find the fountain where wishes begin. Stand where the mist kisses your skin...",
        challenge: "Hold hands, close your eyes, and each make a secret wish about your intimate life together. Then share a passionate 30-second kiss.",
        hint: "Look for the iconic fountain on Las Olas Boulevard near the shops",
        address: 'Las Olas Blvd & SE 6th Ave, Fort Lauderdale, FL',
        coordinates: { lat: 26.1185, lng: -80.1376 }
      },
      {
        id: 'a1s2',
        stopNumber: 2,
        name: 'Riverwalk Lovers Bench',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479129554_f82bc6dd.png',
        clue: "Follow the river where yachts dream and string lights paint the night. Seek the bench beneath the old oak where countless lovers have sat before you...",
        challenge: "Sit together on the bench. Take turns whispering your most romantic fantasy about each other. End with a slow dance under the lights.",
        hint: "Walk along the Riverwalk toward the Stranahan House, look for benches under large trees",
        address: 'Riverwalk Fort Lauderdale, FL',
        coordinates: { lat: 26.1195, lng: -80.1456 }
      },
      {
        id: 'a1s3',
        stopNumber: 3,
        name: 'Stranahan House Gardens',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479155299_22807157.png',
        clue: "Where history holds secrets of forbidden love, the oldest house guards the final destination. Find the garden where moonlight creates shadows for stolen kisses...",
        challenge: "Role-play as secret lovers from the 1920s who've snuck away to meet. Whisper sweet nothings and share a kiss as if it might be your last.",
        hint: "The Stranahan House is at the corner of Las Olas and the New River",
        address: '335 SE 6th Ave, Fort Lauderdale, FL',
        coordinates: { lat: 26.1178, lng: -80.1425 }
      }
    ]
  },
  {
    id: 'adventure2',
    name: 'Beach Passion Quest',
    description: 'An adventurous escape along Fort Lauderdale\'s sensual shoreline',
    coverImage: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479147927_e3e8577c.jpg',
    intensity: 'spicy',
    duration: '2-3 hours',
    reward: 'Unlock exclusive beach-themed intimate game cards',
    stops: [
      {
        id: 'a2s1',
        stopNumber: 1,
        name: 'Sebastian Street Beach',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479147927_e3e8577c.jpg',
        clue: "Where the famous wave wall meets the sand and the sun worshippers gather, begin your passionate journey. Find the spot where the wall curves like a lover's embrace...",
        challenge: "Apply sunscreen to each other slowly and sensually. Whisper in your partner's ear the most daring thing you want to do on this beach trip.",
        hint: "Sebastian Street Beach is known for its iconic wave wall - start at the main entrance",
        address: 'Sebastian St Beach, Fort Lauderdale, FL',
        coordinates: { lat: 26.1224, lng: -80.1028 }
      },
      {
        id: 'a2s2',
        stopNumber: 2,
        name: 'Fort Lauderdale Beach Park',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479147927_e3e8577c.jpg',
        clue: "Walk north where the crowds thin and privacy beckons. Find the lifeguard tower painted with the number of passion - the same as the deadly sins...",
        challenge: "Write both your initials in a heart in the sand. Then share your most adventurous outdoor fantasy while watching the waves.",
        hint: "Look for Lifeguard Tower #7 - walk north from Sebastian Street",
        address: 'Fort Lauderdale Beach Park, FL',
        coordinates: { lat: 26.1289, lng: -80.1028 }
      },
      {
        id: 'a2s3',
        stopNumber: 3,
        name: 'Hugh Taylor Birch State Park Beach',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479148505_64dd99c4.jpg',
        clue: "Continue north to where nature reclaims the shore. Enter the park where a hidden beach awaits, away from prying eyes...",
        challenge: "Find a secluded spot in the dunes. Share your most intimate beach fantasy and seal it with a passionate kiss that leaves you both breathless.",
        hint: "Hugh Taylor Birch State Park has a quieter beach section - enter from Sunrise Blvd",
        address: '3109 E Sunrise Blvd, Fort Lauderdale, FL',
        coordinates: { lat: 26.1369, lng: -80.1053 }
      },
      {
        id: 'a2s4',
        stopNumber: 4,
        name: 'Lauderdale-By-The-Sea Pier',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479147927_e3e8577c.jpg',
        clue: "Your final destination lies where the pier reaches into the sea like a lover reaching for their beloved. Walk to where the horizon meets your dreams...",
        challenge: "At the end of the pier, hold each other close and describe in detail what you want to do to each other when you get home tonight.",
        hint: "Drive north to Lauderdale-By-The-Sea and walk to the end of the Anglin's Fishing Pier",
        address: 'Commercial Blvd, Lauderdale-By-The-Sea, FL',
        coordinates: { lat: 26.1920, lng: -80.0956 }
      }
    ]
  },
  {
    id: 'adventure3',
    name: 'Forbidden Desires Trail',
    description: 'An intensely intimate adventure through hidden and secluded spots',
    coverImage: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479148505_64dd99c4.jpg',
    intensity: 'xxx',
    duration: '3-4 hours',
    reward: 'Unlock the ultimate XXX truth or dare expansion pack',
    stops: [
      {
        id: 'a3s1',
        stopNumber: 1,
        name: 'Secret Garden at Bonnet House',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479146840_fad1cb6a.jpg',
        clue: "Where art and nature intertwine in forbidden beauty, find the garden where orchids bloom in secret. The swans guard the entrance to your desires...",
        challenge: "Find a hidden corner of the garden. Describe in explicit detail your most forbidden fantasy while your partner listens. Then act out the first 30 seconds of it.",
        hint: "Bonnet House Museum & Gardens on N Birch Road - explore the orchid garden",
        address: '900 N Birch Rd, Fort Lauderdale, FL',
        coordinates: { lat: 26.1289, lng: -80.1067 }
      },
      {
        id: 'a3s2',
        stopNumber: 2,
        name: 'Intracoastal Hidden Dock',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479148505_64dd99c4.jpg',
        clue: "Where million-dollar yachts float past and the water reflects your deepest desires, find the hidden dock where lovers meet after dark...",
        challenge: "Find a private spot on the waterfront. Take turns describing exactly how you want to pleasure each other tonight - be as explicit as you dare.",
        hint: "Look for the public dock areas along the Intracoastal near Las Olas",
        address: 'Intracoastal Waterway, Fort Lauderdale, FL',
        coordinates: { lat: 26.1234, lng: -80.1089 }
      },
      {
        id: 'a3s3',
        stopNumber: 3,
        name: 'Birch State Park Secret Trail',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479148505_64dd99c4.jpg',
        clue: "Deep within the urban jungle lies a trail where nature hides lovers from the world. Follow the path less traveled to where passion has no witnesses...",
        challenge: "Find the most secluded spot on the trail. Engage in the most intimate activity you're comfortable with in this semi-private setting. Push your boundaries together.",
        hint: "Take the nature trail that loops through Hugh Taylor Birch State Park",
        address: 'Hugh Taylor Birch State Park, Fort Lauderdale, FL',
        coordinates: { lat: 26.1369, lng: -80.1053 }
      },
      {
        id: 'a3s4',
        stopNumber: 4,
        name: 'Midnight Beach Rendezvous',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479147927_e3e8577c.jpg',
        clue: "As darkness falls, return to where the waves sing their eternal song. Find the stretch of sand where the lights don't reach and the stars are your only audience...",
        challenge: "Under the cover of darkness, fulfill one fantasy you've both been too shy to try. Let the sound of the waves mask your passion. This is your reward for completing the trail.",
        hint: "Return to a quiet section of beach after sunset - north of the main tourist areas",
        address: 'Fort Lauderdale Beach (North Section), FL',
        coordinates: { lat: 26.1400, lng: -80.1028 }
      }
    ]
  },
  {
    id: 'adventure4',
    name: 'Waterfront Seduction',
    description: 'A sensual journey along Fort Lauderdale\'s romantic waterways',
    coverImage: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479129554_f82bc6dd.png',
    intensity: 'spicy',
    duration: '2-3 hours',
    reward: 'Unlock romantic dinner reservation recommendations with private seating',
    stops: [
      {
        id: 'a4s1',
        stopNumber: 1,
        name: 'Esplanade Park',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479129554_f82bc6dd.png',
        clue: "Begin where the river bends and the city skyline reflects in the water. Find the amphitheater where music once played and lovers still dance...",
        challenge: "Dance together slowly without music, bodies pressed close. Whisper what you want to do to each other when you're alone tonight.",
        hint: "Esplanade Park is along the New River, near the Broward Center",
        address: 'Esplanade Park, Fort Lauderdale, FL',
        coordinates: { lat: 26.1201, lng: -80.1445 }
      },
      {
        id: 'a4s2',
        stopNumber: 2,
        name: 'Himmarshee Village',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479146840_fad1cb6a.jpg',
        clue: "Where nightlife pulses and couples steal kisses in dark corners, find the historic street where passion meets pleasure...",
        challenge: "Find a dark corner or alley. Share your most scandalous public fantasy. Steal a kiss that's just a little too passionate for public.",
        hint: "Himmarshee Street is the historic entertainment district",
        address: 'Himmarshee St, Fort Lauderdale, FL',
        coordinates: { lat: 26.1189, lng: -80.1447 }
      },
      {
        id: 'a4s3',
        stopNumber: 3,
        name: 'Riverside Hotel Waterfront',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479129554_f82bc6dd.png',
        clue: "Where the grand hotel meets the river and romance has flourished for decades, find the waterfront terrace where champagne dreams come true...",
        challenge: "Order a drink and toast to your desires. Take turns describing your ultimate romantic evening together - every sensual detail.",
        hint: "The Riverside Hotel on Las Olas has a beautiful waterfront area",
        address: '620 E Las Olas Blvd, Fort Lauderdale, FL',
        coordinates: { lat: 26.1185, lng: -80.1376 }
      }
    ]
  },
  {
    id: 'adventure5',
    name: 'Artistic Passion',
    description: 'Explore the sensual side of Fort Lauderdale\'s art and culture scene',
    coverImage: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479155299_22807157.png',
    intensity: 'mild',
    duration: '2-3 hours',
    reward: 'Unlock couples art class recommendations for body painting',
    stops: [
      {
        id: 'a5s1',
        stopNumber: 1,
        name: 'NSU Art Museum',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479155299_22807157.png',
        clue: "Where modern art challenges the mind and stirs the soul, begin your artistic journey. Find the sculpture that speaks to passion...",
        challenge: "Find the most sensual piece of art in the museum. Describe to your partner how it makes you feel and what it inspires you to do with them.",
        hint: "NSU Art Museum is on Las Olas Boulevard",
        address: '1 E Las Olas Blvd, Fort Lauderdale, FL',
        coordinates: { lat: 26.1185, lng: -80.1445 }
      },
      {
        id: 'a5s2',
        stopNumber: 2,
        name: 'FAT Village Arts District',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479146840_fad1cb6a.jpg',
        clue: "In the creative heart of the city where murals tell stories of love and desire, find the alley where street art becomes seduction...",
        challenge: "Find a mural that represents your relationship. Take a photo together and share what aspects of your intimate life it symbolizes.",
        hint: "FAT Village is in the Flagler Arts and Technology Village area",
        address: 'FAT Village, Fort Lauderdale, FL',
        coordinates: { lat: 26.1234, lng: -80.1512 }
      },
      {
        id: 'a5s3',
        stopNumber: 3,
        name: 'Bonnet House Sculpture Garden',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479148505_64dd99c4.jpg',
        clue: "Return to where art meets nature in perfect harmony. Among the sculptures and swans, find the spot where you can pose as living art...",
        challenge: "Pose together as a romantic sculpture - intertwined and intimate. Hold the pose while sharing your most artistic fantasy about each other.",
        hint: "Bonnet House has beautiful sculpture gardens throughout the property",
        address: '900 N Birch Rd, Fort Lauderdale, FL',
        coordinates: { lat: 26.1289, lng: -80.1067 }
      }
    ]
  },
  {
    id: 'adventure6',
    name: 'After Dark Desires',
    description: 'A late-night adventure for couples who crave excitement after sunset',
    coverImage: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479147927_e3e8577c.jpg',
    intensity: 'xxx',
    duration: '3-4 hours (evening)',
    reward: 'Unlock the complete After Dark intimate activity guide',
    stops: [
      {
        id: 'a6s1',
        stopNumber: 1,
        name: 'Las Olas After Dark',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479146840_fad1cb6a.jpg',
        clue: "When the sun sets and the boulevard transforms, begin where the lights create shadows for secret touches. Find the darkest corner of the brightest street...",
        challenge: "Find a shadowy spot. Let your hands explore each other while maintaining innocent appearances. See how far you can push the boundaries of public decency.",
        hint: "Las Olas Boulevard transforms at night - find the quieter side streets",
        address: 'Las Olas Blvd, Fort Lauderdale, FL',
        coordinates: { lat: 26.1185, lng: -80.1376 }
      },
      {
        id: 'a6s2',
        stopNumber: 2,
        name: 'Beach Parking Garage Rooftop',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479147927_e3e8577c.jpg',
        clue: "Rise above the city to where the ocean breeze meets the night sky. Find the rooftop where cars sleep and lovers awaken...",
        challenge: "Find a private corner of the rooftop. With the city lights below, engage in your most daring public intimate act yet. The night hides your passion.",
        hint: "The beach parking garages have rooftop levels with ocean views",
        address: 'Beach Place Parking, Fort Lauderdale, FL',
        coordinates: { lat: 26.1224, lng: -80.1050 }
      },
      {
        id: 'a6s3',
        stopNumber: 3,
        name: 'Moonlit Beach',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479147927_e3e8577c.jpg',
        clue: "Descend to where the moon paints silver paths on the water. Find the stretch of sand where the lifeguard towers stand empty and the night belongs to lovers...",
        challenge: "Lay together on the sand. Under the stars and with waves as your soundtrack, fulfill a fantasy you've both been saving for the perfect moment.",
        hint: "The beach is quieter after 10pm - find a spot away from the main areas",
        address: 'Fort Lauderdale Beach, FL',
        coordinates: { lat: 26.1300, lng: -80.1028 }
      }
    ]
  },
  {
    id: 'adventure7',
    name: 'Sunset Romance',
    description: 'A magical evening adventure along the beach with breathtaking sunset views and romantic moments',
    coverImage: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479147927_e3e8577c.jpg',
    intensity: 'mild',
    duration: '2-3 hours (evening)',
    reward: 'Unlock a romantic sunset picnic planning guide with wine pairing suggestions',
    stops: [
      {
        id: 'a7s1',
        stopNumber: 1,
        name: 'Fort Lauderdale Beach Pier',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479147927_e3e8577c.jpg',
        clue: "Where the wooden path stretches into the golden sea and fishermen cast their lines into dreams, begin your sunset journey. Arrive as the sun starts its descent...",
        challenge: "Walk hand-in-hand to the end of the pier. As the sun touches the horizon, share three things you love most about your partner. Seal each confession with a kiss.",
        hint: "Anglin's Fishing Pier in Lauderdale-By-The-Sea offers stunning sunset views",
        address: 'Commercial Blvd & Ocean Dr, Lauderdale-By-The-Sea, FL',
        coordinates: { lat: 26.1920, lng: -80.0956 }
      },
      {
        id: 'a7s2',
        stopNumber: 2,
        name: 'Deerfield Beach Boardwalk',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479147927_e3e8577c.jpg',
        clue: "Travel north to where the boardwalk curves like a lover's smile. Find the spot where the palm trees frame the setting sun like a painting made just for you...",
        challenge: "Find a quiet bench on the boardwalk. Watch the colors change in the sky while taking turns describing your perfect romantic evening together.",
        hint: "Deerfield Beach has a beautiful boardwalk with benches facing west",
        address: 'Deerfield Beach Boardwalk, Deerfield Beach, FL',
        coordinates: { lat: 26.3184, lng: -80.0734 }
      },
      {
        id: 'a7s3',
        stopNumber: 3,
        name: 'Hillsboro Inlet Lighthouse View',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479148505_64dd99c4.jpg',
        clue: "Your final destination awaits where the historic lighthouse stands guard over lovers' dreams. As twilight paints the sky in shades of romance, find the perfect viewing spot...",
        challenge: "As the last light fades and the lighthouse begins to glow, slow dance together on the sand. Whisper your hopes and dreams for your future together.",
        hint: "The Hillsboro Inlet area near the lighthouse offers beautiful twilight views",
        address: 'Hillsboro Beach, FL',
        coordinates: { lat: 26.2592, lng: -80.0811 }
      }
    ]
  },
  {
    id: 'adventure8',
    name: 'Downtown Desires',
    description: 'An exciting nightlife adventure through downtown Fort Lauderdale\'s most seductive spots',
    coverImage: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479146840_fad1cb6a.jpg',
    intensity: 'spicy',
    duration: '3-4 hours (evening)',
    reward: 'Unlock VIP recommendations for the best couples-friendly nightlife spots',
    stops: [
      {
        id: 'a8s1',
        stopNumber: 1,
        name: 'Himmarshee Street',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479146840_fad1cb6a.jpg',
        clue: "Where the night comes alive and music spills onto cobblestone streets, begin your downtown seduction. Find the historic heart of Fort Lauderdale's nightlife...",
        challenge: "Order drinks at a rooftop bar. While overlooking the city, take turns whispering your most daring nightlife fantasy into each other's ears.",
        hint: "Himmarshee Street is the entertainment district - look for the rooftop bars",
        address: 'SW 2nd St (Himmarshee), Fort Lauderdale, FL',
        coordinates: { lat: 26.1189, lng: -80.1447 }
      },
      {
        id: 'a8s2',
        stopNumber: 2,
        name: 'Las Olas Wine District',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479155299_22807157.png',
        clue: "Follow the boulevard where sophistication meets seduction. Find the wine bar where couples share secrets over glasses of red...",
        challenge: "Share a bottle of wine. With each glass, reveal something increasingly intimate about your desires. By the last glass, you should be ready to leave...",
        hint: "Las Olas has several intimate wine bars perfect for couples",
        address: 'Las Olas Blvd, Fort Lauderdale, FL',
        coordinates: { lat: 26.1185, lng: -80.1376 }
      },
      {
        id: 'a8s3',
        stopNumber: 3,
        name: 'Riverwalk Jazz Spot',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479129554_f82bc6dd.png',
        clue: "Where smooth jazz floats on the night air and the river reflects city lights, find the spot where music becomes foreplay...",
        challenge: "Find a dark corner near the music. Dance close together, letting the rhythm guide your bodies. Whisper what you want to do when you get home.",
        hint: "Check out the live music venues along the Riverwalk",
        address: 'Riverwalk Fort Lauderdale, FL',
        coordinates: { lat: 26.1195, lng: -80.1456 }
      },
      {
        id: 'a8s4',
        stopNumber: 4,
        name: 'Secret Speakeasy',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479146840_fad1cb6a.jpg',
        clue: "Your final stop hides behind an unmarked door where prohibition-era romance still lingers. Find the hidden bar where the night's desires reach their peak...",
        challenge: "In the dim light of the speakeasy, find the darkest booth. Order something strong and play a private game of truth or dare - spicy level only.",
        hint: "Fort Lauderdale has several hidden speakeasy-style bars - ask locals for the secret spots",
        address: 'Downtown Fort Lauderdale, FL',
        coordinates: { lat: 26.1224, lng: -80.1445 }
      }
    ]
  },
  {
    id: 'adventure9',
    name: 'Island Lovers',
    description: 'A romantic water taxi adventure to nearby islands and waterfront paradises',
    coverImage: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479129554_f82bc6dd.png',
    intensity: 'mild',
    duration: '3-4 hours',
    reward: 'Unlock a private yacht charter discount code for your next anniversary',
    stops: [
      {
        id: 'a9s1',
        stopNumber: 1,
        name: 'Water Taxi Terminal - Las Olas',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479129554_f82bc6dd.png',
        clue: "Where the yellow boats await to carry lovers across the Venice of America, begin your island-hopping romance. Board the vessel that will take you to paradise...",
        challenge: "As you wait for the water taxi, hold hands and plan your dream island vacation together. Share where you'd go and what romantic adventures you'd have.",
        hint: "The Water Taxi picks up at the Las Olas Riverfront terminal",
        address: 'Las Olas Water Taxi Stop, Fort Lauderdale, FL',
        coordinates: { lat: 26.1185, lng: -80.1376 }
      },
      {
        id: 'a9s2',
        stopNumber: 2,
        name: 'Bahia Mar Marina',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479147927_e3e8577c.jpg',
        clue: "Sail to where mega-yachts dream and the ocean breeze carries whispers of adventure. Disembark at the marina where Travis McGee once docked his houseboat...",
        challenge: "Walk along the docks and pick out your dream yacht together. Describe the romantic voyage you'd take and what would happen in the captain's quarters.",
        hint: "Bahia Mar is a famous marina - the Water Taxi has a stop here",
        address: 'Bahia Mar Marina, Fort Lauderdale, FL',
        coordinates: { lat: 26.1089, lng: -80.1067 }
      },
      {
        id: 'a9s3',
        stopNumber: 3,
        name: 'Hollywood Beach Broadwalk',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479147927_e3e8577c.jpg',
        clue: "Your final island destination lies where the famous Broadwalk stretches along pristine sand. Step off the boat into a beachside paradise made for lovers...",
        challenge: "Rent a tandem bike and ride the Broadwalk together. Stop at a beachside cafe, share a tropical drink, and toast to your love while watching the waves.",
        hint: "Take the Water Taxi south to Hollywood - the Broadwalk is right there",
        address: 'Hollywood Beach Broadwalk, Hollywood, FL',
        coordinates: { lat: 26.0112, lng: -80.1170 }
      }
    ]
  },
  {
    id: 'adventure10',
    name: 'Midnight Passion',
    description: 'An intensely intimate late-night adventure through Fort Lauderdale\'s most secluded and private spots',
    coverImage: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479148505_64dd99c4.jpg',
    intensity: 'xxx',
    duration: '3-4 hours (late night)',
    reward: 'Unlock the ultimate Midnight Passion couples kit with exclusive intimate accessories recommendations',
    stops: [
      {
        id: 'a10s1',
        stopNumber: 1,
        name: 'Secret Beach Access',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479147927_e3e8577c.jpg',
        clue: "When the clock strikes midnight and the beach belongs to lovers alone, find the hidden access point where dunes create private alcoves. The moon will be your only witness...",
        challenge: "Find a secluded spot in the dunes. Under the stars, undress each other slowly. Let the sound of waves mask your passion as you explore each other completely.",
        hint: "Look for the less-traveled beach access points north of the main tourist areas after midnight",
        address: 'North Beach Access, Fort Lauderdale, FL',
        coordinates: { lat: 26.1450, lng: -80.1028 }
      },
      {
        id: 'a10s2',
        stopNumber: 2,
        name: 'Intracoastal Midnight Dock',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479129554_f82bc6dd.png',
        clue: "Where the waterway sleeps and million-dollar yachts bob silently, find the dock where shadows provide cover for your deepest desires...",
        challenge: "Find a private spot on the dock. With the water lapping beneath you, act out your most forbidden waterfront fantasy. Be as bold as the darkness allows.",
        hint: "The Intracoastal has quiet public dock areas that are empty late at night",
        address: 'Intracoastal Waterway, Fort Lauderdale, FL',
        coordinates: { lat: 26.1234, lng: -80.1089 }
      },
      {
        id: 'a10s3',
        stopNumber: 3,
        name: 'Rooftop Paradise',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479146840_fad1cb6a.jpg',
        clue: "Ascend to where the city sleeps below and the stars feel close enough to touch. Find the rooftop where lovers become one with the night sky...",
        challenge: "On the rooftop, with the city lights twinkling below, engage in your most uninhibited intimate act. Let the height and the night embolden your passion.",
        hint: "Find a parking garage or building with rooftop access - the views and privacy are worth it",
        address: 'Downtown Fort Lauderdale Rooftop, FL',
        coordinates: { lat: 26.1224, lng: -80.1445 }
      },
      {
        id: 'a10s4',
        stopNumber: 4,
        name: 'Dawn Lovers\' Cove',
        image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479148505_64dd99c4.jpg',
        clue: "As the night surrenders to dawn, find the hidden cove where the first light of day will find you still tangled in each other's arms. This is where your midnight passion reaches its climax...",
        challenge: "As the sky begins to lighten, find the most private spot you can. Make love as the sun rises, greeting the new day in the most intimate way possible. This is your ultimate reward.",
        hint: "The rocky areas near the jetties offer secluded spots perfect for watching the sunrise",
        address: 'Port Everglades Jetty Area, Fort Lauderdale, FL',
        coordinates: { lat: 26.0892, lng: -80.1089 }
      }
    ]
  }

];

// Legacy escape locations for backwards compatibility
export const escapeLocations: EscapeLocation[] = escapeAdventures.flatMap(adventure => 
  adventure.stops.map(stop => ({
    id: stop.id,
    name: stop.name,
    image: stop.image,
    description: `Part of ${adventure.name}`,
    clue: stop.clue,
    challenge: stop.challenge,
    intensity: adventure.intensity,
    address: stop.address,
    coordinates: stop.coordinates
  }))
);

export const categories = [
  { id: 'desire', name: 'Desire', icon: 'flame', color: 'from-red-500 to-orange-600' },
  { id: 'fantasy', name: 'Fantasy', icon: 'sparkles', color: 'from-purple-500 to-pink-600' },
  { id: 'seduction', name: 'Seduction', icon: 'heart', color: 'from-pink-500 to-rose-600' },
  { id: 'confession', name: 'Confession', icon: 'lock', color: 'from-amber-500 to-orange-600' },
  { id: 'adventure', name: 'Adventure', icon: 'map', color: 'from-teal-500 to-cyan-600' },
  { id: 'kink', name: 'Kink', icon: 'link', color: 'from-violet-500 to-purple-600' },
];
