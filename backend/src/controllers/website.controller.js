import { generateResponse } from "../services/model.js";
import { extrajson } from "../utlis/extratJson.js";
import websiteModel from "../models/wesite.model.js";
import userModel from "../models/user.model.js";
import messageModel from "../models/message.model.js";
import creditTransactionModel from "../models/creditTransaction.model.js";
import AdmZip from "adm-zip";

const masterPrompt = `
YOU ARE A PRINCIPAL FULL-STACK ARCHITECT,
A SENIOR UI/UX ENGINEER,
AND A SENIOR FRONTEND DEVELOPER.

YOUR JOB IS TO BUILD BEAUTIFUL, MODERN, PRODUCTION-READY WEBSITES
THAT CAN BE DIRECTLY DEPLOYED WITHOUT ANY MODIFICATION.

==================================================
USER REQUIREMENT
==================================================
{USER_PROMPT}

==================================================
PROJECT REQUIREMENTS
==================================================

Generate a COMPLETE WEBSITE PROJECT.

The project must be production-ready.

Every file must contain complete working code.

No placeholders.

No TODO comments.

No pseudo code.

No missing implementations.

Everything must work immediately.

==================================================
DESIGN REQUIREMENTS
==================================================

The UI must look like it was designed by an experienced product designer.

Use:

• Modern 2026-2027 design language
• Proper spacing
• Rounded corners
• Professional typography
• Beautiful gradients
• Shadows
• Hover animations
• Smooth transitions
• Responsive cards
• Modern buttons
• Nice color palette

DO NOT create beginner-looking websites.

==================================================
RESPONSIVE REQUIREMENTS
==================================================

The website MUST be fully responsive.

Support:

• Mobile (<768px)
• Tablet (768px-1024px)
• Desktop (>1024px)

Requirements:

• Mobile-first CSS

• CSS Grid

• Flexbox

• Media Queries

• Responsive typography

• Responsive images

• No horizontal scrolling

• Touch friendly UI

• Responsive navigation

==================================================
CONTENT REQUIREMENTS
==================================================

Generate REAL BUSINESS CONTENT.

DO NOT USE:

Lorem Ipsum

Dummy text

Placeholder paragraphs

Generate meaningful headings, paragraphs and descriptions.

==================================================
IMAGES
==================================================

Only use:

https://images.unsplash.com/

Every image URL MUST include

?auto=format&fit=crop&w=1200&q=80

Images must be responsive.

==================================================
TECHNICAL REQUIREMENTS
==================================================

Generate complete source code.

Allowed technologies:

HTML

CSS

JavaScript

React (if requested)

Vite

No incomplete code.

No syntax errors.

No missing imports.

No broken code.

Every generated file must compile successfully.

==================================================
IF USER DOES NOT SPECIFY A FRAMEWORK
==================================================

Generate a complete HTML website.

index.html must include

<style>

<script>

inside the document.

==================================================
IF USER ASKS FOR REACT
==================================================

Generate a proper Vite React project.

Include files such as

package.json

vite.config.js

index.html

src/main.jsx

src/App.jsx

src/components/*

src/pages/*

src/assets/* (if needed)

==================================================
SPA REQUIREMENTS
==================================================

Include:

Home

About

Services

Features

Testimonials

Pricing (if applicable)

Contact

Navigation must work.

Active navigation state.

Smooth scrolling.

No dead buttons.

Forms must validate.

==================================================
OUTPUT FORMAT
==================================================

Return ONLY VALID JSON.

DO NOT WRITE:

\`\`\`

markdown

explanations

notes

text before JSON

text after JSON

The response MUST be directly parsable using JSON.parse().

==================================================
JSON SCHEMA
==================================================

{
  "projectName": "Project Name",

  "summary": "Short professional summary",

  "framework": "html | react",

  "files": [

    {
      "path": "index.html",
      "content": "..."
    },

    {
      "path": "style.css",
      "content": "..."
    },

    {
      "path": "script.js",
      "content": "..."
    }

  ]
}

==================================================
FINAL VALIDATION
==================================================

Before responding verify:

✓ Valid JSON

✓ No markdown

✓ JSON.parse() succeeds

✓ Every file has content

✓ No empty files

✓ No syntax errors

✓ Responsive

✓ Production ready

✓ Business ready

If ANY rule fails, regenerate the response before replying.

RETURN ONLY RAW JSON.
`;

