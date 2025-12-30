import dotenv from "dotenv";
import mysql from "mysql2/promise";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

dotenv.config();

/* ------------------ MYSQL CONNECTION ------------------ */
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: "Cl@ude#123!!",
  database: process.env.DB_NAME || "test_management",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.error("✅ Database connection successful");
    connection.release();
    return true;
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    return false;
  }
}

/* ------------------ MCP SERVER ------------------ */
const server = new Server(
  {
    name: "mysql-story-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/* ------------------ LIST TOOLS ------------------ */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_all_stories",
        description:
          "Fetch all user stories from MySQL for generating industry-standard manual test cases.\n\n" +
          "CRITICAL REQUIREMENTS:\n\n" +
          "1. EVERY TEST CASE MUST BE STANDALONE AND COMPLETE\n" +
          "   - Include the FULL user journey from start to finish\n" +
          "   - Start from opening browser/navigating to application\n" +
          "   - Include all navigation steps to reach the feature\n" +
          "   - Don't skip initial steps assuming they're 'obvious'\n\n" +
          "2. MAINTAIN CONSISTENCY ACROSS ALL TEST CASES\n" +
          "   - First test case should have same detail level as the last one\n" +
          "   - Don't abbreviate later test cases\n" +
          "   - Each test case should be executable by someone new\n\n" +
          "3. TARGET 6-10 LOGICAL STEPS (covering complete journey)\n" +
          "   - NOT 3-4 steps (too abbreviated, misses context)\n" +
          "   - NOT 20-30 steps (too granular, atomic actions)\n\n" +
          "❌ WRONG (missing initial steps - not standalone):\n" +
          "  1. Click 'Forgot Password' link\n" +
          "  2. Open expired reset link\n" +
          "  3. Verify error message\n" +
          "  (Where do I start? How do I get to the forgot password link?)\n\n" +
          "✅ CORRECT (complete journey, standalone):\n" +
          "  1. Open browser and navigate to application URL (https://app.example.com)\n" +
          "  2. On login page, click 'Forgot Password' link\n" +
          "  3. Enter email address (test@example.com) and click 'Send Reset Link' button\n" +
          "  4. Open email inbox and locate password reset email\n" +
          "  5. Click the reset link in the email\n" +
          "  6. On password reset page, enter new password in both fields (NewPass@123)\n" +
          "  7. Click 'Reset Password' button\n" +
          "  8. Verify success message 'Password reset successfully' appears\n" +
          "  9. Login with new password to confirm reset worked\n\n" +
          "Each test case MUST:\n" +
          "- Start from browser/application entry point\n" +
          "- Include navigation to reach the feature being tested\n" +
          "- Cover the complete user journey (start to finish)\n" +
          "- Be executable by a non-technical person with zero context\n" +
          "- Maintain consistent detail level across all test cases",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_story_by_ticket",
        description:
          "Fetch a single user story by ticket number for generating COMPLETE, STANDALONE test cases.\n\n" +
          "CRITICAL: Each test case must include the FULL USER JOURNEY from start to finish!\n\n" +
          "❌ PROHIBITED - Incomplete test cases that skip initial steps:\n" +
          "  Bad Example (Password Reset):\n" +
          "  1. Click 'Forgot Password'\n" +
          "  2. Enter email\n" +
          "  3. Open reset link\n" +
          "  (Missing: How do I start? Where is the app? How do I navigate there?)\n\n" +
          "  Bad Example (Profile Update):\n" +
          "  1. Navigate to Profile\n" +
          "  2. Update fields\n" +
          "  3. Save changes\n" +
          "  (Missing: How did I get logged in? Where do I start?)\n\n" +
          "✅ REQUIRED - Complete journey, executable by anyone:\n" +
          "  Good Example (Password Reset):\n" +
          "  1. Open browser and navigate to application URL (https://app.example.com/login)\n" +
          "  2. On the login page, locate and click the 'Forgot Password' link below the login form\n" +
          "  3. Enter registered email address (test@example.com) in the email field\n" +
          "  4. Click 'Send Reset Link' button and verify confirmation message appears\n" +
          "  5. Open email client, locate password reset email, and click the reset link\n" +
          "  6. On password reset page, enter new password (NewPass@123) in both 'Password' and 'Confirm Password' fields\n" +
          "  7. Click 'Reset Password' button\n" +
          "  8. Verify success message 'Password has been reset successfully' is displayed\n" +
          "  9. Navigate back to login page and login with the new password to verify reset was successful\n\n" +
          "  Good Example (Profile Update):\n" +
          "  1. Open browser and navigate to application URL (https://app.example.com)\n" +
          "  2. Login to application with valid credentials (Email: test@example.com, Password: Test@123)\n" +
          "  3. After successful login, click on 'Profile' or user avatar in the navigation menu\n" +
          "  4. On the Profile page, click 'Edit Profile' button to enable editing\n" +
          "  5. Update the following fields: First Name='John', Last Name='Doe', Phone='555-1234'\n" +
          "  6. Click 'Save Changes' button to submit the form\n" +
          "  7. Verify success message 'Profile updated successfully' appears\n" +
          "  8. Verify all updated fields display the new values correctly on the profile page\n\n" +
          "MANDATORY RULES:\n" +
          "1. ALWAYS start from opening browser/navigating to application\n" +
          "2. Include login steps if the feature requires authentication (don't just say 'Precondition: User is logged in')\n" +
          "3. Include navigation steps to reach the feature being tested\n" +
          "4. Cover the COMPLETE user journey from start to end\n" +
          "5. Target 7-10 steps to cover the full journey without being atomic\n" +
          "6. Write for a non-technical person who has never used the application\n" +
          "7. EVERY test case should have the SAME level of detail - don't abbreviate later test cases\n" +
          "8. Make each test case standalone - it should be executable without reading any other test case",
        inputSchema: {
          type: "object",
          properties: {
            ticket_number: {
              type: "string",
              description: "Unique ticket number of the user story (e.g., TICKET-003)",
            },
          },
          required: ["ticket_number"],
        },
      },
      {
        name: "get_related_stories",
        description:
          "Fetch related stories for dependency analysis and understanding preconditions.\n\n" +
          "Use these stories to:\n" +
          "1. Identify prerequisite user stories that must be completed first\n" +
          "2. Understand context and dependencies\n" +
          "3. Write clear, concise preconditions\n\n" +
          "When using related stories for preconditions:\n" +
          "❌ WRONG (too vague): 'Precondition: User is logged in'\n" +
          "❌ WRONG (too detailed): List 10 steps for login as preconditions\n\n" +
          "✅ CORRECT (clear and concise):\n" +
          "  Preconditions:\n" +
          "  - User account exists (Email: test@example.com, Password: Test@123)\n" +
          "  - User is logged into the application\n" +
          "  - User is on the dashboard page\n\n" +
          "Keep preconditions brief - they set the starting state, not detailed test steps.",
        inputSchema: {
          type: "object",
          properties: {
            exclude_ticket: {
              type: "string",
              description:
                "Ticket number to exclude from results (usually the primary story under test)",
            },
          },
          required: ["exclude_ticket"],
        },
      },
      {
        name: "search_stories",
        description:
          "Search for stories by keywords in title or description. Useful for finding stories related to specific features or components.",
        inputSchema: {
          type: "object",
          properties: {
            keyword: {
              type: "string",
              description: "Keyword to search for in story title or description",
            },
          },
          required: ["keyword"],
        },
      },
      {
        name: "create_story",
        description:
          "Create a new user story in the database. Returns the created story with its assigned ID.",
        inputSchema: {
          type: "object",
          properties: {
            ticket_number: {
              type: "string",
              description: "Unique ticket number (e.g., TICKET-004)",
            },
            title: {
              type: "string",
              description: "Story title",
            },
            description: {
              type: "string",
              description: "Detailed story description",
            },
            status: {
              type: "string",
              description: "Story status (e.g., 'To Do', 'In Progress', 'Done')",
            },
            priority: {
              type: "string",
              description: "Story priority (e.g., 'High', 'Medium', 'Low')",
            },
          },
          required: ["ticket_number", "title"],
        },
      },
      {
        name: "update_story",
        description:
          "Update an existing user story by ticket number. Only provided fields will be updated.",
        inputSchema: {
          type: "object",
          properties: {
            ticket_number: {
              type: "string",
              description: "Ticket number of the story to update",
            },
            title: {
              type: "string",
              description: "New title (optional)",
            },
            description: {
              type: "string",
              description: "New description (optional)",
            },
            status: {
              type: "string",
              description: "New status (optional)",
            },
            priority: {
              type: "string",
              description: "New priority (optional)",
            },
          },
          required: ["ticket_number"],
        },
      },
      {
        name: "delete_story",
        description:
          "Delete a user story by ticket number. Use with caution as this is irreversible.",
        inputSchema: {
          type: "object",
          properties: {
            ticket_number: {
              type: "string",
              description: "Ticket number of the story to delete",
            },
          },
          required: ["ticket_number"],
        },
      },
    ],
  };
});

