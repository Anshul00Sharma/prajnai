-- Create custom enum type for upload types
CREATE TYPE upload_type AS ENUM ('text', 'pdf', 'web-link');

-- Create tables with timestamps and relationships
CREATE TABLE IF NOT EXISTS topic (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject_id TEXT,
    additional_info TEXT,
    notion_page_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS upload (
    id TEXT PRIMARY KEY,
    type upload_type NOT NULL,
    content TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    subject_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subject (
    id TEXT PRIMARY KEY,
    upload_id TEXT REFERENCES upload(id),
    topic_id TEXT REFERENCES topic(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    subject_id TEXT REFERENCES subject(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints
ALTER TABLE topic
ADD CONSTRAINT fk_topic_subject
FOREIGN KEY (subject_id) REFERENCES subject(id);

ALTER TABLE upload
ADD CONSTRAINT fk_upload_subject
FOREIGN KEY (subject_id) REFERENCES subject(id);

-- Create indexes for foreign keys to improve query performance
CREATE INDEX idx_topic_subject_id ON topic(subject_id);
CREATE INDEX idx_upload_subject_id ON upload(subject_id);
CREATE INDEX idx_subject_upload_id ON subject(upload_id);
CREATE INDEX idx_subject_topic_id ON subject(topic_id);
CREATE INDEX idx_users_subject_id ON users(subject_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at timestamp
CREATE TRIGGER update_topic_updated_at
    BEFORE UPDATE ON topic
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_upload_updated_at
    BEFORE UPDATE ON upload
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subject_updated_at
    BEFORE UPDATE ON subject
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
