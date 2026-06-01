
const fs = require("fs");
let content = fs.readFileSync("src/components/CircuitView.jsx", "utf8");
content = content.replace("const handleLogSet = async (ex, logs) => {", "const handleLogSet = async (ex, logs) => {\n        console.log(\"handleLogSet CALLED\", {ex, logs});");
content = content.replace("if (entries.length > 0) {", "console.log(\"ENTRIES:\", entries);\n        if (entries.length > 0) {");
fs.writeFileSync("src/components/CircuitView.jsx", content);
