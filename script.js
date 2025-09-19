// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// File Upload Functionality
let uploadedFiles = [];

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
    // Initialize animations
    const animatedElements = document.querySelectorAll('.service-card, .portfolio-item, .feature, .contact-item');
    animatedElements.forEach(el => observer.observe(el));
    
    // Initialize file upload with a delay to ensure elements are ready
    setTimeout(() => {
        initializeFileUpload();
    }, 200);
    
    // Initialize typing effect
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 80);
    }
    
    // Initialize other features
    initializeServiceCards();
    initializePortfolioItems();
    initializeButtons();
    initializeContactForm();
    createScrollProgress();

    // Theme Toggle and variable helpers
    function setThemeClass(theme) {
        const body = document.body;
        if (theme === 'emerald') {
            body.classList.add('theme-emerald');
        } else {
            body.classList.remove('theme-emerald');
        }
    }

    function getSavedTheme() {
        try {
            return localStorage.getItem('theme') || 'default';
        } catch (e) {
            return 'default';
        }
    }

    function saveTheme(theme) {
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {}
    }

    function getCssVar(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    // Initialize theme on DOMContentLoaded (append into existing listener)
    (function attachThemeInit() {
        const saved = getSavedTheme();
        setThemeClass(saved);

        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                const isEmerald = document.body.classList.toggle('theme-emerald');
                const theme = isEmerald ? 'emerald' : 'default';
                saveTheme(theme);
            });
        }
    })();
});

function initializeFileUpload() {
    console.log('Initializing file upload...');
    
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    
    console.log('Upload area:', uploadArea);
    console.log('File input:', fileInput);
    console.log('File list:', fileList);
    
    if (!uploadArea) {
        console.error('Upload area not found');
        return;
    }
    
    if (!fileInput) {
        console.error('File input not found');
        return;
    }
    
    if (!fileList) {
        console.error('File list not found');
        return;
    }
    
    console.log('All file upload elements found');
    
    // Create a new file input element
    const newFileInput = document.createElement('input');
    newFileInput.type = 'file';
    newFileInput.id = 'fileInput';
    newFileInput.className = 'file-input';
    newFileInput.multiple = true;
    newFileInput.accept = '.pdf,.ai,.eps,.psd,.jpg,.jpeg,.png,.tiff,.doc,.docx,.indd';
    newFileInput.style.display = 'none';
    
    // Replace the old file input
    fileInput.parentNode.replaceChild(newFileInput, fileInput);
    
    // Get reference to the new file input
    const freshFileInput = document.getElementById('fileInput');
    
    console.log('New file input created:', freshFileInput);
    
    // Add click event listener to upload area
    uploadArea.addEventListener('click', function(e) {
        console.log('Upload area clicked!');
        e.preventDefault();
        e.stopPropagation();
        
        // Try multiple approaches to trigger file selection
        console.log('Attempting to trigger file selection...');
        
        // Method 1: Direct click
        try {
            freshFileInput.click();
            console.log('Method 1: Direct click successful');
        } catch (error) {
            console.log('Method 1 failed:', error);
        }
        
        // Method 2: Focus and click
        try {
            freshFileInput.focus();
            freshFileInput.click();
            console.log('Method 2: Focus and click successful');
        } catch (error) {
            console.log('Method 2 failed:', error);
        }
        
        // Method 3: Dispatch click event
        try {
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            freshFileInput.dispatchEvent(clickEvent);
            console.log('Method 3: Dispatch click event successful');
        } catch (error) {
            console.log('Method 3 failed:', error);
        }
    });
    
    // Add file change event listener
    freshFileInput.addEventListener('change', function(e) {
        console.log('File input changed, files selected:', e.target.files.length);
        const files = Array.from(e.target.files);
        handleFiles(files);
    });
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
        console.log('Drag over');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        console.log('Drag leave');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        console.log('Files dropped:', files.length);
        handleFiles(files);
    });
    
    console.log('File upload event listeners added successfully');
}

function handleFiles(files) {
    console.log('Handling files:', files.length);
    files.forEach(file => {
        if (validateFile(file)) {
            uploadedFiles.push(file);
            displayFile(file);
        }
    });
}

function validateFile(file) {
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/tiff',
        'application/postscript',
        'application/illustrator',
        'application/vnd.adobe.photoshop',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.adobe.indesign'
    ];
    
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (!allowedTypes.includes(file.type)) {
        showNotification(`File type ${file.type} is not supported. Please upload PDF, AI, EPS, PSD, JPG, PNG, TIFF, DOC, or INDD files.`, 'error');
        return false;
    }
    
    if (file.size > maxSize) {
        showNotification(`File ${file.name} is too large. Maximum size is 50MB.`, 'error');
        return false;
    }
    
    return true;
}

