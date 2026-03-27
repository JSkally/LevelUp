import
{ useState, useEffect, useRef, useCallback, useMemo } from "react";
import { LineChart, Line,
AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
ResponsiveContainer, Legend, Cell } from "recharts";

// ─── BRAND ASSETS ───
const
CHEVRON_LOGO =
"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAIAAAADnC86AAABCGlDQ1BJQ0MgUHJvZmlsZQAAeJxjYGA8wQAELAYMDLl5JUVB7k4KEZFRCuwPGBiBEAwSk4sLGHADoKpv1yBqL+viUYcLcKakFicD6Q9ArFIEtBxopAiQLZIOYWuA2EkQtg2IXV5SUAJkB4DYRSFBzkB2CpCtkY7ETkJiJxcUgdT3ANk2uTmlyQh3M/Ck5oUGA2kOIJZhKGYIYnBncAL5H6IkfxEDg8VXBgbmCQixpJkMDNtbGRgkbiHEVBYwMPC3MDBsO48QQ4RJQWJRIliIBYiZ0tIYGD4tZ2DgjWRgEL7AwMAVDQsIHG5TALvNnSEfCNMZchhSgSKeDHkMyQx6QJYRgwGDIYMZAKbWPz9HbOBQAAAGO0lEQVR42r2YTYxbVxXHzzn3Pb/n9zH2jD0zjpNAoIWWIlRCRGmkooAoEpWCqEBKRQWLChaULggCIULSiEBKlUUEQkVigWDHx4JKVVkglYqyQYqgEioBEjUIZWY8tmf8/fWefc89LF4NmY7H9oSGu/DG792fz/n/z/8+P4DbXXjL5/9vJTyH1G2z1W3cQwACkLdSzxbfbgBejyMFIHcaTAAGIGfZTxcOH7bs93te3ZgbcaQQ5c6BE2rWss6uHjqSSnUMC8Bx36+xuREP9lW32i81VNbZwqG7U06XjYUoACxw3PdrSd1zs9W+qD5Z3yocvNdxu8wKMXHWmB3UmG8M52Wr+akuqTOFQ+913A6bRFEjAoj0BluO+2HN8Jx6q3kmRwAcUt9YLR510x3mZF8bMSBSiFoEd7ATvWew1TzzaiF9bbX4oXTQHlMtxKoe/abdbAkftlLy357Lg4nXhjO8pmZSCfHrqwdPeEGNtYUIAFokIHqx0/xVc/taHH08zCCCACaKgMCJIKyynu41mkpFQDy9Urzf9a7GcUCUVBaQspAOWCmFWEzZnrJ8UikEA+Ai9kSux9FTuZWHwywDJB6ct2Icg7+8cuCRMHNl0Hu6vH4g5dzjOCOAPw/6P65XX+m2I8NN5j/2OjVjDtqpjFIdY85srt0c6Yf88Fjar++tN04x1JeWi48EC03WaaIXOs1fNmqLSkViWlpPugcPWKkm6yOO+5XlwgKSAUgT/qi29VK7gbt6riZSFeIT+cLJMNMy2kI0AEdd/y7H1QAfTAf3pYMbw5hFBIAAFOL7vOBUNmcTPeCFX8gt+0jJT0uypW74n3GE08HJUL7bTT+ZL3QMq3FLIiNF2/5YkFm0rOdbjWN+cHMYaxEAeCjMIoJDdDpfeGcqFYvwWKzEa/elvd9127EYnGkuBTjceZ2gEMBr0eBitWQh/L7dHIlJ2nOl166O9NVo8Ey1BDtbmrC1CM3patkpPosERGXNl7ZKn1/MBUQd1iCiEBEwMuZf8eCJpZWO4R9uVzKkbsXjHj6imcnFID6pkubvVNYfz+Y/7IUECAAagEUYBADShDbAN1eKdebL2+WFnWy4DTCL+EQVHn27vP7ZxfwJP2gyf8Dz06ROLeZPZpYeW8y/J+2/zXELtt1mPrdabDNf2toMSeFUNs2kVjWfL288ms09HIQNZgZ5R8pZte1T2dwXl5afzK3em3LflXIdRBaJjDm7Wuwb88xWySNFIPtOLhbxiKrM58prn8ksfSLM1LW2EVkkp6xI5G9RPxKpaP2P4aBg2SJAiAYgYY+MXKyW0qRoj7ppb11pm/lMee3RzNLJhWydR+NDiW6O4vIw1gIWIIB0mP8eR5J4HyBhn1stMsiFSskla2JiTwZ7SDU2ZzZvfnIh++hCtq5HyUALiI3w12iwaNl3O+5QjIv4gBdej6OuMck1CbtvzLmVIoCcr6zZSNauxMaJYXnEcWOBjwTh57K5uta3Bj0CDEUGIstKtYwJiXrGDEVCItk5kATgkrpY3WixaejRth7earfJkdlk/anM0uPZXEPz7uMFEZaV/foo/m5loyfyoB8kByLuKoBFPhos/GXQuxb332TyyZF5j5s+vVxosVE4Qf6Q1GtR9L3KxrYeXY36HWOOeYER2c02ACBy1Ate7bajnVFoTdTYAoxEcJLVFyx1pd+7XN0cGCZAAHmxVW8bfipXIDGjna4ZR6ahCYg5InNMhYyyXul1flDdTPYyIACgEP/QaXWZv7pSdEBieTMb5nf17mVAMhb9ttu6XClpMW+0cdwGBfhqv3uhvN4ykkZgmf2AOxssAAYkJOvXreZzW5vJsMou4QngetQ/X14vaQ6IZrJpJhVAQrJ+3qr9rFahPfoGAAaAADeG0fny2rXhMFRqOpumUxHAI+snja1f1LcIUabmvgEhgLoeXSiv/WnQz0xl0967AIE4RM9tV15o1gjRyGzpDAAB9A0/W1l/udfJKsvsC2xAbABCury1+VKnoRCMyNw2BATQIt+vlp5vN0KlRCb0afI4pRAZ8FK19Gq/owB4n/+6/zONP61VuoY/nVmime8Nku/vctL3e2Hy8PW/vK5I+nkizOYtex8vLQjegoV3/IY7XMBbtv4NzUM92hvMHMgAAAAASUVORK5CYII=";

//
─── CONSTANTS & DATA ───
const TIERS = [
{ id: "t1", name: "Base", color: "#6B7280",
features: { messaging: false, vbt: false, analytics: "basic" } },
{ id: "t2", name: "Pro",
color: "#1A9E96", features: { messaging: true, vbt: false, analytics: "advanced" } },
{ id:
"t3", name: "Elite", color: "#B22222", features: { messaging: true, vbt: true, analytics:
"advanced" } },
];

