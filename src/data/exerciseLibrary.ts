// ============================================================
// EXERCISE LIBRARY — Full professional exercise database
// ============================================================

export type Difficulty = "beginner" | "intermediate" | "advanced";
export type Equipment =
  | "barbell" | "dumbbell" | "cable" | "machine" | "bodyweight"
  | "kettlebell" | "resistance_band" | "pull_up_bar" | "bench"
  | "ez_bar" | "medicine_ball" | "foam_roller" | "none";

export type WorkoutCategory =
  | "chest" | "back" | "shoulders" | "rear_delts" | "front_delts" | "side_delts"
  | "biceps" | "triceps" | "forearms"
  | "legs" | "quads" | "hamstrings" | "glutes" | "calves"
  | "abs" | "core" | "obliques" | "lower_back" | "hip_flexors"
  | "traps" | "lats" | "neck"
  | "full_body" | "cardio" | "hiit" | "functional" | "mobility"
  | "stretching" | "yoga" | "recovery" | "powerlifting" | "olympic_lifting"
  | "crossfit" | "calisthenics";

export type ExerciseType = "compound" | "isolation";
export type WorkoutType =
  | "strength" | "hypertrophy" | "power" | "conditioning"
  | "mobility" | "recovery" | "skill" | "endurance";
export type MediaStatus = "verified" | "placeholder";
export type SortOption = "alphabetical" | "popular" | "recent" | "xp" | "favorites";

export interface LibraryExercise {
  id: string;
  name: string;
  category: WorkoutCategory;
  primary_muscle: string;
  secondary_muscles: string[];
  difficulty: Difficulty;
  equipment: Equipment[];
  exercise_type: ExerciseType;
  workout_type: WorkoutType;
  gif_url: string;         // Legacy animated demo URL, kept as a fallback source.
  thumbnail_url: string;   // Static fallback image
  image_url: string;
  media_status: MediaStatus;
  demo_frame_id?: string;
  instructions: string[];
  breathing: string[];
  common_mistakes: string[];
  safety_tips: string[];
  beginner_modifications: string[];
  advanced_variations: string[];
  recommended_sets: string;
  recommended_reps: string;
  recommended_rest: string;
  calories_estimate: number;
  xp_value: number;
  popularity_score: number;
  created_at: string;
  updated_at: string;
  aliases: string[];
  tags: string[];
}

type EnrichedField =
  | "exercise_type" | "workout_type" | "image_url" | "media_status" | "breathing"
  | "safety_tips" | "beginner_modifications" | "advanced_variations" | "recommended_rest"
  | "calories_estimate" | "popularity_score" | "created_at" | "updated_at" | "aliases";

type ExerciseSeed = Omit<LibraryExercise, EnrichedField> & Partial<Pick<LibraryExercise, EnrichedField>>;

const FREE_EXERCISE_DB_IMAGE_ROOT =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
const demoFrame = (frameId: string) => `${FREE_EXERCISE_DB_IMAGE_ROOT}${frameId}/0.jpg`;
const DEFAULT_EXERCISE_IMAGE = demoFrame("Barbell_Bench_Press_-_Medium_Grip");

const EXERCISE_DEMO_FRAME_IDS: Partial<Record<string, string>> = {
  barbell_bench_press: "Barbell_Bench_Press_-_Medium_Grip",
  incline_dumbbell_press: "Incline_Dumbbell_Press",
  push_up: "Pushups",
  cable_fly: "Flat_Bench_Cable_Flyes",
  deadlift: "Barbell_Deadlift",
  pull_up: "Pullups",
  barbell_row: "Bent_Over_Barbell_Row",
  lat_pulldown: "Wide-Grip_Lat_Pulldown",
  overhead_press: "Barbell_Shoulder_Press",
  lateral_raise: "Side_Lateral_Raise",
  face_pull: "Face_Pull",
  barbell_curl: "Barbell_Curl",
  hammer_curl: "Hammer_Curls",
  tricep_pushdown: "Triceps_Pushdown",
  skull_crusher: "Decline_Close-Grip_Bench_To_Skull_Crusher",
  barbell_squat: "Barbell_Squat",
  romanian_deadlift: "Romanian_Deadlift",
  leg_press: "Leg_Press",
  hip_thrust: "Barbell_Hip_Thrust",
  calf_raise: "Standing_Calf_Raises",
  plank: "Plank",
  hanging_leg_raise: "Hanging_Leg_Raise",
  russian_twist: "Russian_Twist",
  barbell_shrug: "Barbell_Shrug",
  bench_press_competition: "Bench_Press_-_Powerlifting",
  dips: "Dips_-_Chest_Version",
  muscle_up: "Muscle_Up",
  hip_flexor_stretch: "Kneeling_Hip_Flexor",
  thoracic_rotation: "Torso_Rotation",
  clean_and_press: "Clean_and_Press",
  kettlebell_swing: "One-Arm_Kettlebell_Swings",
  thruster: "Kettlebell_Thruster",
  wrist_curl: "Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench",
  reverse_wrist_curl: "Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench",
  wrist_rotations: "Wrist_Rotations_with_Straight_Bar",
  isometric_neck: "Isometric_Neck_Exercise_-_Front_And_Back",
  plate_neck_resistance: "Lying_Face_Up_Plate_Neck_Resistance",
  head_harness_neck_resistance: "Seated_Head_Harness_Neck_Resistance",
  mountain_climbers: "Mountain_Climbers",
  farmers_walk: "Farmers_Walk",
  turkish_get_up: "Kettlebell_Turkish_Get-Up_Lunge_style",
  cat_stretch: "Cat_Stretch",
  ninety_ninety_hamstring: "90_90_Hamstring",
  behind_head_chest_stretch: "Behind_Head_Chest_Stretch",
  childs_pose: "Childs_Pose",
  dancers_stretch: "Dancers_Stretch",
  downward_facing_balance: "Downward_Facing_Balance",
  calves_smr: "Calves-SMR",
  neck_smr: "Neck-SMR",
  adductor_smr: "Adductor",
};

export function getExerciseDemoFrames(exercise: LibraryExercise): string[] {
  const frameId = exercise.demo_frame_id ?? EXERCISE_DEMO_FRAME_IDS[exercise.id];

  if (!frameId) {
    return [exercise.gif_url];
  }

  return [
    `${FREE_EXERCISE_DB_IMAGE_ROOT}${frameId}/0.jpg`,
    `${FREE_EXERCISE_DB_IMAGE_ROOT}${frameId}/1.jpg`,
  ];
}