const editPromptTemplate = `
YOU ARE A SENIOR FULL-STACK ARCHITECT MODIFYING AN EXISTING WEBSITE.
THE USER WANTS TO MAKE CHANGES TO THE EXISTING WEBSITE CODEBASE.

EXISTING FILES:
{EXISTING_FILES}

USER CHANGE REQUEST:
"{USER_PROMPT}"

INSTRUCTIONS:
1. Carefully analyze the existing files and the user's change request.
2. Update ONLY the necessary files or add new files if required. Do NOT change files that do not need modification.
3. Keep the overall website functioning smoothly, responsive, and styled modernly.
4. Update "index.html" so that it incorporates the requested changes and renders properly in an iframe preview.

OUTPUT FORMAT (STRICT RAW JSON ONLY):
{
  "projectName": "Updated Project Title or keep existing",
  "summary": "Summary of changes made",
  "files": [
    {
      "path": "index.html",
      "content": "..."
    }
  ]
}
`;

// Helper function to extract and compile a self-contained index.html from files array
const compileFilesToHtml = (files, fallbackCode = "") => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return fallbackCode || "<html><body><h1>Generated Website</h1></body></html>";
  }

  // Find primary HTML file
  const indexFile = files.find(
    (f) => f.path === "index.html" || f.path === "index.htm" || f.path?.endsWith(".html")
  );

  let baseHtml = indexFile?.content || "";
  if (!baseHtml) {
    const htmlFile = files.find((f) => f.content && f.content.includes("<html"));
    baseHtml = htmlFile?.content || fallbackCode || "";
  }

  if (!baseHtml) {
    return "<html><body><h1>Generated Website</h1></body></html>";
  }

  // Collect all separate CSS files
  const cssFiles = files.filter(
    (f) => f.path?.endsWith(".css") && f.content && f.content.trim().length > 0
  );

  let inlinedStyles = cssFiles.map((f) => `/* File: ${f.path} */\n${f.content}`).join("\n\n");

  // Collect all separate JS files
  const jsFiles = files.filter(
    (f) =>
      (f.path?.endsWith(".js") || f.path?.endsWith(".jsx")) &&
      !f.path?.endsWith(".html") &&
      f.content &&
      f.content.trim().length > 0
  );

  let inlinedScripts = jsFiles.map((f) => `// File: ${f.path}\n${f.content}`).join("\n\n");

  let finalHtml = baseHtml;

  // Inject inlined CSS before </head>
  if (inlinedStyles && !finalHtml.includes(inlinedStyles.slice(0, 20))) {
    if (finalHtml.includes("</head>")) {
      finalHtml = finalHtml.replace("</head>", `<style>\n${inlinedStyles}\n</style>\n</head>`);
    } else {
      finalHtml = `<style>\n${inlinedStyles}\n</style>\n${finalHtml}`;
    }
  }

  // Inject inlined JS before </body>
  if (inlinedScripts && !finalHtml.includes(inlinedScripts.slice(0, 20))) {
    if (finalHtml.includes("</body>")) {
      finalHtml = finalHtml.replace("</body>", `<script>\n${inlinedScripts}\n</script>\n</body>`);
    } else {
      finalHtml = `${finalHtml}\n<script>\n${inlinedScripts}\n</script>`;
    }
  }

  return finalHtml;
};

// POST /api/website/generate
export const generateWebsite = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.credit < 50) {
      return res.status(400).json({
        success: false,
        message: "Insufficient Credits",
      });
    }

    const finalPrompt = masterPrompt.replace("{USER_PROMPT}", prompt);

    let raw = "";
    let parsed = null;

    for (let i = 0; i < 3; i++) {
      raw = await generateResponse(finalPrompt);
      parsed = await extrajson(raw);

      if (parsed && (parsed.files || parsed.code)) {
        break;
      }
    }

    if (!parsed || (!parsed.files && !parsed.code)) {
      return res.status(500).json({
        success: false,
        message: "AI returned invalid response format",
      });
    }

    const filesArray = parsed.files || [
      {
        path: "index.html",
        content: parsed.code || "<html><body></body></html>",
      },
    ];

    const latestCode = compileFilesToHtml(filesArray, parsed.code);
    const title = parsed.projectName || prompt.slice(0, 30);
    const summaryMsg = parsed.summary || "Website generated successfully!";

