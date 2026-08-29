CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL
);

CREATE TABLE subject (
    subject_id SERIAL PRIMARY KEY,
    subject_code VARCHAR(50) NOT NULL,
    subject_name VARCHAR(255) NOT NULL
);

CREATE TABLE admin (
    admin_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(user_id)
);

CREATE TABLE faculty (
    faculty_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(user_id),
    subject_id INTEGER NOT NULL REFERENCES subject(subject_id),
    name VARCHAR(255) NOT NULL,
    is_coordinator BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE team (
    team_id SERIAL PRIMARY KEY,
    team_code VARCHAR(50) NOT NULL,
    subject_id INTEGER NOT NULL REFERENCES subject(subject_id),
    guide_id INTEGER NOT NULL REFERENCES faculty(faculty_id)
);

CREATE TABLE student (
    student_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(user_id),
    team_id INTEGER NOT NULL REFERENCES team(team_id),
    usn VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE task (
    task_id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL REFERENCES faculty(faculty_id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(20) NOT NULL,
    deadline TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evaluation_criteria (
    criteria_id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES task(task_id),
    criteria_name VARCHAR(255) NOT NULL,
    max_marks INTEGER NOT NULL
);

CREATE TABLE submission (
    submission_id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES task(task_id),
    submitted_by_student_id INTEGER NOT NULL REFERENCES student(student_id),
    team_id INTEGER NOT NULL REFERENCES team(team_id),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evaluation (
    evaluation_id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL REFERENCES submission(submission_id),
    student_id INTEGER NOT NULL REFERENCES student(student_id),
    criteria_id INTEGER NOT NULL REFERENCES evaluation_criteria(criteria_id),
    evaluator_id INTEGER NOT NULL REFERENCES faculty(faculty_id),
    awarded_marks INTEGER NOT NULL,
    feedback TEXT,
    evaluated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE message (
    message_id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(user_id),
    receiver_id INTEGER NOT NULL REFERENCES users(user_id),
    message_text TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE audit_log (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INTEGER,
    details TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);