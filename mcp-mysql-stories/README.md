# MySQL Stories MCP Server

A Model Context Protocol (MCP) server for managing user stories in a MySQL database. This server enables Claude to interact with your MySQL database to fetch, create, update, search, and delete user stories for **highly detailed** test case generation and project management.

## Features

- **Read Operations**: Fetch all stories, get by ticket number, search by keywords, get related stories
- **Write Operations**: Create new stories, update existing stories, delete stories
- **Detailed Test Case Generation**: Built-in prompting system that enforces granular, step-by-step test case creation
- **Robust Error Handling**: Comprehensive validation and error messages
- **Database Connection Pooling**: Efficient connection management with configurable pool settings
- **Graceful Shutdown**: Proper cleanup of database connections
- **Environment-Based Configuration**: Secure credential management via .env files

## Test Case Generation Philosophy

This MCP server follows **industry-standard QA practices** to generate professional manual test cases with **6-8 logical steps** per test case. This matches real-world testing standards used in production environments.

### What Makes Good Test Steps

**WRONG (Too Vague)**:
- "Update profile"
- "Login"
- "Enter valid data"

**ALSO WRONG (Too Granular - Creates 20-30 Steps)**:
- "Click Username field"
- "Type 'test@example.com'"
- "Click Password field"
- "Type password"
- "Click Login button"
(This creates unnecessarily long test cases)

**CORRECT (Industry Standard - 6-8 Grouped Steps with Specifics)**:
1. Login to application with valid credentials (Email: test@example.com, Password: Test@123)
2. Navigate to User Profile page from main menu
3. Click 'Edit Profile' button
4. Update the following fields: First Name='John', Last Name='Doe', Phone='123-456-7890'
5. Click 'Save Changes' button
6. Verify success message "Profile updated successfully" is displayed
7. Verify updated values are displayed correctly on profile page
8. Logout from application (if required)

## Prerequisites

- Node.js (v16 or higher)
- MySQL database server
- A MySQL database with a `stories` table

## Database Schema

Your `stories` table should have at least the following columns:

```sql
CREATE TABLE stories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50),
  priority VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Configure your database connection in `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=test_management
```

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL server host | localhost |
| `DB_PORT` | MySQL server port | 3306 |
| `DB_USER` | Database user | root |
| `DB_PASSWORD` | Database password | (required) |
| `DB_NAME` | Database name | test_management |

### Connection Pool Settings

The server uses connection pooling with the following defaults:
- `connectionLimit`: 10
- `waitForConnections`: true
- `queueLimit`: 0 (unlimited)

## Available Tools

### 1. get_all_stories
Fetches all user stories from the database for generating detailed manual test cases.

**Parameters**: None

**Special Features**:
- Enforces industry-standard 6-8 step test cases
- Provides examples of correct grouping and detail level
- Prevents both vague and overly-granular test steps

**Example Response**:
Returns formatting guidelines followed by story data:
```
📋 INDUSTRY-STANDARD TEST CASE FORMAT:
Generate test cases with 6-8 logical steps (NOT 20-30 atomic actions).

❌ AVOID (too vague): 'Update profile', 'Login'
❌ AVOID (too granular): 'Click field, Type text, Click next field, Type text...' (creates 30 steps)

✅ CORRECT (6-8 grouped steps with details):
  1. Login with credentials (Email: test@example.com, Password: Test@123)
  2. Navigate to Profile page
  3. Click Edit Profile button
  4. Update fields: First Name='John', Last Name='Doe'
  5. Click Save button
  6. Verify success message appears
  7. Verify profile shows updated data

Group related actions together. Include specific test data. Keep it industry-standard!

---STORIES DATA---

