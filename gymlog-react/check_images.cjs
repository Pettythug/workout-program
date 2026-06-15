const fs = require('fs');
const path = require('path');

const tsv = `Hoist ROC-IT Selectorized Leg Press	FALSE	Knee Dominant	24 Hour Fitness
Nautilus Impact Seated Leg Press	FALSE	Knee Dominant	24 Hour Fitness
Nautilus Impact Leg Curl	FALSE	Hip Dominant	24 Hour Fitness
Nautilus Impact Vertical Row	FALSE	Horizontal Pull	24 Hour Fitness
Hammer Strength Select Biceps Curl	FALSE	Elbow Flexion	24 Hour Fitness
Hoist ROC-IT Selectorized Shoulder Press	FALSE	Vertical Push	24 Hour Fitness
Hoist ROC-IT Selectorized Chest Press	FALSE	Horizontal Push	24 Hour Fitness
Hammer Strength MTS Abdominal Crunch	FALSE	Core	24 Hour Fitness
Hammer Strength Iso-Lateral Front Lat Pulldown	FALSE	Vertical Pull	24 Hour Fitness
Hammer Strength Select Fixed Pulldown	FALSE	Vertical Pull	24 Hour Fitness
Hammer Strength Select Seated Leg Curl	FALSE	Hip Dominant	24 Hour Fitness
Hammer Strength Select Seated Leg Press	FALSE	Knee Dominant	24 Hour Fitness
Hammer Strength Select Pectoral Fly	FALSE	Horizontal Push	24 Hour Fitness
Hammer Strength Select Rear Deltoid	FALSE	Horizontal Pull	24 Hour Fitness
Hammer Strength Select Leg Extension	FALSE	Knee Dominant	24 Hour Fitness
Nautilus Glute Drive	FALSE	Hip Dominant	24 Hour Fitness
Nautilus Impact Adductor	FALSE	Hip Dominant	24 Hour Fitness
Nautilus Impact Abductor	FALSE	Hip Dominant	24 Hour Fitness
Hoist ROC-IT Selectorized Leg Extension	FALSE	Knee Dominant	24 Hour Fitness
Hammer Strength Iso-Lateral High Row	FALSE	Horizontal Pull	24 Hour Fitness
Hammer Strength Iso-Lateral Row	FALSE	Horizontal Pull	24 Hour Fitness
Hammer Strength Select Back Extension	FALSE	Core	24 Hour Fitness
Hammer Strength Iso-Lateral Incline Press	FALSE	Horizontal Push	24 Hour Fitness
Hammer Strength Iso-Lateral Bench Press	FALSE	Horizontal Push	24 Hour Fitness
Hammer Strength Iso-Lateral Shoulder Press	FALSE	Vertical Push	24 Hour Fitness
Hammer Strength Select Lateral Raise	FALSE	Shoulder Isolation	24 Hour Fitness
Hammer Strength Select Triceps Extension	FALSE	Elbow Extension	24 Hour Fitness
Hammer Strength Select Leg Curl	FALSE	Hip Dominant	24 Hour Fitness
Hammer Strength Select Row	FALSE	Horizontal Pull	24 Hour Fitness
Hammer Strength Select Chest Press	FALSE	Horizontal Push	24 Hour Fitness
Hammer Strength Select Shoulder Press	FALSE	Vertical Push	24 Hour Fitness
Nautilus Plate Loaded Hack Squat	FALSE	Knee Dominant	24 Hour Fitness
Hoist ROC-IT Selectorized Leg Curl	FALSE	Hip Dominant	24 Hour Fitness
Hoist ROC-IT Selectorized Mid Row	FALSE	Horizontal Pull	24 Hour Fitness
Hoist ROC-IT Selectorized Inner Thigh	FALSE	Hip Dominant	24 Hour Fitness
Hoist ROC-IT Selectorized Outer Thigh	FALSE	Hip Dominant	24 Hour Fitness
Hoist ROC-IT Selectorized Seated Dip	FALSE	Vertical Push	24 Hour Fitness
Hoist ROC-IT Plate Loaded Standing Calf Raise	FALSE	Ankle Isolation	24 Hour Fitness
Hoist ROC-IT Selectorized Rotary Calf	FALSE	Ankle Isolation	24 Hour Fitness
Hoist ROC-IT Selectorized Lat Pulldown	FALSE	Vertical Pull	24 Hour Fitness
Hoist ROC-IT Selectorized Glute Master	FALSE	Hip Dominant	24 Hour Fitness
Hoist ROC-IT Selectorized Low Back	FALSE	Core	24 Hour Fitness
Hoist ROC-IT Selectorized Abs	FALSE	Core	24 Hour Fitness
Hoist ROC-IT Selectorized Biceps Curl	FALSE	Elbow Flexion	24 Hour Fitness
Hoist Chin/Dip Assist	FALSE	Vertical Pull	24 Hour Fitness
Nautilus Hack Squat	FALSE	Knee Dominant	24 Hour Fitness
Hoist Hack Squat	FALSE	Knee Dominant	24 Hour Fitness
Hoist CF Angled Leg Press	FALSE	Knee Dominant	24 Hour Fitness
Nautilus Impact Deltoid Raise	FALSE	Shoulder Isolation	24 Hour Fitness
Nautilus Impact Deltoid Fly	FALSE	Shoulder Isolation	24 Hour Fitness
Nautilus Impact Chest Press	FALSE	Horizontal Push	24 Hour Fitness
Nautilus Impact Biceps Curl	FALSE	Elbow Flexion	24 Hour Fitness
Nautilus Impact Triceps Extension	FALSE	Elbow Extension	24 Hour Fitness
Nautilus Impact Lat Pull Down	FALSE	Vertical Pull	24 Hour Fitness
Hoist Lat Pull Down	FALSE	Vertical Pull	24 Hour Fitness
Hoist Low Row	FALSE	Horizontal Pull	24 Hour Fitness
Life Fitness Signature Series Abdominal	FALSE	Core	24 Hour Fitness
FreeMotion Plate Loaded Calf	FALSE	Ankle Isolation	24 Hour Fitness
True Fitness Composite Strength Full Body Press	FALSE	Horizontal Push	24 Hour Fitness
Total Gym Core	FALSE	Core	24 Hour Fitness
PRIME SmartStrength Arm Curl	FALSE	Elbow Flexion	24 Hour Fitness
PRIME SmartStrength Tricep Extension	FALSE	Elbow Extension	24 Hour Fitness
Hammer Strength Select Pectoral Fly/Rear Delt	FALSE	Horizontal Push	24 Hour Fitness`;

const lines = tsv.trim().split('\n');

const imageDir = path.join(__dirname, 'public', 'images');
const existingImages = fs.readdirSync(imageDir).map(f => f.toLowerCase());

console.log("CHECKING FOR MISSING IMAGES...");

lines.forEach(line => {
    const parts = line.split('\t');
    let rawName = parts[0];

    // Clean name the way we did for the database upload!
    let name = rawName.replace(/\(Plate-Loaded\)/gi, "").trim();
    name = name.replace(/^Prime SmartStrength\s+/i, "Prime "); // we did this in the import script!
    if (name === 'Hoist ROC-IT Selectorized Chin/Dip Assist') name = 'Hoist Chin/Dip Assist';

    const baseName = name.replace(" (Single)", "").replace(" (Alt)", "");
    const expectedFile = baseName.replace(/\//g, " ") + ".jpg";

    if (!existingImages.includes(expectedFile.toLowerCase())) {
        console.log(`❌ MISSING IMAGE FOR DB MACHINE: "${name}"`);
        console.log(`   App is looking for: ${expectedFile}`);
    }
});