const generateSlug = (text) => {
  const base = text ? text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : "site";
  return `${base.slice(0, 20)}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
};

    // Create website
    const website = await websiteModel.create({
      user: user._id,
      title: title,
      prompt: prompt,
      files: filesArray,
      latestCode: latestCode,
      status: "active",
      slug: generateSlug(title),
    });

    // Create chat messages
    await messageModel.create([
      {
        website: website._id,
        role: "user",
        content: prompt,
      },
      {
        website: website._id,
        role: "assistant",
        content: summaryMsg,
      },
    ]);

    // Deduct 50 credits & record transaction
    user.credit -= 50;
    await user.save();

    await creditTransactionModel.create({
      userId: user._id,
      type: "deduct",
      amount: 50,
      reason: `Project Creation (${website.title})`,
    });

    return res.status(201).json({
      success: true,
      message: summaryMsg,
      websiteId: website._id,
      website: {
        _id: website._id,
        id: website._id,
        title: website.title,
        prompt: website.prompt,
        files: website.files,
        latestCode: website.latestCode,
        status: website.status,
        createdAt: website.createdAt,
        updatedAt: website.updatedAt,
      },
      remainingCredit: user.credit,
    });
  } catch (err) {
    console.error("Generate Website Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// POST /api/website/:id/edit or changes
export const changes = async (req, res) => {
  try {
    const { prompt } = req.body;
    const websiteId = req.params.id || req.body.websiteId;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.credit < 25) {
      return res.status(400).json({
        success: false,
        message: "Insufficient Credits",
      });
    }

    const website = await websiteModel.findOne({
      _id: websiteId,
      user: user._id,
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: "Website not found",
      });
    }

    const existingFilesStr = JSON.stringify(website.files || [], null, 2);
    const finalPrompt = editPromptTemplate
      .replace("{EXISTING_FILES}", existingFilesStr)
      .replace("{USER_PROMPT}", prompt);

    let raw = "";
    let parsed = null;

    for (let i = 0; i < 3; i++) {
      raw = await generateResponse(finalPrompt);
      parsed = await extrajson(raw);

      if (parsed && (parsed.files || parsed.code)) {
        break;
      }
    }

    if (!parsed || (!parsed.files && !parsed.code)) {
      return res.status(500).json({
        success: false,
        message: "AI returned invalid response format",
      });
    }

    // Merge modified files into existing website.files
    let updatedFiles = [...website.files];
    if (parsed.files && Array.isArray(parsed.files)) {
      parsed.files.forEach((newFile) => {
        const idx = updatedFiles.findIndex((f) => f.path === newFile.path);
        if (idx !== -1) {
          updatedFiles[idx] = newFile;
        } else {
          updatedFiles.push(newFile);
        }
      });
    } else if (parsed.code) {
      const idx = updatedFiles.findIndex((f) => f.path === "index.html");
      if (idx !== -1) {
        updatedFiles[idx].content = parsed.code;
      } else {
        updatedFiles.push({ path: "index.html", content: parsed.code });
      }
    }

    const latestCode = compileFilesToHtml(updatedFiles, website.latestCode);
    const summaryMsg = parsed.summary || "Website updated successfully!";

    website.files = updatedFiles;
    website.latestCode = latestCode;
    if (parsed.projectName) {
      website.title = parsed.projectName;
    }
    await website.save();

    // Store chat messages
    await messageModel.create([
      {
        website: website._id,
        role: "user",
        content: prompt,
      },
      {
        website: website._id,
        role: "assistant",
        content: summaryMsg,
      },
    ]);

    // Deduct 25 credits & log transaction
    user.credit -= 25;
    await user.save();

    await creditTransactionModel.create({
      userId: user._id,
      type: "deduct",
      amount: 25,
      reason: `Website Modification (${website.title})`,
    });

    // Fetch full conversation history
    const conversation = await messageModel
      .find({ website: website._id })
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      message: summaryMsg,
      website: website,
      conversation: conversation,
      remainingCredit: user.credit,
    });
  } catch (err) {
    console.error("Edit Website Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// GET /api/website/user
export const getUserWebsites = async (req, res) => {
  try {
    const websites = await websiteModel
      .find({ user: req.user._id, status: "active" })
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      websites: websites,
    });
  } catch (err) {
    console.error("Get User Websites Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch websites",
      error: err.message,
    });
  }
};

// GET /api/website/get-my-id/:id or /api/website/:id
export const getWebsiteById = async (req, res) => {
  try {
    const website = await websiteModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: "Website not found",
      });
    }

    const conversation = await messageModel
      .find({ website: website._id })
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      website: website,
      conversation: conversation,
    });
  } catch (err) {
    console.error("Get Website By ID Error:", err);
    return res.status(500).json({
      success: false,
      message: `Failed to fetch website: ${err.message}`,
    });
  }
};

// PUT /api/website/:id/rename
export const renameWebsite = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const website = await websiteModel.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title: title.trim() },
      { new: true }
    );

    if (!website) {
      return res.status(404).json({
        success: false,
        message: "Website not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project renamed successfully",
      website: website,
    });
  } catch (err) {
    console.error("Rename Website Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to rename project",
      error: err.message,
    });
  }
};

// DELETE /api/website/:id
export const deleteWebsite = async (req, res) => {
  try {
    const website = await websiteModel.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: "Website not found",
      });
    }

    await messageModel.deleteMany({ website: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Website deleted successfully",
      websiteId: req.params.id,
    });
  } catch (err) {
    console.error("Delete Website Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete website",
      error: err.message,
    });
  }
};

// POST /api/website/:id/duplicate
export const duplicateWebsite = async (req, res) => {
  try {
    const website = await websiteModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: "Website not found",
      });
    }

    const newTitle = `${website.title} (Copy)`;
    const newWebsite = await websiteModel.create({
      user: req.user._id,
      title: newTitle,
      prompt: website.prompt,
      files: website.files,
      latestCode: website.latestCode,
      status: "active",
      slug: generateSlug(newTitle),
    });

    // Copy chat messages
    const originalMessages = await messageModel.find({ website: website._id });
    if (originalMessages.length > 0) {
      const newMessages = originalMessages.map((msg) => ({
        website: newWebsite._id,
        role: msg.role,
        content: msg.content,
      }));
      await messageModel.create(newMessages);
    }

    return res.status(201).json({
      success: true,
      message: "Project duplicated successfully",
      website: newWebsite,
    });
  } catch (err) {
    console.error("Duplicate Website Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to duplicate website",
      error: err.message,
    });
  }
};

// POST /api/website/:id/deploy
export const deployWebsite = async (req, res) => {
  try {
    const { target = "vercel" } = req.body;
    const website = await websiteModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: "Website not found",
      });
    }

    const hostDomain = target === "netlify" ? "netlify.app" : "vercel.app";
    const cleanSlug = (website.slug || website.title || "site")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").slice(0,60)+website._id.toString().slice(-5);
    // const deployUrl = `https://${cleanSlug}.${hostDomain}`;
    const deployUrl = `${process.env.FRONTEND_URL}/site/${cleanSlug}`

    website.deployed = true;
    website.deployUrl = deployUrl;
    await website.save();

    return res.status(200).json({
      success: true,
      message: `Website successfully deployed to ${target}!`,
      deployUrl: deployUrl,
      website: website,
    });
  } catch (err) {
    console.error("Deploy Website Error:", err);
    return res.status(500).json({
      success: false,
      message: "Deployment failed",
      error: err.message,
    });
  }
};

