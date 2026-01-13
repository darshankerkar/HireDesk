# HireDesk

HireDesk is a modern and easy-to-use job and hiring management platform. It helps recruiters post job openings and manage applications, while job seekers can explore opportunities and track their application status seamlessly.

---

## Overview

HireDesk simplifies the recruitment process for both recruiters and applicants.
* **Recruiters** can manage job postings and review applications efficiently.
* **Applicants** can apply to jobs and monitor their progress in real time.
The platform aims to make hiring transparent, organized, and accessible.

---

## Features

- **User Authentication** – Secure login for recruiters and applicants via JWT.
- **Job Posting & Management** – Recruiters can create, update, and manage job listings.
- **Job Application System** – Applicants can apply and track application status.
- **Status Tracking** – View application progress (Applied, Shortlisted, Rejected).
- **Responsive UI** – Works smoothly across desktop and mobile devices.
- **Database Integration** – Secure storage of jobs and application data using PostgreSQL.

---

## Tech Stack

- **Frontend:** React + Vite
- **UI Styling:** Tailwind CSS + Bootstrap
- **Backend:** Django + Django REST Framework
- **Database:** PostgreSQL (Neon)
- **Authentication:** JWT-based Authentication
- **Deployment:** Vercel (Frontend)

---

## Installation & Setup

```bash
# Clone the repository
git clone [https://github.com/](https://github.com/)<your-username>/hiredesk.git
cd hiredesk

# --- Frontend Setup ---
npm install
npm run dev # Runs at http://localhost:5173

# --- Backend Setup ---
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver # Runs at [http://127.0.0.1:8000](http://127.0.0.1:8000)
```

---

## User Guidelines

* **Sign Up / Log In** – Create an account as a recruiter or applicant.
* **Browse Jobs** – Explore available job opportunities.
* **Post or Apply** – Recruiters post jobs; applicants apply to relevant roles.
* **Track Status** – Monitor application progress in real time.
* **Manage Listings** – Recruiters can review and manage applications easily.

---

## Future Enhancements

- [ ] Advanced job filtering and search.
- [ ] Recruiter analytics dashboard.
- [ ] Email notifications for application updates.
- [ ] Role-based access control (RBAC).
- [ ] Resume upload and management.

---

## Contributing

Contributions are welcome! Follow these steps to contribute:

1.  **Fork the Repository** to your own account.
2.  **Clone Your Fork**:  
    `git clone https://github.com/<your-username>/hiredesk.git`
3.  **Create a New Branch**:  
    `git checkout -b feature/your-feature-name`
4.  **Commit & Push**:
    ```bash
    git add .
    git commit -m "Brief description of changes"
    git push origin feature/your-feature-name
    ```
5.  **Submit a Pull Request** via GitHub.

---

## 🔗 Live Preview

[ View Live Project](https://hiredesk.vercel.app)
