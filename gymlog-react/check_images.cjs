const fs = require('fs');
const path = require('path');

// Extract the names from the user's text
const userText = `
45 Degree Back Extension
45 Degree Hip Extension
Abdominal Machine
Abdominal Machine (Single)
Abductor Machine
Adductor Machine
Arm Snatch (Alt)
45 Degree Back Extension (Single)
Back Squat
Barbell Rollout
Barbell Torque
Bench (Single)
Bench (Single)
Bench Press
Bench Press (Alt)
Bench Press (Single)
Bent Over Row
Bent Over Row (Alt)
Bent Over Row (Single)
Bent-Over Dumbbell Row (Alt)
Bent-over Dumbbell Two-point Dumbbell Row
Bent-over Dumbbell Two-point Dumbbell Row (Alt)
Bent-over Dumbbell Two-point Dumbbell Row (Single)
Bulgarian Split Deadlift
Bulgarian Split Squat
Cable Low Row
Cable Low Row (Alt)
Cable Low Row (Single)
Cable Push-Pull Rotation
Cable Reverse Wood Chop
Cable Rotating Extension
Cable Rotation
Cable Rotation Crunch
Cable Tricep Pushdown
Cable Tricep Pushdown (Alt)
Cable Tricep Pushdown (Single)
Cable Wood Chop
Chest Fly Machine
Chest Fly Machine (Alt)
Chest Fly Machine (Single)
Chest Press Machine
Chest Press Machine (Alt)
Chest Press Machine (Single)
Chest Supported 30° Dumbbell Row
Chest Supported Row
Chest Supported Row (Alt)
Chest Supported Row (Single)
Chin Up Machine
Chin Up Machine (Alt)
Chin Up Machine (Single)
Chinup
Clean Grip Dead Lift
Clean High Pull
Clean Pull
Close Grip Bench
Close Grip Incline Bench
Core Row
Corkscrew
DB Bench (Alt)
Decline Pushups
Deltoid Fly Machine
Dips
Drop Lunge
Dumbbell Bench
Dumbbell Bench (Alt)
Dumbbell Bench (Single)
Dumbbell Incline Bench
Dumbbell Incline Bench (Alt)
Dumbbell Incline Bench (Single)
Dumbbell Press
Dumbbell Press (Alt)
Dumbbell Press (Single)
Dumbbell Press and Bend (Single)
Dumbbell Snatch (Alt)
Dumbbell Snatch (Single)
Dynamic Plank
Flat Pushups
Four-Point Plank
Four-Point Supine Bridge
Front Squat
Glute Master
Good Morning
Good Morning (Single)
Hammer Strength ISO-Lateral Bench Press
Hammer Strength ISO-Lateral Bench Press (Alt)
Hammer Strength ISO-Lateral Bench Press (Single)
Hammer Strength ISO-Lateral Shoulder Press
Hammer Strength ISO-Lateral Shoulder Press (Alt)
Hammer Strength ISO-Lateral Shoulder Press (Single)
Hammer Strength Row
Hammer Strength Row (Alt)
Hammer Strength Row (Single)
Hang Jump Shrug
Hang Power Snatch
Hoist Chest Press Machine Roc-It
Hoist Chest Press Machine Roc-It (Alt)
Hoist Chest Press Machine Roc-It (Single)
Hoist Extension (Single)
Hoist Leg Curl
Hoist Leg Curl (Alt)
Hoist Leg Curl (Single)
Hoist Leg Press (Alt)
Hoist Leg Press (Single)
Hoist Leg Press Roc-It (Alt)
Hoist Leg Press Roc-It (Single)
Hoist Mid Row Machine
Hoist Mid Row Machine (Alt)
Hoist Mid Row Machine (Single)
Hoist Shoulder Press Roc-It
Hoist Shoulder Press Roc-It (Alt)
Hoist Shoulder Press Roc-It (Single)
Horizontal Pullup
Horizontal Pullup (Single)
Horizontal Side-to-Side Pullup
Incline Bench (Single)
Incline Bench Press
Incline Press 30° Lever Arm
Incline Press 30° Lever Arm (Alt)
Incline Press 30° Lever Arm (Single)
Incline Press Machine
Incline Press Machine (Alt)
Incline Press Machine (Single)
Incline Pushups
Iron Master Leg Extension w/ Bands
Iron Master Leg Extension w/ Bands (Alt)
Iron Master Leg Extension w/ Bands (Single)
Iso-Lateral Front Lat Pulldown
Iso-Lateral Front Lat Pulldown (Alt)
Iso-Lateral Front Lat Pulldown (Single)
ISO-Lateral High Row
ISO-Lateral High Row (Alt)
ISO-Lateral High Row (Single)
Jackknife Pushup
Knee Up
Kneeling Reverse Wood Chop
Kneeling Wood Chop
Lat Pull Down Machine
Lat Pull Down Machine (Alt)
Lat Pull Down Machine (Single)
Lat Pull-Down Machine (Alt)
Lat Pull-Down Machine (Single)
Lat Pulldown
Lat Pulldown (Alt)
Lat Pulldown (Single)
Lat Pulldown Machine
Lat Pulldown Machine (Alt)
Lat Pulldown Machine (Single)
Lateral Step Up
Mid Row Machine
Mid Row Machine (Alt)
Mid Row Machine (Single)
Mixed Grip Pullup
Modified T-Bar Row
Muscle Snatch
Narrow Grip Power Snatch
Nautilus Impact Lat Pulldown
Nautilus Impact Lat Pulldown (Alt)
Nautilus Impact Lat Pulldown (Single)
Outer Thigh Machine
Overhead Squat
Plank
Plank Walkup
Plank With Elbow To Knee
Plank With Weight Transfer
Power Clean
Power Snatch
Pull Down (Alt)
Pull Down (Single)
Pullup
Pullup (Single)
Push Jerk
Push Press
Push-Up
QT Belt Calf Raises (Alt)
QT Belt Calf Raises (Single)
QT Belt March in Place
QT Belt Squat
QT Bench Press 45° Handle
QT Bench Press 45° Handle (Alt)
QT Bench Press 45° Handle (Single)
QT Forward Facing Bench 45°
QT Forward Facing Bench 45° (Alt)
QT Forward Facing Bench 45° (Single)
QT Front Harness Belt Squat
QT Underhand Pulldown
QT Underhand Pulldown (Alt)
QT Underhand Pulldown (Single)
QT Viking Press
Reverse Fly Machine
Reverse Fly Machine (Alt)
Reverse Fly Machine (Single)
Reverse Grip Bench
Reverse Hyperextension
Romanian Deadlift
Romanian Deadlift (Alt)
Romanian Deadlift (Single)
Rotary Calf
Rotary Calf (Alt)
Rotary Calf (Single)
Seated Leg Curl
Seated Leg Curl (Alt)
Seated Leg Curl (Single)
Seated Leg Press
Seated Leg Press (Alt)
Seated Leg Press (Single)
Seated Lever Arm Shoulder Press
Seated Lever Arm Shoulder Press (Alt)
Seated Lever Arm Shoulder Press (Single)
Seated Russian Twist
Shoulder Press
Shoulder Press (Alt)
Shoulder Press (Single)
Shoulder Press Machine
Shoulder Press Machine (Alt)
Shoulder Press Machine (Single)
Side Bridge
Side Bridge and Reach
Side Lunge
Side Squat
Side-to-Side Jackknife Pushup
Side-to-Side Pullup
Side-to-Side Pushups
Situps
Snatch (Alt)
Snatch (Single)
Snatch High Pull
Snatch High Pull (Alt)
Snatch High Pull (Single)
Snatch Pull
Snatch Pull (Alt)
Snatch Pull (Single)
Split Good Morning
Split Jerk
Split Squat
Squat Jump
Squatmax MD
SquatMax Romanian Deadlift w/ Harness
Squats (Single)
Standing Cable Chest Press
Standing Cable Chest Press (Alt)
Standing Cable Chest Press (Single)
Standing Cable Row (Alt)
Standing Cable Row (Single)
Standing Cable Row To Face
Standing Cable Row to Neck
Standing Cable Row To Rib cage
Standing Cable Row To Rib cage (Alt)
Standing Cable Row To Rib cage (Single)
Standing Shoulder Press w/ Post Hold
Step Up
Step Up (Alt)
Straight Arm Lat Pull
Straight Arm Lat Pull (Alt)
Straight Arm Lat Pull (Single)
Supine Hip Extension
Supine Hip Extension (Single)
Supported Dumbbell Press (Single)
Swiss Ball Glute-hamstring
Swiss Ball Glute-hamstring (Single)
Swiss Ball Weight Roll
T-Push and Hold
Three-Point Plank
Three-Point Supine Bridge
Total Gym Elevate Core Basic Scrunch
Trap Bar Deadlift
Tricep Extension
Tricep Extension (Alt)
Tricep Extension (Single)
Two Point Dumbbell Row with Twist
Two-Point Plank
Windshield Wiper
Zercher Good Morning
Hammer Strength Seated Leg Press Machine
Hammer Strength Seated Leg Press Machine (Single)
Hammer Strength Seated Leg Press Machine (Alt)
Slamball Snatch
Slamball Snatch (Single)
Slamball Snatch (Alt)
Hoist Roc It Glute Master
Hoist Roc-it Lat Pulldown Machine
Hoist Roc-it Lat Pulldown Machine (Single)
Hoist Roc-it Lat Pulldown Machine (Alt)
Hammer Strength Row Machine
Hammer Strength Row Machine (Single)
Hammer Strength Row Machine (Alt)
Kettlebell High Clean
Kettlebell High Clean (Single)
Kettlebell High Clean (Alt)
QT Lat Pulldown
QT Lat Pulldown (Single)
QT Chest Supported Row
QT Chest Supported Row (Single)
QT Chest Supported Row (Alt)
DB Pullover
DB Pullover (Single)
Hammer Strength MTS Abdominal Crunch Machine
QT Shoulder Press
QT Shoulder Press (Single)
QT Shoulder Press (Alt)
Hoist ROC-IT Selectorized Leg Press
Nautilus Impact Seated Leg Press
Nautilus Impact Leg Curl
Nautilus Impact Vertical Row
Nautilus Impact Leg Extension
Nautilus Impact Lat Pull Down
Nautilus Impact Deltoid Fly
Nautilus Impact Abductor
Nautilus Impact Adductor
Nautilus Impact Chest Press
Nautilus Impact Deltoid Raise
Nautilus Impact Biceps Curl
Nautilus Impact Triceps Extension
Hoist ROC-IT Selectorized Mid Row
Hoist ROC-IT Selectorized Rotary Calf
Hoist ROC-IT Selectorized Leg Extension
Hoist ROC-IT Selectorized Leg Curl
Hoist ROC-IT Selectorized Low Back
Hoist ROC-IT Selectorized Lat Pulldown
Hoist ROC-IT Selectorized Inner Thigh
Hoist ROC-IT Selectorized Outer Thigh
Hoist ROC-IT Selectorized Glute Master
Hammer Strength Select Back Extension
Hoist ROC-IT Selectorized Chest Press
Hoist ROC-IT Selectorized Shoulder Press
Hoist ROC-IT Selectorized Biceps Curl
Hoist ROC-IT Selectorized Seated Dip
Hammer Strength Select Seated Leg Press
Hammer Strength Select Seated Leg Curl
Hammer Strength MTS Abdominal Crunch
Life Fitness Signature Series Abdominal
Hoist ROC-IT Selectorized Abs
Hammer Strength Select Leg Extension
Hammer Strength Select Leg Curl
Hammer Strength Select Fixed Pulldown
Hammer Strength Select Row
Hammer Strength Select Chest Press
Hammer Strength Select Lateral Raise
Hammer Strength Select Shoulder Press
Hammer Strength Select Biceps Curl
Hammer Strength Select Triceps Extension
Hammer Strength Iso-Lateral Incline Press (Plate-Loaded)
Hammer Strength Iso-Lateral Row (Plate-Loaded)
Hammer Strength Iso-Lateral High Row (Plate-Loaded)
Hammer Strength Iso-Lateral Front Lat Pulldown (Plate-Loaded)
Hoist ROC-IT Plate Loaded Standing Calf Raise
Hoist CF Angled Leg Press
Nautilus Plate Loaded Hack Squat (Plate-Loaded)
Hoist Commercial Low Row
Hoist Commercial Lat Pulldown
TRUE Composite Strength Full Body Press
Hoist ROC-IT Selectorized Chin/Dip Assist
PRIME SmartStrength Tricep Extension
PRIME SmartStrength Arm Curl
Hammer Strength Iso-Lateral Shoulder Press (Plate-Loaded)
Hammer Strength Iso-Lateral Bench Press (Plate-Loaded)
Nautilus Impact Pectoral Fly
Hammer Strength Select Rear Deltoid
Hammer Strength Select Pectoral Fly
`;

const machineNames = userText.trim().split('\\n').map(line => line.trim()).filter(Boolean);
const imageDir = path.join(__dirname, 'public', 'images');
const existingImages = fs.readdirSync(imageDir).map(f => f.toLowerCase());

let missingCount = 0;

for (const name of machineNames) {
    let baseName = name.replace(" (Single)", "").replace(" (Alt)", "");
    let fileName = baseName.replace(/\//g, " ") + ".jpg";
    
    if (!existingImages.includes(fileName.toLowerCase())) {
        // Only report if it has a file reference or if it's one of the specific machines
        console.log("MISSING: " + fileName);
        missingCount++;
    }
}

console.log("Total missing images: " + missingCount);