const EXERCISES = [
{ id: "e1", name: "Back Squat", muscles:
["Quads", "Glutes"], chain: "anterior", pattern: "squat", equipment: "Barbell", tags:
["compound", "lower"] },
{ id: "e2", name: "Bench Press", muscles: ["Chest",
"Triceps"], chain: "anterior", pattern: "push", equipment: "Barbell", tags: ["compound",
"upper"] },
{ id: "e3", name: "Deadlift", muscles: ["Hamstrings", "Erectors"], chain:
"posterior", pattern: "hinge", equipment: "Barbell", tags: ["compound", "lower"] },
{
id: "e4", name: "Romanian Deadlift", muscles: ["Hamstrings", "Glutes"], chain:
"posterior", pattern: "hinge", equipment: "Barbell", tags: ["compound", "lower"] },
{
id: "e5", name: "Overhead Press", muscles: ["Deltoids", "Triceps"], chain: "anterior",
pattern: "push", equipment: "Barbell", tags: ["compound", "upper"] },
{ id: "e6", name:
"Barbell Row", muscles: ["Lats", "Biceps"], chain: "posterior", pattern: "pull",
equipment: "Barbell", tags: ["compound", "upper"] },
{ id: "e7", name: "Clean &
Jerk", muscles: ["Full Body"], chain: "full", pattern: "olympic", equipment: "Barbell",
tags: ["olympic", "power"] },
{ id: "e8", name: "Snatch", muscles: ["Full Body"], chain:
"full", pattern: "olympic", equipment: "Barbell", tags: ["olympic", "power"] },
{ id:
"e9", name: "Front Squat", muscles: ["Quads", "Core"], chain: "anterior", pattern:
"squat", equipment: "Barbell", tags: ["compound", "lower"] },
{ id: "e10", name: "Hip
Thrust", muscles: ["Glutes", "Hamstrings"], chain: "posterior", pattern: "hinge",
equipment: "Barbell", tags: ["compound", "lower"] },
{ id: "e11", name: "Pull-Up",
muscles: ["Lats", "Biceps"], chain: "posterior", pattern: "pull", equipment: "Bodyweight",
tags: ["compound", "upper"] },
{ id: "e12", name: "Incline Bench Press", muscles: ["Upper
Chest", "Deltoids"], chain: "anterior", pattern: "push", equipment: "Barbell", tags:
["compound", "upper"] },
];

const LOAD_PARAM_OPTIONS = [
{ key: "weight_kg", label:
"Weight (kg)", type: "number", group: "Intensity" },
{ key: "weight_pct_1rm", label: "%
of 1RM", type: "number", group: "Intensity" },
{ key: "rpe", label: "RPE", type:
"number", group: "Intensity" },
{ key: "rir", label: "RIR", type: "number", group:
"Intensity" },
{ key: "reps", label: "Reps", type: "number", group: "Volume" },
{ key:
"rep_range", label: "Rep Range", type: "range", group: "Volume" },
{ key:
"time_seconds", label: "Time (sec)", type: "number", group: "Volume" },
{ key: "tempo",
label: "Tempo", type: "text", group: "Execution" },
{ key: "velocity_target", label:
"Velocity (m/s)", type: "number", group: "Velocity" },
{ key: "partial_reps", label:
"Partial Reps", type: "number", group: "Advanced" },
{ key: "eccentric_only", label:
"Eccentric Only", type: "toggle", group: "Advanced" },
{ key: "concentric_only", label:
"Concentric Only", type: "toggle", group: "Advanced" },
{ key: "drop_set", label: "Drop
Set", type: "toggle", group: "Advanced" },
{ key: "pyramid", label: "Pyramid", type:
"toggle", group: "Advanced" },
{ key: "rest_seconds", label: "Rest (sec)", type:
"number", group: "Recovery" },
];

const CLIENTS = [
{ id: "c1", name: "Marcus Chen",
tier: "t3", avatar: "MC", program: "Strength Peaking", readiness: 92, lastActive: "2h ago"
},
{ id: "c2", name: "Keisha Brown", tier: "t2", avatar: "KB", program: "Hypertrophy
Block", readiness: 67, lastActive: "5h ago" },
{ id: "c3", name: "Andre Williams", tier:
"t3", avatar: "AW", program: "Olympic Prep", readiness: 45, lastActive: "1h ago" },
{ id:
"c4", name: "Tanya Reid", tier: "t1", avatar: "TR", program: "General Fitness", readiness:
78, lastActive: "1d ago" },
{ id: "c5", name: "Devon Campbell", tier: "t2", avatar:
"DC", program: "Powerlifting", readiness: 85, lastActive: "3h ago" },
];

const VOLUME_DATA
= Array.from({ length: 12 }, (_, i) => ({
week: `W${i + 1}`,
squat: 4200 + Math.random() *
3000 + (i < 4 ? i * 800 : i < 8 ? (8 - i) * 400 : (i - 8) * 600),
bench: 3100 +
Math.random() * 2000 + (i < 4 ? i * 500 : i < 8 ? (8 - i) * 300 : (i - 8) * 400),

deadlift: 5000 + Math.random() * 3500 + (i < 4 ? i * 900 : i < 8 ? (8 - i) * 500 : (i - 8)
* 700),
anterior: 7500 + Math.random() * 3000,
posterior: 8200 + Math.random() *
3500,
}));

const VELOCITY_DATA = [
{ load: 60, velocity: 1.12 }, { load: 70, velocity: 0.98 },
{ load: 80, velocity: 0.82 },
{ load: 90, velocity: 0.68 }, { load: 100, velocity: 0.55 }, { load:
110, velocity: 0.42 },
{ load: 120, velocity: 0.31 }, { load: 130, velocity: 0.22 }, { load: 135,
velocity: 0.17 },
];

const ORM_HISTORY = Array.from({ length: 8 }, (_, i) => ({
month:
["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"][i],
epley: 140 + i * 3.5
+ Math.random() * 5,
velocity: 138 + i * 4 + Math.random() * 6,
}));

const MESSAGES_DATA = [

{ id: 1, from: "trainer", text: "Great session yesterday. Let's push the squats to 85% this
week.", time: "9:15 AM", name: "Coach AJ" },
{ id: 2, from: "client", text: "Feeling
strong! My knees are 100% now. Ready for it.", time: "9:22 AM", name: "Marcus Chen" },
{ id:
3, from: "trainer", text: "Perfect. I've updated your program — check the new week. Added pause
squats on Day 2.", time: "9:30 AM", name: "Coach AJ" },
{ id: 4, from: "client", text:
"Saw it. 3-1-2-0 tempo on the pause squats — that's going to be brutal 😅", time: "9:35 AM",
name: "Marcus Chen" },
{ id: 5, from: "trainer", text: "That's the point. Trust the process.
Hit the readiness check before you start.", time: "9:41 AM", name: "Coach AJ" },
];

const
NOTICE_POSTS = [
{ id: 1, title: "Holiday Schedule Update", body: "Gym hours adjusted Dec
23–Jan 2. Check the app for updated booking slots.", time: "2h ago", tiers: ["All"], pinned:
true },
{ id: 2, title: "New VBT Feature: Jump Analysis", body: "Elite members now have access
to jump height tracking. Open your camera tool and select 'Jump Test' mode.", time: "1d ago",
tiers: ["Elite"], pinned: false },
{ id: 3, title: "Nutrition Workshop — March 28", body:
"Free for Pro & Elite members. Register through the events tab.", time: "3d ago", tiers:
["Pro", "Elite"], pinned: false },
];

// ─── SAMPLE PROGRAM ───
const SAMPLE_PROGRAM = {

name: "12-Week Strength Peaking",
type: "strength",
macrocycles: [
{
id: "m1", name:
"Accumulation", weeks: [
{
id: "w1", number: 1, deload: false, days: [
{
id: "d1",
label: "Upper Push", exercises: [
{ id: "de1", exercise: EXERCISES[1], sets: [
{ set: 1,
type: "working", params: { weight_pct_1rm: 75, reps: 5, rpe: 7, tempo: "3-1-2-0", rest_seconds:
180 } },
{ set: 2, type: "working", params: { weight_pct_1rm: 80, reps: 4, rpe: 8, rest_seconds:
180 } },
{ set: 3, type: "working", params: { weight_pct_1rm: 82, reps: 3, rpe: 8.5,
rest_seconds: 240 } },
]},
{ id: "de2", exercise: EXERCISES[4], sets: [
{ set: 1, type:
"working", params: { weight_kg: 50, reps: 8, rpe: 7, rest_seconds: 120 } },
{ set: 2, type:
"working", params: { weight_kg: 52.5, reps: 8, rpe: 7.5, rest_seconds: 120 } },
{ set: 3, type:
"working", params: { weight_kg: 55, reps: 6, rpe: 8, rest_seconds: 120 } },
]},
{ id: "de3",
exercise: EXERCISES[11], sets: [
{ set: 1, type: "working", params: { weight_kg: 60, reps: 10,
rpe: 7, rest_seconds: 90 } },
{ set: 2, type: "working", params: { weight_kg: 60, reps: 10, rpe:
7.5, rest_seconds: 90 } },
{ set: 3, type: "working", params: { weight_kg: 60, reps: 8, rpe: 8,
rest_seconds: 90 } },
]},
]
},
{
id: "d2", label: "Lower Squat", exercises: [
{ id:
"de4", exercise: EXERCISES[0], sets: [
{ set: 1, type: "working", params: { weight_pct_1rm:
78, reps: 5, rpe: 7.5, velocity_target: 0.55, rest_seconds: 240 } },
{ set: 2, type: "working",
params: { weight_pct_1rm: 82, reps: 4, rpe: 8, velocity_target: 0.48, rest_seconds: 240 } },
{
set: 3, type: "working", params: { weight_pct_1rm: 85, reps: 3, rpe: 8.5, velocity_target: 0.42,
rest_seconds: 300 } },
{ set: 4, type: "backoff", params: { weight_pct_1rm: 72, reps: 6, rpe:
6.5, rest_seconds: 180 } },
]},
{ id: "de5", exercise: EXERCISES[8], sets: [
{ set: 1, type:
"working", params: { weight_kg: 80, reps: 6, rpe: 7, rest_seconds: 150 } },
{ set: 2, type:
"working", params: { weight_kg: 85, reps: 5, rpe: 7.5, rest_seconds: 150 } },
{ set: 3, type:
"working", params: { weight_kg: 85, reps: 5, rpe: 8, rest_seconds: 150 } },
]},
{ id: "de6",
exercise: EXERCISES[3], sets: [
{ set: 1, type: "working", params: { weight_kg: 90, reps: 8,
rpe: 7, tempo: "3-0-1-0", rest_seconds: 120 } },
{ set: 2, type: "working", params: {
weight_kg: 95, reps: 8, rpe: 7.5, tempo: "3-0-1-0", rest_seconds: 120 } },
{ set: 3, type:
"working", params: { weight_kg: 95, reps: 6, rpe: 8, tempo: "3-0-1-0", rest_seconds: 120 } },

]},
]
},
{
id: "d3", label: "Upper Pull", exercises: [
{ id: "de7", exercise:
EXERCISES[5], sets: [
{ set: 1, type: "working", params: { weight_kg: 80, reps: 6, rpe: 7,
rest_seconds: 150 } },
{ set: 2, type: "working", params: { weight_kg: 85, reps: 5, rpe: 7.5,
rest_seconds: 150 } },
{ set: 3, type: "working", params: { weight_kg: 85, reps: 5, rpe: 8,
rest_seconds: 150 } },
]},
{ id: "de8", exercise: EXERCISES[10], sets: [
{ set: 1, type:
"working", params: { reps: 8, rpe: 7, rest_seconds: 120 } },
{ set: 2, type: "working",
params: { reps: 7, rpe: 7.5, rest_seconds: 120 } },
{ set: 3, type: "working", params: { reps:
6, rpe: 8, rest_seconds: 120 } },
]},
]
},
{
id: "d4", label: "Lower Hinge",
exercises: [
{ id: "de9", exercise: EXERCISES[2], sets: [
{ set: 1, type: "working", params:
{ weight_pct_1rm: 80, reps: 4, rpe: 7.5, velocity_target: 0.35, rest_seconds: 300 } },
{ set: 2,
type: "working", params: { weight_pct_1rm: 85, reps: 3, rpe: 8.5, velocity_target: 0.28,
rest_seconds: 300 } },
{ set: 3, type: "working", params: { weight_pct_1rm: 87, reps: 2, rpe: 9,
velocity_target: 0.22, rest_seconds: 300 } },
]},
{ id: "de10", exercise: EXERCISES[9], sets:
[
{ set: 1, type: "working", params: { weight_kg: 100, reps: 10, rpe: 7, rest_seconds: 120 }
},
{ set: 2, type: "working", params: { weight_kg: 110, reps: 8, rpe: 7.5, rest_seconds: 120 }
},
{ set: 3, type: "working", params: { weight_kg: 110, reps: 8, rpe: 8, rest_seconds: 120 }
},
]},
]
},
]
},
{
id: "w2", number: 2, deload: false, days: [
{ id: "d5",
label: "Upper Push", exercises: [] },
{ id: "d6", label: "Lower Squat", exercises: [] },
{
id: "d7", label: "Upper Pull", exercises: [] },
{ id: "d8", label: "Lower Hinge",
exercises: [] },
]
},
{
id: "w3", number: 3, deload: false, days: [
{ id: "d9", label:
"Upper Push", exercises: [] },
{ id: "d10", label: "Lower Squat", exercises: [] },
{ id:
"d11", label: "Upper Pull", exercises: [] },
{ id: "d12", label: "Lower Hinge", exercises:
[] },
]
},
{
id: "w4", number: 4, deload: true, days: [
{ id: "d13", label: "Full
Body A", exercises: [] },
{ id: "d14", label: "Full Body B", exercises: [] },
]
},
]

},
{
id: "m2", name: "Intensification", weeks: [
{ id: "w5", number: 5, deload: false,
days: [{ id: "d15", label: "Heavy Upper", exercises: [] }, { id: "d16", label: "Heavy
Lower", exercises: [] }, { id: "d17", label: "Volume Upper", exercises: [] }, { id: "d18",
label: "Volume Lower", exercises: [] }] },
{ id: "w6", number: 6, deload: false, days: [{ id:
"d19", label: "Heavy Upper", exercises: [] }, { id: "d20", label: "Heavy Lower", exercises:
[] }, { id: "d21", label: "Volume Upper", exercises: [] }, { id: "d22", label: "Volume
Lower", exercises: [] }] },
{ id: "w7", number: 7, deload: false, days: [{ id: "d23", label:
"Heavy Upper", exercises: [] }, { id: "d24", label: "Heavy Lower", exercises: [] }, { id:
"d25", label: "Volume Upper", exercises: [] }, { id: "d26", label: "Volume Lower",
exercises: [] }] },
{ id: "w8", number: 8, deload: true, days: [{ id: "d27", label: "Recovery
A", exercises: [] }, { id: "d28", label: "Recovery B", exercises: [] }] },
]
},
{
id:
"m3", name: "Peaking", weeks: [
{ id: "w9", number: 9, deload: false, days: [{ id: "d29",
label: "Squat Focus", exercises: [] }, { id: "d30", label: "Bench Focus", exercises: [] }, {
id: "d31", label: "Deadlift Focus", exercises: [] }] },
{ id: "w10", number: 10, deload:
false, days: [{ id: "d32", label: "Squat Opener", exercises: [] }, { id: "d33", label: "Bench
Opener", exercises: [] }, { id: "d34", label: "Deadlift Opener", exercises: [] }] },
{ id:
"w11", number: 11, deload: false, days: [{ id: "d35", label: "Heavy Singles", exercises: [] },
{ id: "d36", label: "Light Technique", exercises: [] }] },
{ id: "w12", number: 12, deload:
true, days: [{ id: "d37", label: "Meet Prep", exercises: [] }] },
]
},
]
};

// ───
READINESS ───
const READINESS_CHECKLIST = [
{ key: "sleep_hours", label: "Sleep (hours)",
type: "number", icon: "🌙" },
{ key: "sleep_quality", label: "Sleep Quality", type:
"slider", icon: "😴" },
{ key: "hydration", label: "Hydration", type: "slider", icon:
"💧" },
{ key: "nutrition", label: "Nutrition", type: "slider", icon: "🥗" },
{ key:
"soreness", label: "Soreness", type: "slider", icon: "🦵" },
{ key: "stress", label:
"Stress", type: "slider", icon: "🧠" },
];

const READINESS_ADJUSTMENTS = [
{ exercise:
"Back Squat", original: { weight: "85% 1RM", sets: 4, reps: 3, rpe: 9 }, proposed: { weight:
"78% 1RM", sets: 3, reps: 3, rpe: 7.5 }, severity: "red", reason: "High fatigue + poor sleep.
Heavy CNS demand reduced." },
{ exercise: "Front Squat", original: { weight: "80kg", sets: 3,
reps: 5, rpe: 7.5 }, proposed: { weight: "72kg", sets: 3, reps: 5, rpe: 7 }, severity: "yellow",
reason: "Moderate reduction. Soreness elevated." },
{ exercise: "Romanian Deadlift", original:
{ weight: "95kg", sets: 3, reps: 8, rpe: 7.5 }, proposed: { weight: "95kg", sets: 3, reps: 8,
rpe: 7.5 }, severity: "green", reason: "No change needed. Within recovery capacity."
},
];

// ─── ICONS (SVG inline) ───
const Icons = {
dashboard: <svg width="18"
height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect
x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7"
height="7" rx="1"/><rect x="14" y="14" width="7" height="7"
rx="1"/></svg>,
program: <svg width="18" height="18" viewBox="0 0 24
24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2
2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6"
height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>,
users:
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle
cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16
3.13a4 4 0 010 7.75"/></svg>,
analytics: <svg width="18" height="18"
viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path
d="M18 20V10"/><path d="M12 20V4"/><path d="M6
20v-6"/></svg>,
readiness: <svg width="18" height="18" viewBox="0 0 24
24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9
3l-3 9H2"/></svg>,
message: <svg width="18" height="18" viewBox="0 0 24
24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2
2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
notice: <svg width="18"
height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path
d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
exercises: <svg width="18"
height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
strokeWidth="2"><path d="M6.5 6.5h11"/><path d="M6.5
17.5h11"/><rect x="2" y="4" width="4" height="5" rx="1"/><rect
x="18" y="4" width="4" height="5" rx="1"/><rect x="2" y="15" width="4"
height="5" rx="1"/><rect x="18" y="15" width="4" height="5"
rx="1"/><path d="M12 2v20"/></svg>,
chevron: <svg width="14"
height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>,
chevronDown:
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>,
plus: <svg
width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>,
search: <svg
width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21
21l-4.35-4.35"/></svg>,
pin: <svg width="14" height="14" viewBox="0 0 24
24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L12
22"/><path d="M17 6l-5-4-5 4"/></svg>,
send: <svg width="16"
height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon
points="22 2 15 22 11 13 2 9 22 2"/></svg>,
};

// ─── STYLE ───
const css =
`
@import
url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
--bg-root: #0A0C10;
--bg-surface: #12151C;
--bg-elevated: #1A1E28;
--bg-hover:
#222838;
--border: #2A2F3C;
--border-subtle: #1E2330;
--text-primary: #E8ECF4;

--text-secondary: #8B93A7;
--text-muted: #5A6275;
--accent: #B22222;
--accent-glow: rgba(178,
34, 34, 0.15);
--teal: #1A9E96;
--teal-glow: rgba(26, 158, 150, 0.15);
--green: #34D399;

--green-dim: rgba(52, 211, 153, 0.12);
--yellow: #FBBF24;
--yellow-dim: rgba(251, 191, 36,
0.12);
--red: #F87171;
--red-dim: rgba(248, 113, 113, 0.12);
--blue: #1A9E96;
--blue-dim:
rgba(26, 158, 150, 0.12);
--purple: #A78BFA;
--font: 'DM Sans', sans-serif;
--mono: 'JetBrains
Mono', monospace;
--radius: 8px;
--radius-lg: 12px;
}

* { margin: 0; padding: 0;
box-sizing: border-box; }

.app {
font-family: var(--font);
background: var(--bg-root);

color: var(--text-primary);
display: flex;
height: 100vh;
overflow: hidden;
}

/* Sidebar
*/
.sidebar {
width: 240px;
min-width: 240px;
background: var(--bg-surface);
border-right:
1px solid var(--border);
display: flex;
flex-direction: column;
padding: 0;
}

.sidebar-logo {
padding: 20px 20px 16px;
border-bottom: 1px solid var(--border-subtle);

display: flex;
align-items: center;
gap: 10px;
}

.sidebar-logo img {
width: 32px;

height: 32px;
object-fit: contain;
}

.sidebar-logo-text h1 {
font-size: 22px;

font-weight: 700;
letter-spacing: 3px;
text-transform: uppercase;
color: var(--accent);

}

.sidebar-logo-text span {
font-size: 10px;
color: var(--teal);
text-transform:
uppercase;
letter-spacing: 1.5px;
font-weight: 500;
}

.sidebar-nav {
flex: 1;
padding:
12px 10px;
overflow-y: auto;
}

.nav-section-label {
font-size: 10px;
font-weight: 600;

color: var(--text-muted);
text-transform: uppercase;
letter-spacing: 1.5px;
padding: 16px 10px
8px;
}

.nav-item {
display: flex;
align-items: center;
gap: 10px;
padding: 9px 12px;

border-radius: var(--radius);
cursor: pointer;
font-size: 13.5px;
font-weight: 450;
color:
var(--text-secondary);
transition: all 0.15s;
margin-bottom: 2px;
}

.nav-item:hover {
background: var(--bg-hover); color: var(--text-primary); }
.nav-item.active { background:
var(--accent-glow); color: var(--accent); }
.nav-item .badge {
margin-left: auto;
background:
var(--accent);
color: white;
font-size: 10px;
font-weight: 600;
padding: 2px 7px;

border-radius: 10px;
}

/* Main content */
.main {
flex: 1;
display: flex;

flex-direction: column;
overflow: hidden;
}

.topbar {
height: 56px;
min-height: 56px;

border-bottom: 1px solid var(--border);
display: flex;
align-items: center;
justify-content:
space-between;
padding: 0 24px;
background: var(--bg-surface);
}

.topbar h2 {
font-size:
16px;
font-weight: 600;
letter-spacing: -0.3px;
}

.topbar-actions { display: flex; gap:
8px; align-items: center; }

.content {
flex: 1;
overflow-y: auto;
padding: 24px;

scrollbar-width: thin;
scrollbar-color: var(--border) transparent;
}

.content::-webkit-scrollbar { width: 6px; }
.content::-webkit-scrollbar-thumb { background:
var(--border); border-radius: 3px; }

/* Cards */
.card {
background: var(--bg-surface);

border: 1px solid var(--border);
border-radius: var(--radius-lg);
padding: 20px;

margin-bottom: 16px;
}

.card-header {
display: flex;
align-items: center;

justify-content: space-between;
margin-bottom: 16px;
}

.card-title {
font-size: 14px;

font-weight: 600;
letter-spacing: -0.2px;
}

/* Buttons */
.btn {
display: inline-flex;

align-items: center;
gap: 6px;
padding: 7px 14px;
border-radius: var(--radius);
font-size:
12.5px;
font-weight: 550;
font-family: var(--font);
border: 1px solid var(--border);

background: var(--bg-elevated);
color: var(--text-primary);
cursor: pointer;
transition: all
0.15s;
white-space: nowrap;
}

.btn:hover { background: var(--bg-hover); border-color:
var(--text-muted); }

.btn-primary {
background: var(--accent);
border-color:
var(--accent);
color: white;
}
.btn-primary:hover { background: #961C1C; }

.btn-sm {
padding: 5px 10px; font-size: 11.5px; }
.btn-ghost { background: transparent; border-color:
transparent; }
.btn-ghost:hover { background: var(--bg-hover); }

/* Tags/Badges */

.tier-badge {
font-size: 10px;
font-weight: 600;
padding: 3px 8px;
border-radius: 4px;

text-transform: uppercase;
letter-spacing: 0.8px;
}

.severity-red { background:
var(--red-dim); color: var(--red); }
.severity-yellow { background: var(--yellow-dim); color:
var(--yellow); }
.severity-green { background: var(--green-dim); color: var(--green); }

.severity-gray { background: rgba(139,147,167,0.12); color: var(--text-secondary); }

/* Grid
*/
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.grid-3 { display:
grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
.grid-4 { display: grid;
grid-template-columns: repeat(4, 1fr); gap: 16px; }

/* Stat cards */
.stat-card {

background: var(--bg-surface);
border: 1px solid var(--border);
border-radius:
var(--radius-lg);
padding: 18px;
}
.stat-label { font-size: 11px; color: var(--text-muted);
text-transform: uppercase; letter-spacing: 1px; font-weight: 500; margin-bottom: 8px; }

.stat-value { font-size: 28px; font-weight: 700; letter-spacing: -1px; font-family: var(--mono); }

.stat-delta { font-size: 11px; font-weight: 500; margin-top: 4px; }
.stat-up { color:
var(--green); }
.stat-down { color: var(--red); }

/* Program tree */
.program-tree {
display: flex; flex-direction: column; gap: 4px; }
.tree-macro {
border: 1px solid
var(--border);
border-radius: var(--radius-lg);
overflow: hidden;
background:
var(--bg-surface);
}
.tree-macro-header {
display: flex;
align-items: center;
gap: 10px;

padding: 14px 16px;
cursor: pointer;
transition: background 0.15s;
background:
var(--bg-elevated);
border-bottom: 1px solid var(--border);
}
.tree-macro-header:hover {
background: var(--bg-hover); }
.tree-macro-name { font-weight: 600; font-size: 14px; }

.tree-week {
margin: 8px 12px;
border: 1px solid var(--border-subtle);
border-radius:
var(--radius);
overflow: hidden;
}
.tree-week-header {
display: flex;
align-items:
center;
gap: 8px;
padding: 10px 14px;
cursor: pointer;
font-size: 13px;
font-weight:
500;
color: var(--text-secondary);
transition: background 0.15s;
}
.tree-week-header:hover {
background: var(--bg-hover); }
.tree-week-header .deload-tag {
font-size: 10px;
padding: 2px
6px;
background: var(--yellow-dim);
color: var(--yellow);
border-radius: 4px;
font-weight:
600;
}
.tree-days { padding: 4px 10px 10px; display: flex; gap: 8px; flex-wrap: wrap; }

.tree-day {
flex: 1;
min-width: 120px;
padding: 10px 14px;
background: var(--bg-root);

border: 1px solid var(--border-subtle);
border-radius: var(--radius);
cursor: pointer;

transition: all 0.15s;
font-size: 12.5px;
font-weight: 500;
}
.tree-day:hover {
border-color: var(--accent); background: var(--accent-glow); }
.tree-day.active { border-color:
var(--accent); background: var(--accent-glow); }
.tree-day-label { color: var(--text-primary);
margin-bottom: 4px; }
.tree-day-meta { color: var(--text-muted); font-size: 11px; }

/*
Exercise detail */
.exercise-block {
background: var(--bg-root);
border: 1px solid
var(--border-subtle);
border-radius: var(--radius);
margin-bottom: 12px;
overflow: hidden;

}
.exercise-block-header {
display: flex;
align-items: center;
justify-content:
space-between;
padding: 12px 16px;
border-bottom: 1px solid var(--border-subtle);
}

.exercise-block-name { font-weight: 600; font-size: 13.5px; }
.exercise-block-muscles { font-size:
11px; color: var(--text-muted); }
.set-row {
display: grid;
grid-template-columns: 50px 1fr;

gap: 0;
padding: 8px 16px;
font-size: 12px;
border-bottom: 1px solid var(--border-subtle);

align-items: center;
}
.set-row:last-child { border-bottom: none; }
.set-num {
font-family:
var(--mono);
font-size: 11px;
color: var(--text-muted);
font-weight: 500;
}
.set-params
{
display: flex;
flex-wrap: wrap;
gap: 6px;
}
.param-chip {
font-size: 11px;
padding:
3px 8px;
border-radius: 4px;
background: var(--bg-elevated);
border: 1px solid
var(--border-subtle);
font-family: var(--mono);
color: var(--text-secondary);
}

.param-chip.velocity { background: var(--teal-glow); color: var(--teal); border-color: transparent;
}
.param-chip.intensity { background: var(--accent-glow); color: var(--accent); border-color:
transparent; }
.set-type-tag {
font-size: 9px;
text-transform: uppercase;
letter-spacing:
0.8px;
font-weight: 600;
color: var(--text-muted);
}
.set-type-tag.backoff { color:
var(--yellow); }
.set-type-tag.drop { color: var(--red); }

/* Search */
.search-box {

display: flex;
align-items: center;
gap: 8px;
padding: 8px 14px;
background:
var(--bg-root);
border: 1px solid var(--border);
border-radius: var(--radius);
margin-bottom:
16px;
}
.search-box input {
flex: 1;
background: transparent;
border: none;
outline:
none;
color: var(--text-primary);
font-family: var(--font);
font-size: 13px;
}
.search-box
input::placeholder { color: var(--text-muted); }

/* Exercise library grid */
.exercise-card
{
background: var(--bg-elevated);
border: 1px solid var(--border-subtle);
border-radius:
var(--radius);
padding: 14px;
cursor: pointer;
transition: all 0.15s;
}

.exercise-card:hover { border-color: var(--accent); transform: translateY(-1px); }

.exercise-card-name { font-weight: 600; font-size: 13px; margin-bottom: 6px; }
.exercise-card-meta
{ font-size: 11px; color: var(--text-muted); }
.exercise-card-tags { display: flex; gap: 4px;
margin-top: 8px; flex-wrap: wrap; }
.exercise-card-tag {
font-size: 10px;
padding: 2px 6px;

border-radius: 3px;
background: var(--bg-root);
color: var(--text-muted);
border: 1px solid
var(--border-subtle);
}

/* Client list */
.client-row {
display: grid;

grid-template-columns: 44px 1.5fr 1fr 1fr 0.8fr 80px;
gap: 12px;
align-items: center;
padding:
12px 16px;
border-bottom: 1px solid var(--border-subtle);
transition: background 0.15s;

font-size: 13px;
}
.client-row:hover { background: var(--bg-hover); }
.client-avatar {

width: 36px;
height: 36px;
border-radius: 50%;
display: flex;
align-items: center;

justify-content: center;
font-size: 12px;
font-weight: 700;
background: var(--bg-hover);

color: var(--text-secondary);
}

/* Readiness */
.readiness-grid { display: grid;
grid-template-columns: 1fr 1fr; gap: 20px; }
.readiness-slider-row {
display: flex;

align-items: center;
gap: 12px;
padding: 10px 0;
border-bottom: 1px solid
var(--border-subtle);
}
.readiness-slider-row:last-child { border-bottom: none; }

.readiness-slider-icon { font-size: 20px; width: 30px; text-align: center; }

.readiness-slider-label { font-size: 13px; font-weight: 500; width: 100px; }
.readiness-slider {

flex: 1;
-webkit-appearance: none;
height: 6px;
border-radius: 3px;
background:
var(--bg-hover);
outline: none;
}
.readiness-slider::-webkit-slider-thumb {

-webkit-appearance: none;
width: 18px;
height: 18px;
border-radius: 50%;
background:
var(--teal);
cursor: pointer;
border: 2px solid var(--bg-root);
}
.readiness-val {

font-family: var(--mono);
font-size: 14px;
font-weight: 600;
width: 30px;
text-align:
right;
}

.readiness-score {
width: 120px;
height: 120px;
border-radius: 50%;
display:
flex;
align-items: center;
justify-content: center;
flex-direction: column;
margin: 0 auto
16px;
}
.readiness-score-val { font-size: 36px; font-weight: 800; font-family: var(--mono); }

.readiness-score-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }

/*
Adjustment rows */
.adj-row {
display: grid;
grid-template-columns: 1.2fr 1fr 1fr 80px;
gap:
12px;
padding: 14px 16px;
border-bottom: 1px solid var(--border-subtle);
align-items: start;

font-size: 12.5px;
}
.adj-row:last-child { border-bottom: none; }
.adj-exercise { font-weight:
600; font-size: 13px; margin-bottom: 4px; }
.adj-reason { font-size: 11px; color:
var(--text-muted); margin-top: 6px; line-height: 1.4; }
.adj-param { font-family: var(--mono);
font-size: 11.5px; color: var(--text-secondary); line-height: 1.8; }
.adj-param .strike {
text-decoration: line-through; color: var(--text-muted); margin-right: 6px; }
.adj-param .new-val
{ font-weight: 600; }

/* Messaging */
.msg-container { display: flex; height: calc(100vh -
160px); gap: 0; }
.msg-sidebar {
width: 260px;
border-right: 1px solid var(--border);

overflow-y: auto;
}
.msg-contact {
display: flex;
align-items: center;
gap: 10px;

padding: 12px 16px;
cursor: pointer;
transition: background 0.15s;
border-bottom: 1px solid
var(--border-subtle);
}
.msg-contact:hover { background: var(--bg-hover); }

.msg-contact.active { background: var(--accent-glow); }
.msg-contact-name { font-size: 13px;
font-weight: 550; }
.msg-contact-preview { font-size: 11px; color: var(--text-muted); overflow:
hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 160px; }
.msg-body { flex: 1;
display: flex; flex-direction: column; }
.msg-messages {
flex: 1;
overflow-y: auto;
padding:
20px;
display: flex;
flex-direction: column;
gap: 12px;
}
.msg-bubble {
max-width:
70%;
padding: 10px 14px;
border-radius: 12px;
font-size: 13px;
line-height: 1.5;
}

.msg-bubble.trainer {
background: var(--accent);
color: white;
align-self: flex-end;

border-bottom-right-radius: 4px;
}
.msg-bubble.client {
background: var(--bg-elevated);

border: 1px solid var(--border);
align-self: flex-start;
border-bottom-left-radius: 4px;
}

.msg-time { font-size: 10px; color: var(--text-muted); margin-top: 4px; }
.msg-input-bar {

display: flex;
gap: 8px;
padding: 14px 20px;
border-top: 1px solid var(--border);

background: var(--bg-surface);
}
.msg-input {
flex: 1;
background: var(--bg-root);
border:
1px solid var(--border);
border-radius: var(--radius);
padding: 10px 14px;
color:
var(--text-primary);
font-family: var(--font);
font-size: 13px;
outline: none;
}

.msg-input::placeholder { color: var(--text-muted); }

/* Notice Board */
.notice-card {

background: var(--bg-elevated);
border: 1px solid var(--border);
border-radius:
var(--radius-lg);
padding: 18px;
margin-bottom: 12px;
transition: border-color 0.15s;
}

.notice-card:hover { border-color: var(--text-muted); }
.notice-card.pinned { border-left: 3px
solid var(--accent); }
.notice-title { font-weight: 600; font-size: 14px; margin-bottom: 6px; }

.notice-body { font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 10px;
}
.notice-meta { display: flex; gap: 10px; align-items: center; font-size: 11px; color:
var(--text-muted); }
.notice-tier-tag {
font-size: 10px;
padding: 2px 6px;
border-radius:
3px;
background: var(--bg-root);
border: 1px solid var(--border-subtle);
}

/* Load param
modal */
.modal-overlay {
position: fixed;
inset: 0;
background: rgba(0,0,0,0.6);

backdrop-filter: blur(4px);
display: flex;
align-items: center;
justify-content: center;

z-index: 100;
}
.modal {
background: var(--bg-surface);
border: 1px solid var(--border);

border-radius: var(--radius-lg);
width: 520px;
max-height: 80vh;
overflow-y: auto;
padding:
24px;
}
.modal-title { font-size: 16px; font-weight: 700; margin-bottom: 4px; }

.modal-subtitle { font-size: 12px; color: var(--text-muted); margin-bottom: 20px; }

.param-group-label {
font-size: 10px;
font-weight: 600;
color: var(--text-muted);

text-transform: uppercase;
letter-spacing: 1.2px;
padding: 12px 0 6px;
border-bottom: 1px
solid var(--border-subtle);
margin-bottom: 8px;
}
.param-row {
display: flex;
align-items:
center;
justify-content: space-between;
padding: 8px 0;
}
.param-label { font-size: 13px;
font-weight: 450; }
.param-input {
width: 100px;
padding: 6px 10px;
background:
var(--bg-root);
border: 1px solid var(--border);
border-radius: var(--radius);
color:
var(--text-primary);
font-family: var(--mono);
font-size: 13px;
text-align: right;
outline:
none;
}
.param-input:focus { border-color: var(--accent); }
.param-toggle {
width: 40px;

height: 22px;
border-radius: 11px;
background: var(--bg-hover);
border: 1px solid
var(--border);
cursor: pointer;
position: relative;
transition: all 0.2s;
}

.param-toggle.on { background: var(--accent); border-color: var(--accent); }
.param-toggle::after
{
content: '';
position: absolute;
width: 16px;
height: 16px;
border-radius: 50%;

background: white;
top: 2px;
left: 2px;
transition: transform 0.2s;
}

.param-toggle.on::after { transform: translateX(18px); }

/* Tabs */
.tabs {
display: flex;

gap: 0;
border-bottom: 1px solid var(--border);
margin-bottom: 20px;
}
.tab {
padding:
10px 18px;
font-size: 13px;
font-weight: 500;
color: var(--text-muted);
cursor: pointer;

border-bottom: 2px solid transparent;
transition: all 0.15s;
margin-bottom: -1px;
}

.tab:hover { color: var(--text-secondary); }
.tab.active { color: var(--accent);
border-bottom-color: var(--accent); }

/* Chart container */
.chart-card {
background:
var(--bg-surface);
border: 1px solid var(--border);
border-radius: var(--radius-lg);
padding:
20px;
}
.chart-title { font-size: 13px; font-weight: 600; margin-bottom: 4px; }

.chart-subtitle { font-size: 11px; color: var(--text-muted); margin-bottom: 16px; }

/* Filter
chips */
.filter-row { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }

.filter-chip {
padding: 5px 12px;
font-size: 12px;
border-radius: 20px;
border: 1px solid
var(--border);
background: var(--bg-elevated);
color: var(--text-secondary);
cursor:
pointer;
transition: all 0.15s;
font-family: var(--font);
}
.filter-chip:hover {
border-color: var(--text-muted); }
.filter-chip.active { background: var(--accent-glow);
border-color: var(--accent); color: var(--accent); }

/* Animations */
@keyframes fadeIn {

from { opacity: 0; transform: translateY(8px); }
to { opacity: 1; transform: translateY(0); }

}
.fade-in { animation: fadeIn 0.3s ease forwards; }

.recharts-text { fill: var(--text-muted)
!important; font-size: 11px !important; }
.recharts-cartesian-grid-horizontal line,

.recharts-cartesian-grid-vertical line { stroke: var(--border-subtle) !important; }
`;

// ───
COMPONENTS ───
function Sidebar({ page, setPage }) {
const navItems = [
{ id: "dashboard",
label: "Dashboard", icon: Icons.dashboard },
{ id: "program", label: "Program Builder",
icon: Icons.program },
{ id: "exercises", label: "Exercise Library", icon: Icons.exercises
},
{ id: "clients", label: "Clients", icon: Icons.users },
{ id: "analytics", label:
"Analytics", icon: Icons.analytics },
{ id: "readiness", label: "Readiness", icon:
Icons.readiness },
];
const commItems = [
{ id: "messaging", label: "Messages", icon:
Icons.message, badge: 3 },
{ id: "notices", label: "Notice Board", icon: Icons.notice },

];

return (
<div className="sidebar">
<div
className="sidebar-logo">
<img src={CHEVRON_LOGO} alt="Level" />
<div
className="sidebar-logo-text">
<h1>Level</h1>
<span>Trainer
Portal</span>
</div>
</div>
<div
className="sidebar-nav">
<div
className="nav-section-label">Core</div>
{navItems.map(item => (
<div
key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() =>
setPage(item.id)}>
{item.icon}
{item.label}
</div>
))}
<div
className="nav-section-label">Communication</div>
{commItems.map(item => (

<div key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={()
=> setPage(item.id)}>
{item.icon}
{item.label}
{item.badge && <span
className="badge">{item.badge}</span>}
</div>
))}

</div>
</div>
);
}

// ─── DASHBOARD ───
function DashboardPage() {

return (
<div className="fade-in">
<div className="grid-4" style={{
marginBottom: 20 }}>
<div className="stat-card">
<div
className="stat-label">Active Clients</div>
<div className="stat-value"
style={{ color: "var(--accent)" }}>47</div>
<div className="stat-delta
stat-up">↑ 12% this month</div>
</div>
<div
className="stat-card">
<div className="stat-label">Sessions This
Week</div>
<div className="stat-value">183</div>
<div
className="stat-delta stat-up">↑ 8% vs last week</div>
</div>

<div className="stat-card">
<div className="stat-label">Avg
Readiness</div>
<div className="stat-value" style={{ color: "var(--green)"
}}>74</div>
<div className="stat-delta stat-down">↓ 3pts vs last
week</div>
</div>
<div className="stat-card">
<div
className="stat-label">Programs Active</div>
<div className="stat-value"
style={{ color: "var(--blue)" }}>12</div>
<div className="stat-delta"
style={{ color: "var(--text-muted)" }}>3 in peaking phase</div>

</div>
</div>

<div className="grid-2">
<div
className="chart-card">
<div className="chart-title">Weekly Volume
Trend</div>
<div className="chart-subtitle">Total volume (kg) across all
clients — last 12 weeks</div>
<ResponsiveContainer width="100%"
height={220}>
<AreaChart data={VOLUME_DATA}>
<defs>

<linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
<stop
offset="0%" stopColor="#B22222" stopOpacity={0.3} />
<stop offset="100%"
stopColor="#B22222" stopOpacity={0} />
</linearGradient>
</defs>

<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="week" />

<YAxis />
<Tooltip contentStyle={{ background: "#1A1E28", border: "1px solid
#2A2F3C", borderRadius: 8, fontSize: 12, fontFamily: "DM Sans" }} />
<Area
type="monotone" dataKey="squat" stackId="1" stroke="#B22222" fill="url(#volGrad)"
name="Squat" />
<Area type="monotone" dataKey="bench" stackId="1"
stroke="#1A9E96" fill="rgba(26,158,150,0.15)" name="Bench" />
<Area
type="monotone" dataKey="deadlift" stackId="1" stroke="#34D399"
fill="rgba(52,211,153,0.15)" name="Deadlift" />
<Legend />

</AreaChart>
</ResponsiveContainer>
</div>

<div
className="chart-card">
<div className="chart-title">Client Readiness
Distribution</div>
<div className="chart-subtitle">Today's readiness scores
across all clients</div>
<ResponsiveContainer width="100%" height={220}>

<BarChart data={[
{ range: "0-49", count: 3, fill: "#F87171" },
{ range: "50-69",
count: 11, fill: "#FBBF24" },
{ range: "70-84", count: 18, fill: "#8B93A7" },
{ range:
"85-100", count: 15, fill: "#34D399" },
]}>
<CartesianGrid strokeDasharray="3 3"
/>
<XAxis dataKey="range" />
<YAxis />
<Tooltip
contentStyle={{ background: "#1A1E28", border: "1px solid #2A2F3C", borderRadius: 8, fontSize:
12 }} />
<Bar dataKey="count" radius={[4, 4, 0, 0]} name="Clients">
{[0, 1,
2, 3].map((_, i) => (
<Cell key={i} fill={["#F87171", "#FBBF24", "#8B93A7",
"#34D399"][i]} />
))}
</Bar>
</BarChart>

</ResponsiveContainer>
</div>
</div>

<div
className="card" style={{ marginTop: 16 }}>
<div className="card-header">

<div className="card-title">Clients Requiring Attention</div>

</div>
{CLIENTS.filter(c => c.readiness < 70).map(c => {
const tier =
TIERS.find(t => t.id === c.tier);
return (
<div key={c.id} className="client-row"
style={{ gridTemplateColumns: "44px 1.5fr 1fr 1fr 0.8fr" }}>
<div
className="client-avatar" style={{ background: `${tier.color}22`, color: tier.color
}}>{c.avatar}</div>
<div>
<div style={{ fontWeight: 600
}}>{c.name}</div>
<div style={{ fontSize: 11, color: "var(--text-muted)"
}}>{c.program}</div>
</div>
<div className="tier-badge" style={{
background: `${tier.color}20`, color: tier.color, width: "fit-content"
}}>{tier.name}</div>
<div style={{ fontFamily: "var(--mono)", color:
c.readiness < 50 ? "var(--red)" : "var(--yellow)"
}}>{c.readiness}/100</div>
<div style={{ color: "var(--text-muted)",
fontSize: 12 }}>{c.lastActive}</div>
</div>
);
})}

</div>
</div>
);
}

// ─── PROGRAM BUILDER ───
function ProgramPage()
{
const [expandedMacro, setExpandedMacro] = useState("m1");
const [expandedWeek,
setExpandedWeek] = useState("w1");
const [selectedDay, setSelectedDay] = useState("d1");

const [showParamModal, setShowParamModal] = useState(false);
const program = SAMPLE_PROGRAM;

const selectedDayData = useMemo(() => {
for (const m of program.macrocycles) {
for (const w
of m.weeks) {
const d = w.days.find(d => d.id === selectedDay);
if (d) return d;
}
}

return null;
}, [selectedDay]);

return (
<div className="fade-in">
<div
style={{ display: "flex", gap: 20 }}>
{/* Left: Program tree */}
<div style={{
width: 380, minWidth: 380 }}>
<div style={{ display: "flex", alignItems: "center",
justifyContent: "space-between", marginBottom: 12 }}>
<div>
<div style={{
fontSize: 15, fontWeight: 700 }}>{program.name}</div>
<div style={{ fontSize:
11, color: "var(--text-muted)" }}>12 weeks · Strength · 3 phases</div>

</div>
<button className="btn btn-sm btn-primary">{Icons.plus} Add
Phase</button>
</div>
<div className="program-tree">

{program.macrocycles.map(macro => (
<div key={macro.id} className="tree-macro">

<div className="tree-macro-header" onClick={() => setExpandedMacro(expandedMacro ===
macro.id ? null : macro.id)}>
<span style={{ color: "var(--text-muted)", transition:
"transform 0.2s", transform: expandedMacro === macro.id ? "rotate(90deg)" : "none"
}}>{Icons.chevron}</span>
<span
className="tree-macro-name">{macro.name}</span>
<span style={{ fontSize: 11,
color: "var(--text-muted)", marginLeft: "auto" }}>{macro.weeks.length}
weeks</span>
</div>
{expandedMacro === macro.id &&
macro.weeks.map(week => (
<div key={week.id} className="tree-week">
<div
className="tree-week-header" onClick={() => setExpandedWeek(expandedWeek === week.id ? null :
week.id)}>
<span style={{ color: "var(--text-muted)", transition: "transform 0.2s",
transform: expandedWeek === week.id ? "rotate(90deg)" : "none", display: "flex"
}}>{Icons.chevron}</span>
Week {week.number}
{week.deload && <span
className="deload-tag">Deload</span>}
<span style={{ marginLeft: "auto",
fontSize: 11, color: "var(--text-muted)" }}>{week.days.length} days</span>

</div>
{expandedWeek === week.id && (
<div
className="tree-days">
{week.days.map(day => (
<div key={day.id}
className={`tree-day ${selectedDay === day.id ? "active" : ""}`} onClick={() =>
setSelectedDay(day.id)}>
<div
className="tree-day-label">{day.label}</div>
<div
className="tree-day-meta">{day.exercises.length ? `${day.exercises.length} exercises` :
"Empty"}</div>
</div>
))}
<div className="tree-day" style={{
borderStyle: "dashed", opacity: 0.6, display: "flex", alignItems: "center", justifyContent:
"center", gap: 4, color: "var(--text-muted)" }}>
{Icons.plus} Add Day

</div>
</div>
)}
</div>
))}
</div>
))}

</div>
</div>

{/* Right: Day detail */}
<div style={{ flex: 1
}}>
{selectedDayData ? (
<>
<div style={{ display: "flex", alignItems:
"center", justifyContent: "space-between", marginBottom: 16 }}>
<div>

<div style={{ fontSize: 16, fontWeight: 700 }}>{selectedDayData.label}</div>

<div style={{ fontSize: 12, color: "var(--text-muted)"
}}>{selectedDayData.exercises.length} exercises · {selectedDayData.exercises.reduce((s, e)
=> s + e.sets.length, 0)} total sets</div>
</div>
<div style={{
display: "flex", gap: 8 }}>
<button className="btn btn-sm" onClick={() =>
setShowParamModal(true)}>Load Config</button>
<button className="btn btn-sm
btn-primary">{Icons.plus} Add Exercise</button>
</div>

</div>

{selectedDayData.exercises.length > 0 ? selectedDayData.exercises.map(de
=> (
<div key={de.id} className="exercise-block">
<div
className="exercise-block-header">
<div>
<div
className="exercise-block-name">{de.exercise.name}</div>
<div
className="exercise-block-muscles">{de.exercise.muscles.join(", ")} ·
{de.exercise.equipment} · {de.exercise.chain} chain</div>
</div>
<div
style={{ display: "flex", gap: 6 }}>
<button className="btn btn-sm
btn-ghost">{Icons.plus} Set</button>
</div>
</div>

<div style={{ padding: "4px 0" }}>
<div className="set-row" style={{ color:
"var(--text-muted)", fontSize: 11, fontWeight: 600 }}>
<div>#</div>

<div>Parameters</div>
</div>
{de.sets.map(set => (

<div key={set.set} className="set-row">
<div style={{ display: "flex",
flexDirection: "column", alignItems: "center", gap: 2 }}>
<span
className="set-num">{set.set}</span>
{set.type !== "working" &&
<span className={`set-type-tag ${set.type}`}>{set.type}</span>}

</div>
<div className="set-params">
{set.params.weight_kg &&
<span className="param-chip intensity">{set.params.weight_kg}kg</span>}

{set.params.weight_pct_1rm && <span className="param-chip
intensity">{set.params.weight_pct_1rm}% 1RM</span>}
{set.params.reps &&
<span className="param-chip">{set.params.reps} reps</span>}
{set.params.rpe
&& <span className="param-chip">RPE {set.params.rpe}</span>}

{set.params.tempo && <span className="param-chip">Tempo
{set.params.tempo}</span>}
{set.params.velocity_target && <span
className="param-chip velocity">{set.params.velocity_target} m/s</span>}

{set.params.rest_seconds && <span className="param-chip">Rest
{set.params.rest_seconds}s</span>}
</div>
</div>
))}

</div>
</div>
)) : (
<div style={{ textAlign: "center", padding:
60, color: "var(--text-muted)" }}>
<div style={{ fontSize: 40, marginBottom: 12
}}>🏋️</div>
<div style={{ fontSize: 14, fontWeight: 500 }}>No exercises
yet</div>
<div style={{ fontSize: 12, marginTop: 4 }}>Click "Add Exercise"
to build this training day</div>
</div>
)}
</>
) : (

<div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>

Select a training day from the program tree
</div>
)}
</div>

</div>

{/* Load Params Modal */}
{showParamModal && <LoadParamModal
onClose={() => setShowParamModal(false)} />}
</div>
);
}

function
LoadParamModal({ onClose }) {
const [params, setParams] = useState({});
const groups = [...new
Set(LOAD_PARAM_OPTIONS.map(p => p.group))];

return (
<div
className="modal-overlay" onClick={onClose}>
<div className="modal" onClick={e
=> e.stopPropagation()}>
<div className="modal-title">Load Parameter
Configuration</div>
<div className="modal-subtitle">Configure load and
constraint parameters for this set</div>
{groups.map(group => (
<div
key={group}>
<div className="param-group-label">{group}</div>

{LOAD_PARAM_OPTIONS.filter(p => p.group === group).map(p => (
<div key={p.key}
className="param-row">
<span
className="param-label">{p.label}</span>
{p.type === "toggle" ? (
<div

className={`param-toggle ${params[p.key] ? "on" : ""}`}
onClick={() => setParams({
...params, [p.key]: !params[p.key] })}
/>
) : (
<input
className="param-input"

type={p.type === "number" ? "number" : "text"}
placeholder={p.type === "range" ? "4-6" :
"—"}
value={params[p.key] || ""}
onChange={e => setParams({ ...params, [p.key]:
e.target.value })}
/>
)}
</div>
))}
</div>
))}
<div
style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>

<button className="btn" onClick={onClose}>Cancel</button>
<button
className="btn btn-primary" onClick={onClose}>Apply</button>
</div>

</div>
</div>
);
}

// ─── EXERCISE LIBRARY ───
function ExercisesPage()
{
const [search, setSearch] = useState("");
const [filterChain, setFilterChain] =
useState("all");
const filtered = EXERCISES.filter(e => {
const matchSearch =
e.name.toLowerCase().includes(search.toLowerCase()) || e.muscles.some(m =>
m.toLowerCase().includes(search.toLowerCase()));
const matchChain = filterChain === "all" ||
e.chain === filterChain;
return matchSearch && matchChain;
});

return (

<div className="fade-in">
<div className="search-box">
{Icons.search}

<input placeholder="Search exercises by name, muscle, or tag..." value={search} onChange={e
=> setSearch(e.target.value)} />
</div>
<div
className="filter-row">
{["all", "anterior", "posterior", "full"].map(c => (

<button key={c} className={`filter-chip ${filterChain === c ? "active" : ""}`} onClick={()
=> setFilterChain(c)}>
{c === "all" ? "All Chains" : c.charAt(0).toUpperCase() +
c.slice(1)}
</button>
))}
</div>
<div className="grid-3">

{filtered.map(ex => (
<div key={ex.id} className="exercise-card">
<div
className="exercise-card-name">{ex.name}</div>
<div
className="exercise-card-meta">{ex.muscles.join(", ")} · {ex.equipment}</div>

<div className="exercise-card-tags">
<span className="exercise-card-tag"
style={ex.chain === "posterior" ? { background: "var(--green-dim)", color: "var(--green)",
borderColor: "transparent" } : ex.chain === "anterior" ? { background: "var(--blue-dim)",
color: "var(--blue)", borderColor: "transparent" } : { background: "rgba(167,139,250,0.12)",
color: "var(--purple)", borderColor: "transparent" }}>{ex.chain}</span>

<span className="exercise-card-tag">{ex.pattern}</span>
{ex.tags.map(t
=> <span key={t} className="exercise-card-tag">{t}</span>)}

</div>
</div>
))}
<div className="exercise-card" style={{
borderStyle: "dashed", display: "flex", alignItems: "center", justifyContent: "center",
color: "var(--text-muted)", gap: 6, cursor: "pointer", minHeight: 100 }}>
{Icons.plus}
Add Custom Exercise
</div>
</div>
</div>
);
}

// ───
CLIENTS ───
function ClientsPage() {
return (
<div className="fade-in">
<div
className="card">
<div className="card-header">
<div
className="card-title">All Clients</div>
<button className="btn btn-sm
btn-primary">{Icons.plus} Add Client</button>
</div>
<div
className="client-row" style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)"
}}>
<div></div>
<div>Client</div>

<div>Program</div>
<div>Tier</div>

<div>Readiness</div>
<div>Active</div>

</div>
{CLIENTS.map(c => {
const tier = TIERS.find(t => t.id === c.tier);

const scoreColor = c.readiness >= 85 ? "var(--green)" : c.readiness >= 70 ?
"var(--text-secondary)" : c.readiness >= 50 ? "var(--yellow)" : "var(--red)";
return
(
<div key={c.id} className="client-row">
<div className="client-avatar"
style={{ background: `${tier.color}22`, color: tier.color }}>{c.avatar}</div>

<div style={{ fontWeight: 600 }}>{c.name}</div>
<div style={{ color:
"var(--text-secondary)" }}>{c.program}</div>
<div>
<span
className="tier-badge" style={{ background: `${tier.color}20`, color: tier.color
}}>{tier.name}</span>
</div>
<div style={{ fontFamily:
"var(--mono)", fontWeight: 600, color: scoreColor }}>{c.readiness}</div>

<div style={{ color: "var(--text-muted)", fontSize: 12
}}>{c.lastActive}</div>
</div>
);
})}
</div>

<div className="grid-3" style={{ marginTop: 16 }}>
{TIERS.map(tier => (

<div key={tier.id} className="card" style={{ borderLeft: `3px solid ${tier.color}` }}>

<div style={{ fontSize: 13, fontWeight: 700, color: tier.color, marginBottom: 12
}}>{tier.name} Tier</div>
<div style={{ fontSize: 12, color:
"var(--text-secondary)", lineHeight: 1.6 }}>
<div>Messaging:
{tier.features.messaging ? "✓" : "✗"}</div>
<div>VBT Access:
{tier.features.vbt ? "✓" : "✗"}</div>
<div>Analytics:
{tier.features.analytics}</div>
</div>
</div>
))}

</div>
</div>
);
}

// ─── ANALYTICS ───
function AnalyticsPage() {

const [activeTab, setActiveTab] = useState("volume");
const [selectedClient, setSelectedClient]
= useState("Marcus Chen");

return (
<div className="fade-in">
<div
style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom:
16 }}>
<div className="tabs" style={{ marginBottom: 0, borderBottom: "none"
}}>
{["volume", "1rm", "velocity"].map(t => (
<div key={t} className={`tab
${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
{t ===
"volume" ? "Volume" : t === "1rm" ? "1RM Tracking" : "Load-Velocity"}
</div>

))}
</div>
<select style={{ background: "var(--bg-elevated)", color:
"var(--text-primary)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
padding: "6px 12px", fontFamily: "var(--font)", fontSize: 12 }}>

<option>{selectedClient}</option>
{CLIENTS.filter(c => c.name !==
selectedClient).map(c => <option key={c.id}>{c.name}</option>)}

</select>
</div>

{activeTab === "volume" && (
<>

<div className="grid-4" style={{ marginBottom: 16 }}>
<div
className="stat-card">
<div className="stat-label">Total
Volume</div>
<div className="stat-value" style={{ fontSize: 22 }}>142,800
<span style={{ fontSize: 13, color: "var(--text-muted)"
}}>kg</span></div>
</div>
<div
className="stat-card">
<div className="stat-label">Anterior
Chain</div>
<div className="stat-value" style={{ fontSize: 22, color:
"var(--blue)" }}>62,400 <span style={{ fontSize: 13, color: "var(--text-muted)"
}}>kg</span></div>
</div>
<div
className="stat-card">
<div className="stat-label">Posterior
Chain</div>
<div className="stat-value" style={{ fontSize: 22, color:
"var(--green)" }}>80,400 <span style={{ fontSize: 13, color: "var(--text-muted)"
}}>kg</span></div>
</div>
<div
className="stat-card">
<div className="stat-label">A/P Ratio</div>

<div className="stat-value" style={{ fontSize: 22 }}>0.78</div>

</div>
</div>

<div className="grid-2">
<div
className="chart-card">
<div className="chart-title">Volume by Lift — 12
Weeks</div>
<div className="chart-subtitle">Squat, Bench & Deadlift
weekly volume (kg)</div>
<ResponsiveContainer width="100%" height={260}>

<BarChart data={VOLUME_DATA}>
<CartesianGrid strokeDasharray="3 3" />

<XAxis dataKey="week" />
<YAxis />
<Tooltip contentStyle={{
background: "#1A1E28", border: "1px solid #2A2F3C", borderRadius: 8, fontSize: 12 }} />

<Bar dataKey="squat" fill="#B22222" radius={[2, 2, 0, 0]} name="Squat" />

<Bar dataKey="bench" fill="#1A9E96" radius={[2, 2, 0, 0]} name="Bench" />

<Bar dataKey="deadlift" fill="#34D399" radius={[2, 2, 0, 0]} name="Deadlift" />

<Legend />
</BarChart>
</ResponsiveContainer>
</div>

<div className="chart-card">
<div className="chart-title">Anterior vs
Posterior Volume</div>
<div className="chart-subtitle">Chain balance
tracking over mesocycle</div>
<ResponsiveContainer width="100%"
height={260}>
<AreaChart data={VOLUME_DATA}>
<CartesianGrid
strokeDasharray="3 3" />
<XAxis dataKey="week" />
<YAxis />

<Tooltip contentStyle={{ background: "#1A1E28", border: "1px solid #2A2F3C", borderRadius:
8, fontSize: 12 }} />
<Area type="monotone" dataKey="anterior" stroke="#1A9E96"
fill="rgba(26,158,150,0.15)" name="Anterior" />
<Area type="monotone"
dataKey="posterior" stroke="#34D399" fill="rgba(52,211,153,0.15)" name="Posterior" />

<Legend />
</AreaChart>
</ResponsiveContainer>

</div>
</div>
</>
)}

{activeTab === "1rm" && (

<div className="grid-2">
<div className="chart-card">
<div
className="chart-title">Estimated 1RM — Back Squat</div>
<div
className="chart-subtitle">Epley (volume-based) vs Velocity (speed-based)
estimation</div>
<ResponsiveContainer width="100%" height={300}>

<LineChart data={ORM_HISTORY}>
<CartesianGrid strokeDasharray="3 3" />

<XAxis dataKey="month" />
<YAxis domain={[130, 180]} />
<Tooltip
contentStyle={{ background: "#1A1E28", border: "1px solid #2A2F3C", borderRadius: 8, fontSize:
12 }} formatter={(v) => `${v.toFixed(1)} kg`} />
<Line type="monotone"
dataKey="epley" stroke="#B22222" strokeWidth={2.5} dot={{ fill: "#B22222", r: 4 }}
name="Epley" />
<Line type="monotone" dataKey="velocity" stroke="#1A9E96"
strokeWidth={2.5} dot={{ fill: "#1A9E96", r: 4 }} name="Velocity" />
<Legend
/>
</LineChart>
</ResponsiveContainer>
</div>
<div
className="card">
<div className="card-title" style={{ marginBottom: 16 }}>1RM
Estimation Methods</div>
<div style={{ padding: "14px 16px", background:
"var(--bg-root)", borderRadius: "var(--radius)", marginBottom: 12, fontSize: 13, lineHeight: 1.6
}}>
<div style={{ fontWeight: 700, color: "var(--accent)", marginBottom: 6
}}>Epley Formula (Volume-Based)</div>
<div style={{ fontFamily:
"var(--mono)", fontSize: 14, color: "var(--text-secondary)", marginBottom: 8 }}>1RM =
weight × (1 + reps / 30)</div>
<div style={{ color: "var(--text-muted)",
fontSize: 12 }}>Applied to sets of ≤10 reps. Best estimate from each session is
tracked.</div>
</div>
<div style={{ padding: "14px 16px", background:
"var(--bg-root)", borderRadius: "var(--radius)", fontSize: 13, lineHeight: 1.6 }}>

<div style={{ fontWeight: 700, color: "var(--blue)", marginBottom: 6 }}>Velocity
Regression (Speed-Based)</div>
<div style={{ fontFamily: "var(--mono)", fontSize:
14, color: "var(--text-secondary)", marginBottom: 8 }}>1RM = load at min. velocity
threshold</div>
<div style={{ color: "var(--text-muted)", fontSize: 12
}}>Linear regression on load-velocity pairs. Squat: 0.17 m/s, Bench: 0.15 m/s, Deadlift: 0.12
m/s.</div>
</div>
</div>
</div>
)}

{activeTab
=== "velocity" && (
<div className="grid-2">
<div
className="chart-card">
<div className="chart-title">Load-Velocity Profile —
Back Squat</div>
<div className="chart-subtitle">Mean concentric velocity vs
load. 1RM estimated at 0.17 m/s threshold.</div>
<ResponsiveContainer
width="100%" height={300}>
<ScatterChart>
<CartesianGrid
strokeDasharray="3 3" />
<XAxis dataKey="load" name="Load (kg)" type="number"
domain={[40, 150]} />
<YAxis dataKey="velocity" name="Velocity (m/s)"
type="number" domain={[0, 1.3]} />
<Tooltip contentStyle={{ background: "#1A1E28",
border: "1px solid #2A2F3C", borderRadius: 8, fontSize: 12 }} formatter={(v, name) => name
=== "Load (kg)" ? `${v} kg` : `${v} m/s`} />
<Scatter data={VELOCITY_DATA}
fill="#B22222" name="Recorded Sets" />
{/* Threshold line approximation */}

<Scatter data={[{ load: 40, velocity: 0.17 }, { load: 150, velocity: 0.17 }]}
fill="transparent" line={{ stroke: "#F87171", strokeDasharray: "6 3", strokeWidth: 2 }}
name="1RM Threshold (0.17 m/s)" />
</ScatterChart>

</ResponsiveContainer>
</div>
<div className="card">
<div
className="card-title" style={{ marginBottom: 16 }}>Velocity Metrics — Latest
Session</div>
{[
{ exercise: "Back Squat", load: "120kg", mean: "0.42 m/s",
peak: "0.78 m/s", est1rm: "142kg" },
{ exercise: "Bench Press", load: "90kg", mean: "0.38
m/s", peak: "0.62 m/s", est1rm: "108kg" },
{ exercise: "Deadlift", load: "150kg", mean:
"0.28 m/s", peak: "0.51 m/s", est1rm: "172kg" },
].map((v, i) => (
<div key={i}
style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: 8, padding: "10px
0", borderBottom: i < 2 ? "1px solid var(--border-subtle)" : "none", fontSize: 12.5
}}>
{i === 0 && <div style={{ gridColumn: "1 / -1", display: "grid",
gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: 8, color: "var(--text-muted)", fontSize: 10,
fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>

<div>Exercise</div><div>Load</div><div>Mean
V</div><div>Peak V</div><div>Est. 1RM</div>

</div>}
<div style={{ fontWeight: 600 }}>{v.exercise}</div>

<div style={{ fontFamily: "var(--mono)", color: "var(--text-secondary)"
}}>{v.load}</div>
<div style={{ fontFamily: "var(--mono)", color:
"var(--blue)" }}>{v.mean}</div>
<div style={{ fontFamily: "var(--mono)",
color: "var(--purple)" }}>{v.peak}</div>
<div style={{ fontFamily:
"var(--mono)", color: "var(--accent)", fontWeight: 600 }}>{v.est1rm}</div>

</div>
))}
</div>
</div>
)}
</div>
);
}

//
─── READINESS ───
function ReadinessPage() {
const [scores, setScores] = useState({

sleep_hours: 5.5, sleep_quality: 2, hydration: 3, nutrition: 3, soreness: 2, stress: 4,
});

const [accepted, setAccepted] = useState({});

const compositeScore = useMemo(() => {

const weights = { sleep_hours: 0.15, sleep_quality: 0.10, hydration: 0.10, nutrition: 0.15,
soreness: 0.20, stress: 0.15 };
const normed = {
sleep_hours: Math.min(scores.sleep_hours / 8,
1) * 5,
sleep_quality: scores.sleep_quality,
hydration: scores.hydration,
nutrition:
scores.nutrition,
soreness: scores.soreness,
stress: (6 - scores.stress),
};
let total =
0;
for (const [k, w] of Object.entries(weights)) total += (normed[k] / 5) * w * 100;
total +=
15; // jump + squeeze baseline
return Math.round(Math.min(total, 100));
}, [scores]);

const
severityColor = compositeScore >= 85 ? "var(--green)" : compositeScore >= 70 ?
"var(--text-secondary)" : compositeScore >= 50 ? "var(--yellow)" : "var(--red)";
const
severityBg = compositeScore >= 85 ? "var(--green-dim)" : compositeScore >= 70 ?
"rgba(139,147,167,0.12)" : compositeScore >= 50 ? "var(--yellow-dim)" :
"var(--red-dim)";

return (
<div className="fade-in">
<div
className="readiness-grid">
{/* Left: Checklist */}
<div>
<div
className="card">
<div className="card-header">
<div
className="card-title">Pre-Training Readiness Check</div>
<div style={{
fontSize: 11, color: "var(--text-muted)" }}>Andre Williams · Today</div>

</div>

{READINESS_CHECKLIST.map(item => (
<div key={item.key}
className="readiness-slider-row">
<div
className="readiness-slider-icon">{item.icon}</div>
<div
className="readiness-slider-label">{item.label}</div>
{item.type === "number" ?
(
<input
className="param-input"
type="number"
step="0.5"
style={{ flex: 1,
textAlign: "center" }}
value={scores[item.key]}
onChange={e => setScores({ ...scores,
[item.key]: parseFloat(e.target.value) || 0 })}
/>
) : (
<input
type="range"

className="readiness-slider"
min="1" max="5" step="1"
value={scores[item.key]}

onChange={e => setScores({ ...scores, [item.key]: parseInt(e.target.value) })}
/>
)}

<div className="readiness-val">{scores[item.key]}{item.type === "slider" ? "/5" :
"h"}</div>
</div>
))}

<div style={{ display: "flex", gap: 12,
marginTop: 16 }}>
<div style={{ flex: 1, padding: 12, background: "var(--bg-root)",
borderRadius: "var(--radius)", textAlign: "center" }}>
<div style={{ fontSize: 10,
color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4
}}>Jump Test</div>
<div style={{ fontFamily: "var(--mono)", fontSize: 18,
fontWeight: 700, color: "var(--yellow)" }}>34.2 cm</div>
<div style={{
fontSize: 10, color: "var(--red)" }}>↓ 8% from baseline</div>
</div>

<div style={{ flex: 1, padding: 12, background: "var(--bg-root)", borderRadius:
"var(--radius)", textAlign: "center" }}>
<div style={{ fontSize: 10, color:
"var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4
}}>Squeeze Test</div>
<div style={{ fontFamily: "var(--mono)", fontSize: 18,
fontWeight: 700, color: "var(--yellow)" }}>42 kg</div>
<div style={{
fontSize: 10, color: "var(--red)" }}>↓ 5% from baseline</div>
</div>

</div>
</div>
</div>

{/* Right: Score + Adjustments */}

<div>
<div className="card" style={{ textAlign: "center" }}>
<div
className="readiness-score" style={{ background: severityBg, border: `2px solid ${severityColor}`
}}>
<div className="readiness-score-val" style={{ color: severityColor
}}>{compositeScore}</div>
<div className="readiness-score-label" style={{
color: severityColor }}>Readiness</div>
</div>
<div style={{
fontSize: 13, fontWeight: 600, color: severityColor }}>
{compositeScore >= 85 ? "No
Changes Needed" : compositeScore >= 70 ? "Minor Adjustments" : compositeScore >= 50 ?
"Modifications Recommended" : "Significant Adjustments Required"}
</div>
<div
style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Based on sleep, soreness,
stress, and objective metrics</div>
</div>

<div
className="card">
<div className="card-header">
<div
className="card-title">Original vs Proposed Program</div>
<div style={{
display: "flex", gap: 6 }}>
<button className="btn btn-sm" style={{ color:
"var(--green)" }}>Accept All</button>
<button className="btn btn-sm"
style={{ color: "var(--red)" }}>Reject All</button>
</div>

</div>

<div className="adj-row" style={{ fontSize: 10, fontWeight: 600, color:
"var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>

<div>Exercise</div>
<div>Original</div>

<div>Proposed</div>
<div>Action</div>

</div>

{READINESS_ADJUSTMENTS.map((adj, i) => (
<div key={i}
className="adj-row">
<div>
<div
className="adj-exercise">{adj.exercise}</div>
<span className={`tier-badge
severity-${adj.severity}`}>
{adj.severity === "red" ? "High Priority" : adj.severity ===
"yellow" ? "Recommended" : "No Change"}
</span>
<div
className="adj-reason">{adj.reason}</div>
</div>
<div
className="adj-param">
<div>{adj.original.weight}</div>

<div>{adj.original.sets}×{adj.original.reps}</div>
<div>RPE
{adj.original.rpe}</div>
</div>
<div className="adj-param">

<div>
{adj.severity !== "green" && <span
className="strike">{adj.original.weight}</span>}
<span className="new-val"
style={{ color: adj.severity === "red" ? "var(--red)" : adj.severity === "yellow" ?
"var(--yellow)" : "var(--green)" }}>
{adj.proposed.weight}
</span>

</div>
<div>
{adj.severity !== "green" && adj.original.sets !==
adj.proposed.sets && <span
className="strike">{adj.original.sets}×{adj.original.reps}</span>}
<span
className="new-val">{adj.proposed.sets}×{adj.proposed.reps}</span>

</div>
<div>
<span className="new-val">RPE
{adj.proposed.rpe}</span>
</div>
</div>
<div>

{adj.severity !== "green" ? (
<div style={{ display: "flex", flexDirection: "column",
gap: 4 }}>
<button
className="btn btn-sm"
style={accepted[i] === true ? {
background: "var(--green-dim)", color: "var(--green)", borderColor: "var(--green)" } : {}}

onClick={() => setAccepted({ ...accepted, [i]: true })}
>
{accepted[i] === true ? "✓
Accepted" : "Accept"}
</button>
<button
className="btn btn-sm"

style={accepted[i] === false ? { background: "var(--red-dim)", color: "var(--red)", borderColor:
"var(--red)" } : {}}
onClick={() => setAccepted({ ...accepted, [i]: false })}
>

{accepted[i] === false ? "✗ Rejected" : "Reject"}
</button>
</div>
) :
(
<span style={{ fontSize: 11, color: "var(--text-muted)" }}>No
action</span>
)}
</div>
</div>
))}
</div>

</div>
</div>
</div>
);
}

// ─── MESSAGING ───
function
MessagingPage() {
const [msgInput, setMsgInput] = useState("");
const [messages, setMessages]
= useState(MESSAGES_DATA);

const handleSend = () => {
if (!msgInput.trim()) return;

setMessages([...messages, { id: messages.length + 1, from: "trainer", text: msgInput, time:
"Now", name: "Coach AJ" }]);
setMsgInput("");
};

return (
<div
className="fade-in msg-container">
<div className="msg-sidebar">
<div
style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
<div
className="search-box" style={{ marginBottom: 0 }}>
{Icons.search}
<input
placeholder="Search conversations..." style={{ fontSize: 12 }} />
</div>

</div>
{CLIENTS.map((c, i) => {
const tier = TIERS.find(t => t.id ===
c.tier);
const hasMsgAccess = tier.features.messaging;
return (
<div key={c.id}
className={`msg-contact ${i === 0 ? "active" : ""}`} style={{ opacity: hasMsgAccess ? 1 : 0.4
}}>
<div className="client-avatar" style={{ background: `${tier.color}22`, color:
tier.color, width: 34, height: 34, fontSize: 11, minWidth: 34 }}>{c.avatar}</div>

<div style={{ overflow: "hidden" }}>
<div
className="msg-contact-name">{c.name} {!hasMsgAccess && <span style={{
fontSize: 9, color: "var(--text-muted)" }}>🔒</span>}</div>
<div
className="msg-contact-preview">{hasMsgAccess ? "Last message preview..." : "Messaging not
in plan"}</div>
</div>
</div>
);
})}
</div>

<div className="msg-body">
<div style={{ padding: "12px 20px", borderBottom:
"1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
<div
className="client-avatar" style={{ background: "rgba(178,34,34,0.15)", color: "#B22222",
width: 34, height: 34, fontSize: 11, minWidth: 34 }}>MC</div>
<div>

<div style={{ fontSize: 14, fontWeight: 600 }}>Marcus Chen</div>
<div
style={{ fontSize: 11, color: "var(--green)" }}>Online · Elite tier</div>

</div>
</div>
<div className="msg-messages">
{messages.map(msg
=> (
<div key={msg.id} style={{ alignSelf: msg.from === "trainer" ? "flex-end" :
"flex-start" }}>
<div className={`msg-bubble
${msg.from}`}>{msg.text}</div>
<div className="msg-time" style={{ textAlign:
msg.from === "trainer" ? "right" : "left" }}>{msg.time}</div>

</div>
))}
</div>
<div className="msg-input-bar">

<input
className="msg-input"
placeholder="Type a message..."
value={msgInput}

onChange={e => setMsgInput(e.target.value)}
onKeyDown={e => e.key === "Enter"
&& handleSend()}
/>
<button className="btn btn-primary"
onClick={handleSend}>{Icons.send} Send</button>
</div>

</div>
</div>
);
}

// ─── NOTICE BOARD ───
function NoticeBoardPage()
{
return (
<div className="fade-in">
<div style={{ display: "flex",
justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
<div
style={{ fontSize: 14, color: "var(--text-secondary)" }}>Global announcements and updates for
all subscribers</div>
<button className="btn btn-primary">{Icons.plus} New
Post</button>
</div>
{NOTICE_POSTS.map(post => (
<div
key={post.id} className={`notice-card ${post.pinned ? "pinned" : ""}`}>
<div
style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
{post.pinned
&& <span style={{ color: "var(--accent)", fontSize: 11, fontWeight: 600, display:
"flex", alignItems: "center", gap: 3 }}>{Icons.pin} Pinned</span>}

</div>
<div className="notice-title">{post.title}</div>

<div className="notice-body">{post.body}</div>
<div
className="notice-meta">
<span>{post.time}</span>

<span>·</span>
{post.tiers.map(t => <span key={t}
className="notice-tier-tag">{t}</span>)}
</div>
</div>

))}
</div>
);
}

// ─── MAIN APP ───
export default function LevelApp() {
const
[page, setPage] = useState("dashboard");

const pageTitle = {
dashboard: "Dashboard",

program: "Program Builder",
exercises: "Exercise Library",
clients: "Client Management",

analytics: "Analytics & Data",
readiness: "Readiness & Autoregulation",
messaging:
"Messages",
notices: "Notice Board",
};

const renderPage = () => {
switch (page)
{
case "dashboard": return <DashboardPage />;
case "program": return
<ProgramPage />;
case "exercises": return <ExercisesPage />;
case
"clients": return <ClientsPage />;
case "analytics": return <AnalyticsPage
/>;
case "readiness": return <ReadinessPage />;
case "messaging": return
<MessagingPage />;
case "notices": return <NoticeBoardPage />;
default:
return <DashboardPage />;
}
};

return (
<>

<style>{css}</style>
<div className="app">
<Sidebar
page={page} setPage={setPage} />
<div className="main">
<div
className="topbar">
<h2>{pageTitle[page]}</h2>
<div
className="topbar-actions">
<div style={{ display: "flex", alignItems: "center",
gap: 8 }}>
<div className="client-avatar" style={{ width: 30, height: 30, fontSize:
10, background: "var(--accent-glow)", color: "var(--accent)" }}>AJ</div>

<span style={{ fontSize: 12.5, fontWeight: 550 }}>Coach AJ</span>

</div>
</div>
</div>
<div className="content">

{renderPage()}
</div>
</div>
</div>
</>

);
}
