// Main JavaScript for the Voice School Website

// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true,
        offset: 100
    });
    
    // Initialize all components
    initializeScrollIndicator();
    initializeMobileMenu();
    initializeContactForms();
    initializeModals();
    initializeAnimatedCounters();
    initializeParticles();
    createVoiceWaves();
});

// Scroll Indicator go fuck yourself
function initializeScrollIndicator() {
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    scrollIndicator.innerHTML = '<div class="scroll-progress"></div>';
    document.body.appendChild(scrollIndicator);
    
    const scrollProgress = scrollIndicator.querySelector('.scroll-progress');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = scrollPercent + '%';
    });
}

// Mobile Menu Toggle
function initializeMobileMenu() {
    const burger = document.querySelector('.nav__burger');
    const mobileMenu = document.querySelector('.nav__mobile-menu');
    
    if (burger && mobileMenu) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (mobileMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Close menu when clicking on links
        const mobileLinks = mobileMenu.querySelectorAll('.nav__link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!burger.contains(e.target) && !mobileMenu.contains(e.target)) {
                burger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Contact Forms Handler
function initializeContactForms() {
    const contactForms = document.querySelectorAll('.contact-form');
    
    contactForms.forEach(form => {
        form.addEventListener('submit', handleContactFormSubmit);
    });
}

function submitContactForm(event) {
    event.preventDefault();
    handleFormSubmission(event.target, 'contact');
}

function handleContactFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    
    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Validate form
    if (!validateContactForm(data)) {
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;
    
    // Simulate form submission (in real app, send to server)
    setTimeout(() => {
        showNotification('Спасибо! Мы свяжемся с вами в ближайшее время.', 'success');
        form.reset();
        
        // Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Store lead in localStorage for demo
        saveLeadToStorage(data, 'contact');
    }, 2000);
}

function validateContactForm(data) {
    if (!data.name || data.name.trim().length < 2) {
        showNotification('Пожалуйста, введите ваше имя', 'error');
        return false;
    }
    
    if (!data.phone || !isValidPhone(data.phone)) {
        showNotification('Пожалуйста, введите корректный номер телефона', 'error');
        return false;
    }
    
    return true;
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

// Modal System
function initializeModals() {
    const modal = document.getElementById('modal');
    if (!modal) return;
    
    const modalOverlay = modal.querySelector('.modal__overlay');
    const modalClose = modal.querySelector('.modal__close');
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

function openModal(plan) {
    const modal = document.getElementById('modal');
    const planInput = document.getElementById('modal-plan');
    
    if (modal && planInput) {
        planInput.value = plan;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function submitModalForm(event) {
    event.preventDefault();
    handleFormSubmission(event.target, 'modal');
}

function handleFormSubmission(form, type) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Validate
    if (!validateContactForm(data)) {
        return;
    }
    
    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;
    
    // Simulate submission
    setTimeout(() => {
        if (type === 'modal') {
            closeModal();
        }
        
        showNotification('Заявка отправлена! Мы свяжемся с вами в течение 15 минут.', 'success');
        form.reset();
        
        // Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Store lead
        saveLeadToStorage(data, type);
        
        // Analytics event
        trackEvent('form_submit', { type, plan: data.plan || 'contact' });
    }, 2000);
}

// Animated Counters
function initializeAnimatedCounters() {
    const counters = document.querySelectorAll('.stat__number, .counter__number, .stat-number');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const text = element.textContent;
    const number = parseInt(text.replace(/\D/g, ''));
    const suffix = text.replace(/[\d\s]/g, '');
    
    if (isNaN(number)) return;
    
    const duration = 2000;
    const steps = 60;
    const increment = number / steps;
    let current = 0;
    
    element.classList.add('counter-animation');
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= number) {
            current = number;
            clearInterval(timer);
            element.classList.remove('counter-animation');
        }
        
        element.textContent = Math.floor(current) + suffix;
        element.classList.toggle('counting');
    }, duration / steps);
}

// Particle Effect
function initializeParticles() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particles';
    heroSection.appendChild(particleContainer);
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 2;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 3 + 5;
        const delay = Math.random() * 2;
        
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = left + '%';
        particle.style.animationDuration = animationDuration + 's';
        particle.style.animationDelay = delay + 's';
        
        particleContainer.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, (animationDuration + delay) * 1000);
    }
    
    // Create particles periodically
    setInterval(createParticle, 300);
}

// Voice Wave Animation
function createVoiceWaves() {
    const visualizers = document.querySelectorAll('.recording-visualizer .wave-bars');
    
    visualizers.forEach(visualizer => {
        for (let i = 0; i < 8; i++) {
            const bar = document.createElement('div');
            bar.className = 'voice-bar';
            visualizer.appendChild(bar);
        }
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    
    // Styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '10px',
        color: 'white',
        fontWeight: '600',
        fontSize: '0.875rem',
        zIndex: '10000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '300px',
        wordWrap: 'break-word'
    });
    
    // Type-specific styles
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #68D391, #38A169)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #FC8181, #E53E3E)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #9F7AEA, #6B46C1)';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Local Storage for Demo
function saveLeadToStorage(data, type) {
    const leads = JSON.parse(localStorage.getItem('voiceSchoolLeads') || '[]');
    const lead = {
        ...data,
        type,
        timestamp: new Date().toISOString(),
        id: Date.now()
    };
    
    leads.push(lead);
    localStorage.setItem('voiceSchoolLeads', JSON.stringify(leads));
    
    console.log('Lead saved:', lead);
}

// Analytics (Demo)
function trackEvent(eventName, parameters = {}) {
    console.log('Analytics Event:', eventName, parameters);
    
    // In real implementation, send to analytics service
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, parameters);
    }
}

// Utility Functions
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Performance Optimization
window.addEventListener('load', () => {
    // Mark page as loaded
    document.body.classList.add('page-loaded');
    
    // Track page load time
    const loadTime = performance.now();
    console.log('Page loaded in:', Math.round(loadTime), 'ms');
    
    trackEvent('page_load', { 
        load_time: Math.round(loadTime),
        page: window.location.pathname 
    });
});

// Error Handling
window.addEventListener('error', (event) => {
    console.error('JavaScript Error:', event.error);
    
    trackEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno
    });
});

// Service Worker Registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 