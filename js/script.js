/**
 * StudentSphere — Interactive Student Registration & Management System
 * Subject: Web Technology (2304362L) — Practical 2
 * Author: Tejas Mali (PRN: 202401040083)
 * Department: Computer Engineering, MIT Academy of Engineering, Pune
 */

// ================= GLOBAL STATE =================
const STORAGE_KEY = "studentsphere_records_v1";
let students = [];
let isEditing = false;
let currentEditingId = null;

// Initial sample data if storage is empty
const INITIAL_SAMPLE_STUDENTS = [
    {
        id: "rec_202401040083",
        name: "Tejas Mali",
        prn: "202401040083",
        email: "tejas.mali@mitaoe.ac.in",
        mobile: "9823456789",
        department: "Computer Engineering",
        year: "Third Year",
        dob: "2004-05-18"
    },
    {
        id: "rec_202401040012",
        name: "Aditi Deshmukh",
        prn: "202401040012",
        email: "aditi.deshmukh@mitaoe.ac.in",
        mobile: "9123456780",
        department: "Information Technology",
        year: "Third Year",
        dob: "2004-09-12"
    },
    {
        id: "rec_202301020045",
        name: "Rohan Patil",
        prn: "202301020045",
        email: "rohan.patil@mitaoe.ac.in",
        mobile: "8899776655",
        department: "Mechanical Engineering",
        year: "Final Year",
        dob: "2003-11-25"
    }
];

// ================= DOM ELEMENT REFERENCES =================
const form = document.getElementById("studentForm");
const nameInput = document.getElementById("name");
const prnInput = document.getElementById("prn");
const emailInput = document.getElementById("email");
const mobileInput = document.getElementById("mobile");
const departmentInput = document.getElementById("department");
const yearInput = document.getElementById("year");
const dobInput = document.getElementById("dob");

const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const resetBtn = document.getElementById("resetBtn");
const formHeading = document.getElementById("formHeading");
const formModeBadge = document.getElementById("formModeBadge");

const studentsTbody = document.getElementById("studentsTbody");
const emptyState = document.getElementById("emptyState");
const emptyStateText = document.getElementById("emptyStateText");
const searchInput = document.getElementById("searchInput");
const recordsCounter = document.getElementById("recordsCounter");

const totalStudentsEl = document.getElementById("totalStudents");
const deptCountNumberEl = document.getElementById("deptCountNumber");
const thirdYearCountEl = document.getElementById("thirdYearCount");
const deptPillsEl = document.getElementById("deptPills");
const toastEl = document.getElementById("toastNotification");

const loadSampleDataBtn = document.getElementById("loadSampleDataBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

// ================= INITIALIZATION =================
document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

function initializeApp() {
    loadStudents();
    attachEventListeners();
    updateDashboard();
    renderStudents();
}

// ================= DATA PERSISTENCE (JSON & LOCALSTORAGE) =================
/**
 * Loads student records from localStorage.
 * Handles missing, empty, or malformed data safely.
 */
function loadStudents() {
    try {
        const rawData = localStorage.getItem(STORAGE_KEY);
        if (rawData) {
            const parsed = JSON.parse(rawData);
            if (Array.isArray(parsed)) {
                // Verify structure of stored records
                students = parsed.filter(item => 
                    item && item.id && item.prn && item.name && item.email && item.mobile && item.department && item.year
                );
            } else {
                students = [...INITIAL_SAMPLE_STUDENTS];
                saveStudents();
            }
        } else {
            // First run: preload sample records for seamless preview
            students = [...INITIAL_SAMPLE_STUDENTS];
            saveStudents();
        }
    } catch (error) {
        console.error("Error reading localStorage, resetting to defaults:", error);
        students = [...INITIAL_SAMPLE_STUDENTS];
        saveStudents();
    }
}

/**
 * Saves current array of student objects to localStorage via JSON serialization.
 */
function saveStudents() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch (error) {
        showToast("Storage quota exceeded or error writing data.", "error");
    }
}

// ================= VALIDATION LOGIC =================
/**
 * Rigorously validates a student record object across 10 rules.
 * @param {Object} data - Student form data.
 * @param {boolean} isEdit - Whether currently editing an existing record.
 * @param {string|null} editingId - ID of record being edited.
 * @returns {Object} { isValid: boolean, errors: Object }
 */
