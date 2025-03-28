# Backend Technical Specification

## API Development Guidelines

### Directory Structure

- All API endpoints will be implemented in the `src/app/api` directory
- Following Next.js API route conventions for file-based routing

### API Implementation Standards

1. **Input Validation**

   - All request inputs must be validated using Zod schema validation
   - Schema definitions should be maintained separately for reusability
   - Validation errors should return appropriate HTTP status codes and error messages

2. **Next.js API Conventions**
   - APIs should be implemented using Next.js Route Handlers
   - Use appropriate HTTP methods (GET, POST, PUT, DELETE)
   - Follow the file-based routing pattern of Next.js
   - Implement proper error handling and status codes

---

# Database Table Specification

### upload table

- `id` (text): Primary key
- `type` (enum): ["text", "pdf", "web-link"]
- `content` (text)
- `title` (text)
- `description` (text)
- `subject_id` (text): Reference to subject
- `created_at` (datetime): Creation timestamp
- `updated_at` (datetime): Last update timestamp

### subject table

- `id` (text): Primary key
- `name` (text)
- `upload_id` (text): Reference to upload
- `topic_id` (text): Reference to topic
- `user_id` (text): Reference to user
- `created_at` (datetime): Creation timestamp
- `updated_at` (datetime): Last update timestamp

### users table

- `id` (text): Primary key
- `subject_id` (text): Reference to subject
- `created_at` (datetime): Creation timestamp
- `updated_at` (datetime): Last update timestamp

### topic table

- `id` (text): Primary key
- `title` (text)
- `subject_id` (text): Reference to subject
- `additional_info` (text)
- `note` (jsonb): JSON data
- `created_at` (datetime): Creation timestamp
- `updated_at` (datetime): Last update timestamp

### exam table

- `id` (uuid): Unique identifier for the exam
- `created_at` (timestamptz): Timestamp when the exam was created
- `title` (text): Title of the exam
- `additionalInfo` (text): Additional information about the exam
- `feedback` (text): Feedback for the exam
- `true_false` (jsonb): JSON data for true/false questions
- `short_answer` (jsonb): JSON data for short answer questions
- `mcq` (jsonb): JSON data for multiple-choice questions
- `subject_id` (text): Identifier for the subject
- `user_id` (uuid): Identifier for the user who created the exam
- `shortAnswerCount` (int8): Number of short answer questions
- `mcqCount` (int8): Number of multiple-choice questions
- `trueFalseCount` (int8): Number of true/false questions
- `topics` (jsonb): JSON data for exam topics
- `exam_ready` (bool): Indicates if the exam is ready for use

### ai-chat-message table

- `id` (uuid): Unique identifier for the chat message
- `created_at` (timestamptz): Timestamp when the message was created
- `by` (text): Sender of the message ("user" or "ai")
- `content` (text): Content of the message
- `note-id` (text): Reference to associated topic table
- `subject-id` (text): Reference to associated subject
- `timestamp` (timestamptz): Timestamp for the message

## Relationships

1. user to subject (One-to-Many)
2. subject to upload (One-to-Many)
3. subject to topic (One-to-Many)

# API Endpoints

## User Endpoints

### POST /api/user

Create a new user

**Request Body:**

```json
{
  "id": "string"
}
```

**Response (201):**

```json
{
  "id": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### GET /api/user/{id}

Get user by ID

**Response (200):**

```json
{
  "id": "string",
  "subject_id": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## subject Endpoints

### POST /api/subject

Create a new subject

**Request Body:**

```json
{
  "user_id": "string",
  "id": "string"
}
```

**Response (201):**

```json
{
  "id": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### GET /api/subject/{user_id}

Get subjects by user ID

**Response (200):**

```json
[
  {
    "id": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

### PUT /api/subject/{id}

Update a subject by ID

**Request Body:**

```json
{
  "name": "string"
}
```

**Response (200):**

```json
{
  "id": "string",
  "name": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## Upload Endpoints

### POST /api/upload

Create a new upload

**Request Body:**

```json
{
  "id": "string",
  "type": "string",
  "content": "string",
  "title": "string",
  "description": "string",
  "subject_id": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Response (201):**

```json
{
  "id": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### GET /api/upload/subject/{subject_id}

Get all uploads for a subject by ID

**Response (200):**

```json
[
  {
    "id": "string",
    "type": "string",
    "content": "string",
    "title": "string",
    "description": "string",
    "subject_id": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

### DELETE /api/upload/{id}

Delete an upload by ID

**Response (204):**

```json
{
  "message": "Upload deleted successfully"
}
```

### GET /api/upload/subject/{subject_id}

Get number of uploads for a subject by ID

**Response (200):**

```json
{
  "count": "number"
}
```
