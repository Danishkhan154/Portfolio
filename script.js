// ===== GLOBAL VARIABLES =====
let currentTheme = localStorage.getItem('theme') || 'light';
let isScrolling = false;
let portfolioItems = [];
let currentFilter = 'all';

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// ===== INITIALIZE APPLICATION =====
function initializeApp() {
    // Initialize theme
    initializeTheme();
    
    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100
    });
    
    // Initialize all components
    initializeNavigation();
    initializeHero();
    initializeSkills();
    initializePortfolio();
    initializeContactForm();
    initializeBackToTop();
    initializeScrollEffects();
    initializeLazyLoading();
    
    // Add event listeners
    addEventListeners();
    
    console.log('Portfolio website initialized successfully!');
}

// ===== THEME MANAGEMENT =====
function initializeTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeToggle();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeToggle();
    
    // Trigger AOS refresh for theme change
    setTimeout(() => {
        AOS.refresh();
    }, 100);
}

function updateThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        
        if (currentTheme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
}

// ===== NAVIGATION =====
function initializeNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Handle scroll effect on navbar
    window.addEventListener('scroll', throttle(() => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, 100));
    
    // Handle active nav link
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    smoothScrollTo(targetElement);
                    updateActiveNavLink(link);
                    
                    // Close mobile menu if open
                    const navbarCollapse = document.querySelector('.navbar-collapse');
                    if (navbarCollapse.classList.contains('show')) {
                        const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                        bsCollapse.hide();
                    }
                }
            }
        });
    });
    
    // Update active nav link on scroll
    window.addEventListener('scroll', throttle(updateActiveNavOnScroll, 100));
}

function updateActiveNavLink(activeLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

function updateActiveNavOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            const correspondingNavLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            if (correspondingNavLink) {
                updateActiveNavLink(correspondingNavLink);
            }
        }
    });
}

// ===== HERO SECTION =====
function initializeHero() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    // Scroll indicator click
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                smoothScrollTo(aboutSection);
            }
        });
    }
    
    // Parallax effect for hero background
    window.addEventListener('scroll', throttle(() => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero && scrolled < window.innerHeight) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    }, 16));
}

// ===== SKILLS ANIMATION =====
function initializeSkills() {
    const skillsSection = document.getElementById('about');
    
    if (skillsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateSkillBars();
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(skillsSection);
    }
}

function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    skillBars.forEach((bar, index) => {
        const percentage = bar.getAttribute('data-width') || '0';
        
        setTimeout(() => {
            bar.style.width = percentage + '%';
        }, index * 200);
    });
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current);
        }, 16);
    });
}

// ===== PORTFOLIO FILTERING =====
function initializePortfolio() {
    portfolioItems = document.querySelectorAll('.portfolio-item');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Add click event to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            filterPortfolio(filter);
            updateActiveFilter(button);
        });
    });
    
    // Initialize portfolio modal
    initializePortfolioModal();
}

function filterPortfolio(filter) {
    currentFilter = filter;
    
    portfolioItems.forEach(item => {
        const itemCategories = item.getAttribute('data-category');
        
        if (filter === 'all' || itemCategories.includes(filter)) {
            item.classList.remove('hide');
            item.style.display = 'block';
        } else {
            item.classList.add('hide');
            setTimeout(() => {
                if (item.classList.contains('hide')) {
                    item.style.display = 'none';
                }
            }, 300);
        }
    });
    
    // Refresh AOS after filtering
    setTimeout(() => {
        AOS.refresh();
    }, 400);
}

function updateActiveFilter(activeButton) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    activeButton.classList.add('active');
}

function initializePortfolioModal() {
    const portfolioCards = document.querySelectorAll('.portfolio-card');
    const modal = document.getElementById('portfolioModal');
    const modalContent = document.getElementById('modalContent');
    
    portfolioCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            const projectData = getProjectData(card, index);
            displayProjectModal(projectData);
            
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        });
    });
}

