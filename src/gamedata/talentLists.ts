// Generated from the talents table of https://roguetrader.wiki.fextralife.com/Talents.

import type { TalentList } from './types'

/**
 * Talent lists: which talents each source offers (Availability Rules: Lists). `common` is always
 * available. Each ID is followed by the talent name.
 */
export const TALENT_LISTS: readonly TalentList[] = [
  {
    key: 'common',
    name: 'Common',
    talentIds: [
      6, // Advanced Skill: Athletics
      7, // Advanced Skill: Awareness
      8, // Advanced Skill: Carouse
      9, // Advanced Skill: Coercion
      10, // Advanced Skill: Commerce
      11, // Advanced Skill: Demolition
      12, // Advanced Skill: Logic
      13, // Advanced Skill: Lore (Imperium)
      14, // Advanced Skill: Lore (Warp)
      15, // Advanced Skill: Lore (Xenos)
      16, // Advanced Skill: Medicae
      17, // Advanced Skill: Persuasion
      18, // Advanced Skill: Tech-Use
      19, // Aeldari Weapon Proficiency
      40, // Base Skill: Athletics
      41, // Base Skill: Awareness
      42, // Base Skill: Carouse
      43, // Base Skill: Coercion
      44, // Base Skill: Commerce
      45, // Base Skill: Demolition
      46, // Base Skill: Logic
      47, // Base Skill: Lore (Imperium)
      48, // Base Skill: Lore (Warp)
      49, // Base Skill: Lore (Xenos)
      50, // Base Skill: Medicae
      51, // Base Skill: Persuasion
      52, // Base Skill: Tech-Use
      76, // Bolt Weapon Expert
      77, // Bolter Weapon Proficiency
      95, // Chain Weapon Expert
      96, // Characteristic Training: Agility
      97, // Characteristic Training: Ballistic Skill
      98, // Characteristic Training: Fellowship
      99, // Characteristic Training: Intelligence
      100, // Characteristic Training: Perception
      101, // Characteristic Training: Strength
      102, // Characteristic Training: Toughness
      103, // Characteristic Training: Weapon Skill
      104, // Characteristic Training: Willpower
      110, // Combat Master
      170, // Drukhari Weapon Proficiency
      171, // Dual Weapon Specialist
      172, // Dual-Weapon Combat
      173, // Duelling Mastery
      212, // Flame Weapon Expert
      213, // Flame Weapon Proficiency
      237, // Grenadier
      246, // Heavy Armour Proficiency
      248, // Heavy Weapon Proficiency
      259, // Hurt Like Hell
      287, // It Will Not Die
      299, // Las Weapon Expert
      322, // Melta Weapon Expert
      323, // Melta Weapon Proficiency
      337, // Nimble
      375, // Plasma Weapon Expert
      376, // Plasma Weapon Proficiency
      380, // Power Weapon Expert
      451, // Solid Projectile Weapon Expert
      479, // Swift Movements
      530, // Weapon Specialist
    ],
  },
  {
    key: 'soldier',
    name: 'Soldier',
    talentIds: [
      22, // Alacrity
      87, // Camaraderie
      111, // Combat Medicae
      153, // Demolition Engineer
      185, // Enough Bullets for Everyone
      195, // Exploit Surroundings
      208, // Fired Up
      224, // Forewarning
      226, // Fortress
      280, // Integrity
      333, // Muzzle Velocity
      342, // On the Double
      378, // Point-Blank
      405, // Rack and Ruin
      408, // Rapid Reload
      433, // Second Skin
      480, // Swift Slaughter
      481, // Tactical Disengage
      486, // Tenderise
      498, // Trace the Trajectory
      508, // Unfaltering Fire
      513, // Unpredictable
    ],
  },
  {
    key: 'warrior',
    name: 'Warrior',
    talentIds: [
      60, // Blade Flurry
      93, // Cautious Disengage
      106, // Clenched Teeth
      120, // Contempt
      135, // Crowd Kill
      150, // Defensive Manoeuvres
      151, // Defensive Stance
      155, // Desolation
      178, // Easy Target
      186, // Enrage
      187, // Epicentre of Slaughter
      245, // Hardened Scars
      264, // Impetus
      281, // Interception
      283, // Invigorating Hatred
      311, // Living Shield
      345, // Open Engagement
      347, // Opening Strike
      407, // Ramming Speed
      411, // Reckless Fury
      422, // Rigorous Training
      440, // Shearing Strikes
      492, // Thick Skin
    ],
  },
  {
    key: 'operative',
    name: 'Operative',
    talentIds: [
      39, // Ballistics Calculation
      109, // Combat Insight
      115, // Comprehensive Analysis
      123, // Continuous Analysis
      128, // Covert Protocol
      231, // Fresh Target
      265, // Improved Tactics
      271, // Inflict Despair
      272, // Informed Hit
      275, // Insightful Precision
      279, // Instant Exposure
      289, // Joint Offence
      341, // Offensive Pattern Prediction
      356, // Passive Learning
      409, // Reactive Study
      439, // Sharpshooter
      449, // Sniper Expertise
      488, // Terrifying Presence
      493, // Tide of Excellence
      505, // Uncanny Sight
      526, // Weak Body, Weak Soul
    ],
  },
  {
    key: 'officer',
    name: 'Officer',
    talentIds: [
      32, // Armour of Contempt
      55, // Be Vigilant!
      69, // Blood of Martyrs
      114, // Commanding Voice
      222, // Focus!
      253, // Heroism
      276, // Inspire Courage
      277, // Inspiring Speech
      285, // Iron Discipline
      300, // Lasting Impression
      303, // Lead by Example
      304, // Leader's Assault
      316, // March
      338, // No Respite
      367, // Personal Oversight
      369, // Physical Encouragement
      383, // Prepare for an Assault!
      435, // Seize the Initiative
      460, // Steady!
      462, // Steel Resolve
      506, // Undaunted
      524, // Watch Yourself!
      534, // Wounds Are No Excuse!
    ],
  },
  {
    key: 'bladedancer',
    name: 'Bladedancer',
    talentIds: [
      30, // Anticipation
      38, // Balancing on the Edge
      61, // Blade in His Hand
      65, // Blessed Scars
      66, // Blinding Blades
      67, // Blood Bonds
      70, // Blood Rush
      72, // Bloody Requiem
      138, // Dance Partners
      144, // Death Warden
      174, // Duellist
      188, // Escape Artist
      198, // Facing the End
      203, // Feel No Pain
      236, // Grand Performance
      242, // Guillotine
      267, // In Footsteps of Death
      286, // It Takes Two
      295, // Killing Rhythm
      354, // Paid in Blood
      387, // Promises of Blood
      404, // Race Against Death
      423, // Rising Tempo
      437, // Shadow Dancer
      448, // Slip Away
      455, // Spinning Blades
      459, // Steady Hand
      477, // Sweeping Motions
      511, // Unforgiving
    ],
  },
  {
    key: 'assassin',
    name: 'Assassin',
    talentIds: [
      27, // Ambush
      28, // An Eye for the Unscathed
      80, // Bringer of Doom
      88, // Carmine Whisper
      129, // Create an Opening
      142, // Deadly Calculation
      159, // Disarray
      181, // Elusive Speed
      190, // Esquive
      215, // Flawless Lunge
      239, // Gruesome Gust
      263, // Imminent Demise
      270, // Inevitable Enervation
      292, // Keep Your Distance
      296, // Killing Spree
      305, // Leave No Witness
      308, // Lethality Heightens
      313, // Lone Killer
      330, // Morbid Pirouette
      331, // Mortally Effective
      350, // Outsmart
      361, // Perfect Opening
      386, // Professional Acumen
      434, // Seize the Advantage
    ],
  },
  {
    key: 'vanguard',
    name: 'Vanguard',
    talentIds: [
      56, // Beacon of Might
      94, // Centre of Attention
      126, // Counter-Attack Stance
      127, // Covering Bulwark
      149, // Defensive Comrade
      182, // Enduring Shield
      225, // Formidable Distraction
      340, // Offensive Follow
      343, // On Your Feet!
      352, // Overwhelming Provocation
      358, // Penitent Beacon
      388, // Protective Word
      403, // Punish the Imprudent
      417, // Resilient Beacon
      436, // Selfless Resilience
      483, // Taunting Defence
      484, // Taunting Opportunity
      509, // Unflinching
      517, // Unyielding Resolve
      521, // Wall of Ferrocrete
      532, // Words of Endurance
    ],
  },
  {
    key: 'bountyHunter',
    name: 'Bounty Hunter',
    talentIds: [
      92, // Catch
      105, // Claim and Maim
      130, // Critical Chain
      137, // Cut to the Chase
      194, // Expert Finesse
      217, // Flay the Bold
      235, // Good Hunting
      240, // Gruesome Kill
      241, // Guidance
      249, // Heightened Concentration
      257, // Hunter's Ambush
      258, // Hunting Surge
      278, // Inspiring Trophy
      293, // Kill Squad
      370, // Pierce and Ruin
      371, // Pierce the Armour
      379, // Pounce
      419, // Retaliate
      429, // Savour the Kill
      438, // Share the Spoils
      499, // Trail and Shatter
      525, // We Got 'Em
      531, // Withdraw
    ],
  },
  {
    key: 'masterTactician',
    name: 'Master Tactician',
    talentIds: [
      21, // Against All Odds
      25, // Ally Coordination
      81, // Brink of Death
      113, // Comfort in Conformity
      125, // Cost-Effective
      140, // Dawn of Victory
      252, // Heroic Inspiration
      254, // Hidden Advantage
      268, // In the Hero's Footsteps
      290, // Joint Offensive
      312, // Logistical Superiority
      334, // Nerves of Steel
      360, // Perfect Finish
      366, // Personal Involvement
      385, // Primary Objective
      415, // Reliance
      426, // Salvation
      457, // Stacking the Deck
      458, // Stand Resolute
      468, // Stronghold
      474, // Suppressive Fire
      482, // Tactical Respite
      507, // Undisputed Advantage
      516, // Unwavering Motivation
    ],
  },
  {
    key: 'grandStrategist',
    name: 'Grand Strategist',
    talentIds: [
      4, // Adjusting Frontline
      74, // Blurred Locus
      133, // Critical Zone
      134, // Crossfire Zone
      139, // Daunting Zone
      164, // Disputed Zone
      166, // Diversion Zone
      183, // Enduring Zone
      205, // Fire at Will
      227, // Fortress Zone
      266, // Improvised Strategy
      269, // Inescapable Zone
      329, // Mobility Zone
      346, // Opening Strategy
      351, // Overcoming Zone
      365, // Personal Combat Zone
      368, // Personal Zone
      377, // Point of Interest
      412, // Redeployment
      418, // Respite Zone
      450, // Sniping Zone
      465, // Strategic Offensive
      466, // Strategic Perfection
      469, // Strongpoint
      472, // Supporting Zone
    ],
  },
  {
    key: 'archMilitant',
    name: 'Arch-Militant',
    talentIds: [
      1, // Accustomed to Glory
      3, // Adaptability
      23, // All Out
      26, // Always Ready
      34, // Armsmaster
      36, // Awaiting Orders
      68, // Blood Haze
      78, // Breaking Attack
      82, // Broad Expertise
      86, // Calm and Steady
      107, // Close-Quarters Training
      121, // Contempt for the Weak
      132, // Critical Versatility
      154, // Dependable
      161, // Discipline
      162, // Dismantle
      165, // Distract
      196, // Exploit Weakness
      214, // Flashfire
      221, // Focal Point
      247, // Heavy Gunner
      273, // Ingenious
      317, // Martial Art
      382, // Preferred Targets
      442, // Shoot on the Hands
      476, // Survivor
    ],
  },
  {
    key: 'executioner',
    name: 'Executioner',
    talentIds: [
      2, // Acute Pain
      24, // All-Encompassing Agony
      29, // Anatomy Expert
      53, // Battle of Attrition
      64, // Bleeding Stigmata
      73, // Bloody Trail
      143, // Death in the Air
      145, // Death Warrant
      148, // Deep Laceration
      168, // Does it Hurt?
      193, // Everlasting Agony
      229, // Fragile Playthings
      244, // Hardened Body
      282, // Internal Bleeding
      284, // Invigorating Screams
      314, // Maddening Flames
      319, // Master of Torture
      359, // Perfect Anatomy
      406, // Racking Weakness
      416, // Reprieve
      420, // Revelling in Suffering
      431, // Scourging Strikes
      447, // Sickening Pain
      452, // Sower of Distress
      496, // Tormenting Sprain
      503, // Unbearable Presence
      520, // Vivisection
    ],
  },
  {
    key: 'exemplar',
    name: 'Exemplar',
    talentIds: [
      35, // Attention!
      79, // Breaking Point
      91, // Cataclysm
      112, // Combat Meditation
      118, // Contagion
      131, // Critical Velocity
      136, // Crushing Assault
      141, // Deadly Aim
      147, // Deathdealer
      152, // Degraded Defence
      157, // Destroyer
      160, // Disastrous Collision
      176, // Eager for Battle
      177, // Eager Subordinates
      197, // Extermination
      207, // Firebrand
      211, // Flagbearer
      220, // Flesh Wounds
      232, // Full Attention
      238, // Grievous Wounds
      298, // Know-It-All
      307, // Lethal Threat
      315, // Malign Influence
      318, // Martyrdom
      320, // Masterful Display
      321, // Masterful Precision
      348, // Out of My Way
      357, // Peak Condition
      363, // Perfection Under Fire
      374, // Pinpoint Accuracy
      390, // Psychic Awakening (Biomancy)
      391, // Psychic Awakening (Divination)
      392, // Psychic Awakening (Pyromancy)
      393, // Psychic Awakening (Sanctic Powers)
      394, // Psychic Awakening (Telepathy)
      402, // Puncture
      413, // Relentless
      421, // Revenge
      443, // Shot Through
      463, // Steel Shell
      495, // Tipping Point
      497, // Tough as Steel
      501, // Tricky Defence
      504, // Unbreakable Will
      515, // Unstoppable
      519, // Vital Points
    ],
  },
  {
    key: 'arbitrator',
    name: 'Arbitrator',
    talentIds: [
      31, // Arbites Physical Training
      33, // Armour-Piercing
      58, // Binding Purpose
      89, // Castigated!
      90, // Castigator
      201, // Fear of the Condemned
      202, // Feat of Greatness
      262, // Illustrious Glory
      301, // Law and Order
      302, // Lawful Intervention
      328, // Mob Justice
      353, // Pacification Procedures
      372, // Pillar of the Law
      384, // Prepared Prosecution
      400, // Public Sentencing
      424, // Ruthloss Suppression
      444, // Shotgun Mastery
      478, // Swift Justice
      491, // The Steady Hand of Justice
    ],
  },
  {
    key: 'ministorumPriest',
    name: 'Ministorum Priest',
    talentIds: [
      219, // Flensing Faith
      309, // Litany of Hatred
      310, // Litany of Purification
      441, // Shield of Faith
      487, // Tenets of Retribution
      489, // The Emperor Protects
      514, // Unshakable Faith
    ],
  },
  {
    key: 'commissar',
    name: 'Commissar',
    talentIds: [
      175, // Duty and Honour!
      223, // For the Emperor!
      261, // Iconic Sidearm
      306, // Let Them Know Fear!
      332, // Motivation
      344, // One for the Enemies, Two for the Traitors
      446, // Show Them Contempt!
      471, // Summary Execution
    ],
  },
  {
    key: 'navyOfficer',
    name: 'Navy Officer',
    talentIds: [
      167, // Do Not Falter!
      192, // Evasive Manoeuvres
      218, // Fleet Combat Training
      233, // Get Into Cover!
      234, // Get off Me
      362, // Perfect Timing
      430, // Scatter
    ],
  },
  {
    key: 'astraMilitarumCommander',
    name: 'Astra Militarum Commander',
    talentIds: [
      204, // Field of Fire
      210, // Fix Bayonets!
      445, // Shoulder to Shoulder
      473, // Suppression Fire!
      494, // Timely Rescue
      500, // Trench Warfare
      510, // Unflinching Heroism
    ],
  },
  {
    key: 'noble',
    name: 'Noble',
    talentIds: [
      535, // You. Do Something.
      536, // You. Go On.
      537, // You. Kill It.
      538, // You. Protect Me.
      539, // You. Serve Me.
      540, // You. You Are Next.
    ],
  },
  {
    key: 'crimeLord',
    name: 'Crime Lord',
    talentIds: [
      122, // Contingency Plan
      163, // Disorienting Plan
      189, // Escape Plan
      294, // Killing Plan
      475, // Sure-Fire Plan
      490, // The Last Plan
    ],
  },
  {
    key: 'psyker',
    name: 'Psyker',
    talentIds: [
      62, // Blade of Light
      184, // Enforce Reality
      327, // Mind Thief
      339, // Obscured Threat
      395, // Psychic Barrage
      396, // Psyker Extremis (Psy Rating 3)
      397, // Psyker Majoris (Psy Rating 2)
      398, // Psyker Minoris (Psy Rating 1)
      399, // Psyker Terminus (Psy Rating 4)
      432, // Second Sight
      456, // Stabilising Factor
      470, // Subtle Manipulation
    ],
  },
  {
    key: 'sanctionedPsyker',
    name: 'Sanctioned Psyker',
    talentIds: [
      274, // Inscribed Soul
      425, // Sacred Rituals
      464, // Still Mind
    ],
  },
  {
    key: 'psykerBiomancy',
    name: 'Psyker: Biomancy',
    talentIds: [
      5, // Adrenaline Surge
      59, // Biophysical Distortion
      117, // Confer Immunity
      124, // Corpus Conversion
      158, // Deterioration
      401, // Pulse of Life
      428, // Sanguine Siphon
      523, // Warp Saturation
    ],
  },
  {
    key: 'psykerDivination',
    name: 'Psyker: Divination',
    talentIds: [
      180, // Edge of Fate
      200, // Fatebringer
      216, // Flawless Plan
      381, // Predicted Downfall
      512, // Unnatural Luck
    ],
  },
  {
    key: 'psykerPyromancy',
    name: 'Psyker: Pyromancy',
    talentIds: [
      37, // Backdraft
      63, // Blazing Inferno
      75, // Body of Flames
      84, // Burning Blood
      206, // Fire Within
      324, // Melting Armour
      414, // Relentless Blaze
      454, // Sparks of the Greater Flame
    ],
  },
  {
    key: 'psykerSanctic',
    name: 'Psyker: Sanctic Powers',
    talentIds: [
      156, // Destined
      179, // Edge of Dawn
      191, // Eternal Glory
      260, // Hymns of Hatred
      389, // Psalms of Heroes
      427, // Sanctified Slayer
    ],
  },
  {
    key: 'psykerTelepathy',
    name: 'Psyker: Telepathy',
    talentIds: [
      20, // Aftershock
      325, // Mental Breach
      326, // Mind Siege
      355, // Pain Channelling
      518, // Visions of Doom
      522, // Warp Minds
      527, // Weak Hearts
    ],
  },
  {
    key: 'deathWorld',
    name: 'Death World',
    talentIds: [
      83, // Brutal Hunter
      146, // Death World
      250, // Hellish Life
      485, // Tenacity
      502, // Trusty Weapons
      533, // Wounded Beast
    ],
  },
  {
    key: 'forgeWorld',
    name: 'Forge World',
    talentIds: [
      85, // Calculated Relations
      209, // Fires of the Forge
      364, // Persistence of the Forge
      373, // Pinnacle of Weaponry
      461, // Steel of the Forge
    ],
  },
  {
    key: 'fortressWorld',
    name: 'Fortress World',
    talentIds: [
      108, // Combat Addict
      199, // Familiar Kickback
      243, // Hail of Steel
      335, // Never Stop Believing
      336, // Never Stop Shooting
      453, // Spare Magazine
    ],
  },
  {
    key: 'hiveWorld',
    name: 'Hive World',
    talentIds: [
      116, // Comradery
      230, // Fresh Start
      251, // Helping Hand
      255, // Hive World
      349, // Outnumber
      528, // Weapon Personalisation
      529, // Weapon Personalization
    ],
  },
  {
    key: 'imperialWorld',
    name: 'Imperial World',
    talentIds: [
      57, // Better to Die for the Emperor
      169, // Doing My Part
      256, // Humanity's Finest
      297, // Know no Heresy
      410, // Ready to Serve
      467, // Stronger Together
    ],
  },
  {
    key: 'voidborn',
    name: 'Voidborn',
    talentIds: [
      54, // Be Smart
      71, // Bloody Mess
      119, // Contagious Luck
      228, // Fortune
      288, // Jinx
      291, // Just a Flesh Wound
    ],
  },
]