const BASE_EXERCISE_LIBRARY: ExerciseSeed[] = [
  // ── CHEST ────────────────────────────────────────────────
  {
    id: "barbell_bench_press",
    name: "Flat Barbell Chest Press",
    category: "chest",
    primary_muscle: "Chest",
    secondary_muscles: ["Triceps", "Front Delts"],
    difficulty: "intermediate",
    equipment: ["barbell", "bench"],
    gif_url: "https://v2.exercisedb.io/image/4l-gRbFxxx3GZp",
    thumbnail_url: "https://images.unsplash.com/photo-1534368420009-621bfab424a8?w=400&q=80",
    instructions: [
      "Lie flat on a bench with feet planted firmly on the floor.",
      "Grip the bar slightly wider than shoulder-width with an overhand grip.",
      "Unrack the bar and lower it slowly to mid-chest (2–3 seconds).",
      "Press explosively back to the starting position, locking out elbows.",
      "Keep your shoulder blades retracted and lower back with a natural arch.",
    ],
    common_mistakes: [
      "Bouncing the bar off the chest — control the descent.",
      "Flaring elbows too wide — keep them at ~45–75° to protect shoulders.",
      "Lifting hips off the bench during the press.",
    ],
    recommended_sets: "4",
    recommended_reps: "6–10",
    xp_value: 120,
    tags: ["compound", "strength", "powerlifting", "barbell bench press"],
    aliases: ["Barbell Bench Press", "Bench Press"],
  },
  {
    id: "incline_dumbbell_press",
    name: "Incline Dumbbell Press",
    category: "chest",
    primary_muscle: "Upper Chest",
    secondary_muscles: ["Front Delts", "Triceps"],
    difficulty: "beginner",
    equipment: ["dumbbell", "bench"],
    gif_url: "https://v2.exercisedb.io/image/Q5kZc3VvSqfzD3",
    thumbnail_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
    instructions: [
      "Set bench to 30–45° incline. Sit back with a dumbbell in each hand.",
      "Press the dumbbells up and together above your upper chest.",
      "Lower with control until elbows are at 90°.",
      "Drive back up, squeezing the chest at the top.",
    ],
    common_mistakes: [
      "Setting incline too steep — targets shoulders more than chest.",
      "Not going through full range of motion.",
    ],
    recommended_sets: "3–4",
    recommended_reps: "8–12",
    xp_value: 100,
    tags: ["hypertrophy", "upper chest"],
  },
  {
    id: "push_up",
    name: "Push-Up",
    category: "chest",
    primary_muscle: "Chest",
    secondary_muscles: ["Triceps", "Core", "Front Delts"],
    difficulty: "beginner",
    equipment: ["bodyweight"],
    gif_url: "https://v2.exercisedb.io/image/XKYGYvia6K33Sy",
    thumbnail_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
    instructions: [
      "Place hands slightly wider than shoulder-width, fingers forward.",
      "Keep body in a straight line from head to heels.",
      "Lower chest to 1–2 cm from floor, elbows at ~45°.",
      "Push through palms to return to start.",
    ],
    common_mistakes: [
      "Sagging hips — engage core throughout.",
      "Elbows flaring out at 90° — keep them tucked.",
    ],
    recommended_sets: "3",
    recommended_reps: "AMRAP",
    xp_value: 70,
    tags: ["calisthenics", "beginner-friendly"],
  },
  {
    id: "cable_fly",
    name: "Cable Fly",
    category: "chest",
    primary_muscle: "Chest",
    secondary_muscles: ["Front Delts"],
    difficulty: "beginner",
    equipment: ["cable"],
    gif_url: "https://v2.exercisedb.io/image/UhNj5o1JQXkMKE",
    thumbnail_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80",
    instructions: [
      "Set cables at chest height or slightly above.",
      "Stand in the center, one foot forward, slight lean.",
      "Pull handles together in a wide arc, squeezing chest at the top.",
      "Slowly open arms back to start under control.",
    ],
    common_mistakes: [
      "Using too much weight — cables should allow full range of motion.",
      "Bending elbows excessively, turning it into a press.",
    ],
    recommended_sets: "3",
    recommended_reps: "12–15",
    xp_value: 80,
    tags: ["isolation", "hypertrophy"],
  },
  // ── BACK ─────────────────────────────────────────────────
  {
    id: "deadlift",
    name: "Deadlift",
    category: "back",
    primary_muscle: "Lower Back",
    secondary_muscles: ["Hamstrings", "Glutes", "Traps", "Lats"],
    difficulty: "advanced",
    equipment: ["barbell"],
    gif_url: "https://v2.exercisedb.io/image/rq4TH2HKQRWZ6x",
    thumbnail_url: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&q=80",
    instructions: [
      "Stand with bar over mid-foot, hip-width stance.",
      "Hinge at hips, grip bar just outside legs.",
      "Big breath, brace core, drive through the floor.",
      "Lock out at the top — hips and knees fully extended.",
      "Lower under control by hinging hips back first.",
    ],
    common_mistakes: [
      "Rounding the lower back — always maintain neutral spine.",
      "Bar drifting away from legs — keep it against the shins.",
      "Jerking the bar off the floor — build tension before pulling.",
    ],
    recommended_sets: "3–5",
    recommended_reps: "3–6",
    xp_value: 200,
    tags: ["compound", "powerlifting", "king lift"],
  },
  {
    id: "pull_up",
    name: "Pull-Up",
    category: "lats",
    primary_muscle: "Lats",
    secondary_muscles: ["Biceps", "Upper Back", "Core"],
    difficulty: "intermediate",
    equipment: ["pull_up_bar"],
    gif_url: "https://v2.exercisedb.io/image/E3NiXJ8iuVGxlO",
    thumbnail_url: "https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?w=400&q=80",
    instructions: [
      "Hang with a pronated grip, hands slightly wider than shoulders.",
      "Pull your chest to the bar, driving elbows down and back.",
      "Pause briefly at the top, then lower with control.",
    ],
    common_mistakes: [
      "Kipping without building strength — use strict form first.",
      "Not reaching full hang at the bottom.",
    ],
    recommended_sets: "4",
    recommended_reps: "AMRAP",
    xp_value: 130,
    tags: ["calisthenics", "compound", "back width"],
  },
  {
    id: "barbell_row",
    name: "Barbell Row",
    category: "back",
    primary_muscle: "Upper Back",
    secondary_muscles: ["Lats", "Biceps", "Rear Delts"],
    difficulty: "intermediate",
    equipment: ["barbell"],
    gif_url: "https://v2.exercisedb.io/image/Lm3WkJjELdOJ72",
    thumbnail_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",
    instructions: [
      "Hinge forward 45°, bar in hands with overhand grip.",
      "Pull bar to lower sternum, driving elbows back.",
      "Squeeze shoulder blades at the top.",
      "Lower under control back to full hang.",
    ],
    common_mistakes: [
      "Using momentum to heave the bar — use controlled reps.",
      "Letting the bar drift to the hips instead of chest.",
    ],
    recommended_sets: "4",
    recommended_reps: "6–10",
    xp_value: 140,
    tags: ["compound", "thickness", "back mass"],
  },
  {
    id: "lat_pulldown",
    name: "Front Lat Pulldown",
    category: "lats",
    primary_muscle: "Lats",
    secondary_muscles: ["Biceps", "Rear Delts"],
    difficulty: "beginner",
    equipment: ["cable", "machine"],
    gif_url: "https://v2.exercisedb.io/image/hMGDFBaTMR30Xk",
    thumbnail_url: "https://images.unsplash.com/photo-1530822847156-5df684ec5933?w=400&q=80",
    instructions: [
      "Grip the bar wider than shoulder-width with an overhand grip.",
      "Sit down, thighs secured under pads.",
      "Pull bar to upper chest, driving elbows down to hips.",
      "Slowly return to start with full extension.",
    ],
    common_mistakes: [
      "Pulling behind the neck — puts cervical spine at risk.",
      "Leaning too far back — turn it into a row.",
    ],
    recommended_sets: "3–4",
    recommended_reps: "10–12",
    xp_value: 100,
    tags: ["lat width", "cable", "beginner-friendly", "lat pulldown"],
    aliases: ["Lat Pulldown", "Wide-Grip Lat Pulldown"],
  },
  // ── SHOULDERS ────────────────────────────────────────────
  {
    id: "overhead_press",
    name: "Overhead Press",
    category: "shoulders",
    primary_muscle: "Shoulders",
    secondary_muscles: ["Triceps", "Upper Traps", "Core"],
    difficulty: "intermediate",
    equipment: ["barbell"],
    gif_url: "https://v2.exercisedb.io/image/jxL4NXJ8C1rDKH",
    thumbnail_url: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&q=80",
    instructions: [
      "Start with bar at collarbone height, grip just outside shoulders.",
      "Brace your core and press the bar straight up.",
      "At lockout, shrug slightly to pack shoulders.",
      "Lower with control back to collarbone.",
    ],
    common_mistakes: [
      "Excessive lower back arch — brace core and tuck ribs.",
      "Bar path drifting forward — keep it directly overhead.",
    ],
    recommended_sets: "4",
    recommended_reps: "5–8",
    xp_value: 130,
    tags: ["compound", "strength", "powerlifting"],
  },
  {
    id: "lateral_raise",
    name: "Side Lateral Raise",
    category: "side_delts",
    primary_muscle: "Lateral Delts",
    secondary_muscles: ["Traps"],
    difficulty: "beginner",
    equipment: ["dumbbell"],
    gif_url: "https://v2.exercisedb.io/image/PO0Bx5TBTQX6Xl",
    thumbnail_url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80",
    instructions: [
      "Stand with dumbbells at sides, slight forward lean.",
      "Raise dumbbells to shoulder height with slight elbow bend.",
      "Lead with elbows, not wrists — pinkies slightly higher.",
      "Lower under control over 2–3 seconds.",
    ],
    common_mistakes: [
      "Using momentum to swing weights — use lighter dumbbells.",
      "Raising too high above shoulder level — traps take over.",
    ],
    recommended_sets: "3–4",
    recommended_reps: "12–20",
    xp_value: 70,
    tags: ["isolation", "shoulder width", "lateral raise"],
    aliases: ["Lateral Raise", "Dumbbell Lateral Raise"],
  },
  {
    id: "face_pull",
    name: "Face Pull",
    category: "rear_delts",
    primary_muscle: "Rear Delts",
    secondary_muscles: ["Upper Back", "Rotator Cuff"],
    difficulty: "beginner",
    equipment: ["cable"],
    gif_url: "https://v2.exercisedb.io/image/uyKFRHJYB9GXMZ",
    thumbnail_url: "https://images.unsplash.com/photo-1534368420009-621bfab424a8?w=400&q=80",
    instructions: [
      "Set cable at head height with rope attachment.",
      "Pull the rope toward your face, separating hands at ear level.",
      "Elbows should be at or above shoulder height.",
      "Squeeze rear delts and slowly return to start.",
    ],
    common_mistakes: [
      "Letting elbows drop below shoulders.",
      "Using excessive weight — control beats load here.",
    ],
    recommended_sets: "3",
    recommended_reps: "15–20",
    xp_value: 65,
    tags: ["rear delts", "shoulder health", "posture"],
  },
  // ── BICEPS ───────────────────────────────────────────────
  {
    id: "barbell_curl",
    name: "Barbell Curl",
    category: "biceps",
    primary_muscle: "Biceps",
    secondary_muscles: ["Forearms", "Brachialis"],
    difficulty: "beginner",
    equipment: ["barbell"],
    gif_url: "https://v2.exercisedb.io/image/3SUfkX3Xe0NLHE",
    thumbnail_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80",
    instructions: [
      "Stand with bar in underhand grip, elbows at sides.",
      "Curl bar up, keeping elbows pinned to the body.",
      "Squeeze biceps hard at the top.",
      "Lower under control over 3 seconds.",
    ],
    common_mistakes: [
      "Swinging the torso to heave weight up.",
      "Letting elbows drift forward at the top.",
    ],
    recommended_sets: "3–4",
    recommended_reps: "8–12",
    xp_value: 90,
    tags: ["isolation", "arm size"],
  },
  {
    id: "hammer_curl",
    name: "Hammer Curl",
    category: "biceps",
    primary_muscle: "Brachialis",
    secondary_muscles: ["Biceps", "Forearms"],
    difficulty: "beginner",
    equipment: ["dumbbell"],
    gif_url: "https://v2.exercisedb.io/image/FRdB4Er0ZyIV6m",
    thumbnail_url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80",
    instructions: [
      "Hold dumbbells with neutral (hammer) grip.",
      "Curl both dumbbells up simultaneously or alternating.",
      "Keep upper arms stationary throughout.",
    ],
    common_mistakes: [
      "Rotating wrist at the top — keep neutral grip.",
    ],
    recommended_sets: "3",
    recommended_reps: "10–14",
    xp_value: 80,
    tags: ["arm thickness", "brachialis"],
  },
  // ── TRICEPS ──────────────────────────────────────────────
  {
    id: "tricep_pushdown",
    name: "Tricep Pushdown",
    category: "triceps",
    primary_muscle: "Triceps",
    secondary_muscles: [],
    difficulty: "beginner",
    equipment: ["cable"],
    gif_url: "https://v2.exercisedb.io/image/gMOdS8HZv8YDEO",
    thumbnail_url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80",
    instructions: [
      "Stand at cable machine with bar or rope attachment at chest height.",
      "Keep elbows tucked at sides throughout.",
      "Push handle down until arms are fully extended.",
      "Slowly return to start position.",
    ],
    common_mistakes: [
      "Flaring elbows out to assist the push.",
      "Leaning forward excessively.",
    ],
    recommended_sets: "3–4",
    recommended_reps: "12–15",
    xp_value: 75,
    tags: ["isolation", "triceps"],
  },
  {
    id: "skull_crusher",
    name: "Skull Crusher",
    category: "triceps",
    primary_muscle: "Triceps (Long Head)",
    secondary_muscles: [],
    difficulty: "intermediate",
    equipment: ["barbell", "bench"],
    gif_url: "https://v2.exercisedb.io/image/eKlBPK4Mz5rX0S",
    thumbnail_url: "https://images.unsplash.com/photo-1534368420009-621bfab424a8?w=400&q=80",
    instructions: [
      "Lie on a bench with EZ-bar or straight bar held above chest.",
      "Lower bar toward forehead by bending elbows only.",
      "Press back to start by extending elbows.",
    ],
    common_mistakes: [
      "Letting elbows flare out wide.",
      "Lowering too fast — risk of injury.",
    ],
    recommended_sets: "3",
    recommended_reps: "8–12",
    xp_value: 100,
    tags: ["mass builder", "long head"],
  },
  // ── LEGS ─────────────────────────────────────────────────
  {
    id: "barbell_squat",
    name: "Barbell Squat",
    category: "quads",
    primary_muscle: "Quads",
    secondary_muscles: ["Glutes", "Hamstrings", "Lower Back"],
    difficulty: "advanced",
    equipment: ["barbell"],
    gif_url: "https://v2.exercisedb.io/image/zGBdExQ5JB2E8A",
    thumbnail_url: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&q=80",
    instructions: [
      "Set bar on traps (high bar) or rear delts (low bar).",
      "Feet shoulder-width with toes slightly out.",
      "Brace core and descend until thighs are parallel or below.",
      "Drive through the floor, maintaining a neutral spine.",
    ],
    common_mistakes: [
      "Knees caving inward — push knees out over toes.",
      "Good morning squat — keep torso upright.",
    ],
    recommended_sets: "4–5",
    recommended_reps: "4–8",
    xp_value: 200,
    tags: ["king lift", "compound", "powerlifting", "legs", "back squat"],
    aliases: ["Back Squat"],
  },
  {
    id: "romanian_deadlift",
    name: "Romanian Deadlift",
    category: "hamstrings",
    primary_muscle: "Hamstrings",
    secondary_muscles: ["Glutes", "Lower Back"],
    difficulty: "intermediate",
    equipment: ["barbell", "dumbbell"],
    gif_url: "https://v2.exercisedb.io/image/TXj2X3JMvGPWR5",
    thumbnail_url: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&q=80",
    instructions: [
      "Stand with bar at hips, slight knee bend.",
      "Hinge at hips, lowering bar along the legs.",
      "Feel the stretch in hamstrings — stop when back begins to round.",
      "Drive hips forward to return to standing.",
    ],
    common_mistakes: [
      "Rounding lower back at the bottom.",
      "Bending knees too much — turns into a squat.",
    ],
    recommended_sets: "3–4",
    recommended_reps: "8–12",
    xp_value: 130,
    tags: ["hamstrings", "hip hinge", "posterior chain"],
  },
  {
    id: "leg_press",
    name: "Leg Press",
    category: "quads",
    primary_muscle: "Quads",
    secondary_muscles: ["Glutes", "Hamstrings"],
    difficulty: "beginner",
    equipment: ["machine"],
    gif_url: "https://v2.exercisedb.io/image/rSBdHrN9E3FPDL",
    thumbnail_url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80",
    instructions: [
      "Sit in the leg press machine, feet shoulder-width on the platform.",
      "Lower the platform until knees are at 90°.",
      "Press through the platform until legs are almost extended.",
      "Do NOT lock knees at the top.",
    ],
    common_mistakes: [
      "Allowing lower back to peel off the pad at the bottom.",
      "Placing feet too high — reduces quad activation.",
    ],
    recommended_sets: "3–4",
    recommended_reps: "10–15",
    xp_value: 100,
    tags: ["quad isolation", "machine", "beginner-friendly"],
  },
  {
    id: "hip_thrust",
    name: "Hip Thrust",
    category: "glutes",
    primary_muscle: "Glutes",
    secondary_muscles: ["Hamstrings", "Core"],
    difficulty: "intermediate",
    equipment: ["barbell", "bench"],
    gif_url: "https://v2.exercisedb.io/image/GmGMSCK7sCtJsB",
    thumbnail_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",
    instructions: [
      "Sit with upper back against a bench, bar across hips.",
      "Plant feet hip-width, toes slightly out.",
      "Drive hips to ceiling, squeezing glutes hard at the top.",
      "Lower under control until hips just below bench level.",
    ],
    common_mistakes: [
      "Overextending the lower back — posterior pelvic tilt at the top.",
      "Feet too far away — reduces glute activation.",
    ],
    recommended_sets: "4",
    recommended_reps: "8–12",
    xp_value: 130,
    tags: ["glutes", "hypertrophy"],
  },
  {
    id: "calf_raise",
    name: "Standing Calf Raise",
    category: "calves",
    primary_muscle: "Gastrocnemius",
    secondary_muscles: ["Soleus"],
    difficulty: "beginner",
    equipment: ["machine", "bodyweight"],
    gif_url: "https://v2.exercisedb.io/image/jrm8ULY0GcA14K",
    thumbnail_url: "https://images.unsplash.com/photo-1565728744382-61accd4aa148?w=400&q=80",
    instructions: [
      "Stand on the edge of a step or calf raise machine.",
      "Rise onto tiptoes as high as possible.",
      "Hold at the top for 1 second, squeezing calves.",
      "Lower fully until you feel a deep stretch.",
    ],
    common_mistakes: [
      "Not using full range of motion.",
      "Doing partial reps too fast.",
    ],
    recommended_sets: "4",
    recommended_reps: "15–20",
    xp_value: 60,
    tags: ["isolation", "calves"],
  },
  // ── ABS / CORE ───────────────────────────────────────────
  {
    id: "plank",
    name: "Plank",
    category: "core",
    primary_muscle: "Core",
    secondary_muscles: ["Glutes", "Shoulders"],
    difficulty: "beginner",
    equipment: ["bodyweight"],
    gif_url: "https://v2.exercisedb.io/image/DxmDGGxwJ7jfEY",
    thumbnail_url: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&q=80",
    instructions: [
      "Get into push-up position, then lower to forearms.",
      "Align body in straight line from head to heels.",
      "Squeeze abs, glutes, and quads. Hold.",
      "Breathe steadily — don't hold your breath.",
    ],
    common_mistakes: [
      "Hips too high or too low — maintain a straight line.",
      "Head drooping forward — neutral neck position.",
    ],
    recommended_sets: "3",
    recommended_reps: "30–60 sec",
    xp_value: 60,
    tags: ["isometric", "core stability"],
  },
  {
    id: "hanging_leg_raise",
    name: "Hanging Leg Raise",
    category: "abs",
    primary_muscle: "Lower Abs",
    secondary_muscles: ["Hip Flexors", "Core"],
    difficulty: "intermediate",
    equipment: ["pull_up_bar"],
    gif_url: "https://v2.exercisedb.io/image/qPqX5S4xNr3pqT",
    thumbnail_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
    instructions: [
      "Hang from a pull-up bar with an overhand grip.",
      "Keep legs straight (or bent for easier variation).",
      "Raise legs to hip height or above, using abs — not momentum.",
      "Lower under control.",
    ],
    common_mistakes: [
      "Swinging for momentum.",
      "Not posteriorly tilting pelvis — reduces ab activation.",
    ],
    recommended_sets: "3",
    recommended_reps: "10–15",
    xp_value: 90,
    tags: ["abs", "lower abs", "calisthenics"],
  },
  {
    id: "russian_twist",
    name: "Russian Twist",
    category: "obliques",
    primary_muscle: "Obliques",
    secondary_muscles: ["Abs", "Hip Flexors"],
    difficulty: "beginner",
    equipment: ["bodyweight", "dumbbell"],
    gif_url: "https://v2.exercisedb.io/image/qxW6J8BNNAXJMV",
    thumbnail_url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80",
    instructions: [
      "Sit on floor, knees bent, feet off or on floor.",
      "Lean back to ~45°, hold a weight or clasp hands.",
      "Rotate torso side to side, touching weight to the floor.",
    ],
    common_mistakes: [
      "Rotating only the arms — engage the full torso.",
    ],
    recommended_sets: "3",
    recommended_reps: "20 (10 each side)",
    xp_value: 70,
    tags: ["obliques", "core rotation"],
  },
  // ── TRAPS ────────────────────────────────────────────────
  {
    id: "barbell_shrug",
    name: "Barbell Shrugs",
    category: "traps",
    primary_muscle: "Traps",
    secondary_muscles: [],
    difficulty: "beginner",
    equipment: ["barbell", "dumbbell"],
    gif_url: "https://v2.exercisedb.io/image/uCa5ioNfUUdlYg",
    thumbnail_url: "https://images.unsplash.com/photo-1483721310020-03333e577078?w=400&q=80",
    instructions: [
      "Hold bar with overhand grip, arms fully extended.",
      "Shrug shoulders straight up toward ears.",
      "Hold briefly at the top and squeeze traps.",
      "Lower slowly.",
    ],
    common_mistakes: [
      "Rolling shoulders forward — straight up and down only.",
    ],
    recommended_sets: "3–4",
    recommended_reps: "10–15",
    xp_value: 75,
    tags: ["traps", "isolation", "shrug"],
    aliases: ["Barbell Shrug", "Shrugs"],
  },
  // ── CARDIO ───────────────────────────────────────────────
  {
    id: "running",
    name: "Running (15 min)",
    category: "cardio",
    primary_muscle: "Cardiovascular System",
    secondary_muscles: ["Quads", "Calves", "Glutes"],
    difficulty: "beginner",
    equipment: ["none"],
    gif_url: "https://v2.exercisedb.io/image/c2nCpyNfpWBamH",
    thumbnail_url: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&q=80",
    instructions: [
      "Warm up with a 5 min walk.",
      "Maintain a conversational pace (Zone 2) for endurance.",
      "Land mid-foot, not heel-striking.",
      "Cool down with a 5 min walk after.",
    ],
    common_mistakes: [
      "Starting too fast — builds lactic acid early.",
      "Skipping warm-up/cool-down.",
    ],
    recommended_sets: "1",
    recommended_reps: "15–45 min",
    xp_value: 100,
    tags: ["cardio", "aerobic", "fat burn"],
  },
  {
    id: "burpee",
    name: "Burpee",
    category: "hiit",
    primary_muscle: "Full Body",
    secondary_muscles: ["Chest", "Core", "Quads", "Cardio"],
    difficulty: "intermediate",
    equipment: ["bodyweight"],
    gif_url: "https://v2.exercisedb.io/image/M7KOaYFIBSgWvj",
    thumbnail_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
    instructions: [
      "From standing, squat down and place hands on floor.",
      "Jump feet back into push-up position.",
      "Perform a push-up (optional).",
      "Jump feet toward hands, then explosively jump up with arms overhead.",
    ],
    common_mistakes: [
      "Sagging hips during the push-up portion.",
      "Not landing softly — absorb with bent knees.",
    ],
    recommended_sets: "3–5",
    recommended_reps: "10–20",
    xp_value: 110,
    tags: ["hiit", "full body", "conditioning"],
  },
  // ── POWERLIFTING ─────────────────────────────────────────
  {
    id: "bench_press_competition",
    name: "Competition Bench Press",
    category: "powerlifting",
    primary_muscle: "Chest",
    secondary_muscles: ["Triceps", "Front Delts"],
    difficulty: "advanced",
    equipment: ["barbell", "bench"],
    gif_url: "https://v2.exercisedb.io/image/0Dwk5nbQxK3Wr8",
    thumbnail_url: "https://images.unsplash.com/photo-1534368420009-621bfab424a8?w=400&q=80",
    instructions: [
      "Set up with pronounced arch, feet flat or on toes.",
      "Retract scapulae hard and create leg drive.",
      "Pause the bar on chest on command, press on 'press'.",
      "Lock out fully and wait for 'rack' command.",
    ],
    common_mistakes: [
      "Not pausing the bar — powerlifting requires a pause.",
      "Losing leg drive during the press.",
    ],
    recommended_sets: "5",
    recommended_reps: "1–3",
    xp_value: 180,
    tags: ["powerlifting", "competition", "strength"],
  },
  // ── CALISTHENICS ─────────────────────────────────────────
  {
    id: "dips",
    name: "Parallel Bar Dips",
    category: "calisthenics",
    primary_muscle: "Triceps",
    secondary_muscles: ["Chest", "Front Delts"],
    difficulty: "intermediate",
    equipment: ["bodyweight"],
    gif_url: "https://v2.exercisedb.io/image/NvZT0dBiNE8lTG",
    thumbnail_url: "https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?w=400&q=80",
    instructions: [
      "Grip parallel bars, arms fully extended, slight forward lean.",
      "Lower body by bending elbows to ~90°.",
      "Press back up to lockout.",
    ],
    common_mistakes: [
      "Leaning too far forward — shifts to chest-focused dip.",
      "Not reaching full depth.",
    ],
    recommended_sets: "3–4",
    recommended_reps: "AMRAP",
    xp_value: 110,
    tags: ["calisthenics", "triceps", "bodyweight"],
  },
  {
    id: "muscle_up",
    name: "Muscle-Up",
    category: "calisthenics",
    primary_muscle: "Lats",
    secondary_muscles: ["Chest", "Triceps", "Core"],
    difficulty: "advanced",
    equipment: ["pull_up_bar"],
    gif_url: "https://v2.exercisedb.io/image/f0SMIiLtEiTRUK",
    thumbnail_url: "https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?w=400&q=80",
    instructions: [
      "Begin with a powerful pull-up, driving elbows high.",
      "At the top of the pull, transition by rotating wrists over the bar.",
      "Push up into a dip position and lock out.",
    ],
    common_mistakes: [
      "Kipping without building strict foundation first.",
      "Failing the transition — work chest-to-bar pull-ups first.",
    ],
    recommended_sets: "3",
    recommended_reps: "3–6",
    xp_value: 250,
    tags: ["advanced", "calisthenics", "skill"],
  },
  // ── MOBILITY / STRETCHING ────────────────────────────────
  {
    id: "hip_flexor_stretch",
    name: "Hip Flexor Lunge Stretch",
    category: "mobility",
    primary_muscle: "Hip Flexors",
    secondary_muscles: ["Quads", "Glutes"],
    difficulty: "beginner",
    equipment: ["bodyweight"],
    gif_url: "https://v2.exercisedb.io/image/tCEi1bTODc7dqR",
    thumbnail_url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80",
    instructions: [
      "Step forward into a deep lunge, back knee on the floor.",
      "Drive hips forward, keeping torso upright.",
      "Feel the stretch in the front of the rear hip.",
      "Hold 30–60 seconds per side.",
    ],
    common_mistakes: [
      "Allowing front knee to cave inward.",
      "Not sinking deep enough to feel the stretch.",
    ],
    recommended_sets: "2",
    recommended_reps: "30–60 sec each side",
    xp_value: 40,
    tags: ["mobility", "hip flexors", "recovery"],
  },
  {
    id: "thoracic_rotation",
    name: "Thoracic Rotation",
    category: "mobility",
    primary_muscle: "Thoracic Spine",
    secondary_muscles: ["Obliques"],
    difficulty: "beginner",
    equipment: ["bodyweight"],
    gif_url: "https://v2.exercisedb.io/image/JZb8oZf5IZ9WrE",
    thumbnail_url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80",
    instructions: [
      "Get into quadruped position (hands & knees).",
      "Place one hand behind your head.",
      "Rotate elbow toward the ceiling, following with your eyes.",
      "Return and repeat. Switch sides.",
    ],
    common_mistakes: [
      "Rotating from the lower back — isolate the thoracic spine.",
    ],
    recommended_sets: "2",
    recommended_reps: "10 each side",
    xp_value: 35,
    tags: ["mobility", "spine", "warm-up"],
  },
  // ── FULL BODY ────────────────────────────────────────────
  {
    id: "clean_and_press",
    name: "Clean & Press",
    category: "full_body",
    primary_muscle: "Full Body",
    secondary_muscles: ["Shoulders", "Traps", "Legs", "Core"],
    difficulty: "advanced",
    equipment: ["barbell"],
    gif_url: "https://v2.exercisedb.io/image/F2M5RGf1NNRHi4",
    thumbnail_url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80",
    instructions: [
      "Deadlift bar to hips, then explosively pull it to shoulder (clean).",
      "Catch bar in front rack position.",
      "Press bar overhead to lockout.",
      "Lower back to front rack, then floor.",
    ],
    common_mistakes: [
      "Using only arms to pull — use the hips for explosive power.",
    ],
    recommended_sets: "4",
    recommended_reps: "3–5",
    xp_value: 220,
    tags: ["full body", "power", "olympic lifting"],
  },
  {
    id: "kettlebell_swing",
    name: "Kettlebell Swing",
    category: "full_body",
    primary_muscle: "Glutes",
    secondary_muscles: ["Hamstrings", "Core", "Shoulders"],
    difficulty: "intermediate",
    equipment: ["kettlebell"],
    gif_url: "https://v2.exercisedb.io/image/Hk3ERIeYtQ0mXt",
    thumbnail_url: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&q=80",
    instructions: [
      "Hinge at hips, swing kettlebell back between legs.",
      "Explode hips forward, using that power to swing KB to shoulder height.",
      "Keep arms relaxed — the hips generate the swing, not the arms.",
      "Hinge again and repeat rhythmically.",
    ],
    common_mistakes: [
      "Squatting instead of hinging — this is a hip hinge movement.",
      "Pulling with the arms above shoulder height.",
    ],
    recommended_sets: "4",
    recommended_reps: "15–25",
    xp_value: 120,
    tags: ["full body", "cardio", "hiit", "power"],
  },
  // ── CROSSFIT ─────────────────────────────────────────────
  {
    id: "thruster",
    name: "Thruster",
    category: "crossfit",
    primary_muscle: "Full Body",
    secondary_muscles: ["Quads", "Shoulders", "Core"],
    difficulty: "advanced",
    equipment: ["barbell"],
    gif_url: "https://v2.exercisedb.io/image/nNFhK4NoJAbKvZ",
    thumbnail_url: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&q=80",
    instructions: [
      "Hold bar in front rack position.",
      "Squat to below parallel.",
      "As you rise, use the momentum to drive the bar overhead.",
      "Lock out arms at the top before descending.",
    ],
    common_mistakes: [
      "Pressing before reaching standing — it's one fluid motion.",
    ],
    recommended_sets: "3–5",
    recommended_reps: "10–15",
    xp_value: 180,
    tags: ["crossfit", "conditioning", "full body"],
  },
  // -- FOREARMS --------------------------------------------------------------
  {
    id: "wrist_curl",
    name: "Wrist Curl",
    category: "forearms",
    primary_muscle: "Forearm Flexors",
    secondary_muscles: ["Grip"],
    difficulty: "beginner",
    equipment: ["dumbbell", "bench"],
    gif_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench/0.jpg",
    thumbnail_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench/0.jpg",
    instructions: [
      "Rest your forearm on a bench with palm facing up and wrist just beyond the edge.",
      "Let the dumbbell roll slightly toward the fingers under control.",
      "Curl the wrist upward without lifting the forearm from the bench.",
      "Pause briefly, then lower slowly through the full range.",
    ],
    common_mistakes: [
      "Moving the whole arm instead of isolating the wrist.",
      "Using too much load and shortening the range of motion.",
    ],
    recommended_sets: "2-3",
    recommended_reps: "12-20",
    xp_value: 45,
    tags: ["grip", "forearms", "beginner-friendly"],
  },
  {
    id: "reverse_wrist_curl",
    name: "Reverse Wrist Curl",
    category: "forearms",
    primary_muscle: "Forearm Extensors",
    secondary_muscles: ["Grip"],
    difficulty: "intermediate",
    equipment: ["dumbbell", "bench"],
    gif_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench/0.jpg",
    thumbnail_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench/0.jpg",
    instructions: [
      "Rest your forearm on a bench with palm facing down.",
      "Lower the dumbbell until the wrist flexes comfortably.",
      "Extend the wrist upward while keeping the forearm planted.",
      "Control the lowering phase and avoid swinging.",
    ],
    common_mistakes: [
      "Rushing reps with momentum.",
      "Letting the elbow or shoulder assist the movement.",
    ],
    recommended_sets: "2-4",
    recommended_reps: "12-18",
    xp_value: 60,
    tags: ["forearms", "elbow health", "isolation"],
  },
  {
    id: "wrist_rotations",
    name: "Straight Bar Wrist Rotations",
    category: "forearms",
    primary_muscle: "Forearms",
    secondary_muscles: ["Grip", "Wrists"],
    difficulty: "advanced",
    equipment: ["barbell"],
    gif_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wrist_Rotations_with_Straight_Bar/0.jpg",
    thumbnail_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wrist_Rotations_with_Straight_Bar/0.jpg",
    instructions: [
      "Hold a light straight bar with a secure shoulder-width grip.",
      "Rotate the wrists slowly through a controlled arc.",
      "Keep elbows close and shoulders quiet throughout the set.",
      "Reverse direction after the planned reps.",
    ],
    common_mistakes: [
      "Using a heavy bar before the wrists are conditioned.",
      "Rotating too quickly and losing control.",
    ],
    recommended_sets: "2-3",
    recommended_reps: "8-12 each direction",
    xp_value: 85,
    tags: ["advanced", "grip", "wrist control"],
  },
  // -- NECK ------------------------------------------------------------------
  {
    id: "isometric_neck",
    name: "Isometric Neck Hold",
    category: "neck",
    primary_muscle: "Neck",
    secondary_muscles: ["Upper Traps"],
    difficulty: "beginner",
    equipment: ["bodyweight"],
    gif_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Isometric_Neck_Exercise_-_Front_And_Back/0.jpg",
    thumbnail_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Isometric_Neck_Exercise_-_Front_And_Back/0.jpg",
    instructions: [
      "Stand tall with a neutral spine.",
      "Press your hand gently into your forehead while resisting with the neck.",
      "Hold steady without letting the head move.",
      "Repeat against the back and sides of the head.",
    ],
    common_mistakes: [
      "Pushing too hard too soon.",
      "Letting the chin jut forward.",
    ],
    recommended_sets: "2",
    recommended_reps: "10-20 sec each direction",
    xp_value: 40,
    tags: ["neck", "isometric", "prehab"],
  },
  {
    id: "plate_neck_resistance",
    name: "Plate Neck Resistance",
    category: "neck",
    primary_muscle: "Neck Flexors",
    secondary_muscles: ["Upper Traps"],
    difficulty: "intermediate",
    equipment: ["none"],
    gif_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Face_Up_Plate_Neck_Resistance/0.jpg",
    thumbnail_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Face_Up_Plate_Neck_Resistance/0.jpg",
    instructions: [
      "Lie face up with head supported at the edge of a bench.",
      "Use very light resistance and keep the movement smooth.",
      "Flex the neck gently, then return to neutral under control.",
      "Stop immediately if you feel sharp discomfort.",
    ],
    common_mistakes: [
      "Using heavy resistance.",
      "Moving into painful end ranges.",
    ],
    recommended_sets: "2-3",
    recommended_reps: "10-15",
    xp_value: 70,
    tags: ["neck", "controlled strength"],
  },
  {
    id: "head_harness_neck_resistance",
    name: "Head Harness Neck Resistance",
    category: "neck",
    primary_muscle: "Neck Extensors",
    secondary_muscles: ["Upper Traps"],
    difficulty: "advanced",
    equipment: ["none"],
    gif_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Head_Harness_Neck_Resistance/0.jpg",
    thumbnail_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Head_Harness_Neck_Resistance/0.jpg",
    instructions: [
      "Sit tall with the torso braced and neck neutral.",
      "Use a very light harness load and hinge the head forward under control.",
      "Extend back to neutral without overextending.",
      "Keep the movement slow and pain-free.",
    ],
    common_mistakes: [
      "Loading too aggressively.",
      "Hyperextending at the top.",
    ],
    recommended_sets: "2-3",
    recommended_reps: "8-12",
    xp_value: 95,
    tags: ["advanced", "neck", "strength"],
  },
  // -- FUNCTIONAL ------------------------------------------------------------
  {
    id: "mountain_climbers",
    name: "Mountain Climbers",
    category: "functional",
    primary_muscle: "Full Body",
    secondary_muscles: ["Core", "Shoulders", "Hip Flexors"],
    difficulty: "beginner",
    equipment: ["bodyweight"],
    gif_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Mountain_Climbers/0.jpg",
    thumbnail_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Mountain_Climbers/0.jpg",
    instructions: [
      "Start in a high plank with hands under shoulders.",
      "Drive one knee toward the chest while keeping hips controlled.",
      "Switch legs rhythmically without losing plank position.",
      "Breathe steadily and keep the shoulders stacked.",
    ],
    common_mistakes: [
      "Letting hips bounce high.",
      "Collapsing through the shoulders.",
    ],
    recommended_sets: "3",
    recommended_reps: "20-40 sec",
    xp_value: 70,
    tags: ["functional", "core", "conditioning"],
  },
  {
    id: "farmers_walk",
    name: "Farmer's Walk",
    category: "functional",
    primary_muscle: "Full Body",
    secondary_muscles: ["Grip", "Traps", "Core"],
    difficulty: "intermediate",
    equipment: ["dumbbell", "kettlebell"],
    gif_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Farmers_Walk/0.jpg",
    thumbnail_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Farmers_Walk/0.jpg",
    instructions: [
      "Pick up two heavy implements with a neutral spine.",
      "Stand tall with ribs down and shoulders packed.",
      "Walk with short controlled steps for the target distance.",
      "Set the weights down by hinging, not rounding.",
    ],
    common_mistakes: [
      "Leaning backward while walking.",
      "Letting the weights pull the shoulders down and forward.",
    ],
    recommended_sets: "3-5",
    recommended_reps: "20-40 m",
    xp_value: 115,
    tags: ["carry", "grip", "functional strength"],
  },
  {
    id: "turkish_get_up",
    name: "Turkish Get-Up",
    category: "functional",
    primary_muscle: "Full Body",
    secondary_muscles: ["Shoulders", "Core", "Glutes"],
    difficulty: "advanced",
    equipment: ["kettlebell"],
    gif_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Turkish_Get-Up_Lunge_style/0.jpg",
    thumbnail_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Turkish_Get-Up_Lunge_style/0.jpg",
    instructions: [
      "Lie on your back with the kettlebell locked out over one shoulder.",
      "Roll to elbow, post to hand, and bridge the hips.",
      "Sweep the leg through into a lunge position.",
      "Stand tall, then reverse each step under control.",
    ],
    common_mistakes: [
      "Rushing the transitions.",
      "Letting the loaded shoulder lose its stacked position.",
    ],
    recommended_sets: "2-4",
    recommended_reps: "1-3 each side",
    xp_value: 180,
    tags: ["advanced", "coordination", "functional"],
  },
  // -- STRETCHING ------------------------------------------------------------
  {
    id: "cat_stretch",
    name: "Cat Stretch",
    category: "stretching",
    primary_muscle: "Spine",
    secondary_muscles: ["Upper Back", "Lower Back"],
    difficulty: "beginner",
    equipment: ["bodyweight"],
    gif_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cat_Stretch/0.jpg",
    thumbnail_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cat_Stretch/0.jpg",
    instructions: [
      "Start on hands and knees with a neutral spine.",
      "Round the back upward while tucking the chin slightly.",
      "Pause and breathe into the upper back.",
      "Return to neutral with control.",
    ],
    common_mistakes: [
      "Forcing the range instead of moving gently.",
      "Holding the breath.",
    ],
    recommended_sets: "2",
    recommended_reps: "8-12",
    xp_value: 35,
    tags: ["stretching", "spine", "warm-up"],
  },
  {
    id: "ninety_ninety_hamstring",
    name: "90/90 Hamstring Stretch",
    category: "stretching",
    primary_muscle: "Hamstrings",
    secondary_muscles: ["Calves"],
    difficulty: "intermediate",
    equipment: ["bodyweight"],
    gif_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/90_90_Hamstring/0.jpg",
    thumbnail_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/90_90_Hamstring/0.jpg",
    instructions: [
      "Lie on your back and bring one hip and knee to 90 degrees.",
      "Hold behind the thigh and slowly extend the knee.",
      "Stop before the lower back lifts from the floor.",
      "Breathe and repeat controlled pulses.",
    ],
    common_mistakes: [
      "Pulling aggressively on the leg.",
      "Letting the pelvis roll off the floor.",
    ],
    recommended_sets: "2-3",
    recommended_reps: "8-12 each side",
    xp_value: 45,
    tags: ["stretching", "hamstrings", "mobility"],
  },
  {
    id: "behind_head_chest_stretch",
    name: "Behind Head Chest Stretch",
    category: "stretching",
    primary_muscle: "Chest",
    secondary_muscles: ["Shoulders", "Biceps"],
    difficulty: "advanced",
    equipment: ["bodyweight"],
    gif_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Behind_Head_Chest_Stretch/0.jpg",
    thumbnail_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Behind_Head_Chest_Stretch/0.jpg",
    instructions: [
      "Stand tall and place the hands behind the head.",
      "Open the elbows while keeping ribs down.",
      "Lift the chest gently without arching the lower back.",
      "Hold the stretch and breathe slowly.",
    ],
    common_mistakes: [
      "Cranking the neck forward.",
      "Overarching the lower back to fake range.",
    ],
    recommended_sets: "2",
    recommended_reps: "30-45 sec",
    xp_value: 55,
    tags: ["advanced", "chest", "posture"],
  },
  // -- YOGA ------------------------------------------------------------------
  {
    id: "childs_pose",
    name: "Child's Pose",
    category: "yoga",
    primary_muscle: "Lower Back",
    secondary_muscles: ["Lats", "Hips"],
    difficulty: "beginner",
    equipment: ["bodyweight"],
    gif_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Childs_Pose/0.jpg",
    thumbnail_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Childs_Pose/0.jpg",
    instructions: [
      "Kneel with big toes together and knees comfortably apart.",
      "Sit hips back toward heels.",
      "Reach arms forward and let the chest soften toward the floor.",
      "Breathe slowly into the back and ribs.",
    ],
    common_mistakes: [
      "Forcing hips to heels when knees are uncomfortable.",
      "Shrugging shoulders toward ears.",
    ],
    recommended_sets: "1-2",
    recommended_reps: "45-90 sec",
    xp_value: 35,
    tags: ["yoga", "recovery", "relaxation"],
  },
  {
    id: "dancers_stretch",
    name: "Dancer's Stretch",
    category: "yoga",
    primary_muscle: "Quads",
    secondary_muscles: ["Hip Flexors", "Shoulders"],
    difficulty: "intermediate",
    equipment: ["bodyweight"],
    gif_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dancers_Stretch/0.jpg",
    thumbnail_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dancers_Stretch/0.jpg",
    instructions: [
      "Stand tall and hold one foot behind you.",
      "Keep knees close and ribs stacked over the pelvis.",
      "Press the foot into the hand as you open the chest.",
      "Hold balance, then switch sides.",
    ],
    common_mistakes: [
      "Letting the knee flare far outside the hip.",
      "Arching the lower back instead of opening the hip.",
    ],
    recommended_sets: "2",
    recommended_reps: "20-40 sec each side",
    xp_value: 50,
    tags: ["yoga", "balance", "quad stretch"],
  },
  {
    id: "downward_facing_balance",
    name: "Downward Facing Balance",
    category: "yoga",
    primary_muscle: "Shoulders",
    secondary_muscles: ["Core", "Hamstrings"],
    difficulty: "advanced",
    equipment: ["bodyweight"],
    gif_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Downward_Facing_Balance/0.jpg",
    thumbnail_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Downward_Facing_Balance/0.jpg",
    instructions: [
      "Start in a stable downward-facing position.",
      "Brace the core and shift weight evenly through both hands.",
      "Lift one leg or adjust balance only as far as control allows.",
      "Return with slow, steady breathing.",
    ],
    common_mistakes: [
      "Collapsing into the shoulders.",
      "Chasing range before balance is stable.",
    ],
    recommended_sets: "2-3",
    recommended_reps: "20-30 sec each side",
    xp_value: 80,
    tags: ["advanced", "yoga", "balance"],
  },
  // -- RECOVERY --------------------------------------------------------------
  {
    id: "calves_smr",
    name: "Calves SMR",
    category: "recovery",
    primary_muscle: "Calves",
    secondary_muscles: ["Ankles"],
    difficulty: "beginner",
    equipment: ["bodyweight"],
    gif_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calves-SMR/0.jpg",
    thumbnail_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calves-SMR/0.jpg",
    instructions: [
      "Sit with one calf resting on a roller or firm surface.",
      "Support yourself with the hands and gently roll the calf.",
      "Pause on tender spots and breathe.",
      "Switch sides after the planned time.",
    ],
    common_mistakes: [
      "Rolling too fast.",
      "Pressing through sharp pain.",
    ],
    recommended_sets: "1-2",
    recommended_reps: "45-90 sec each side",
    xp_value: 30,
    tags: ["recovery", "calves", "soft tissue"],
  },
  {
    id: "neck_smr",
    name: "Neck SMR",
    category: "recovery",
    primary_muscle: "Neck",
    secondary_muscles: ["Upper Traps"],
    difficulty: "intermediate",
    equipment: ["bodyweight"],
    gif_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Neck-SMR/0.jpg",
    thumbnail_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Neck-SMR/0.jpg",
    instructions: [
      "Set up gently with support under the neck or upper traps.",
      "Apply light pressure and move slowly.",
      "Pause only on mild tension, never sharp pain.",
      "Keep breathing calm and controlled.",
    ],
    common_mistakes: [
      "Using aggressive pressure on the neck.",
      "Rolling directly over painful joints.",
    ],
    recommended_sets: "1-2",
    recommended_reps: "30-60 sec",
    xp_value: 45,
    tags: ["recovery", "neck", "soft tissue"],
  },
  {
    id: "adductor_smr",
    name: "Adductor SMR",
    category: "recovery",
    primary_muscle: "Adductors",
    secondary_muscles: ["Hips"],
    difficulty: "advanced",
    equipment: ["bodyweight"],
    gif_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Adductor/0.jpg",
    thumbnail_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Adductor/0.jpg",
    instructions: [
      "Lie face down with one thigh supported out to the side.",
      "Place light pressure through the inner thigh.",
      "Roll slowly from the upper inner thigh toward the knee.",
      "Adjust pressure with your arms and opposite leg.",
    ],
    common_mistakes: [
      "Rolling directly into knee discomfort.",
      "Using too much pressure too early.",
    ],
    recommended_sets: "1-2",
    recommended_reps: "45-90 sec each side",
    xp_value: 60,
    tags: ["advanced", "recovery", "hips"],
  },
];

