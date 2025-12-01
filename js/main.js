// ==========================================
// GLOBAL CONSENT FLAG
// ==========================================
let userConsentGiven = false;

// ==========================================
// CUSTOM ALERT FUNCTION
// ==========================================
function showCustomAlert(type, title, message) {
    const overlay = document.getElementById('customAlertOverlay');
    const alert = document.getElementById('customAlert');
    const icon = document.getElementById('customAlertIcon');
    const titleEl = document.getElementById('customAlertTitle');
    const messageEl = document.getElementById('customAlertMessage');
    const button = document.getElementById('customAlertButton');

    // Set icon based on type
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    icon.textContent = icons[type] || icons.info;
    titleEl.textContent = title;
    messageEl.textContent = message;

    // Remove all type classes and add the current one
    alert.className = 'custom-alert ' + type;

    // Show overlay
    overlay.classList.add('show');

    // Close on button click
    button.onclick = function() {
        overlay.classList.remove('show');
    };

    // Close on overlay click
    overlay.onclick = function(e) {
        if (e.target === overlay) {
            overlay.classList.remove('show');
        }
    };

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay.classList.contains('show')) {
            overlay.classList.remove('show');
        }
    });
}

// ==========================================
// CONSENT MODAL FUNCTIONS
// ==========================================
function showConsentModal() {
    const fileInput = document.getElementById('fileInput');

    // Validation: Check if file is selected first
    if (fileInput.files.length === 0) {
        showCustomAlert('error', 'No File Selected', 'Please select a PDF file first before proceeding with evaluation.');
        return;
    }

    const file = fileInput.files[0];

    // Validation: Check file type
    if (file.type !== 'application/pdf') {
        showCustomAlert('error', 'Invalid File Type', 'Please upload a PDF file only.');
        return;
    }

    // Validation: Check file size
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
        showCustomAlert('error', 'File Size Exceeded', `Your file is ${formatFileSize(file.size)}\nMaximum allowed size is 10 MB.`);
        return;
    }

    // Validation: Check if file is empty
    if (file.size === 0) {
        showCustomAlert('error', 'Empty File', 'The selected file is empty.\nPlease select a valid PDF file.');
        return;
    }

    // If user already gave consent, proceed directly to evaluation
    if (userConsentGiven) {
        evaluateResume();
        return;
    }

    // Show consent modal
    const overlay = document.getElementById('consentModalOverlay');
    const checkbox = document.getElementById('consentModalCheckbox');
    const acceptBtn = document.getElementById('consentAcceptBtn');
    const errorMsg = document.getElementById('consentModalError');

    // Reset modal state
    checkbox.checked = false;
    acceptBtn.disabled = true;
    errorMsg.classList.remove('show');

    overlay.classList.add('show');
}

function closeConsentModal() {
    const overlay = document.getElementById('consentModalOverlay');
    overlay.classList.remove('show');
}

// Close consent modal on overlay click
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('consentModalOverlay');

    overlay.onclick = function(e) {
        if (e.target === overlay) {
            closeConsentModal();
        }
    };

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay.classList.contains('show')) {
            closeConsentModal();
        }
    });
});

function toggleConsentAcceptButton() {
    const checkbox = document.getElementById('consentModalCheckbox');
    const acceptBtn = document.getElementById('consentAcceptBtn');
    const errorMsg = document.getElementById('consentModalError');

    if (checkbox.checked) {
        acceptBtn.disabled = false;
        errorMsg.classList.remove('show');
    } else {
        acceptBtn.disabled = true;
    }
}

function acceptConsent() {
    const checkbox = document.getElementById('consentModalCheckbox');
    const errorMsg = document.getElementById('consentModalError');

    if (!checkbox.checked) {
        errorMsg.classList.add('show');
        return;
    }

    // Set consent flag to true
    userConsentGiven = true;

    // Close modal
    closeConsentModal();

    // Proceed to evaluation
    evaluateResume();
}

// ==========================================
// NAVIGATION
// ==========================================
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({
        behavior: 'smooth'
    });
}

