import dotenv from "dotenv";
import mysql from "mysql2/promise";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

dotenv.config();

/* ------------------ CONFIGURATION ------------------ */
// 🔥 CHANGE TABLE NAME HERE - This will update everywhere in the code
const TABLE_NAME = process.env.DB_TABLE_NAME || "instagram_stories";

/* ------------------ MYSQL CONNECTION ------------------ */
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "test",
  database: process.env.DB_NAME || "testcase_generator",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.error("✅ Database connection successful");
    console.error(`📋 Using table: ${TABLE_NAME}`);
    connection.release();
    return true;
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    return false;
  }
}

/* ------------------ APPLICATION TYPE DETECTION ------------------ */
const APP_TYPE_DETECTION_GUIDE = `
═══════════════════════════════════════════════════════════════════════════════
                    APPLICATION TYPE DETECTION FROM USER STORY
═══════════════════════════════════════════════════════════════════════════════

🔍 ANALYZE THE USER STORY TO DETECT APPLICATION TYPE:

1. WEB APPLICATION ONLY
   Keywords to look for: "website", "web app", "browser", "URL", "webpage", "web portal"

   Test Steps Format:
   "1. Open browser and navigate to [App Name] login page (https://example.com/login)
    2. On the login page, enter credentials..."

2. MOBILE APPLICATION ONLY
   Keywords to look for: "mobile app", "iOS app", "Android app", "smartphone", "mobile device", "app store"

   Test Steps Format:
   "1. Open [App Name] mobile app on the device
    2. On the login screen, enter credentials..."

3. BOTH WEB AND MOBILE APPLICATION
   Keywords to look for: "web and mobile", "cross-platform", "responsive", "both platforms", "mobile and web"
   OR if story mentions features that work on both platforms

   Test Steps Format (provide both variations):
   "1. Open browser and navigate to [App Name] login page (https://example.com/login) OR Open [App Name] mobile app on the device
    2. On the login page/screen, enter credentials..."

4. DESKTOP APPLICATION
   Keywords to look for: "desktop app", "Windows application", "Mac app", "desktop client"

   Test Steps Format:
   "1. Launch [App Name] desktop application from the system
    2. On the login window, enter credentials..."

═══════════════════════════════════════════════════════════════════════════════
                              DETECTION RULES
═══════════════════════════════════════════════════════════════════════════════

PRIORITY ORDER (check in this sequence):
1. First, look for EXPLICIT mentions of platform in the user story
2. If no explicit mention, infer from the feature description:
   - Features like "responsive design", "touch gestures" → Mobile or Both
   - Features like "URL navigation", "browser tabs" → Web
   - Features like "push notifications", "camera access" → Mobile or Both
   - General features without platform-specific hints → Assume Both (safer approach)

EXAMPLES OF APPLICATION TYPE DETECTION:

Example 1 - WEB ONLY:
User Story: "As a user, I want to login to the Instagram website using my email..."
Detection: WEB APPLICATION
First Step: "1. Open browser and navigate to Instagram login page (https://instagram.com/login)"

Example 2 - MOBILE ONLY:
User Story: "As a mobile user, I want to login to the Instagram app on my phone..."
Detection: MOBILE APPLICATION
First Step: "1. Open Instagram mobile app on the device"

Example 3 - BOTH PLATFORMS:
User Story: "As a user, I want to login to Instagram from web or mobile app..."
Detection: BOTH WEB AND MOBILE
First Step: "1. Open browser and navigate to Instagram login page (https://instagram.com/login) OR Open Instagram mobile app on the device"

Example 4 - NO EXPLICIT MENTION (assume both):
User Story: "As a user, I want to view my Instagram profile and edit my bio..."
Detection: BOTH WEB AND MOBILE (default when unclear)
First Step: "1. Open browser and navigate to Instagram (https://instagram.com) OR Open Instagram mobile app on the device"

═══════════════════════════════════════════════════════════════════════════════
                         APPLICATION TYPE STEP VARIATIONS
═══════════════════════════════════════════════════════════════════════════════

📱 MOBILE APP VARIATIONS:
- "Open [App Name] mobile app on the device"
- "Launch [App Name] app on your smartphone"
- "Open the [App Name] application on your iOS/Android device"

🌐 WEB APP VARIATIONS:
- "Open browser and navigate to [App Name] login page (https://example.com/login)"
- "Open a web browser and go to [URL]"
- "Navigate to [App Name] website at [URL]"

🔄 BOTH PLATFORMS:
- "Open browser and navigate to [URL] OR Open [App Name] mobile app on the device"
- "Access [App Name] via web browser at [URL] or mobile app"
- "Launch [App Name] (web: [URL] / mobile: app on device)"

💻 DESKTOP APP:
- "Launch [App Name] desktop application"
- "Open [App Name] from your applications folder"

═══════════════════════════════════════════════════════════════════════════════
                              IMPLEMENTATION INSTRUCTIONS
═══════════════════════════════════════════════════════════════════════════════

⚠️ MANDATORY: Before generating test cases, YOU MUST:

1. READ the entire user story title and description
2. IDENTIFY keywords related to application type (web, mobile, both, desktop)
3. DETERMINE the application type based on the detection rules above
4. ADAPT the first step(s) of EVERY test case based on detected type
5. MAINTAIN consistency across all test cases for the same story

⚠️ IF UNCERTAIN about application type:
- Default to BOTH (web and mobile) as it covers all bases
- This ensures test cases are comprehensive

⚠️ IMPORTANT NOTES:
- The application type detection should affect ONLY the initial navigation/app opening steps
- All subsequent steps remain the same regardless of platform
- Login steps should also be adapted: "login page" (web) vs "login screen" (mobile)
- Use appropriate terminology: "click" (web) vs "tap" (mobile) vs "click/tap" (both)

═══════════════════════════════════════════════════════════════════════════════
`;