interface CompactExerciseSeed {
  id: string;
  name: string;
  category: WorkoutCategory;
  primary_muscle: string;
  secondary_muscles?: string[];
  difficulty?: Difficulty;
  equipment?: Equipment[];
  frame?: string;
  tags?: string[];
  sets?: string;
  reps?: string;
  xp?: number;
  type?: ExerciseType;
  workout_type?: WorkoutType;
}

const compactExercise = (seed: CompactExerciseSeed): ExerciseSeed => {
  const frameUrl = seed.frame ? demoFrame(seed.frame) : DEFAULT_EXERCISE_IMAGE;
  const primary = seed.primary_muscle;

  return {
    id: seed.id,
    name: seed.name,
    category: seed.category,
    primary_muscle: primary,
    secondary_muscles: seed.secondary_muscles ?? [],
    difficulty: seed.difficulty ?? "intermediate",
    equipment: seed.equipment ?? ["bodyweight"],
    exercise_type: seed.type,
    workout_type: seed.workout_type,
    gif_url: frameUrl,
    thumbnail_url: frameUrl,
    demo_frame_id: seed.frame,
    media_status: seed.frame ? "verified" : "placeholder",
    instructions: [
      `Set up for ${seed.name} with stable posture and the ${primary.toLowerCase()} loaded.`,
      "Brace the core, keep joints stacked, and move through a controlled pain-free range.",
      "Pause briefly in the hardest position, then return under control.",
      "Stop the set when rep speed or posture breaks down.",
    ],
    common_mistakes: [
      `Using momentum instead of controlled ${primary.toLowerCase()} tension.`,
      "Skipping the setup or chasing load through uncomfortable joint positions.",
    ],
    recommended_sets: seed.sets ?? "3-4",
    recommended_reps: seed.reps ?? "8-12",
    xp_value: seed.xp ?? 90,
    tags: [...(seed.tags ?? []), seed.category, primary.toLowerCase()],
    created_at: "2026-06-30",
    updated_at: "2026-06-30",
  };
};

