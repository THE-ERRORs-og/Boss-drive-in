const fs = require("fs");
const path = require("path");

// Base directory for the Next.js project
const baseDir = "D:/The_ERRORs/boss_drive_in/app/(root)"; // Updated parent directory

// Route structure
const routes = [
  "/",
  "/Login",
  "/employee",
  "/employee/daily-cash-summary",
  "/employee/daily-safe-balance",
  "/employee/daily-safe-balance/[id]",
  "/employee/order-process",
  "/admin",
  "/admin/staff-management",
  "/admin/staff-management/add-staff",
  "/admin/staff-management/edit-staff",
  "/admin/staff-management/employee",
  "/admin/staff-management/employee/edit",
  "/admin/daily-safe-balance",
  "/admin/daily-safe-balance/history",
  "/admin/daily-safe-balance/history/[id]",
  "/admin/daily-cash-flow",
  "/admin/employee-order-history",
  "/admin/employee-order-history/edit",
  "/admin/employee-order-history/view",
  "/admin/employee-order-history/view/[id]",
];

// Function to create files and directories
function createFolderStructure(baseDir, routes) {
  routes.forEach((route) => {
    // Convert route into a folder path
    const folderPath = path.join(
      baseDir,
      route === "/"
        ? "page"
        : route.replace(/\[|\]/g, "").replace(/\//g, path.sep)
    );

    // Create the directory
    fs.mkdirSync(folderPath, { recursive: true });

    // Create an `index.js` file in the directory
    const filePath = path.join(folderPath, "page.js");
    const boilerplate = `export default function Page() {\n  return (\n    <div>\n      <h1>Route: ${route}</h1>\n    </div>\n  );\n}\n`;

    fs.writeFileSync(filePath, boilerplate);
  });
}

// Create the folder structure
try {
  createFolderStructure(baseDir, routes);
  console.log("Folder structure and files created successfully!");
} catch (error) {
  console.error("Error creating folder structure:", error);
}