// Hide/Show Navigation on Scroll
let scrollTimer;
let isScrolling = false;

function hideNavbars() {
    const navbars = document.querySelectorAll('nav');
    navbars.forEach(nav => {
        nav.classList.add('nav-hidden');
    });
    isScrolling = true;
}

function showNavbars() {
    const navbars = document.querySelectorAll('nav');
    navbars.forEach(nav => {
        nav.classList.remove('nav-hidden');
    });
    isScrolling = false;
}

window.addEventListener('scroll', function() {
    // Hide navbar immediately when scrolling starts
    if (!isScrolling) {
        hideNavbars();
    }

    // Clear the previous timer
    clearTimeout(scrollTimer);

    // Set a new timer to show navbar after scrolling stops
    scrollTimer = setTimeout(function() {
        showNavbars();
    }, 150); // Show navbar 150ms after scrolling stops
});

// Show navbar on page load
window.addEventListener('load', function() {
    showNavbars();
});

// ==========================================
// DRAG AND DROP FUNCTIONALITY
// ==========================================
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// Click to open file dialog
dropZone.addEventListener('click', () => {
    fileInput.click();
});

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop zone when dragging over
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dropZone.classList.add('dragover');
}

function unhighlight() {
    dropZone.classList.remove('dragover');
}

// Handle dropped files
dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// Handle file selection
fileInput.addEventListener('change', function() {
    handleFiles(this.files);
});

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function handleFiles(files) {
    // Clear any previous error states
    fileInfo.classList.remove('error');

    if (files.length === 0) {
        return;
    }

    const file = files[0];

    // Validation 1: Check if file is PDF
    if (file.type !== 'application/pdf') {
        fileInfo.classList.add('show', 'error');
        fileName.textContent = 'Error: Please upload a PDF file only';
        fileSize.textContent = '';
        fileInput.value = '';

        setTimeout(() => {
            showCustomAlert('error', 'Invalid File Type', 'Please upload a PDF file only.\nOther file formats are not supported.');
        }, 100);
        return;
    }

    // Validation 2: Check file size (max 10MB)
    if (file.size > MAX_FILE_SIZE) {
        fileInfo.classList.add('show', 'error');
        fileName.textContent = 'Error: File too large';
        fileSize.textContent = `File size: ${formatFileSize(file.size)} (Maximum: 10 MB)`;
        fileInput.value = '';

        setTimeout(() => {
            showCustomAlert('error', 'File Size Exceeded', `Your file is ${formatFileSize(file.size)}\nMaximum allowed size is 10 MB.\n\nPlease compress your PDF or select a smaller file.`);
        }, 100);
        return;
    }

    // Validation 3: Check if file is empty
    if (file.size === 0) {
        fileInfo.classList.add('show', 'error');
        fileName.textContent = 'Error: Empty file';
        fileSize.textContent = '';
        fileInput.value = '';

        setTimeout(() => {
            showCustomAlert('error', 'Empty File', 'The selected file is empty.\nPlease select a valid PDF file.');
        }, 100);
        return;
    }

    // File is valid - assign to file input
    // Create a new DataTransfer to assign files to the input element
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;

    // Show success message
    fileInfo.classList.add('show');
    fileInfo.classList.remove('error');
    fileName.textContent = file.name;
    fileSize.textContent = `File size: ${formatFileSize(file.size)}`;

    // Show confirmation message
    setTimeout(() => {
        showCustomAlert('success', 'File Selected Successfully!', `File: ${file.name}\nSize: ${formatFileSize(file.size)}\n\nClick "Evaluate Resume" to proceed.`);
    }, 100);
}

// Clear selected file
function clearFile() {
    fileInput.value = '';
    fileName.textContent = '';
    fileSize.textContent = '';
    fileInfo.classList.remove('show', 'error');
}

// ==========================================
// QUESTION MATRIX
// ==========================================
const questionList = document.getElementById('questionList');
let questionCount = 0;