[Story JSON data]
```

### 2. get_story_by_ticket
Fetches a single user story by ticket number for generating highly detailed manual test cases.

**Parameters**:
- `ticket_number` (string, required): Unique ticket identifier (e.g., "TICKET-003")

**Special Features**:
- Includes comprehensive instructions for test case structure
- Provides mandatory format template
- Shows examples of correct granularity with specific UI element names
- Lists prohibited high-level phrases

**Example Request**:
```json
{
  "ticket_number": "TICKET-003"
}
```

**Example Response**:
Returns detailed instructions followed by story data:
```
📋 CRITICAL INSTRUCTION FOR TEST CASE GENERATION:
Generate test cases with HIGHLY DETAILED, GRANULAR steps. Each step must be a single UI action.

MANDATORY FORMAT:
Test Case: [Title]
Preconditions:
  - [Specific precondition with details]
  - [Another precondition]

Test Steps:
  1. [Single atomic action with specific UI element name]
  2. [Another single action]
  3. [Verification step with expected result]
  ...

Expected Results:
  - [Specific outcome]

EXAMPLES OF CORRECT GRANULARITY:
  ✅ 'Click the "Edit Profile" button located in the top-right corner'
  ✅ 'Locate the "First Name" text input field'
  ✅ 'Clear existing text in the "First Name" field'
  ✅ 'Type "John" in the "First Name" field'
  ✅ 'Verify the "First Name" field displays "John"'

PROHIBITED (too high-level):
  ❌ 'Update the profile'
  ❌ 'Enter valid data'
  ❌ 'Login to the system'

---STORY DATA---

[Story JSON data]
```

### 3. get_related_stories
Fetches all stories except the specified ticket for dependency analysis and creating detailed preconditions.

**Parameters**:
- `exclude_ticket` (string, required): Ticket number to exclude from results

**Special Features**:
- Provides instructions for using related stories in preconditions
- Shows how to expand prerequisite stories into detailed setup steps
- Maintains granularity in precondition steps

**Example Request**:
```json
{
  "exclude_ticket": "TICKET-003"
}
```

**Example Response**:
Returns guidance for using related stories followed by data:
```
📋 INSTRUCTION FOR USING RELATED STORIES:
Use these related stories to create DETAILED preconditions and setup steps.
When a related story describes a prerequisite action (like login), break it down into granular steps in your preconditions.

Example - If related story is about 'User Login', your preconditions should be:
  ✅ Preconditions:
     1. Open browser and navigate to login page
     2. Enter username in Username field
     3. Enter password in Password field
     4. Click Login button
     5. Verify successful login and redirection to dashboard

  ❌ NOT: 'Precondition: User is logged in'

---RELATED STORIES DATA---

[Related stories JSON data]
```

### 4. search_stories
Search for stories by keywords in title or description.

**Parameters**:
- `keyword` (string, required): Search term

**Example**:
```json
{
  "keyword": "login"
}
```

### 5. create_story
Creates a new user story in the database.

**Parameters**:
- `ticket_number` (string, required): Unique ticket identifier
- `title` (string, required): Story title
- `description` (string, optional): Detailed description
- `status` (string, optional): Story status (e.g., "To Do", "In Progress", "Done")
- `priority` (string, optional): Priority level (e.g., "High", "Medium", "Low")

**Example**:
```json
{
  "ticket_number": "TICKET-005",
  "title": "Password Reset Feature",
  "description": "As a user, I want to reset my password...",
  "status": "To Do",
  "priority": "Medium"
}
```

### 6. update_story
Updates an existing user story. Only provided fields will be updated.

**Parameters**:
- `ticket_number` (string, required): Ticket number of story to update
- `title` (string, optional): New title
- `description` (string, optional): New description
- `status` (string, optional): New status
- `priority` (string, optional): New priority

**Example**:
```json
{
  "ticket_number": "TICKET-005",
  "status": "In Progress",
  "priority": "High"
}
```

### 7. delete_story
Deletes a user story by ticket number. This operation is irreversible.

**Parameters**:
- `ticket_number` (string, required): Ticket number of story to delete

**Example**:
```json
{
  "ticket_number": "TICKET-005"
}
```

## Usage Examples

### Example: Generating Detailed Test Cases

Here's a typical workflow for generating detailed test cases:

**Step 1**: Fetch a story
```
Use the get_story_by_ticket tool with ticket_number "TICKET-005"
```

**Step 2**: The MCP returns the story with detailed instructions
```
📋 CRITICAL INSTRUCTION FOR TEST CASE GENERATION:
...
---STORY DATA---
{
  "ticket_number": "TICKET-005",
  "title": "User Profile Update",
  "description": "As a user, I want to update my profile information..."
}
```

**Step 3**: Ask Claude to generate test cases
```
"Generate detailed test cases for this story"
```

**Step 4**: Claude generates industry-standard test cases following the 6-8 step guideline
```
Test Case ID: TC-PROFILE-001
Test Case Title: Update User Profile with Valid Data