function validateStudent(data, isEdit = false, editingId = null) {
    const errors = {};

    // Regular Expression definitions
    const nameRegex = /^[A-Za-z\s'.-]{2,50}$/;
    const prnRegex = /^[0-9]{7,12}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const mobileRegex = /^[6-9][0-9]{9}$/;

    // Rule 1 & 2: Name Validation
    if (!data.name || data.name.trim() === "") {
        errors.name = "Full name is required.";
    } else if (data.name.trim().length < 2 || data.name.trim().length > 50) {
        errors.name = "Name must be between 2 and 50 characters.";
    } else if (!nameRegex.test(data.name.trim())) {
        errors.name = "Name can only contain alphabets, spaces, dots, or hyphens.";
    }

    // Rule 3, 4 & 5: PRN Validation (Format & Uniqueness)
    if (!data.prn || data.prn.trim() === "") {
        errors.prn = "PRN / Student ID is required.";
    } else if (!prnRegex.test(data.prn.trim())) {
        errors.prn = "PRN must be 7 to 12 numeric digits.";
    } else {
        // Check uniqueness against existing array of student objects
        const trimmedPrn = data.prn.trim();
        const duplicate = students.find(s => s.prn === trimmedPrn && (!isEdit || s.id !== editingId));
        if (duplicate) {
            errors.prn = `PRN "${trimmedPrn}" already registered under ${duplicate.name}.`;
        }
    }

    // Rule 6: Email Validation
    if (!data.email || data.email.trim() === "") {
        errors.email = "Email address is required.";
    } else if (!emailRegex.test(data.email.trim())) {
        errors.email = "Please enter a valid email format (e.g., student@domain.com).";
    }

    // Rule 7: Mobile Number Validation (Indian Format)
    if (!data.mobile || data.mobile.trim() === "") {
        errors.mobile = "Mobile number is required.";
    } else if (!mobileRegex.test(data.mobile.trim())) {
        errors.mobile = "Must be a valid 10-digit Indian number starting with 6, 7, 8, or 9.";
    }

    // Rule 8: Department Selection Validation
    if (!data.department || data.department === "") {
        errors.department = "Please select an academic department.";
    }

    // Rule 9: Year of Study Selection Validation
    if (!data.year || data.year === "") {
        errors.year = "Please select the academic year of study.";
    }

    // Rule 10: Date of Birth Validation
    if (!data.dob) {
        errors.dob = "Date of birth is required.";
    } else {
        const selectedDate = new Date(data.dob);
        const today = new Date();
        if (isNaN(selectedDate.getTime())) {
            errors.dob = "Invalid date format.";
        } else if (selectedDate > today) {
            errors.dob = "Date of birth cannot be in the future.";
        } else {
            // Check reasonable student age (at least 15 years old)
            const minAgeDate = new Date();
            minAgeDate.setFullYear(today.getFullYear() - 15);
            if (selectedDate > minAgeDate) {
                errors.dob = "Student must be at least 15 years old.";
            }
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

// ================= UI ERROR DISPLAY HELPERS =================
function showFieldError(fieldId, message) {
    const errorEl = document.getElementById(`error-${fieldId}`);
    const inputEl = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = message;
    if (inputEl) inputEl.classList.add("input-error");
}

function clearFieldError(fieldId) {
    const errorEl = document.getElementById(`error-${fieldId}`);
    const inputEl = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = "";
    if (inputEl) inputEl.classList.remove("input-error");
}

function clearAllErrors() {
    ["name", "prn", "email", "mobile", "department", "year", "dob"].forEach(field => {
        clearFieldError(field);
    });
}

// ================= CRUD OPERATIONS =================
/**
 * CREATE: Add new student record.
 */
function addStudent(studentData) {
    const newStudent = {
        id: "rec_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        name: studentData.name.trim(),
        prn: studentData.prn.trim(),
        email: studentData.email.trim().toLowerCase(),
        mobile: studentData.mobile.trim(),
        department: studentData.department,
        year: studentData.year,
        dob: studentData.dob
    };

    students.unshift(newStudent); // Place newest at top
    saveStudents();
    updateDashboard();
    renderStudents();
    resetForm();
    showToast(`Student "${newStudent.name}" registered successfully!`, "success");
}

/**
 * UPDATE: Modify existing student record.
 */
function updateStudent(id, studentData) {
    const index = students.findIndex(s => s.id === id);
    if (index === -1) {
        showToast("Error: Record not found.", "error");
        return;
    }

    students[index] = {
        ...students[index],
        name: studentData.name.trim(),
        prn: studentData.prn.trim(),
        email: studentData.email.trim().toLowerCase(),
        mobile: studentData.mobile.trim(),
        department: studentData.department,
        year: studentData.year,
        dob: studentData.dob
    };

    saveStudents();
    updateDashboard();
    renderStudents();
    resetForm();
    showToast(`Record for "${students[index].name}" updated successfully!`, "success");
}

/**
 * DELETE: Remove student record with explicit user confirmation.
 */
function deleteStudent(id) {
    const target = students.find(s => s.id === id);
    if (!target) return;

    const confirmed = confirm(`Are you sure you want to delete student: \n\nName: ${target.name}\nPRN: ${target.prn}\nDepartment: ${target.department}\n\nThis action cannot be undone.`);
    if (confirmed) {
        // If currently editing this record, reset form
        if (isEditing && currentEditingId === id) {
            resetForm();
        }

        students = students.filter(s => s.id !== id);
        saveStudents();
        updateDashboard();
        renderStudents();
        showToast(`Record for "${target.name}" has been deleted.`, "info");
    }
}

/**
 * EDIT TRIGGER: Populates the form with existing record data.
 */
function startEditStudent(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;

    isEditing = true;
    currentEditingId = id;

    // Populate inputs
    nameInput.value = student.name;
    prnInput.value = student.prn;
    emailInput.value = student.email;
    mobileInput.value = student.mobile;
    departmentInput.value = student.department;
    yearInput.value = student.year;
    dobInput.value = student.dob;

    // Adjust UI state
    formHeading.textContent = "Edit Student Record";
    formModeBadge.textContent = "Editing Mode";
    formModeBadge.className = "mode-badge edit-mode";
    submitBtn.textContent = "Update Student Record";
    cancelEditBtn.classList.remove("hidden");

    clearAllErrors();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function cancelEdit() {
    resetForm();
    showToast("Edit mode cancelled.", "info");
}

function resetForm() {
    form.reset();
    isEditing = false;
    currentEditingId = null;
    clearAllErrors();

    formHeading.textContent = "Register New Student";
    formModeBadge.textContent = "New Entry";
    formModeBadge.className = "mode-badge create-mode";
    submitBtn.textContent = "Save Student Record";
    cancelEditBtn.classList.add("hidden");
}

// ================= RENDERING & DOM MANIPULATION =================
/**
 * Renders records into the HTML table dynamically.
 * Uses safe DOM escaping to mitigate cross-site scripting (XSS).
 */
function renderStudents(recordsToDisplay = null) {
    const data = recordsToDisplay !== null ? recordsToDisplay : students;
    studentsTbody.innerHTML = "";

    recordsCounter.textContent = `Showing ${data.length} of ${students.length} records`;

    if (data.length === 0) {
        emptyState.style.display = "block";
        if (students.length === 0) {
            emptyStateText.textContent = "No students registered yet. Fill out the form or click 'Load Sample Records' to populate.";
        } else {
            emptyStateText.textContent = "No student records match your search criteria.";
        }
        return;
    }

    emptyState.style.display = "none";

    data.forEach(student => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td class="td-prn">${escapeHTML(student.prn)}</td>
            <td class="td-name">${escapeHTML(student.name)}</td>
            <td><a href="mailto:${escapeHTML(student.email)}" style="color: #2563eb; text-decoration: none;">${escapeHTML(student.email)}</a></td>
            <td>${escapeHTML(student.mobile)}</td>
            <td><span class="td-badge badge-dept">${escapeHTML(student.department)}</span></td>
            <td><span class="td-badge badge-year">${escapeHTML(student.year)}</span></td>
            <td class="actions-cell">
                <button type="button" class="action-btn action-edit" data-id="${student.id}" title="Edit Record">Edit</button>
                <button type="button" class="action-btn action-delete" data-id="${student.id}" title="Delete Record">Delete</button>
            </td>
        `;

        studentsTbody.appendChild(tr);
    });
}

/**
 * XSS prevention: Escapes unsafe HTML characters.
 */
function escapeHTML(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ================= DASHBOARD ANALYTICS CALCULATION =================
function updateDashboard() {
    totalStudentsEl.textContent = students.length;

    // Unique departments
    const deptMap = {};
    let thirdYearTotal = 0;

    students.forEach(s => {
        if (s.department) {
            deptMap[s.department] = (deptMap[s.department] || 0) + 1;
        }
        if (s.year === "Third Year") {
            thirdYearTotal++;
        }
    });

    const uniqueDeptCount = Object.keys(deptMap).length;
    deptCountNumberEl.textContent = uniqueDeptCount;
    thirdYearCountEl.textContent = thirdYearTotal;

    // Render department distribution pills
    deptPillsEl.innerHTML = "";
    if (uniqueDeptCount === 0) {
        deptPillsEl.innerHTML = `<span style="font-size: 0.8rem; color: #94a3b8;">None</span>`;
    } else {
        Object.entries(deptMap).forEach(([dept, count]) => {
            const pill = document.createElement("span");
            pill.className = "dept-pill";
            pill.innerHTML = `${escapeHTML(dept)}: <strong>${count}</strong>`;
            deptPillsEl.appendChild(pill);
        });
    }
}

// ================= SEARCH & FILTERING =================
function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
        renderStudents();
        return;
    }

    const filtered = students.filter(student => 
        student.name.toLowerCase().includes(query) ||
        student.prn.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.department.toLowerCase().includes(query)
    );

    renderStudents(filtered);
}

// ================= TOAST NOTIFICATION HELPER =================
let toastTimeout;
function showToast(message, type = "success") {
    clearTimeout(toastTimeout);
    toastEl.textContent = message;
    toastEl.className = `toast toast-${type}`;
    toastEl.style.display = "block";

    toastTimeout = setTimeout(() => {
        toastEl.style.display = "none";
    }, 4000);
}

// ================= EVENT LISTENERS =================
function attachEventListeners() {
    // Form submission
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        clearAllErrors();

        const formData = {
            name: nameInput.value,
            prn: prnInput.value,
            email: emailInput.value,
            mobile: mobileInput.value,
            department: departmentInput.value,
            year: yearInput.value,
            dob: dobInput.value
        };

        const { isValid, errors } = validateStudent(formData, isEditing, currentEditingId);

        if (!isValid) {
            // Display field errors
            Object.keys(errors).forEach(field => {
                showFieldError(field, errors[field]);
            });
            showToast("Please correct the errors in the form before proceeding.", "error");
            return;
        }

        if (isEditing) {
            updateStudent(currentEditingId, formData);
        } else {
            addStudent(formData);
        }
    });

    // Real-time input error clearing on user typing
    [nameInput, prnInput, emailInput, mobileInput, departmentInput, yearInput, dobInput].forEach(input => {
        input.addEventListener("input", () => clearFieldError(input.id));
        input.addEventListener("change", () => clearFieldError(input.id));
    });

    // Reset button
    resetBtn.addEventListener("click", () => {
        resetForm();
    });

    // Cancel edit button
    cancelEditBtn.addEventListener("click", cancelEdit);

    // Search input
    searchInput.addEventListener("input", handleSearch);

    // Delegated actions on table (Edit & Delete)
    studentsTbody.addEventListener("click", (e) => {
        const editBtn = e.target.closest(".action-edit");
        const deleteBtn = e.target.closest(".action-delete");

        if (editBtn) {
            const id = editBtn.dataset.id;
            startEditStudent(id);
        } else if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            deleteStudent(id);
        }
    });

    // Load sample data button
    loadSampleDataBtn.addEventListener("click", () => {
        students = [...INITIAL_SAMPLE_STUDENTS];
        saveStudents();
        updateDashboard();
        renderStudents();
        showToast("Sample records loaded successfully!", "success");
    });

    // Clear all records
    clearAllBtn.addEventListener("click", () => {
        if (students.length === 0) return;
        const confirmed = confirm("Are you sure you want to clear ALL registered student records? This will erase localStorage data.");
        if (confirmed) {
            students = [];
            saveStudents();
            resetForm();
            updateDashboard();
            renderStudents();
            showToast("All records have been cleared.", "info");
        }
    });
}