function getProjectData(card, index) {
    const title = card.querySelector('h5').textContent;
    const description = card.querySelector('p').textContent;
    const image = card.querySelector('img').src;
    const category = card.closest('.portfolio-item').getAttribute('data-category');
    
    // Mock project data - in real app, this would come from a database or API
    const projectDetails = {
        1: {
            technologies: ['React.js', 'Chart.js', 'Bootstrap', 'Node.js'],
            features: ['Real-time analytics', 'User management', 'Responsive design', 'Data visualization'],
            challenges: 'Implementing real-time data updates and creating intuitive data visualizations.',
            solution: 'Used WebSocket connections for real-time updates and Chart.js for interactive charts.'
        },
        2: {
            technologies: ['React Native', 'Firebase', 'Redux', 'Expo'],
            features: ['Secure authentication', 'Transaction history', 'Push notifications', 'Biometric login'],
            challenges: 'Ensuring security and compliance with banking regulations.',
            solution: 'Implemented multi-layer security with biometric authentication and encrypted data storage.'
        },
        3: {
            technologies: ['Adobe Illustrator', 'Photoshop', 'Figma', 'After Effects'],
            features: ['Logo design', 'Brand guidelines', 'Marketing materials', 'Digital assets'],
            challenges: 'Creating a cohesive brand identity that works across all mediums.',
            solution: 'Developed a comprehensive brand system with flexible guidelines and scalable assets.'
        },
        4: {
            technologies: ['Vue.js', 'Node.js', 'MongoDB', 'Stripe API'],
            features: ['Online ordering', 'Menu management', 'Payment processing', 'Reservation system'],
            challenges: 'Integrating multiple third-party services and ensuring smooth user experience.',
            solution: 'Created a modular architecture with robust error handling and fallback systems.'
        },
        5: {
            technologies: ['Flutter', 'Firebase', 'Google Fit API', 'Charts'],
            features: ['Activity tracking', 'Goal setting', 'Social features', 'Health insights'],
            challenges: 'Accurate activity tracking and motivating user engagement.',
            solution: 'Integrated multiple health APIs and implemented gamification features.'
        },
        6: {
            technologies: ['Angular', 'TypeScript', 'PostgreSQL', 'Docker'],
            features: ['Course management', 'Video streaming', 'Progress tracking', 'Assessments'],
            challenges: 'Handling large video files and ensuring scalable architecture.',
            solution: 'Implemented CDN for video delivery and microservices architecture for scalability.'
        }
    };
    
    const details = projectDetails[index + 1] || {
        technologies: ['HTML', 'CSS', 'JavaScript'],
        features: ['Responsive design', 'Modern UI', 'Cross-browser compatibility'],
        challenges: 'Creating an engaging user experience.',
        solution: 'Focused on clean design and smooth interactions.'
    };
    
    return {
        title,
        description,
        image,
        category,
        ...details,
        liveUrl: '#',
        githubUrl: '#'
    };
}