Preconditions:
  - User account exists (Email: testuser@example.com, Password: Test@1234)
  - User is logged out
  - Application is accessible at https://app.example.com

Test Steps:
  1. Login to application with valid credentials (Email: testuser@example.com, Password: Test@1234)
  2. Navigate to User Profile page from the main menu
  3. Click 'Edit Profile' button to enable editing mode
  4. Update the following fields with valid data:
     - First Name: 'John'
     - Last Name: 'Doe'
     - Phone Number: '123-456-7890'
     - Address: '123 Main St, City, State 12345'
  5. Click 'Save Changes' button to submit the form
  6. Verify success message "Profile updated successfully" is displayed
  7. Verify all updated fields display the new values correctly on the profile page
  8. Logout from the application

Expected Result:
  - User successfully updates profile information
  - All changes are saved to the database
  - Updated values are displayed correctly
  - Success confirmation message appears
  - User can logout successfully

Test Data:
  - Email: testuser@example.com
  - Password: Test@1234
  - First Name: John
  - Last Name: Doe
  - Phone: 123-456-7890
  - Address: 123 Main St, City, State 12345
```

Notice: 8 logical steps, grouped actions, specific test data - this is industry-standard!

### Running the Server

Start the server with:
```bash
node index.js
```

The server will:
1. Load environment variables from `.env`
2. Test the database connection
3. Connect to the MCP transport layer
4. Start listening for tool requests

### Using with Claude Desktop

Add the server to your Claude Desktop configuration file:

**macOS/Linux**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mysql-stories": {
      "command": "node",
      "args": [
        "C:\\Users\\Hp\\Desktop\\CLaudeMCP\\mcp-mysql-stories\\index.js"
      ]
    }
  }
}
```

Restart Claude Desktop after updating the configuration.

### Development Mode

For development with auto-reload:
```bash
npx nodemon index.js
```

## Error Handling

The server includes comprehensive error handling:

- **Input Validation**: All required parameters are validated
- **Database Errors**: Connection issues and query errors are caught and reported
- **Duplicate Prevention**: Creating stories with existing ticket numbers is prevented
- **Not Found Handling**: Graceful handling when stories don't exist
- **Graceful Shutdown**: Database connections are properly closed on server termination

## Logging

The server logs important events to stderr:
- Database connection status
- Tool invocations and results
- Errors and warnings
- Shutdown events

## Security Considerations

1. **Environment Variables**: Never commit `.env` files with credentials
2. **SQL Injection Protection**: All queries use parameterized statements
3. **Connection Pooling**: Prevents connection exhaustion
4. **Input Validation**: All user inputs are validated before processing

## Troubleshooting

### Connection Failed
- Verify database credentials in `.env`
- Ensure MySQL server is running
- Check firewall settings
- Verify database name exists

### Tool Not Found
- Ensure the server is properly registered in Claude Desktop config
- Restart Claude Desktop after configuration changes
- Check server logs for startup errors

### Story Not Found
- Verify the ticket number exists in the database
- Check for typos in ticket number
- Use `get_all_stories` to list available tickets

## Version

Current version: 1.0.0

## License

MIT

## Support

For issues or questions, please check:
- MCP Documentation: https://modelcontextprotocol.io
- Claude Code Documentation: https://github.com/anthropics/claude-code
