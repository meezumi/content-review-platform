# Collaborative Content Review and Approval Platform

![alt text](brave_screenshot_localhost.png)
![alt text](<Screenshot From 2025-10-10 17-19-58.png>)

## Project Overview

This is a full-stack web application designed to streamline the content review and approval process for teams. It provides a centralized platform where users can upload documents, images, and videos, and stakeholders can provide feedback through real-time comments and formal approvals. The goal of this project is to eliminate the confusion of email chains and fragmented feedback, creating a single source of truth for creative and marketing workflows.

This project serves as a powerful portfolio piece, demonstrating expertise in full-stack development, real-time technologies, and building applications that solve tangible business problems.

### Real-World Use Case

In many organizations, the process for reviewing and approving content (like marketing materials, design mockups, or legal documents) is inefficient. Feedback is often scattered across lengthy email threads, Slack messages, and multiple file versions, leading to confusion, missed feedback, and delays.

This platform solves this by providing:
*   A **centralized hub** for all content under review.
*   **Real-time commenting**, allowing for interactive feedback sessions.
*   **Version control** to track changes and revisions.
*   **Structured approval workflows** to ensure the right people sign off in the right order.

---

## Tech Stack

The technology stack is chosen to reflect modern, in-demand skills in the software industry.

*   **Frontend:**
    *   **Framework:** React.js
    *   **State Management:** Redux Toolkit
    *   **Real-time Communication:** Socket.IO Client
    *   **UI Library:** Material-UI (MUI)
    *   **Styling:** Emotion

*   **Backend:**
    *   **Framework:** Node.js with Express.js
    *   **Real-time Communication:** Socket.IO
    *   **Database:** MongoDB with Mongoose ODM
    *   **File Storage:** (Planned) AWS S3 or Google Cloud Storage

*   **Deployment & DevOps:**
    *   **Containerization:** Docker & Docker Compose
    *   **Deployment:** In Testing phase

---

## Key Features

*   **Real-time Collaboration:** Multiple users can comment on a document simultaneously, with all changes broadcast instantly.
*   **User Authentication:** Secure user registration and login.
*   **File Uploads:** Users can upload various file types for review.
*   **Version History:** Track and compare different versions of a file.
*   **Multi-step Approval Workflows:** Define custom approval chains for different types of content.
*   **Notifications:** In-app and email notifications for comments and status changes.

---

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [Docker](https://www.docker.com/products/docker-desktop/) and [Docker Compose](https://docs.docker.com/compose/install/)

### Installation and Running the Application

This project is fully containerized, making it easy to set up and run with a single command.

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd content-review-platform
    ```

2.  **Build and run the containers using Docker Compose:**
    From the root directory (`content-review-platform`), run the following command:
    ```bash
    docker-compose up --build
    ```
    This command will:
    *   Build the Docker images for the `client`, `server`, and `mongo` services.
    *   Start the containers in the correct order.
    *   Set up networking between the containers.

3.  **Access the application:**
    *   The **Frontend** will be available at [http://localhost:3000](http://localhost:3000)
    *   The **Backend** server will be running on port `5000`.
    *   The **MongoDB** database will be accessible on port `27017`.

## Recent Updates (Oct 2025)

### ✨ Major UI/UX Overhaul
*   **Modern Glassmorphism Design**: Complete redesign with blurred transparent backgrounds and gradient accents
*   **Responsive Navigation**: Sticky navigation bar with scroll effects and mobile support
*   **Landing Page**: Professional landing page with feature showcase and pricing sections
*   **Enhanced Authentication**: Improved login/register forms with password strength indicators
*   **Dashboard Redesign**: Stats cards, enhanced upload interface, and animated document cards
*   **Professional Footer**: Complete footer with links, social media, and company information

### Known Issues & Roadmap (Updated Oct 8, 2025)

#### 🐛 Critical Bugs
*   **PDF Viewer Layout**: Excessive white space in PDF viewer when document is short
*   **Comment Persistence**: Pinned comments carry over to new document versions (should be version-specific)
*   **Upload Redirect Bug**: User gets logged out and redirected to white screen after uploading new version
*   **Layout Efficiency**: Contextual and general comments stacked vertically instead of horizontal layout

#### 🚀 Priority Enhancements
*   **Zoom Controls**: Add zoom in/out functionality for PDF and image documents
*   **UI Consistency**: Update remaining components (ReviewPage, Analytics) to match new design system
*   **Mobile Optimization**: Improve mobile experience for document viewing
*   **Performance**: Optimize large document loading and rendering

#### 📋 Future Features
*   **Real-time Cursors**: Show other users' cursors during collaborative editing
*   **Advanced Annotations**: Text highlighting, shapes, and drawing tools
*   **Keyboard Shortcuts**: Power user shortcuts for common actions
*   **Dark/Light Mode**: Theme switching capability
