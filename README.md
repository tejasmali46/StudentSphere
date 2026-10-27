# StudentSphere

**StudentSphere – Student Registration & Management System**

**Student Details**
- **PRN:** 202401040083
- **Name:** Tejas Mali

A polished, responsive web application built with **HTML5, CSS3, and vanilla JavaScript** that demonstrates:
- CRUD operations on an in‑memory array of student objects.
- Validation with eight+ rules and clear field‑specific error messages.
- Dynamic dashboard statistics (total students, per‑department counts).
- Live search/filtering.
- Optional persistence using `localStorage` (JSON.stringify / JSON.parse).
- Fully responsive layout using CSS Grid/Flexbox.

---

## Project Structure
```
StudentSphere/
├─ index.html
├─ README.md
├─ css/
│   └─ style.css
└─ js/
    └─ script.js
```

## How to Run
1. Open the folder `StudentSphere` in File Explorer.
2. Double‑click **index.html** or open it in any modern browser (Chrome, Edge, Firefox, Safari).
3. The application loads instantly – no server or build step is required.

## Features Overview
- **Dashboard** – shows total students and department counts.
- **Registration Form** – collect name, PRN, email, mobile, department, year, DOB.
- **Student Table** – edit/delete actions, empty‑state message.
- **Search Bar** – filter by name, PRN, email, department.
- **Validation** – eight rules (name, PRN format & uniqueness, email, mobile, department, year, DOB, etc.) with inline error messages.
- **Persistence** – data saved to `localStorage`; survives page reloads.

## Testing Checklist
A full checklist is provided in the PDF report (see `PRN_Name_P2_Report.pdf`). The key scenarios include:
- Submitting an empty form.
- Each individual validation rule (invalid name, duplicate PRN, future DOB, etc.).
- Successful registration.
- Editing and deleting records.
- Searching with and without results.
- Reloading the page and verifying data persistence.
- Dashboard updates after each CRUD operation.

## Next Steps
1. **Open the app** and explore the UI.
2. Use the form to add a few sample students – observe validation messages.
3. Edit and delete entries to confirm CRUD works.
4. Try the search bar.
5. Refresh the page; the students you added should remain (localStorage).
6. When ready, capture screenshots for the PDF report and package the folder into a ZIP named `PRN_Name_P2_Title.zip` (replace placeholders with your actual PRN and name).

---

*Feel free to modify colors, add extra statistics, or enhance the UI – just keep the core requirements intact.*