/* ------------------ STANDARD FORMAT TEMPLATE ------------------ */
const TEST_CASE_FORMAT_INSTRUCTIONS = `
═══════════════════════════════════════════════════════════════════════════════
                    INDUSTRY-STANDARD TEST CASE GENERATION
═══════════════════════════════════════════════════════════════════════════════

${APP_TYPE_DETECTION_GUIDE}

📋 MANDATORY OUTPUT FORMAT: CSV

Generate test cases in CSV format with the following columns:
"Test Case ID","Test Case Title","Priority","Test Type","Preconditions","Test Data","Test Steps","Expected Result"

═══════════════════════════════════════════════════════════════════════════════
                          TEST CASE ID FORMAT (MANDATORY)
═══════════════════════════════════════════════════════════════════════════════

🆔 SIMPLIFIED TEST CASE ID FORMAT: [TICKET_NUMBER][SEQUENCE]

Format Rules:
- Start with the ticket number (e.g., 101, 102, 103)
- Append a 3-digit sequence number (001, 002, 003...)
- No separators or prefixes

Examples:
✅ CORRECT: 101001, 101002, 101003, 102001, 102002
❌ WRONG: TC-101-001, 101-001, TC101001, 101_001

IMPORTANT: Extract the ticket number from the user story and use it directly.

═══════════════════════════════════════════════════════════════════════════════
                              CRITICAL REQUIREMENTS
═══════════════════════════════════════════════════════════════════════════════

1. COMPLETE USER JOURNEY (NOT ATOMIC STEPS)
   ✅ Industry Standard: 6-10 logical steps covering full journey
   ❌ Avoid: 20-30 atomic steps (too granular: "Click button", "Enter text")

   Example of GOOD industry-standard steps (WEB):
   - 1. Open browser and navigate to application login page (https://app.example.com/login)
   - 2. Login with valid credentials (Email: test@example.com, Password: Test@123)
   - 3. Navigate to Profile section from the main menu
   - 4. Update profile information (First Name: John, Last Name: Doe, Phone: 555-1234)
   - 5. Save changes and verify success message appears

   Example of GOOD industry-standard steps (MOBILE):
   - 1. Open application mobile app on the device
   - 2. On login screen, enter valid credentials (Email: test@example.com, Password: Test@123)
   - 3. Tap on Profile icon in the bottom navigation bar
   - 4. Tap Edit Profile button and update information (First Name: John, Last Name: Doe)
   - 5. Tap Save button and verify success message appears
//added comment
   Example of GOOD industry-standard steps (BOTH):
   - 1. Open browser and navigate to application URL (https://app.example.com) OR Open application mobile app on the device
   - 2. On login page/screen, enter valid credentials (Email: test@example.com, Password: Test@123)
   - 3. Navigate to Profile section from the main menu/bottom navigation
   - 4. Update profile information (First Name: John, Last Name: Doe, Phone: 555-1234)
   - 5. Save changes and verify success message appears

   Example of BAD atomic steps:
   - 1. Click browser icon
   - 2. Type URL
   - 3. Press Enter
   - 4. Wait for page load
   - 5. Locate username field
   - 6. Click username field
   - 7. Type username
   (This is TOO GRANULAR - not industry standard!)

2. EVERY TEST CASE MUST BE STANDALONE
   - Start from opening browser/application entry point (based on detected app type)
   - Include login steps if authentication required
   - Include navigation to reach the feature
   - Don't assume any prior context or steps
   - Should be executable by someone who has NEVER used the app

3. CONSISTENCY ACROSS ALL TEST CASES
   - First test case = Last test case in detail level
   - Do NOT abbreviate later test cases
   - Maintain same structure and depth for ALL test cases
   - Use same format template for every test case
   - Use consistent app type handling (all test cases should reflect detected type)

4. PRECONDITIONS FORMAT
   Write clear, concise preconditions that set the starting state:

   ✅ CORRECT (WEB):
   "- User account exists (Email: test@example.com, Password: Test@123)
    - Application is accessible at https://app.example.com
    - Browser: Chrome (latest version)"

   ✅ CORRECT (MOBILE):
   "- User account exists (Email: test@example.com, Password: Test@123)
    - Application is installed on the device (iOS/Android)
    - Device: Smartphone with internet connection"

   ✅ CORRECT (BOTH):
   "- User account exists (Email: test@example.com, Password: Test@123)
    - Application is accessible via web (https://app.example.com) or mobile app is installed
    - Device: Web browser (Chrome/Safari) or Smartphone (iOS/Android)"

   ❌ WRONG (too vague):
   "- User is logged in"

   ❌ WRONG (too detailed - should be in test steps):
   "- Navigate to login page
    - Enter username
    - Click login button..."

5. TEST STEPS FORMAT
   Write industry-standard steps (6-10 steps) covering the COMPLETE journey:

   ⚠️ CRITICAL: Use simple numbering format: 1. 2. 3. (NOT "Step 1:", "Step 2:")
   ⚠️ CRITICAL: First step MUST reflect the detected application type

   Format each step as:
   "[N]. [Action description with specific details and test data]"

   Example (WEB):
   "1. Open browser and navigate to application URL (https://app.example.com)
    2. On login page, enter credentials (Email: test@example.com, Password: Test@123) and click 'Login' button
    3. After successful login, click 'Profile' menu item in the navigation bar
    4. On Profile page, click 'Edit Profile' button to enable editing mode
    5. Update the following fields: First Name='John', Last Name='Doe', Phone='555-1234', Address='123 Main St'
    6. Click 'Save Changes' button at the bottom of the form
    7. Verify that a success message 'Profile updated successfully' is displayed
    8. Verify that all updated fields display the new values correctly on the profile page"

   Example (MOBILE):
   "1. Open application mobile app on the device
    2. On login screen, enter credentials (Email: test@example.com, Password: Test@123) and tap 'Login' button
    3. After successful login, tap 'Profile' icon in the bottom navigation bar
    4. On Profile screen, tap 'Edit Profile' button to enable editing mode
    5. Update the following fields: First Name='John', Last Name='Doe', Phone='555-1234'
    6. Tap 'Save Changes' button at the bottom of the screen
    7. Verify that a success message 'Profile updated successfully' is displayed
    8. Verify that all updated fields display the new values correctly on the profile screen"

6. TEST DATA FORMAT
   Provide clear test data that can be used during execution:

   Example:
   "Email: test@example.com | Password: Test@123 | First Name: John | Last Name: Doe | Phone: 555-1234"

7. EXPECTED RESULT FORMAT
   Describe the overall expected outcome clearly:

   "- User successfully updates profile information
    - Success message 'Profile updated successfully' is displayed
    - Updated information is visible on the profile page
    - All fields show the newly entered values"

8. CSV FORMAT SPECIFICATIONS
   - Use double quotes for all field values
   - Escape internal quotes by doubling them ("")
   - Use newline character within fields for multi-line content
   - Separate columns with commas
   - Include header row
   - Each test case = one CSV row

═══════════════════════════════════════════════════════════════════════════════
                              EXAMPLE CSV OUTPUT
═══════════════════════════════════════════════════════════════════════════════

"Test Case ID","Test Case Title","Test Type","Priority","Preconditions","Test Steps","Test Data","Expected Result"
"101001","User Login with Valid Credentials","Functional","High","- User account exists (Email: test@example.com, Password: Test@123)
- Application is accessible at https://app.example.com
- Browser: Chrome (latest version)","1. Open browser and navigate to application login page (https://app.example.com/login)
2. On the login page, enter valid email address (test@example.com) in the 'Email' field
3. Enter valid password (Test@123) in the 'Password' field
4. Click the 'Login' button to submit credentials
5. Wait for authentication to complete and page to redirect
6. Verify that user is redirected to the dashboard page
7. Verify that user's name is displayed in the navigation bar
8. Verify that logout option is available in the user menu","Email: test@example.com | Password: Test@123","- User successfully logs into the application
- User is redirected to dashboard page
- User's name appears in navigation bar
- All dashboard elements are loaded correctly"
"102001","Update User Profile Information","Functional","Medium","- User account exists (Email: test@example.com, Password: Test@123)
- User is logged into the application
- User is on the dashboard page","1. From the dashboard, click on 'Profile' or user avatar icon in the navigation menu
2. On the Profile page, click 'Edit Profile' button to enable editing mode
3. Update the following profile fields: First Name='John', Last Name='Doe', Phone='555-1234'
4. Optionally update additional fields like Address='123 Main St', City='New York'
5. Click 'Save Changes' button at the bottom of the profile form
6. Verify that a success message 'Profile updated successfully' is displayed at the top
7. Verify that all updated fields now display the new values on the profile page
8. Navigate away and return to Profile to confirm changes persisted","Email: test@example.com | Password: Test@123 | First Name: John | Last Name: Doe | Phone: 555-1234 | Address: 123 Main St | City: New York","- Profile information is updated successfully
- Success message is displayed
- Updated values are visible on profile page
- Changes persist after page refresh"

═══════════════════════════════════════════════════════════════════════════════
                              MANDATORY RULES SUMMARY
═══════════════════════════════════════════════════════════════════════════════

✅ ALWAYS DO:
  ✓ DETECT application type from user story (web/mobile/both/desktop)
  ✓ ADAPT first steps based on detected application type
  ✓ Use SIMPLIFIED Test Case ID format: [TICKET_NUMBER][SEQUENCE] (e.g., 101001, 102003)
  ✓ Extract ticket number from user story data
  ✓ Use simple numbering for steps: 1. 2. 3. (NOT "Step 1:", "Step 2:")
  ✓ Generate output in CSV format with proper escaping
  ✓ Start every test case from browser/app entry point (based on app type)
  ✓ Include login steps if authentication is required
  ✓ Use 6-10 industry-standard logical steps (not 20+ atomic steps)
  ✓ Include specific test data, URLs, field names, button labels
  ✓ Write for someone who has NEVER used the application
  ✓ Maintain EXACT same detail level for ALL test cases
  ✓ Make each test case completely standalone and executable
  ✓ Write clear, concise preconditions (2-4 bullet points)
  ✓ Include complete expected results
  ✓ Add Test Data column with pipe-separated values

❌ NEVER DO:
  ✗ Ignore application type detection
  ✗ Use generic "open application" without specifying web/mobile
  ✗ Use prefixes like "TC-" or "Step" in IDs or step numbers
  ✗ Skip initial navigation/login steps
  ✗ Abbreviate later test cases
  ✗ Use atomic steps (too granular)
  ✗ Write vague preconditions like "User is logged in"
  ✗ List 10 detailed steps as preconditions
  ✗ Assume any prior context
  ✗ Change format or structure between test cases
  ✗ Output in any format other than CSV
  ✗ Use complex Test Case ID formats with hyphens or prefixes

═══════════════════════════════════════════════════════════════════════════════
`;

