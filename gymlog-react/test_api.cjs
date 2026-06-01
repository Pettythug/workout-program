
const fetch = require("node-fetch");
const url = "https://script.google.com/macros/s/AKfycbwtpr_4LEVCXRyMv_v86796HIN0v36kdULk7DVSI2x3R2KIbjh9KGWFV0lXT7x8MZTo7g/exec";
const payload = {
    action: "logSet",
    exercise: "Barbell Bench Press",
    entries: [{
        date: new Date().toLocaleDateString("en-US"),
        person: "brian",
        reps: "10",
        weight: "135",
        range: "r8_12",
        timed: false,
        note: "test from backend"
    }],
    pin: "5050"
};
const encoded = encodeURIComponent(JSON.stringify(payload));
fetch(url + "?payload=" + encoded)
    .then(res => res.text())
    .then(text => console.log("Response:", text))
    .catch(err => console.error("Error:", err));
