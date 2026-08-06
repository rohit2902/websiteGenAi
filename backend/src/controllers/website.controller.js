import { generateResponse } from "../services/model.js";
import { extrajson } from "../utlis/extratJson.js";
import websiteModel from "../models/wesite.model.js";
import userModel from "../models/user.model.js";
import messageModel from "../models/message.model.js";
import creditTransactionModel from "../models/creditTransaction.model.js";
import AdmZip from "adm-zip";

const masterPrompt = `You are a Principal Full-Stack Architect. Generate a complete, modern, production-ready website for the following requirement:

USER REQUIREMENT:
"{USER_PROMPT}"

REQUIREMENTS:
- Modern UI/UX design with mobile-first responsive layout.
- Real business content (NO lorem ipsum, NO placeholders, NO TODOs).
- Self-contained working HTML/CSS/JS code.
- Responsive Unsplash images (URL format: https://images.unsplash.com/... ?auto=format&fit=crop&w=1200&q=80).
- Return ONLY valid raw JSON without markdown formatting.

JSON SCHEMA:
{
  "projectName": "Project Title",
  "summary": "Short professional summary",
  "framework": "html",
  "files": [
    { "path": "index.html", "content": "..." },
    { "path": "style.css", "content": "..." },
    { "path": "script.js", "content": "..." }
  ]
}`;

const editPromptTemplate = `You are a Senior Full-Stack Architect. Modify the existing website codebase according to the user request.

EXISTING FILES:
{EXISTING_FILES}

USER CHANGE REQUEST:
"{USER_PROMPT}"

INSTRUCTIONS:
1. Update ONLY necessary files or add new files if needed.
2. Keep the website functioning, responsive, and modern.
3. Return ONLY valid raw JSON without markdown formatting.

JSON SCHEMA:
{
  "projectName": "Updated Project Title",
  "summary": "Summary of changes made",
  "files": [
    { "path": "index.html", "content": "..." }
  ]
}`;

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
  const reqStartTime = Date.now();
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    console.log(`[Generate API Received] Prompt: "${prompt.slice(0, 60)}..."`);

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
    const promptFormattedTime = Date.now();
    console.log(`[Prompt Generated] Time taken: ${promptFormattedTime - reqStartTime}ms`);

    let raw = "";
    let parsed = null;

    // AI Call Step
    const aiStartTime = Date.now();
    try {
      raw = await generateResponse(finalPrompt);
      parsed = extrajson(raw);
    } catch (aiErr) {
      console.warn(`[Generate API Warning] First AI model call failed: ${aiErr.message}`);
    }

    // Fallback if parsing failed or AI call errored
    if (!parsed || (!parsed.files && !parsed.code)) {
      console.warn(`[Generate API Retry] Retrying with secondary fallback model...`);
      try {
        raw = await generateResponse(finalPrompt, "google/gemma-4-31b-it:free");
        parsed = extrajson(raw);
      } catch (fallbackErr) {
        console.error(`[Generate API Error] Secondary fallback call failed: ${fallbackErr.message}`);
      }
    }

    const aiEndTime = Date.now();
    console.log(`[AI Response Received] Execution time: ${aiEndTime - aiStartTime}ms`);

    if (!parsed || (!parsed.files && !parsed.code)) {
      return res.status(500).json({
        success: false,
        message: "AI returned invalid response format. Please try again.",
      });
    }

    const jsonParsedTime = Date.now();
    console.log(`[JSON Parsed] Time taken: ${jsonParsedTime - aiEndTime}ms. Summary: "${parsed.summary || 'N/A'}"`);

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

    const dbStartTime = Date.now();

    // Create website document
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

    const dbEndTime = Date.now();
    const totalExecutionTime = dbEndTime - reqStartTime;
    console.log(`[DB Saved] Time taken: ${dbEndTime - dbStartTime}ms. [Total Execution Time]: ${totalExecutionTime}ms`);

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
    console.error(`[Generate Website Fatal Error] after ${Date.now() - reqStartTime}ms:`, err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// POST /api/website/:id/edit or changes
export const changes = async (req, res) => {
  const reqStartTime = Date.now();
  try {
    const { prompt } = req.body;
    const websiteId = req.params.id || req.body.websiteId;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    console.log(`[Edit API Received] WebsiteId: ${websiteId}, Prompt: "${prompt.slice(0, 60)}..."`);

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

    const aiStartTime = Date.now();
    try {
      raw = await generateResponse(finalPrompt);
      parsed = extrajson(raw);
    } catch (aiErr) {
      console.warn(`[Edit API Warning] First AI model call failed: ${aiErr.message}`);
    }

    if (!parsed || (!parsed.files && !parsed.code)) {
      console.warn(`[Edit API Retry] Retrying with secondary fallback model...`);
      try {
        raw = await generateResponse(finalPrompt, "meta-llama/llama-3.3-70b-instruct:free");
        parsed = extrajson(raw);
      } catch (fallbackErr) {
        console.error(`[Edit API Error] Secondary fallback call failed: ${fallbackErr.message}`);
      }
    }

    const aiEndTime = Date.now();
    console.log(`[AI Response Received] Execution time: ${aiEndTime - aiStartTime}ms`);

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

    const totalExecutionTime = Date.now() - reqStartTime;
    console.log(`[Edit Website Completed] Total time: ${totalExecutionTime}ms`);

    return res.status(200).json({
      success: true,
      message: summaryMsg,
      website: website,
      conversation: conversation,
      remainingCredit: user.credit,
    });
  } catch (err) {
    console.error(`[Edit Website Fatal Error] after ${Date.now() - reqStartTime}ms:`, err);
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