/* ------------------ MCP SERVER ------------------ */
const server = new Server(
  {
    name: "mysql-story-mcp",
    version: "3.0.0",
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
          "Fetch all user stories from MySQL database to generate industry-standard manual test cases.\n\n" +
          "⚠️ CRITICAL: When this tool is called, you MUST:\n" +
          "1. DETECT application type from user stories (web/mobile/both/desktop)\n" +
          "2. Generate test cases in CSV format (MANDATORY)\n" +
          "3. Follow the COMPLETE industry-standard test case format\n" +
          "4. ADAPT initial steps based on detected application type\n" +
          "5. Maintain CONSISTENT structure across ALL test cases\n" +
          "6. Use 6-10 logical steps per test case (NOT atomic steps)\n" +
          "7. Make EVERY test case standalone and complete\n" +
          "8. Use SIMPLIFIED Test Case ID format: [TICKET_NUMBER][SEQUENCE] (e.g., 101001, 102001)\n" +
          "9. Use simple step numbering: 1. 2. 3. (NOT 'Step 1:', 'Step 2:')\n\n" +
          TEST_CASE_FORMAT_INSTRUCTIONS +
          "\n\n" +
          "After fetching stories, immediately generate test cases following the above format WITHOUT requiring additional prompts.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_story_by_ticket",
        description:
          "Fetch a single user story by ticket number to generate industry-standard manual test cases.\n\n" +
          "⚠️ CRITICAL: When this tool is called, you MUST:\n" +
          "1. DETECT application type from the user story (web/mobile/both/desktop)\n" +
          "2. Generate test case(s) in CSV format (MANDATORY)\n" +
          "3. Follow the EXACT SAME format as previously generated test cases\n" +
          "4. ADAPT initial steps based on detected application type\n" +
          "5. Maintain CONSISTENCY with existing test cases\n" +
          "6. Use 6-10 logical steps (NOT atomic steps)\n" +
          "7. Make the test case completely standalone\n" +
          "8. Use SIMPLIFIED Test Case ID format: [TICKET_NUMBER][SEQUENCE] (e.g., 101001)\n" +
          "9. Use simple step numbering: 1. 2. 3. (NOT 'Step 1:', 'Step 2:')\n\n" +
          TEST_CASE_FORMAT_INSTRUCTIONS +
          "\n\n" +
          "CONSISTENCY REQUIREMENT:\n" +
          "If test cases were previously generated for other stories, maintain the EXACT same:\n" +
          "- CSV structure and column format\n" +
          "- Test Case ID format (simple numeric format)\n" +
          "- Detail level in test steps\n" +
          "- Step numbering format (1. 2. 3.)\n" +
          "- Application type handling\n" +
          "- Precondition style\n" +
          "- Expected result format\n" +
          "- Priority and status conventions\n\n" +
          "After fetching the story, immediately generate test case(s) following the above format.",
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
          "Fetch related stories to understand dependencies and context for writing better preconditions.\n\n" +
          "Use this data to:\n" +
          "1. Identify prerequisite user stories\n" +
          "2. Understand feature dependencies\n" +
          "3. Write accurate, clear preconditions\n\n" +
          "PRECONDITION WRITING GUIDE:\n" +
          "✅ CORRECT (clear and concise):\n" +
          "  Preconditions:\n" +
          "  - User account exists (Email: test@example.com, Password: Test@123)\n" +
          "  - User is logged into the application\n" +
          "  - User has at least one post in their feed\n\n" +
          "❌ WRONG (too vague):\n" +
          "  - User is logged in\n\n" +
          "❌ WRONG (too detailed - these are test steps, not preconditions):\n" +
          "  - Open browser\n" +
          "  - Navigate to login page\n" +
          "  - Enter username and password\n" +
          "  - Click login button\n\n" +
          "Keep preconditions to 2-4 clear bullet points that describe the starting state.",
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
      const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME}`);
      console.error(`✅ Fetched ${rows.length} stories from ${TABLE_NAME}`);

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

      return {
        content: [
          {
            type: "text",
            text:
              "📊 USER STORIES DATA FOR TEST CASE GENERATION\n\n" +
              "⚠️ STEP 1: DETECT APPLICATION TYPE from each user story (web/mobile/both/desktop)\n" +
              "⚠️ STEP 2: GENERATE TEST CASES NOW using the format specified in tool description\n" +
              "⚠️ STEP 3: ADAPT first steps based on detected application type\n" +
              "⚠️ IMPORTANT: Use SIMPLIFIED Test Case ID format: [TICKET_NUMBER][SEQUENCE]\n" +
              "   Examples: 101001, 101002, 102001, 102002\n" +
              "⚠️ IMPORTANT: Use simple step numbering: 1. 2. 3. (NOT 'Step 1:', 'Step 2:')\n\n" +
              "Stories Data:\n" +
              JSON.stringify(rows, null, 2),
          },
        ],
      };
    }

    if (name === "get_story_by_ticket") {
      // Input validation
      if (!args.ticket_number || typeof args.ticket_number !== "string") {
        throw new Error("ticket_number is required and must be a string");
      }

      const [rows] = await pool.query(
        `SELECT * FROM ${TABLE_NAME} WHERE ticket_number = ?`,
        [args.ticket_number]
      );

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

      return {
        content: [
          {
            type: "text",
            text:
              "📊 USER STORY DATA FOR TEST CASE GENERATION\n\n" +
              "⚠️ STEP 1: DETECT APPLICATION TYPE from this user story (web/mobile/both/desktop)\n" +
              "⚠️ STEP 2: GENERATE TEST CASE(S) NOW using the EXACT SAME format as previously generated test cases\n" +
              "⚠️ STEP 3: ADAPT first steps based on detected application type\n" +
              "⚠️ MAINTAIN CONSISTENCY with existing test case structure, detail level, and style\n" +
              "⚠️ IMPORTANT: Use SIMPLIFIED Test Case ID format: [TICKET_NUMBER][SEQUENCE]\n" +
              "⚠️ IMPORTANT: Use simple step numbering: 1. 2. 3. (NOT 'Step 1:', 'Step 2:')\n\n" +
              "Story Data:\n" +
              JSON.stringify(rows, null, 2),
          },
        ],
      };
    }

    if (name === "get_related_stories") {
      // Input validation
      if (!args.exclude_ticket || typeof args.exclude_ticket !== "string") {
        throw new Error("exclude_ticket is required and must be a string");
      }

      const [rows] = await pool.query(
        `SELECT * FROM ${TABLE_NAME} WHERE ticket_number != ?`,
        [args.exclude_ticket]
      );

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

      return {
        content: [
          {
            type: "text",
            text:
              "📊 RELATED STORIES FOR CONTEXT\n\n" +
              "Use this data to understand dependencies and write clear preconditions.\n\n" +
              "Related Stories:\n" +
              JSON.stringify(rows, null, 2),
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
        `SELECT * FROM ${TABLE_NAME} WHERE title LIKE ? OR description LIKE ?`,
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
        `SELECT ticket_number FROM ${TABLE_NAME} WHERE ticket_number = ?`,
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

      const query = `INSERT INTO ${TABLE_NAME} (${fields.join(", ")}) VALUES (${placeholders.join(
        ", "
      )})`;
      const [result] = await pool.query(query, values);

      // Fetch the created story
      const [created] = await pool.query(
        `SELECT * FROM ${TABLE_NAME} WHERE ticket_number = ?`,
        [args.ticket_number]
      );

      console.error(`✅ Created story ${args.ticket_number} in ${TABLE_NAME}`);

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
        `SELECT ticket_number FROM ${TABLE_NAME} WHERE ticket_number = ?`,
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
      const query = `UPDATE ${TABLE_NAME} SET ${updates.join(", ")} WHERE ticket_number = ?`;
      await pool.query(query, values);

      // Fetch the updated story
      const [updated] = await pool.query(
        `SELECT * FROM ${TABLE_NAME} WHERE ticket_number = ?`,
        [args.ticket_number]
      );

      console.error(`✅ Updated story ${args.ticket_number} in ${TABLE_NAME}`);

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
      const [existing] = await pool.query(
        `SELECT * FROM ${TABLE_NAME} WHERE ticket_number = ?`,
        [args.ticket_number]
      );

      if (existing.length === 0) {
        throw new Error(`Story with ticket number ${args.ticket_number} not found`);
      }

      // Delete the story
      await pool.query(`DELETE FROM ${TABLE_NAME} WHERE ticket_number = ?`, [
        args.ticket_number,
      ]);

      console.error(`✅ Deleted story ${args.ticket_number} from ${TABLE_NAME}`);

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