function displayProjectModal(project) {
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <img src="${project.image}" alt="${project.title}" class="img-fluid rounded mb-3">
                <div class="d-flex gap-2 mb-3">
                    <a href="${project.liveUrl}" class="btn btn-primary flex-fill" target="_blank">
                        <i class="fas fa-external-link-alt me-2"></i>Live Demo
                    </a>
                    <a href="${project.githubUrl}" class="btn btn-outline-primary flex-fill" target="_blank">
                        <i class="fab fa-github me-2"></i>View Code
                    </a>
                </div>
            </div>
            <div class="col-md-6">
                <h4 class="mb-3">${project.title}</h4>
                <p class="text-muted mb-3">${project.description}</p>
                
                <h6 class="mb-2">Technologies Used:</h6>
                <div class="mb-3">
                    ${project.technologies.map(tech => `<span class="badge bg-primary me-2 mb-1">${tech}</span>`).join('')}
                </div>
                
                <h6 class="mb-2">Key Features:</h6>
                <ul class="mb-3">
                    ${project.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                
                <h6 class="mb-2">Challenges:</h6>
                <p class="mb-3">${project.challenges}</p>
                
                <h6 class="mb-2">Solution:</h6>
                <p class="mb-0">${project.solution}</p>
            </div>
        </div>
    `;
}

// ===== CONTACT FORM =====
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
        
        // Add real-time validation
        const formInputs = contactForm.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
    }
}

async function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Validate form
    if (!validateContactForm(form)) {
        return;
    }
    
    // Show loading state
    setButtonLoading(submitButton, true);
    
    try {
        // Simulate API call (replace with actual endpoint)
        await simulateFormSubmission(formData);
        
        // Show success message
        showFormMessage('success', 'Thank you! Your message has been sent successfully.');
        form.reset();
        
    } catch (error) {
        // Show error message
        showFormMessage('error', 'Sorry, there was an error sending your message. Please try again.');
        console.error('Form submission error:', error);
        
    } finally {
        setButtonLoading(submitButton, false);
    }
}

function validateContactForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        errorMessage = `${getFieldLabel(fieldName)} is required.`;
        isValid = false;
    }
    
    // Email validation
    if (fieldName === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            errorMessage = 'Please enter a valid email address.';
            isValid = false;
        }
    }
    
    // Phone validation (optional)
    if (fieldName === 'phone' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            errorMessage = 'Please enter a valid phone number.';
            isValid = false;
        }
    }
    
    // Show/hide error
    if (isValid) {
        clearFieldError(field);
    } else {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function getFieldLabel(fieldName) {
    const labels = {
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email Address',
        phone: 'Phone Number',
        subject: 'Subject',
        message: 'Message'
    };
    return labels[fieldName] || fieldName;
}

function showFieldError(field, message) {
    field.classList.add('is-invalid');
    const errorElement = document.getElementById(field.name + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearFieldError(field) {
    field.classList.remove('is-invalid');
    const errorElement = document.getElementById(field.name + 'Error');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function setButtonLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');
    
    if (isLoading) {
        button.classList.add('btn-loading');
        button.disabled = true;
        if (btnText) btnText.classList.add('d-none');
        if (btnLoading) btnLoading.classList.remove('d-none');
    } else {
        button.classList.remove('btn-loading');
        button.disabled = false;
        if (btnText) btnText.classList.remove('d-none');
        if (btnLoading) btnLoading.classList.add('d-none');
    }
}

function showFormMessage(type, message) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.form-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert-custom alert-${type} form-message`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
        ${message}
    `;
    
    // Insert message
    const form = document.getElementById('contactForm');
    form.parentNode.insertBefore(messageDiv, form);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
    
    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function simulateFormSubmission(formData) {
    // Simulate API delay
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate random success/failure for demo
            if (Math.random() > 0.1) { // 90% success rate
                resolve({ success: true });
            } else {
                reject(new Error('Simulated server error'));
            }
        }, 2000);
    });
}

// ===== BACK TO TOP BUTTON =====
function initializeBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        window.addEventListener('scroll', throttle(() => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        }, 100));
        
        backToTopButton.addEventListener('click', () => {
            smoothScrollTo(document.body);
        });
    }
}

// ===== SCROLL EFFECTS =====
function initializeScrollEffects() {
    // Parallax effect for sections
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    window.addEventListener('scroll', throttle(() => {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = element.getAttribute('data-parallax') || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }, 16));
    
    // Initialize progress bars animation
    initializeProgressBars();
}

function initializeProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar[data-progress]');
    
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target;
                const progress = progressBar.getAttribute('data-progress');
                
                setTimeout(() => {
                    progressBar.style.width = progress + '%';
                }, 200);
                
                progressObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    progressBars.forEach(bar => {
        progressObserver.observe(bar);
    });
}

// ===== LAZY LOADING =====
function initializeLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.classList.add('loaded');
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px'
    });
    
    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== EVENT LISTENERS =====
function addEventListeners() {
    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                smoothScrollTo(target);
            }
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', debounce(() => {
        AOS.refresh();
    }, 250));
    
    // Handle visibility change (for performance)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Pause animations when tab is not visible
            document.body.classList.add('paused');
        } else {
            // Resume animations when tab becomes visible
            document.body.classList.remove('paused');
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Handle form submissions
    document.addEventListener('submit', (e) => {
        if (e.target.classList.contains('ajax-form')) {
            e.preventDefault();
            handleAjaxForm(e.target);
        }
    });
    
    // Initialize custom components
    initializeCustomComponents();
}

function handleKeyboardNavigation(e) {
    // ESC key to close modals
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            const bsModal = bootstrap.Modal.getInstance(openModal);
            if (bsModal) {
                bsModal.hide();
            }
        }
    }
    
    // Arrow keys for carousel navigation
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const activeCarousel = document.querySelector('.carousel:hover');
        if (activeCarousel) {
            const bsCarousel = bootstrap.Carousel.getInstance(activeCarousel);
            if (bsCarousel) {
                if (e.key === 'ArrowLeft') {
                    bsCarousel.prev();
                } else {
                    bsCarousel.next();
                }
            }
        }
    }
}

// ===== CUSTOM COMPONENTS =====
function initializeCustomComponents() {
    // Initialize custom accordions
    initializeAccordions();
    
    // Initialize custom tabs
    initializeTabs();
    
    // Initialize custom dropdowns
    initializeDropdowns();
    
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize progress circles
    initializeProgressCircles();
}

function initializeAccordions() {
    const accordionHeaders = document.querySelectorAll('.accordion-header-custom');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.closest('.accordion-item-custom');
            const isActive = accordionItem.classList.contains('active');
            
            // Close all accordion items
            document.querySelectorAll('.accordion-item-custom').forEach(item => {
                item.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                accordionItem.classList.add('active');
            }
        });
    });
}

function initializeTabs() {
    const tabLinks = document.querySelectorAll('.tab-link-custom');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href').substring(1);
            const targetContent = document.getElementById(targetId);
            
            if (targetContent) {
                // Remove active class from all tabs and content
                document.querySelectorAll('.tab-link-custom').forEach(l => l.classList.remove('active'));
                document.querySelectorAll('.tab-content-custom').forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                link.classList.add('active');
                targetContent.classList.add('active');
            }
        });
    });
}

function initializeDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-custom');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle-custom');
        const menu = dropdown.querySelector('.dropdown-menu-custom');
        const items = dropdown.querySelectorAll('.dropdown-item-custom');
        
        toggle.addEventListener('click', () => {
            dropdown.classList.toggle('active');
        });
        
        items.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                toggle.textContent = item.textContent;
                dropdown.classList.remove('active');
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    });
}

function initializeTooltips() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

function initializeProgressCircles() {
    const progressCircles = document.querySelectorAll('.progress-circle');
    
    const circleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const circle = entry.target;
                const progress = circle.getAttribute('data-progress') || 0;
                
                setTimeout(() => {
                    circle.style.setProperty('--progress', progress + '%');
                }, 200);
                
                circleObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    progressCircles.forEach(circle => {
        circleObserver.observe(circle);
    });
}

// ===== UTILITY FUNCTIONS =====
function smoothScrollTo(target, duration = 1000) {
    const targetPosition = target.offsetTop - 80; // Account for fixed navbar
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }
    
    requestAnimationFrame(animation);
}

function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// ===== PERFORMANCE MONITORING =====
function initializePerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
        if (performance.getEntriesByType) {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                console.log('Page Load Performance:', {
                    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                    totalTime: perfData.loadEventEnd - perfData.fetchStart
                });
            }
        }
    });
    
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) {
                        console.warn('Long task detected:', entry.duration + 'ms');
                    }
                }
            });
            
            observer.observe({ entryTypes: ['longtask'] });
        } catch (e) {
            // Long task API not supported
            console.log('Long task monitoring not supported');
        }
    }
}

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        error: e.error
    });
    
    // You could send this to an error tracking service
    // trackError(e);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
    
    // You could send this to an error tracking service
    // trackError(e);
});

// ===== ADDITIONAL FEATURES =====

// Service Worker Registration (for PWA features)
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

// Web Share API
function shareContent(title, text, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: text,
            url: url
        }).then(() => {
            console.log('Content shared successfully');
        }).catch((error) => {
            console.log('Error sharing content:', error);
        });
    } else {
        // Fallback to clipboard
        copyToClipboard(url);
        showToast('Link copied to clipboard!');
    }
}

// Copy to Clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            fallbackCopyTextToClipboard(text);
        });
    } else {
        fallbackCopyTextToClipboard(text);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast('Copied to clipboard!');
        } else {
            showToast('Failed to copy text', 'error');
        }
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        showToast('Failed to copy text', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Toast Notifications
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${getToastIcon(type)} me-2"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
}

function getToastIcon(type) {
    const icons = {
        info: 'info-circle',
        success: 'check-circle',
        warning: 'exclamation-triangle',
        error: 'exclamation-circle'
    };
    return icons[type] || 'info-circle';
}

// ===== ADVANCED FEATURES =====

// Intersection Observer for animations
function createAnimationObserver() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animationType = element.getAttribute('data-animate');
                const delay = element.getAttribute('data-delay') || 0;
                
                setTimeout(() => {
                    element.classList.add(animationType);
                }, delay);
                
                animationObserver.unobserve(element);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(element => {
        animationObserver.observe(element);
    });
}

// Dynamic content loading
async function loadDynamicContent(url, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    try {
        // Show loading state
        container.innerHTML = '<div class="spinner"></div>';
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const content = await response.text();
        container.innerHTML = content;
        
        // Reinitialize components for new content
        AOS.refresh();
        initializeCustomComponents();
        
    } catch (error) {
        console.error('Error loading content:', error);
        container.innerHTML = '<div class="alert-custom alert-error">Failed to load content</div>';
    }
}

// Image optimization and lazy loading with blur effect
function initializeAdvancedImageLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                
                // Create a new image to preload
                const newImg = new Image();
                newImg.onload = () => {
                    img.src = src;
                    img.classList.add('loaded');
                    img.removeAttribute('data-src');
                };
                newImg.onerror = () => {
                    img.classList.add('error');
                    console.error('Failed to load image:', src);
                };
                newImg.src = src;
                
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px'
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// Advanced form handling with validation
class FormValidator {
    constructor(formElement) {
        this.form = formElement;
        this.rules = {};
        this.messages = {};
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Add real-time validation
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearError(input));
        });
    }
    
    addRule(fieldName, validator, message) {
        if (!this.rules[fieldName]) {
            this.rules[fieldName] = [];
        }
        this.rules[fieldName].push(validator);
        this.messages[fieldName] = message;
    }
    
    validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        const rules = this.rules[fieldName];
        
        if (!rules) return true;
        
        for (let rule of rules) {
            if (!rule(value, field)) {
                this.showError(field, this.messages[fieldName]);
                return false;
            }
        }
        
        this.clearError(field);
        return true;
    }
    
    validateForm() {
        let isValid = true;
        const inputs = this.form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    showError(field, message) {
        field.classList.add('is-invalid');
        let errorElement = field.parentNode.querySelector('.invalid-feedback');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'invalid-feedback';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }
    
    clearError(field) {
        field.classList.remove('is-invalid');
        const errorElement = field.parentNode.querySelector('.invalid-feedback');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        if (this.validateForm()) {
            // Form is valid, proceed with submission
            this.onSubmit(new FormData(this.form));
        }
    }
    
    onSubmit(formData) {
        // Override this method in instances
        console.log('Form submitted:', formData);
    }
}

// Initialize advanced form validation
function initializeAdvancedForms() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const validator = new FormValidator(contactForm);
        
        // Add validation rules
        validator.addRule('firstName', (value) => value.length >= 2, 'First name must be at least 2 characters');
        validator.addRule('lastName', (value) => value.length >= 2, 'Last name must be at least 2 characters');
        validator.addRule('email', (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Please enter a valid email address');
        validator.addRule('subject', (value) => value.length >= 5, 'Subject must be at least 5 characters');
        validator.addRule('message', (value) => value.length >= 10, 'Message must be at least 10 characters');
        
        // Override submit handler
        validator.onSubmit = async (formData) => {
            const submitButton = contactForm.querySelector('button[type="submit"]');
            setButtonLoading(submitButton, true);
            
            try {
                await simulateFormSubmission(formData);
                showFormMessage('success', 'Thank you! Your message has been sent successfully.');
                contactForm.reset();
            } catch (error) {
                showFormMessage('error', 'Sorry, there was an error sending your message. Please try again.');
            } finally {
                setButtonLoading(submitButton, false);
            }
        };
    }
}

// Advanced scroll effects
function initializeAdvancedScrollEffects() {
    // Parallax scrolling for multiple elements
    const parallaxElements = document.querySelectorAll('[data-parallax-speed]');
    
    window.addEventListener('scroll', throttle(() => {
        const scrollTop = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = parseFloat(element.getAttribute('data-parallax-speed')) || 0.5;
            const yPos = -(scrollTop * speed);
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    }, 16));
    
    // Reveal animations on scroll
    const revealElements = document.querySelectorAll('[data-reveal]');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const revealType = element.getAttribute('data-reveal');
                const delay = parseInt(element.getAttribute('data-reveal-delay')) || 0;
                
                setTimeout(() => {
                    element.classList.add('revealed', `reveal-${revealType}`);
                }, delay);
                
                revealObserver.unobserve(element);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    });
    
    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
}

// Local storage management
class StorageManager {
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }
    
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }
    
    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }
    
    static clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
}

// Analytics and tracking
function initializeAnalytics() {
    // Track page views
    trackPageView();
    
    // Track user interactions
    document.addEventListener('click', (e) => {
        const element = e.target.closest('[data-track]');
        if (element) {
            const action = element.getAttribute('data-track');
            trackEvent('click', action, element.textContent);
        }
    });
    
    // Track form submissions
    document.addEventListener('submit', (e) => {
        const form = e.target;
        if (form.id) {
            trackEvent('form_submit', form.id);
        }
    });
    
    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', throttle(() => {
        const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollDepth > maxScrollDepth) {
            maxScrollDepth = scrollDepth;
            if (maxScrollDepth % 25 === 0) { // Track at 25%, 50%, 75%, 100%
                trackEvent('scroll_depth', `${maxScrollDepth}%`);
            }
        }
    }, 1000));
}

function trackPageView() {
    // Replace with your analytics service
    console.log('Page view tracked:', window.location.pathname);
}

function trackEvent(action, category, label = '') {
    // Replace with your analytics service
    console.log('Event tracked:', { action, category, label });
}

// Initialize performance monitoring
initializePerformanceMonitoring();

// Initialize advanced features
document.addEventListener('DOMContentLoaded', () => {
    createAnimationObserver();
    initializeAdvancedImageLoading();
    initializeAdvancedForms();
    initializeAdvancedScrollEffects();
    initializeAnalytics();
});

// Export functions for global access
window.portfolioApp = {
    toggleTheme,
    smoothScrollTo,
    showToast,
    shareContent,
    copyToClipboard,
    filterPortfolio,
    loadDynamicContent,
    StorageManager,
    FormValidator
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}