const ADDITIONAL_EXERCISES: ExerciseSeed[] = [
  compactExercise({ id: "incline_barbell_chest_press", name: "Incline Barbell Chest Press", category: "chest", primary_muscle: "Upper Chest", secondary_muscles: ["Front Delts", "Triceps"], difficulty: "intermediate", equipment: ["barbell", "bench"], frame: "Incline_Dumbbell_Press", tags: ["compound", "strength", "upper chest"], xp: 125 }),
  compactExercise({ id: "decline_barbell_chest_press", name: "Decline Barbell Chest Press", category: "chest", primary_muscle: "Lower Chest", secondary_muscles: ["Triceps", "Front Delts"], difficulty: "intermediate", equipment: ["barbell", "bench"], frame: "Decline_Barbell_Bench_Press", tags: ["compound", "strength", "lower chest"], xp: 120 }),
  compactExercise({ id: "close_grip_chest_press", name: "Close-Grip Chest Press", category: "chest", primary_muscle: "Chest", secondary_muscles: ["Triceps", "Front Delts"], difficulty: "intermediate", equipment: ["barbell", "bench"], frame: "Close-Grip_Barbell_Bench_Press", tags: ["compound", "press", "triceps"], xp: 110 }),
  compactExercise({ id: "pec_flyes", name: "Pec Flyes", category: "chest", primary_muscle: "Chest", secondary_muscles: ["Front Delts"], difficulty: "beginner", equipment: ["machine", "dumbbell"], frame: "Dumbbell_Flyes", tags: ["isolation", "hypertrophy"], reps: "10-15", xp: 80, type: "isolation" }),
  compactExercise({ id: "bent_arm_pullover", name: "Bent Arm Pullover", category: "chest", primary_muscle: "Chest", secondary_muscles: ["Lats", "Triceps"], difficulty: "intermediate", equipment: ["dumbbell", "bench"], frame: "Bent-Arm_Dumbbell_Pullover", tags: ["stretch", "hypertrophy"], xp: 90 }),

  compactExercise({ id: "behind_neck_lat_pulldown", name: "Behind-the-Neck Lat Pulldown", category: "lats", primary_muscle: "Lats", secondary_muscles: ["Biceps", "Rear Delts"], difficulty: "advanced", equipment: ["cable", "machine"], frame: "Wide-Grip_Rear_Pull-Up", tags: ["advanced", "lat width"], reps: "8-12", xp: 115 }),
  compactExercise({ id: "t_bar_row", name: "T-Bar Row", category: "back", primary_muscle: "Upper Back", secondary_muscles: ["Lats", "Rear Delts", "Biceps"], difficulty: "intermediate", equipment: ["barbell"], frame: "T-Bar_Row_with_Handle", tags: ["compound", "thickness"], xp: 130 }),
  compactExercise({ id: "seated_cable_row", name: "Seated Cable Row", category: "back", primary_muscle: "Upper Back", secondary_muscles: ["Lats", "Biceps", "Rear Delts"], difficulty: "beginner", equipment: ["cable", "machine"], frame: "Seated_Cable_Rows", tags: ["compound", "cable"], xp: 100 }),
  compactExercise({ id: "one_arm_dumbbell_row", name: "One-Arm Dumbbell Row", category: "back", primary_muscle: "Lats", secondary_muscles: ["Upper Back", "Biceps", "Rear Delts"], difficulty: "beginner", equipment: ["dumbbell", "bench"], frame: "One-Arm_Dumbbell_Row", tags: ["unilateral", "back"], xp: 95 }),

  compactExercise({ id: "dumbbell_curl", name: "Dumbbell Curl", category: "biceps", primary_muscle: "Biceps", secondary_muscles: ["Forearms"], difficulty: "beginner", equipment: ["dumbbell"], frame: "Dumbbell_Bicep_Curl", tags: ["isolation", "arms"], type: "isolation", xp: 70 }),
  compactExercise({ id: "rope_hammer_curl", name: "Rope Hammer Curl", category: "biceps", primary_muscle: "Brachialis", secondary_muscles: ["Biceps", "Forearms"], difficulty: "beginner", equipment: ["cable"], frame: "Hammer_Curls", tags: ["isolation", "arms", "cable"], type: "isolation", xp: 75 }),
  compactExercise({ id: "cable_reverse_curl", name: "Cable Reverse Curl", category: "biceps", primary_muscle: "Brachioradialis", secondary_muscles: ["Biceps", "Forearms"], difficulty: "intermediate", equipment: ["cable"], frame: "Reverse_Barbell_Curl", tags: ["forearms", "arms"], type: "isolation", xp: 80 }),
  compactExercise({ id: "preacher_curl", name: "Preacher Curl", category: "biceps", primary_muscle: "Biceps", secondary_muscles: ["Brachialis"], difficulty: "intermediate", equipment: ["ez_bar", "bench"], frame: "Preacher_Curl", tags: ["isolation", "strict curl"], type: "isolation", xp: 85 }),
  compactExercise({ id: "concentration_curl", name: "Concentration Curl", category: "biceps", primary_muscle: "Biceps", secondary_muscles: ["Forearms"], difficulty: "beginner", equipment: ["dumbbell"], frame: "Concentration_Curls", tags: ["isolation", "mind muscle"], type: "isolation", xp: 70 }),

  compactExercise({ id: "machine_shoulder_press", name: "Machine Shoulder Press", category: "shoulders", primary_muscle: "Shoulders", secondary_muscles: ["Triceps", "Front Delts"], difficulty: "beginner", equipment: ["machine"], frame: "Barbell_Shoulder_Press", tags: ["compound", "machine"], xp: 100 }),
  compactExercise({ id: "barbell_front_press", name: "Barbell Front Press", category: "front_delts", primary_muscle: "Front Delts", secondary_muscles: ["Triceps", "Upper Chest"], difficulty: "intermediate", equipment: ["barbell"], frame: "Barbell_Shoulder_Press", tags: ["compound", "press"], xp: 120 }),
  compactExercise({ id: "barbell_behind_neck_press", name: "Barbell Behind-the-Neck Press", category: "shoulders", primary_muscle: "Shoulders", secondary_muscles: ["Triceps", "Upper Traps"], difficulty: "advanced", equipment: ["barbell"], frame: "Seated_Barbell_Military_Press", tags: ["advanced", "press"], xp: 135 }),
  compactExercise({ id: "front_raise", name: "Front Raise", category: "front_delts", primary_muscle: "Front Delts", secondary_muscles: ["Upper Chest"], difficulty: "beginner", equipment: ["dumbbell"], frame: "Front_Dumbbell_Raise", tags: ["isolation", "front delts"], type: "isolation", xp: 65 }),
  compactExercise({ id: "three_d_delt_raise", name: "3D Delt Raise", category: "shoulders", primary_muscle: "Shoulders", secondary_muscles: ["Rear Delts", "Side Delts", "Front Delts"], difficulty: "advanced", equipment: ["dumbbell"], frame: "Dumbbell_Lying_Rear_Lateral_Raise", tags: ["delts", "hypertrophy"], reps: "12-20", xp: 100 }),
  compactExercise({ id: "upright_row", name: "Upright Row", category: "side_delts", primary_muscle: "Side Delts", secondary_muscles: ["Traps", "Biceps"], difficulty: "intermediate", equipment: ["barbell", "ez_bar"], frame: "Upright_Barbell_Row", tags: ["shoulder width", "traps"], xp: 90 }),

  compactExercise({ id: "close_grip_bench_press", name: "Close-Grip Bench Press", category: "triceps", primary_muscle: "Triceps", secondary_muscles: ["Chest", "Front Delts"], difficulty: "intermediate", equipment: ["barbell", "bench"], frame: "Close-Grip_Barbell_Bench_Press", tags: ["compound", "arms"], xp: 115 }),
  compactExercise({ id: "rope_pushdown", name: "Rope Pushdown", category: "triceps", primary_muscle: "Triceps", secondary_muscles: [], difficulty: "beginner", equipment: ["cable"], frame: "Triceps_Pushdown", tags: ["isolation", "cable"], type: "isolation", xp: 75 }),
  compactExercise({ id: "single_arm_extension", name: "Single-Arm Extension", category: "triceps", primary_muscle: "Triceps", secondary_muscles: ["Core"], difficulty: "beginner", equipment: ["dumbbell", "cable"], frame: "Standing_One-Arm_Dumbbell_Triceps_Extension", tags: ["unilateral", "isolation"], type: "isolation", xp: 75 }),
  compactExercise({ id: "overhead_two_arm_extension", name: "Overhead Two-Arm Extension", category: "triceps", primary_muscle: "Triceps", secondary_muscles: ["Shoulders"], difficulty: "intermediate", equipment: ["dumbbell"], frame: "Standing_Dumbbell_Triceps_Extension", tags: ["long head", "isolation"], type: "isolation", xp: 85 }),
  compactExercise({ id: "reverse_grip_cable_pushdown", name: "Reverse-Grip Cable Pushdown", category: "triceps", primary_muscle: "Triceps", secondary_muscles: ["Forearms"], difficulty: "intermediate", equipment: ["cable"], frame: "Reverse_Grip_Triceps_Pushdown", tags: ["cable", "isolation"], type: "isolation", xp: 80 }),
  compactExercise({ id: "v_bar_d_rod_pushdown", name: "V-Bar (D-Rod) Pushdown", category: "triceps", primary_muscle: "Triceps", secondary_muscles: [], difficulty: "beginner", equipment: ["cable"], frame: "Triceps_Pushdown_-_V-Bar_Attachment", tags: ["cable", "isolation", "v-bar"], type: "isolation", xp: 75 }),
  compactExercise({ id: "tricep_kickback", name: "Tricep Kickback", category: "triceps", primary_muscle: "Triceps", secondary_muscles: ["Rear Delts"], difficulty: "beginner", equipment: ["dumbbell"], frame: "Tricep_Dumbbell_Kickback", tags: ["isolation", "arms"], type: "isolation", xp: 65 }),

  compactExercise({ id: "leg_extension", name: "Leg Extension", category: "quads", primary_muscle: "Quadriceps", secondary_muscles: [], difficulty: "beginner", equipment: ["machine"], frame: "Leg_Extensions", tags: ["isolation", "quads"], type: "isolation", xp: 75 }),
  compactExercise({ id: "leg_curl", name: "Leg Curl", category: "hamstrings", primary_muscle: "Hamstrings", secondary_muscles: ["Calves"], difficulty: "beginner", equipment: ["machine"], frame: "Lying_Leg_Curls", tags: ["isolation", "hamstrings"], type: "isolation", xp: 75 }),
  compactExercise({ id: "walking_lunges", name: "Walking Lunges", category: "legs", primary_muscle: "Quadriceps", secondary_muscles: ["Glutes", "Hamstrings", "Calves"], difficulty: "intermediate", equipment: ["bodyweight", "dumbbell"], frame: "Barbell_Squat", tags: ["unilateral", "legs", "functional"], reps: "10-16 each side", xp: 105 }),

  compactExercise({ id: "flat_crunch", name: "Flat Crunch", category: "abs", primary_muscle: "Abs", secondary_muscles: ["Hip Flexors"], difficulty: "beginner", equipment: ["bodyweight"], frame: "Crunches", tags: ["core", "beginner"], type: "isolation", reps: "12-20", xp: 50 }),
  compactExercise({ id: "flat_leg_raise", name: "Flat Leg Raise", category: "abs", primary_muscle: "Lower Abs", secondary_muscles: ["Hip Flexors"], difficulty: "beginner", equipment: ["bodyweight"], frame: "Flat_Bench_Leg_Pull-In", tags: ["core", "lower abs"], reps: "10-15", xp: 60 }),
  compactExercise({ id: "side_toe_touches", name: "Side Toe Touches", category: "obliques", primary_muscle: "Obliques", secondary_muscles: ["Abs"], difficulty: "beginner", equipment: ["bodyweight"], frame: "Alternate_Heel_Touchers", tags: ["core", "obliques"], reps: "16-30 total", xp: 50 }),
  compactExercise({ id: "flutter_kicks", name: "Flutter Kicks", category: "abs", primary_muscle: "Lower Abs", secondary_muscles: ["Hip Flexors"], difficulty: "intermediate", equipment: ["bodyweight"], frame: "Flutter_Kicks", tags: ["core", "conditioning"], reps: "20-45 sec", xp: 70, workout_type: "conditioning" }),
  compactExercise({ id: "machine_crunch", name: "Machine Crunch", category: "abs", primary_muscle: "Abs", secondary_muscles: ["Obliques"], difficulty: "beginner", equipment: ["machine"], frame: "Ab_Crunch_Machine", tags: ["machine", "core"], type: "isolation", xp: 75 }),

  compactExercise({ id: "back_extension", name: "Back Extension", category: "lower_back", primary_muscle: "Lower Back", secondary_muscles: ["Glutes", "Hamstrings"], difficulty: "beginner", equipment: ["machine", "bodyweight"], frame: "Hyperextensions_Back_Extensions", tags: ["posterior chain", "lower back"], xp: 80 }),
  compactExercise({ id: "hanging_knee_raise", name: "Hanging Knee Raise", category: "hip_flexors", primary_muscle: "Hip Flexors", secondary_muscles: ["Abs", "Grip"], difficulty: "intermediate", equipment: ["pull_up_bar"], frame: "Hanging_Leg_Raise", tags: ["core", "hip flexors"], reps: "8-15", xp: 85 }),
  compactExercise({ id: "clean_and_jerk", name: "Clean and Jerk", category: "olympic_lifting", primary_muscle: "Full Body", secondary_muscles: ["Quads", "Glutes", "Shoulders", "Traps"], difficulty: "advanced", equipment: ["barbell"], frame: "Clean_and_Jerk", tags: ["olympic lifting", "power", "technical"], sets: "4-6", reps: "1-3", xp: 220, workout_type: "power" }),
  compactExercise({ id: "power_snatch", name: "Power Snatch", category: "olympic_lifting", primary_muscle: "Full Body", secondary_muscles: ["Hamstrings", "Glutes", "Shoulders", "Traps"], difficulty: "advanced", equipment: ["barbell"], frame: "Power_Snatch", tags: ["olympic lifting", "power", "technical"], sets: "4-6", reps: "1-3", xp: 210, workout_type: "power" }),
];