// GET /api/website/:id/download
export const downloadWebsiteZip = async (req, res) => {
  try {
    const website = await websiteModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: "Website not found",
      });
    }

    const zip = new AdmZip();

    // Add generated files from database
    const files = website.files && website.files.length > 0 ? website.files : [
      { path: "index.html", content: website.latestCode || "<html><body></body></html>" }
    ];

    files.forEach((file) => {
      zip.addFile(file.path, Buffer.from(file.content || "", "utf-8"));
    });

    // Check if package.json exists, if not add a standard package.json
    if (!files.some((f) => f.path === "package.json")) {
      const packageJson = {
        name: (website.title || "ai-generated-website").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        version: "1.0.0",
        private: true,
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview"
        },
        dependencies: {
          react: "^19.0.0",
          "react-dom": "^19.0.0"
        },
        devDependencies: {
          vite: "^5.0.0"
        }
      };
      zip.addFile("package.json", Buffer.from(JSON.stringify(packageJson, null, 2), "utf-8"));
    }

    // Add README.md if missing
    if (!files.some((f) => f.path === "README.md")) {
      const readme = `# ${website.title || "AI Generated Website"}\n\nGenerated with GenWeb.ai.\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n`;
      zip.addFile("README.md", Buffer.from(readme, "utf-8"));
    }

    // Add .env.example if missing
    if (!files.some((f) => f.path === ".env.example")) {
      zip.addFile(".env.example", Buffer.from("VITE_API_URL=http://localhost:5000\n", "utf-8"));
    }

    const zipBuffer = zip.toBuffer();
    const fileName = `${(website.title || "website").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.send(zipBuffer);
  } catch (err) {
    console.error("Download ZIP Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create project ZIP file",
      error: err.message,
    });
  }
};

// PUT /api/website/:id/file
export const updateSingleFile = async (req, res) => {
  try {
    const { path, content } = req.body;
    if (!path) {
      return res.status(400).json({
        success: false,
        message: "File path is required",
      });
    }

    const website = await websiteModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: "Website not found",
      });
    }

    let files = [...(website.files || [])];
    const idx = files.findIndex((f) => f.path === path);
    if (idx !== -1) {
      files[idx].content = content;
    } else {
      files.push({ path, content });
    }

    const latestCode = compileFilesToHtml(files, website.latestCode);

    website.files = files;
    website.latestCode = latestCode;
    await website.save();

    return res.status(200).json({
      success: true,
      message: "File saved successfully",
      website: website,
    });
  } catch (err) {
    console.error("Update Single File Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save file",
      error: err.message,
    });
  }
};