function displayFile(file) {
    const fileList = document.getElementById('fileList');
    if (!fileList) return;
    
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
        <div class="file-icon">
            <i class="fas fa-file"></i>
        </div>
        <div class="file-info">
            <div class="file-name">${file.name}</div>
            <div class="file-size">${formatFileSize(file.size)}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
        </div>
        <div class="file-actions">
            <button class="btn btn-primary" onclick="uploadFile('${file.name}')">
                <i class="fas fa-upload"></i> Upload
            </button>
            <button class="btn btn-danger" onclick="removeFile('${file.name}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    fileList.appendChild(fileItem);
    console.log('File displayed:', file.name);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function uploadFile(fileName) {
    console.log('Upload button clicked for:', fileName);
    
    const file = uploadedFiles.find(f => f.name === fileName);
    if (!file) {
        console.error('File not found:', fileName);
        return;
    }
    
    const fileItem = document.querySelector(`[onclick="uploadFile('${fileName}')"]`).closest('.file-item');
    if (!fileItem) {
        console.error('File item not found for:', fileName);
        return;
    }
    
    const progressBar = fileItem.querySelector('.progress-fill');
    const uploadBtn = fileItem.querySelector('.btn-primary');
    
    if (!progressBar || !uploadBtn) {
        console.error('Progress bar or upload button not found');
        return;
    }
    
    // Disable upload button
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            showUploadSuccess(fileName, fileItem);
        }
        progressBar.style.width = progress + '%';
    }, 200);
}

function showUploadSuccess(fileName, fileItem) {
    fileItem.classList.add('success');
    fileItem.querySelector('.file-icon i').className = 'fas fa-check-circle';
    const successColor = getCssVar('--color-success');
    fileItem.querySelector('.file-icon').style.color = successColor;
    
    const uploadBtn = fileItem.querySelector('.btn-primary');
    uploadBtn.innerHTML = '<i class="fas fa-check"></i> Uploaded';
    uploadBtn.style.background = successColor;
    
    showNotification(`File ${fileName} uploaded successfully!`, 'success');
}

function removeFile(fileName) {
    console.log('Remove button clicked for:', fileName);
    uploadedFiles = uploadedFiles.filter(f => f.name !== fileName);
    const fileItem = document.querySelector(`[onclick="uploadFile('${fileName}')"]`).closest('.file-item');
    if (fileItem) {
        fileItem.remove();
    }
    showNotification(`File ${fileName} removed.`, 'info');
}

function initializeServiceCards() {
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

function initializePortfolioItems() {
    document.querySelectorAll('.portfolio-item').forEach(item => {
        item.addEventListener('click', function() {
            const title = this.querySelector('h3').textContent;
            showNotification(`Viewing portfolio item: ${title}`, 'info');
        });
    });
}

function initializeButtons() {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (this.type === 'submit') return; // Skip for form submit buttons
            
            const originalText = this.textContent;
            this.textContent = 'Loading...';
            this.style.pointerEvents = 'none';
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.pointerEvents = 'auto';
            }, 1000);
        });
    });
}

function initializeContactForm() {
    const contactForm = document.querySelector('#contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const service = formData.get('service');
            const message = formData.get('message');
            const hasFiles = formData.get('hasFiles');
            
            // Simple validation
            if (!name || !email || !service || !message) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            // Check if user mentioned files but hasn't uploaded any
            if (hasFiles && uploadedFiles.length === 0) {
                showNotification('You mentioned having files to upload. Please upload them using the Upload Files section.', 'warning');
                return;
            }
            
            // Simulate form submission
            const messageText = hasFiles && uploadedFiles.length > 0 
                ? `Thank you for your message! We've received your inquiry and ${uploadedFiles.length} file(s). We'll get back to you soon.`
                : 'Thank you for your message! We\'ll get back to you soon.';
                
            showNotification(messageText, 'success');
            this.reset();
            
            // Clear uploaded files
            uploadedFiles = [];
            const fileList = document.getElementById('fileList');
            if (fileList) {
                fileList.innerHTML = '';
            }
        });
    }
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${
            type === 'success' ? getCssVar('--color-success') :
            type === 'error' ? getCssVar('--color-primary') :
            type === 'warning' ? getCssVar('--color-warning') :
            getCssVar('--color-accent-end')
        };
        
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add typing effect to hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Add scroll progress indicator
function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, var(--color-primary), var(--color-warning));
        z-index: 10001;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(notificationStyles);