const getExerciseType = (exercise: ExerciseSeed): ExerciseType => {
  if (exercise.exercise_type) return exercise.exercise_type;
  const tags = exercise.tags.join(" ").toLowerCase();
  if (tags.includes("isolation")) return "isolation";
  if (["biceps", "triceps", "forearms", "calves", "abs", "obliques", "rear_delts", "front_delts", "side_delts"].includes(exercise.category)) {
    return tags.includes("compound") ? "compound" : "isolation";
  }
  return "compound";
};

const getWorkoutType = (exercise: ExerciseSeed): WorkoutType => {
  if (exercise.workout_type) return exercise.workout_type;
  const tags = exercise.tags.join(" ").toLowerCase();
  if (["cardio"].includes(exercise.category)) return "endurance";
  if (["hiit", "crossfit", "functional"].includes(exercise.category)) return "conditioning";
  if (["mobility", "stretching", "yoga"].includes(exercise.category)) return "mobility";
  if (exercise.category === "recovery") return "recovery";
  if (["olympic_lifting"].includes(exercise.category) || tags.includes("power")) return "power";
  if (tags.includes("calisthenics") || exercise.category === "calisthenics") return "skill";
  if (tags.includes("hypertrophy") || getExerciseType(exercise) === "isolation") return "hypertrophy";
  return "strength";
};