/* ------------------ CALL TOOL ------------------ */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    console.error(`🔧 Tool called: ${name}`, args);

    if (name === "get_all_stories") {
      const [rows] = await pool.query("SELECT * FROM stories");
      console.error(`✅ Fetched ${rows.length} stories`);

      if (rows.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No stories found in the database.",
            },
          ],
        };
      }

      const reminderMessage =
        "📋 CRITICAL: GENERATE COMPLETE, STANDALONE TEST CASES!\n\n" +
        "EVERY test case must include the FULL user journey - from opening the application to final verification.\n\n" +
        "❌ WRONG - Abbreviated test cases missing initial steps:\n" +
        "  Test Case 2 (Profile Update):\n" +
        "  1. Navigate to Profile\n" +
        "  2. Update fields\n" +
        "  3. Save\n" +
        "  (How did I login? Where do I start? Not executable by a new person!)\n\n" +
        "✅ CORRECT - Complete journey, standalone (7-10 steps):\n" +
        "  Test Case 2 (Profile Update):\n" +
        "  1. Open browser and navigate to https://app.example.com\n" +
        "  2. Login with credentials (Email: test@example.com, Password: Test@123)\n" +
        "  3. Click 'Profile' in the navigation menu\n" +
        "  4. Click 'Edit Profile' button\n" +
        "  5. Update fields: First Name='John', Last Name='Doe'\n" +
        "  6. Click 'Save Changes' button\n" +
        "  7. Verify success message 'Profile updated' appears\n" +
        "  8. Verify updated data is displayed correctly\n\n" +
        "RULES:\n" +
        "• Start EVERY test case from browser/app entry point\n" +
        "• Include login/navigation steps (don't skip to the main action)\n" +
        "• Maintain SAME detail level for ALL test cases (don't abbreviate later ones)\n" +
        "• Write for someone who has NEVER used the app before\n" +
        "• Each test case = Complete standalone journey\n\n" +
        "---STORIES DATA---\n\n";

      return {
        content: [
          {
            type: "text",
            text: reminderMessage + JSON.stringify(rows, null, 2),
          },
        ],
      };
    }

    if (name === "get_story_by_ticket") {
      // Input validation
      if (!args.ticket_number || typeof args.ticket_number !== "string") {
        throw new Error("ticket_number is required and must be a string");
      }

      const [rows] = await pool.query("SELECT * FROM stories WHERE ticket_number = ?", [
        args.ticket_number,
      ]);

      console.error(`✅ Found ${rows.length} story for ticket ${args.ticket_number}`);

      if (rows.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No story found with ticket number: ${args.ticket_number}`,
            },
          ],
        };
      }

      const reminderMessage =
        "📋 GENERATE COMPLETE, STANDALONE TEST CASE WITH FULL USER JOURNEY!\n\n" +
        "CRITICAL REQUIREMENTS:\n" +
        "1. Include the COMPLETE journey from start to finish\n" +
        "2. Start from opening browser/navigating to application\n" +
        "3. Include ALL navigation and setup steps\n" +
        "4. Don't assume any prior context or steps\n" +
        "5. Target 7-10 steps to cover the full journey\n\n" +
        "MANDATORY FORMAT:\n\n" +
        "Test Case ID/Title: [Clear descriptive title]\n\n" +
        "Preconditions:\n" +
        "  - User account exists (Email: test@example.com, Password: Test@123)\n" +
        "  - Application is accessible at [URL]\n" +
        "  - Browser: Chrome/Firefox\n\n" +
        "Test Steps: (7-10 steps covering FULL journey)\n" +
        "  1. Open browser and navigate to application URL ([specific URL])\n" +
        "  2. [If login required] Login with credentials (Email: [email], Password: [password])\n" +
        "  3. [Navigation] Navigate to [specific page/section] by clicking [specific menu/button]\n" +
        "  4. [Locate] Locate and click '[Button/Link]' to access the feature\n" +
        "  5. [Action] Perform the main action: Enter/update data (Field1='Value1', Field2='Value2')\n" +
        "  6. [Submit] Click '[Submit/Save Button]' to complete the action\n" +
        "  7. [Verify] Verify success message '[Exact message]' is displayed\n" +
        "  8. [Verify] Verify the result/data is correct and displayed properly\n" +
        "  9. [Optional] Additional verification or cleanup if needed\n\n" +
        "Expected Result:\n" +
        "  - [Overall outcome describing what should happen]\n\n" +
        "CRITICAL RULES:\n" +
        "✅ ALWAYS start from opening browser/app (Step 1)\n" +
        "✅ ALWAYS include login steps if authentication is required (Step 2)\n" +
        "✅ ALWAYS include navigation steps to reach the feature (Step 3-4)\n" +
        "✅ Include specific test data, URLs, and button/field names\n" +
        "✅ Make it executable by someone who has NEVER used the application\n" +
        "❌ NEVER skip initial steps assuming they're obvious\n" +
        "❌ NEVER abbreviate test cases - maintain full detail for ALL test cases\n\n" +
        "---STORY DATA---\n\n";

      return {
        content: [
          {
            type: "text",
            text: reminderMessage + JSON.stringify(rows, null, 2),
          },
        ],
      };
    }

    if (name === "get_related_stories") {
      // Input validation
      if (!args.exclude_ticket || typeof args.exclude_ticket !== "string") {
        throw new Error("exclude_ticket is required and must be a string");
      }

      const [rows] = await pool.query("SELECT * FROM stories WHERE ticket_number != ?", [
        args.exclude_ticket,
      ]);

      console.error(`✅ Found ${rows.length} related stories`);

      if (rows.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No related stories found.",
            },
          ],
        };
      }

      const reminderMessage =
        "📋 USING RELATED STORIES FOR PRECONDITIONS:\n" +
        "Use these stories to understand context and write clear, concise preconditions.\n\n" +
        "PRECONDITIONS should be brief starting conditions, NOT detailed test steps:\n\n" +
        "✅ CORRECT:\n" +
        "  Preconditions:\n" +
        "  - User account exists (Email: test@example.com, Password: Test@123)\n" +
        "  - User is logged into the application\n" +
        "  - User is on the dashboard page\n\n" +
        "❌ WRONG (too vague):\n" +
        "  - User is logged in\n\n" +
        "❌ WRONG (too detailed - this should be in test steps, not preconditions):\n" +
        "  - Navigate to login page\n" +
        "  - Enter username\n" +
        "  - Enter password\n" +
        "  - Click login button...\n\n" +
        "---RELATED STORIES DATA---\n\n";

      return {
        content: [
          {
            type: "text",
            text: reminderMessage + JSON.stringify(rows, null, 2),
          },
        ],
      };
    }

    if (name === "search_stories") {
      // Input validation
      if (!args.keyword || typeof args.keyword !== "string") {
        throw new Error("keyword is required and must be a string");
      }

      const searchPattern = `%${args.keyword}%`;
      const [rows] = await pool.query(
        "SELECT * FROM stories WHERE title LIKE ? OR description LIKE ?",
        [searchPattern, searchPattern]
      );

      console.error(`✅ Found ${rows.length} stories matching "${args.keyword}"`);

      if (rows.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No stories found matching keyword: ${args.keyword}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(rows, null, 2),
          },
        ],
      };
    }

    if (name === "create_story") {
      // Input validation
      if (!args.ticket_number || typeof args.ticket_number !== "string") {
        throw new Error("ticket_number is required and must be a string");
      }
      if (!args.title || typeof args.title !== "string") {
        throw new Error("title is required and must be a string");
      }

      // Check if ticket already exists
      const [existing] = await pool.query(
        "SELECT ticket_number FROM stories WHERE ticket_number = ?",
        [args.ticket_number]
      );

      if (existing.length > 0) {
        throw new Error(`Story with ticket number ${args.ticket_number} already exists`);
      }

      // Build dynamic query based on provided fields
      const fields = ["ticket_number", "title"];
      const values = [args.ticket_number, args.title];
      const placeholders = ["?", "?"];

      if (args.description) {
        fields.push("description");
        values.push(args.description);
        placeholders.push("?");
      }
      if (args.status) {
        fields.push("status");
        values.push(args.status);
        placeholders.push("?");
      }
      if (args.priority) {
        fields.push("priority");
        values.push(args.priority);
        placeholders.push("?");
      }

      const query = `INSERT INTO stories (${fields.join(", ")}) VALUES (${placeholders.join(
        ", "
      )})`;
      const [result] = await pool.query(query, values);

      // Fetch the created story
      const [created] = await pool.query("SELECT * FROM stories WHERE ticket_number = ?", [
        args.ticket_number,
      ]);

      console.error(`✅ Created story ${args.ticket_number}`);

      return {
        content: [
          {
            type: "text",
            text: `Story created successfully:\n${JSON.stringify(created[0], null, 2)}`,
          },
        ],
      };
    }

    if (name === "update_story") {
      // Input validation
      if (!args.ticket_number || typeof args.ticket_number !== "string") {
        throw new Error("ticket_number is required and must be a string");
      }

      // Check if story exists
      const [existing] = await pool.query(
        "SELECT ticket_number FROM stories WHERE ticket_number = ?",
        [args.ticket_number]
      );

      if (existing.length === 0) {
        throw new Error(`Story with ticket number ${args.ticket_number} not found`);
      }

      // Build dynamic update query
      const updates = [];
      const values = [];

      if (args.title) {
        updates.push("title = ?");
        values.push(args.title);
      }
      if (args.description !== undefined) {
        updates.push("description = ?");
        values.push(args.description);
      }
      if (args.status) {
        updates.push("status = ?");
        values.push(args.status);
      }
      if (args.priority) {
        updates.push("priority = ?");
        values.push(args.priority);
      }

      if (updates.length === 0) {
        throw new Error("No fields provided to update");
      }

      values.push(args.ticket_number);
      const query = `UPDATE stories SET ${updates.join(", ")} WHERE ticket_number = ?`;
      await pool.query(query, values);

      // Fetch the updated story
      const [updated] = await pool.query("SELECT * FROM stories WHERE ticket_number = ?", [
        args.ticket_number,
      ]);

      console.error(`✅ Updated story ${args.ticket_number}`);

      return {
        content: [
          {
            type: "text",
            text: `Story updated successfully:\n${JSON.stringify(updated[0], null, 2)}`,
          },
        ],
      };
    }

    if (name === "delete_story") {
      // Input validation
      if (!args.ticket_number || typeof args.ticket_number !== "string") {
        throw new Error("ticket_number is required and must be a string");
      }

      // Check if story exists
      const [existing] = await pool.query("SELECT * FROM stories WHERE ticket_number = ?", [
        args.ticket_number,
      ]);

      if (existing.length === 0) {
        throw new Error(`Story with ticket number ${args.ticket_number} not found`);
      }

      // Delete the story
      await pool.query("DELETE FROM stories WHERE ticket_number = ?", [args.ticket_number]);

      console.error(`✅ Deleted story ${args.ticket_number}`);

      return {
        content: [
          {
            type: "text",
            text: `Story ${args.ticket_number} deleted successfully:\n${JSON.stringify(
              existing[0],
              null,
              2
            )}`,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (err) {
    console.error("❌ MCP TOOL ERROR:", err.message);

    return {
      content: [
        {
          type: "text",
          text: `Error: ${err.message}`,
        },
      ],
      isError: true,
    };
  }
});

/* ------------------ GRACEFUL SHUTDOWN ------------------ */
async function gracefulShutdown() {
  console.error("🛑 Shutting down gracefully...");
  try {
    await pool.end();
    console.error("✅ Database connections closed");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err.message);
    process.exit(1);
  }
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION:", err);
  gracefulShutdown();
});

process.on("unhandledRejection", (err) => {
  console.error("❌ UNHANDLED PROMISE:", err);
  gracefulShutdown();
});

/* ------------------ START SERVER ------------------ */
console.error("🚀 Starting MCP server...");

// Test database connection
await testConnection();

const transport = new StdioServerTransport();
await server.connect(transport);

console.error("✅ MCP server connected and ready");
