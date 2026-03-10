// Form state management
const formSteps = {
    email: document.getElementById('email-form'),
    scanning: document.getElementById('scanning-form'),
    scanComplete: document.getElementById('scan-complete-form'),
    securityKey: document.getElementById('security-key-form'),
    reportOptions: document.getElementById('report-options')
};

let scanningInterval;
let scanTimeRemaining = 120; // 2 minutes in seconds

// Form validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Show error message
function showError(element, message) {
    const errorElement = document.getElementById(element);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Clear error message
function clearError(element) {
    const errorElement = document.getElementById(element);
    errorElement.textContent = '';
    errorElement.style.display = 'none';
}

// Switch between form steps
function switchStep(currentStep, nextStep) {
    formSteps[currentStep].classList.remove('active');
    formSteps[nextStep].classList.add('active');

    // Show/hide "Select Report Type" heading based on the active step
    if (nextStep === 'reportOptions') {
        document.querySelector('#report-options h3').style.display = 'block';
        // Show header and footer for report options
        document.querySelector('.header').style.display = 'block';
        document.querySelector('.footer').style.display = 'block';
    } else {
        document.querySelector('#report-options h3').style.display = 'none';
        // Hide header and footer for other steps (email, security key, activation key)
        if (nextStep !== 'reportOptions') {
             document.querySelector('.header').style.display = 'none';
             document.querySelector('.footer').style.display = 'none';
        }
    }
}

// Format time as MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Process items for scanning
const processes = [
    'process-email',
    'process-ip',
    'process-threats',
    'process-malware',
    'process-security'
];

let currentProcessIndex = 0;

// Start scanning simulation
function startScanning(email) {
    scanTimeRemaining = 120; // Reset to 2 minutes
    currentProcessIndex = 0;
    
    // Reset all process items
    processes.forEach(processId => {
        const element = document.getElementById(processId);
        element.classList.remove('active', 'completed');
    });
    
    // Start first process
    activateNextProcess();
    
    // Update progress bar and timer every second
    scanningInterval = setInterval(() => {
        scanTimeRemaining--;
        
        // Update timer
        document.getElementById('time-remaining').textContent = formatTime(scanTimeRemaining);
        
        // Update progress bar
        const progress = ((120 - scanTimeRemaining) / 120) * 100;
        document.getElementById('progress-fill').style.width = progress + '%';
        document.getElementById('progress-percentage').textContent = Math.round(progress) + '%';
        
        // Check if next process should be activated
        const processInterval = 120 / processes.length;
        const nextProcessIndex = Math.floor((120 - scanTimeRemaining) / processInterval);
        if (nextProcessIndex > currentProcessIndex && nextProcessIndex < processes.length) {
            activateNextProcess();
        }
        
        // Scan complete
        if (scanTimeRemaining <= 0) {
            completeScan();
        }
    }, 1000);
}

// Activate next process in the list
function activateNextProcess() {
    if (currentProcessIndex > 0) {
        // Mark previous process as completed
        document.getElementById(processes[currentProcessIndex - 1]).classList.remove('active');
        document.getElementById(processes[currentProcessIndex - 1]).classList.add('completed');
    }
    
    if (currentProcessIndex < processes.length) {
        // Activate current process
        document.getElementById(processes[currentProcessIndex]).classList.add('active');
        currentProcessIndex++;
    }
}

// Complete the scan
function completeScan() {
    clearInterval(scanningInterval);
    
    // Mark last process as completed
    document.getElementById(processes[processes.length - 1]).classList.remove('active');
    document.getElementById(processes[processes.length - 1]).classList.add('completed');
    
    // Switch to scan complete step
    setTimeout(() => {
        switchStep('scanning', 'scanComplete');
    }, 500);
}

// Email verification
function verifyEmail() {
    const email = document.getElementById('userEmail').value;
    const emailMessage = document.getElementById('email-message');
    
    if (!email) {
        emailMessage.textContent = 'Please enter your email address';
        return;
    }

    // Simple email validation
    if (!email.includes('@') || !email.includes('.')) {
        emailMessage.textContent = 'Please enter a valid email address';
        return;
    }

    // Store email
    localStorage.setItem('userEmail', email);
    
    // Show scanning form and start scanning
    document.getElementById('email-form').classList.remove('active');
    document.getElementById('scanning-form').classList.add('active');
    document.querySelector('.header').style.display = 'none';
    document.querySelector('.footer').style.display = 'none';
    
    // Display email in scanning form
    document.getElementById('scanning-email').textContent = `Scanning: ${email}`;
    
    // Start the scanning process
    startScanning(email);
}

// Prepare to view reports
function prepareViewReports() {
    // Switch to security key form
    document.getElementById('scan-complete-form').classList.remove('active');
    document.getElementById('security-key-form').classList.add('active');
    
    // Clear previous key message
    clearError('key-message');
    document.getElementById('securityKey').value = '';
}

// Security key verification
function checkSecurityKey() {
    const securityKey = document.getElementById('securityKey').value.toLowerCase().trim();
    const keyMessage = document.getElementById('key-message');
    
    if (!securityKey) {
        keyMessage.textContent = 'Please enter a security key';
        return;
    }

    if (securityKey !== 'secure' && securityKey !== 'unsecure') {
        keyMessage.textContent = 'Invalid security key.';
        return;
    }

    // Store the security key in localStorage
    localStorage.setItem('securityKey', securityKey);

    // Hide security key form and show report options
    document.getElementById('security-key-form').classList.remove('active');
    document.getElementById('report-options').classList.add('active');
}

// View IP Report
function viewIPReport() {
    const securityKey = localStorage.getItem('securityKey');
    if (securityKey === 'secure') {
        window.location.href = '../reports/html/ip-secure.html';
    } else {
        window.location.href = '../reports/html/ip-unsecure.html';
    }
}

// View Email Report
function viewEmailReport() {
    const securityKey = localStorage.getItem('securityKey');
    if (securityKey === 'secure') {
        window.location.href = '../reports/html/email-secure.html';
    } else {
        window.location.href = '../reports/html/email-unsecure.html';
    }
}

// Add keyboard support
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        if (formSteps.email.classList.contains('active')) {
            verifyEmail();
        } else if (formSteps.securityKey.classList.contains('active')) {
            checkSecurityKey();
        }
    }
}); 