const defaultRest = (exercise: ExerciseSeed): string => {
  if (exercise.category === "cardio" || exercise.category === "hiit") return "45-90 sec";
  if (["mobility", "stretching", "yoga", "recovery"].includes(exercise.category)) return "30-60 sec";
  if (exercise.difficulty === "advanced" || getExerciseType(exercise) === "compound") return "90-180 sec";
  return "45-90 sec";
};

const caloriesEstimate = (exercise: ExerciseSeed): number => {
  const base = exercise.difficulty === "advanced" ? 10 : exercise.difficulty === "intermediate" ? 8 : 6;
  if (["cardio", "hiit", "crossfit", "full_body", "olympic_lifting"].includes(exercise.category)) return base + 5;
  if (["mobility", "stretching", "yoga", "recovery"].includes(exercise.category)) return Math.max(3, base - 3);
  return base;
};

const normalizeExercise = (exercise: ExerciseSeed, index: number): LibraryExercise => {
  const frameId = exercise.demo_frame_id ?? EXERCISE_DEMO_FRAME_IDS[exercise.id];
  const frameUrl = frameId ? demoFrame(frameId) : undefined;
  const mediaUrl = frameUrl ?? exercise.thumbnail_url ?? exercise.gif_url ?? DEFAULT_EXERCISE_IMAGE;

  return {
    ...exercise,
    exercise_type: getExerciseType(exercise),
    workout_type: getWorkoutType(exercise),
    gif_url: mediaUrl,
    thumbnail_url: mediaUrl,
    image_url: exercise.image_url ?? mediaUrl,
    media_status: exercise.media_status ?? (frameId ? "verified" : "placeholder"),
    breathing: exercise.breathing ?? [
      "Inhale and brace before the hardest part of the rep.",
      "Exhale smoothly as you drive, lift, pull, or squeeze.",
      "Reset your breath before the next controlled repetition.",
    ],
    safety_tips: exercise.safety_tips ?? [
      "Warm up the target joints before loading hard sets.",
      "Keep the movement pain-free and stop if sharp discomfort appears.",
      "Choose a load that lets you complete every rep with control.",
    ],
    beginner_modifications: exercise.beginner_modifications ?? [
      "Use lighter load, shorter range, or assisted setup while learning the pattern.",
      "Perform fewer sets and keep 2-3 reps in reserve.",
    ],
    advanced_variations: exercise.advanced_variations ?? [
      "Add tempo control, pauses, unilateral work, or heavier progressive loading.",
      "Use advanced variations only after the base movement feels consistent.",
    ],
    recommended_rest: exercise.recommended_rest ?? defaultRest(exercise),
    calories_estimate: exercise.calories_estimate ?? caloriesEstimate(exercise),
    popularity_score: exercise.popularity_score ?? Math.max(10, 100 - index),
    created_at: exercise.created_at ?? "2026-06-01",
    updated_at: exercise.updated_at ?? "2026-06-30",
    aliases: exercise.aliases ?? [],
    tags: Array.from(new Set([...exercise.tags, exercise.primary_muscle.toLowerCase(), ...exercise.secondary_muscles.map((m) => m.toLowerCase())])),
  };
};