function createQuestionElement(questionText = '', weightValue = '') {
    questionCount++;

    const box = document.createElement('div');
    box.className = 'question-box';
    box.id = `question-${questionCount}`;

    box.innerHTML = `
        <label class="question-label">Question ${questionCount}</label>
        <div class="input-row">
            <input type="text" class="input-text" placeholder="Enter your question..." value="${questionText}">
            <input type="number" class="input-weight" placeholder="Points" value="${weightValue}">
        </div>
        <button class="btn-delete" onclick="removeQuestion(${questionCount})">Remove</button>
    `;

    return box;
}

function addQuestion() {
    const questionElement = createQuestionElement();
    questionList.appendChild(questionElement);
}

function removeQuestion(id) {
    const element = document.getElementById(`question-${id}`);
    if (element) {
        element.remove();
    }
}

// Initialize with default questions
function initializeQuestions() {
    const defaultQuestions = [
        { question: "Does the candidate have background in Computer Science or Data analytic", weight: "10" },
        { question: "Does the candidate have experience in Programming Language Python", weight: "10" },
        { question: "Does the candidate have experience in Project Developement Python", weight: "20" }, 
        { question: "Does the candidate have experience in Machine Learning", weight: "10" },
        { question: "Does the candidate graduate with CGPA 3.5 or above", weight: "15" }
    ];

    defaultQuestions.forEach(q => {
        const questionElement = createQuestionElement(q.question, q.weight);
        questionList.appendChild(questionElement);
    });
}

// ==========================================
// EVALUATE RESUME
// ==========================================
async function evaluateResume() {
    const fileInput = document.getElementById('fileInput');
    const statusDiv = document.getElementById('uploadStatus');
    const resultOutput = document.getElementById('resultOutput');
    const evaluateBtn = document.getElementById('evaluateBtn');
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    // Note: All validations are done in showConsentModal before this function is called
    const file = fileInput.files[0];

    // Gather questions
    const boxes = document.querySelectorAll('.question-box');
    const questionsPayload = [];

    boxes.forEach(box => {
        const qText = box.querySelector('.input-text').value.trim();
        const qWeight = box.querySelector('.input-weight').value.trim();
        if (qText || qWeight) {
            questionsPayload.push({
                question: qText,
                weightage: Number(qWeight) || 0
            });
        }
    });

    // Gather gender weights
    const maleWeight = Number(document.getElementById('maleWeight').value) || 0;
    const femaleWeight = Number(document.getElementById('femaleWeight').value) || 0;

    const genderWeights = {
        male: maleWeight,
        female: femaleWeight
    };

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('questions_data', JSON.stringify(questionsPayload));
    formData.append('gender_weights', JSON.stringify(genderWeights));

    // UI updates
    evaluateBtn.disabled = true;
    statusDiv.textContent = 'Processing... This may take a few moments';
    resultOutput.classList.remove('show');

    try {
        const response = await fetch('https://tabular-denver-actually.ngrok-free.dev/process-docling2/', {
            method: 'POST',
            body: formData,
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (!response.ok) {
            let errorMessage = 'Upload failed';
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorMessage;
            } catch (e) {}
            throw new Error(errorMessage);
        }

        const data = await response.json();

        statusDiv.textContent = 'Evaluation complete! Scroll down to see results.';
        resultOutput.textContent = data.markdown_content;
        resultOutput.classList.add('show');

        // Scroll to results
        setTimeout(() => {
            scrollToSection('results');
        }, 500);

        console.log('Server parsed questions:', data.received_questions);

    } catch (error) {
        statusDiv.textContent = 'Error: ' + error.message;
        console.error(error);
    } finally {
        evaluateBtn.disabled = false;
    }
}

// ==========================================
// HANDSHAKE ANIMATION
// ==========================================
function initializeHandshakeAnimation() {
    const container = document.getElementById('handshake-animation');

    if (container && typeof handshakeAnimationData !== 'undefined') {
        lottie.loadAnimation({
            container: container,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: handshakeAnimationData
        });
    }
}

// Initialize on page load
window.addEventListener('load', () => {
    initializeQuestions();
    initializeHandshakeAnimation();
});