const normalizeExerciseLibrary = (exercises: ExerciseSeed[]): LibraryExercise[] => {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  return exercises
    .map((exercise, index) => normalizeExercise(exercise, index))
    .filter((exercise) => {
      const nameKey = exercise.name.trim().toLowerCase();
      if (seenIds.has(exercise.id) || seenNames.has(nameKey)) return false;
      seenIds.add(exercise.id);
      seenNames.add(nameKey);
      return true;
    });
};

export const EXERCISE_LIBRARY: LibraryExercise[] = normalizeExerciseLibrary([
  ...BASE_EXERCISE_LIBRARY,
  ...ADDITIONAL_EXERCISES,
]);

// ---------------------------------------------------------------------------
// Derived utilities
// ---------------------------------------------------------------------------
export const EXERCISE_CATEGORIES: { id: WorkoutCategory; label: string; glyph: string }[] = [
  { id: "chest",        label: "Chest",        glyph: "✚" },
  { id: "back",         label: "Back",          glyph: "▲" },
  { id: "lats",         label: "Lats",          glyph: "◆" },
  { id: "shoulders",    label: "Shoulders",     glyph: "◯" },
  { id: "biceps",       label: "Biceps",        glyph: "❖" },
  { id: "triceps",      label: "Triceps",       glyph: "✦" },
  { id: "forearms",     label: "Forearms",      glyph: "✧" },
  { id: "quads",        label: "Quads",         glyph: "❉" },
  { id: "hamstrings",   label: "Hamstrings",    glyph: "❀" },
  { id: "glutes",       label: "Glutes",        glyph: "❂" },
  { id: "calves",       label: "Calves",        glyph: "✺" },
  { id: "abs",          label: "Abs",           glyph: "⊟" },
  { id: "core",         label: "Core",          glyph: "⊠" },
  { id: "obliques",     label: "Obliques",      glyph: "⊞" },
  { id: "traps",        label: "Traps",         glyph: "△" },
  { id: "neck",         label: "Neck",          glyph: "◉" },
  { id: "full_body",    label: "Full Body",     glyph: "✜" },
  { id: "cardio",       label: "Cardio",        glyph: "♥" },
  { id: "hiit",         label: "HIIT",          glyph: "⚡" },
  { id: "functional",   label: "Functional",    glyph: "⚙" },
  { id: "mobility",     label: "Mobility",      glyph: "☯" },
  { id: "stretching",   label: "Stretching",    glyph: "🌀" },
  { id: "yoga",         label: "Yoga",          glyph: "✿" },
  { id: "recovery",     label: "Recovery",      glyph: "☽" },
  { id: "powerlifting", label: "Powerlifting",  glyph: "⚔" },
  { id: "crossfit",     label: "CrossFit",      glyph: "✠" },
  { id: "calisthenics", label: "Calisthenics",  glyph: "⬡" },
  { id: "rear_delts", label: "Rear Delts", glyph: "RD" },
  { id: "front_delts", label: "Front Delts", glyph: "FD" },
  { id: "side_delts", label: "Side Delts", glyph: "SD" },
  { id: "legs", label: "Legs", glyph: "LG" },
  { id: "lower_back", label: "Lower Back", glyph: "LB" },
  { id: "hip_flexors", label: "Hip Flexors", glyph: "HF" },
  { id: "olympic_lifting", label: "Olympic Lifting", glyph: "OL" },
];

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell:          "Barbell",
  dumbbell:         "Dumbbell",
  cable:            "Cable",
  machine:          "Machine",
  bodyweight:       "Bodyweight",
  kettlebell:       "Kettlebell",
  resistance_band:  "Resistance Band",
  pull_up_bar:      "Pull-Up Bar",
  bench:            "Bench",
  ez_bar:           "EZ Bar",
  medicine_ball:    "Medicine Ball",
  foam_roller:      "Foam Roller",
  none:             "No Equipment",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner:     "Beginner",
  intermediate: "Intermediate",
  advanced:     "Advanced",
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner:     "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
  intermediate: "text-amber-400 border-amber-400/40 bg-amber-400/10",
  advanced:     "text-red-400 border-red-400/40 bg-red-400/10",
};
