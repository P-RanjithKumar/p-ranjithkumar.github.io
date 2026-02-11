// ===========================
// WEDDING FACE FORWARD - PROJECT DOCUMENTATION
// JavaScript for Interactive Features
// ===========================

// ===========================
// DARK MODE TOGGLE
// ===========================
(function initDarkMode() {
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const body = document.body;

    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';

    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    } else {
        body.classList.remove('dark-mode');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }

    // Toggle theme on button click
    themeToggleButton.addEventListener('click', function () {
        body.classList.toggle('dark-mode');

        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        } else {
            localStorage.setItem('theme', 'light');
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
    });
})();

// ===========================
// TABLE OF CONTENTS GENERATION
// ===========================
(function generateTableOfContents() {
    const tocList = document.getElementById('toc-list');
    const sections = document.querySelectorAll('section[id]');

    sections.forEach(section => {
        const sectionId = section.getAttribute('id');
        const sectionTitle = section.querySelector('h2');

        if (sectionTitle) {
            // Create main TOC item (H2)
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${sectionId}`;
            a.textContent = sectionTitle.textContent;
            a.classList.add('toc-link');
            li.appendChild(a);

            // Find all H3 headings within this section
            const subHeadings = section.querySelectorAll('h3[id]');

            if (subHeadings.length > 0) {
                const subList = document.createElement('ul');

                subHeadings.forEach(subHeading => {
                    const subId = subHeading.getAttribute('id');
                    const subLi = document.createElement('li');
                    const subA = document.createElement('a');
                    subA.href = `#${subId}`;
                    subA.textContent = subHeading.textContent;
                    subA.classList.add('toc-sub-link');
                    subLi.appendChild(subA);
                    subList.appendChild(subLi);
                });

                li.appendChild(subList);
            }

            tocList.appendChild(li);
        }
    });
})();

// ===========================
// SMOOTH SCROLLING FOR ANCHOR LINKS
// ===========================
(function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // Skip if it's just "#"
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update URL without jumping
                history.pushState(null, null, targetId);
            }
        });
    });
})();

// ===========================
// ACTIVE SECTION HIGHLIGHTING IN TOC WITH AUTO-SCROLL
// ===========================
(function initActiveSection() {
    const allHeadingElements = document.querySelectorAll('.content-area section[id], .content-area h3[id]');
    const allTocLinks = document.querySelectorAll('#toc-list a');
    const topNavbarHeight = document.querySelector('.top-utility-navbar').offsetHeight;
    const sidebar = document.querySelector('.sidebar');

    const observer = new IntersectionObserver(entries => {
        let currentActiveId = null;
        let minDistanceToActivationLine = Infinity;

        entries.forEach(entry => {
            const targetElement = entry.target;
            const rect = targetElement.getBoundingClientRect();
            const id = targetElement.id;

            // Consider elements whose top is visible or above the fold, and bottom is below the navbar
            if (rect.top < window.innerHeight && rect.bottom > topNavbarHeight) {
                // Calculate distance from the element's top to the "activation line" 
                // (just below the navbar)
                const distance = Math.abs(rect.top - (topNavbarHeight + 15)); // 15px buffer

                // Prioritize elements that are closer to the activation line
                // and are currently intersecting
                if (entry.isIntersecting && distance < minDistanceToActivationLine) {
                    minDistanceToActivationLine = distance;
                    currentActiveId = id;
                }
            }
        });

        // Fallback if no intersecting element was ideal (e.g., fast scroll, initial load)
        if (!currentActiveId) {
            let fallbackMinDistance = Infinity;
            allHeadingElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                // Element's top must be on screen, bottom must be past navbar.
                if (rect.top < window.innerHeight && rect.bottom > topNavbarHeight) {
                    const distance = Math.abs(rect.top - (topNavbarHeight + 15));
                    // And its top must be reasonably close to the activation line
                    if (rect.top < (topNavbarHeight + window.innerHeight * 0.5)) { // Within top half of viewport generally
                        if (distance < fallbackMinDistance) {
                            fallbackMinDistance = distance;
                            currentActiveId = el.id;
                        }
                    }
                }
            });
        }

        allTocLinks.forEach(link => {
            link.classList.remove('active');
            const parentLi = link.closest('li'); // For H2 or H3 li
            if (parentLi) parentLi.classList.remove('active-parent');

            if (link.getAttribute('href') === `#${currentActiveId}`) {
                link.classList.add('active');
                if (parentLi) parentLi.classList.add('active-parent');

                // Scroll active TOC item into view if sidebar is scrollable
                if (sidebar.scrollHeight > sidebar.clientHeight) {
                    const linkRect = link.getBoundingClientRect();
                    const sidebarRect = sidebar.getBoundingClientRect();
                    // Check if element is fully visible within sidebar
                    const isVisible = (linkRect.top >= sidebarRect.top && linkRect.bottom <= sidebarRect.bottom);
                    if (!isVisible) {
                        link.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                    }
                }
            }
        });

    }, {
        rootMargin: `-${topNavbarHeight - 1}px 0px -${Math.max(0, window.innerHeight - topNavbarHeight - (window.innerHeight * 0.34))}px 0px`,
        threshold: [0, 0.01, 0.1, 0.25, 0.5, 0.75, 0.9, 1.0] // More thresholds for finer-grained updates
    });

    allHeadingElements.forEach(section => {
        if (section.id) {
            observer.observe(section);
        }
    });
})();

// ===========================
// EXPANDABLE TOC SUB-ITEMS ON HOVER
// ===========================
(function initExpandableTOC() {
    const mainTocItems = document.querySelectorAll('#toc-list > li');

    mainTocItems.forEach(item => {
        const subMenu = item.querySelector('ul');
        let hideTimeout;

        if (subMenu) {
            const showSubMenu = () => {
                clearTimeout(hideTimeout);
                subMenu.style.maxHeight = subMenu.scrollHeight + "px";
                item.classList.add('open');
            };

            const startHideTimeout = () => {
                hideTimeout = setTimeout(() => {
                    if (!item.matches(':hover') && !subMenu.matches(':hover')) { // Check if mouse truly left
                        subMenu.style.maxHeight = '0px';
                        item.classList.remove('open');
                    }
                }, 200); // Small delay to allow moving mouse into submenu
            };

            // Handle mouse enter on item and submenu to keep it open
            item.addEventListener('mouseenter', showSubMenu);
            subMenu.addEventListener('mouseenter', () => clearTimeout(hideTimeout));

            // Handle mouse leave from item and submenu
            item.addEventListener('mouseleave', startHideTimeout);
            subMenu.addEventListener('mouseleave', startHideTimeout);
        }
    });
})();

// ===========================
// ACCORDION FUNCTIONALITY
// ===========================
(function initAccordions() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', function () {
            const content = this.nextElementSibling;
            const isActive = this.classList.contains('active');

            // Toggle active class on header
            this.classList.toggle('active');

            // Toggle active class on content
            content.classList.toggle('active');

            // Animate max-height
            if (isActive) {
                content.style.maxHeight = '0px';
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
})();

// ===========================
// SHARE BUTTON FUNCTIONALITY
// ===========================
(function initShareButton() {
    const shareButton = document.getElementById('page-share-button');
    const shareDropdown = document.querySelector('.share-dropdown');
    const shareTwitter = document.getElementById('share-twitter');
    const shareLinkedIn = document.getElementById('share-linkedin');
    const shareCopy = document.getElementById('share-copy');

    // Toggle dropdown
    shareButton.addEventListener('click', function (e) {
        e.stopPropagation();
        shareDropdown.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!shareButton.contains(e.target) && !shareDropdown.contains(e.target)) {
            shareDropdown.classList.add('hidden');
        }
    });

    // Share to Twitter
    shareTwitter.addEventListener('click', function (e) {
        e.preventDefault();
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent('Check out Wedding Face Forward - AI-Powered Event Photography Management System');
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
        shareDropdown.classList.add('hidden');
    });

    // Share to LinkedIn
    shareLinkedIn.addEventListener('click', function (e) {
        e.preventDefault();
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
        shareDropdown.classList.add('hidden');
    });

    // Copy link to clipboard
    shareCopy.addEventListener('click', function (e) {
        e.preventDefault();
        const url = window.location.href;

        // Modern clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function () {
                showCopyFeedback();
            }).catch(function (err) {
                console.error('Failed to copy: ', err);
                fallbackCopyToClipboard(url);
            });
        } else {
            fallbackCopyToClipboard(url);
        }
    });

    // Fallback copy method for older browsers
    function fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            showCopyFeedback();
        } catch (err) {
            console.error('Fallback: Failed to copy', err);
        }

        document.body.removeChild(textArea);
    }

    // Show copy feedback
    function showCopyFeedback() {
        // Replace the copy button content temporarily
        const originalHTML = shareCopy.innerHTML;
        shareCopy.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
            </svg>
            Copied!
        `;

        setTimeout(function () {
            shareCopy.innerHTML = originalHTML;
            shareDropdown.classList.add('hidden');
        }, 1500);
    }
})();

// ===========================
// SCROLL TO TOP ON PAGE LOAD
// ===========================
(function scrollToTopOnLoad() {
    window.addEventListener('load', function () {
        // Check if there's a hash in the URL
        if (!window.location.hash) {
            window.scrollTo(0, 0);
        }
    });
})();

// ===========================
// EXTERNAL LINK HANDLING
// ===========================
(function initExternalLinks() {
    const externalLinks = document.querySelectorAll('a[href^="http"]');

    externalLinks.forEach(link => {
        // Skip if it's already set to open in new tab
        if (!link.hasAttribute('target')) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
})();

// ===========================
// CODE BLOCK COPY FUNCTIONALITY (OPTIONAL ENHANCEMENT)
// ===========================
(function initCodeBlockCopy() {
    const codeBlocks = document.querySelectorAll('pre code');

    codeBlocks.forEach(codeBlock => {
        const pre = codeBlock.parentElement;

        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'code-copy-button';
        copyButton.textContent = 'Copy';
        copyButton.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            padding: 4px 8px;
            font-size: 0.8em;
            background-color: var(--primary-color-light);
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;

        // Make pre relative for absolute positioning
        pre.style.position = 'relative';

        // Show button on hover
        pre.addEventListener('mouseenter', function () {
            copyButton.style.opacity = '0.8';
        });

        pre.addEventListener('mouseleave', function () {
            if (copyButton.textContent === 'Copy') {
                copyButton.style.opacity = '0';
            }
        });

        copyButton.addEventListener('mouseenter', function () {
            copyButton.style.opacity = '1';
        });

        // Copy functionality
        copyButton.addEventListener('click', function () {
            const code = codeBlock.textContent;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(code).then(function () {
                    copyButton.textContent = 'Copied!';
                    setTimeout(function () {
                        copyButton.textContent = 'Copy';
                        copyButton.style.opacity = '0';
                    }, 2000);
                });
            }
        });

        pre.appendChild(copyButton);
    });
})();

// ===========================
// PERFORMANCE: LAZY LOAD IMAGES (IF NEEDED)
// ===========================
(function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const images = document.querySelectorAll('img[data-src]');

        const imageObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
})();



// ===========================
// PRINT STYLES OPTIMIZATION
// ===========================
(function initPrintOptimization() {
    window.addEventListener('beforeprint', function () {
        // Expand all accordions for printing
        const accordionContents = document.querySelectorAll('.accordion-content');
        accordionContents.forEach(content => {
            content.style.maxHeight = 'none';
            content.classList.add('active');
        });
    });

    window.addEventListener('afterprint', function () {
        // Collapse accordions after printing
        const accordionContents = document.querySelectorAll('.accordion-content');
        accordionContents.forEach(content => {
            if (!content.previousElementSibling.classList.contains('active')) {
                content.style.maxHeight = '0px';
                content.classList.remove('active');
            }
        });
    });
})();

// ===========================
// KEYBOARD NAVIGATION SUPPORT
// ===========================
(function initKeyboardNavigation() {
    document.addEventListener('keydown', function (e) {
        // Press 'T' to toggle dark mode
        if (e.key === 't' || e.key === 'T') {
            if (!e.target.matches('input, textarea')) {
                document.getElementById('theme-toggle-button').click();
            }
        }

        // Press 'Escape' to close share dropdown
        if (e.key === 'Escape') {
            const shareDropdown = document.querySelector('.share-dropdown');
            if (!shareDropdown.classList.contains('hidden')) {
                shareDropdown.classList.add('hidden');
            }
        }
    });
})();

// ===========================
// ANALYTICS TRACKING (OPTIONAL)
// ===========================
(function initAnalytics() {
    // Track section views
    const sections = document.querySelectorAll('section[id]');
    const sectionViews = new Set();

    const sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                if (!sectionViews.has(sectionId)) {
                    sectionViews.add(sectionId);
                    console.log('Section viewed:', sectionId);
                    // Here you could send to analytics service
                    // Example: gtag('event', 'section_view', { section_id: sectionId });
                }
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(section => sectionObserver.observe(section));
})();

// ===========================
// ACCESSIBILITY ENHANCEMENTS
// ===========================
(function initAccessibility() {
    // Add skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#vision';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 0;
        background: var(--primary-color-light);
        color: white;
        padding: 8px;
        text-decoration: none;
        z-index: 10000;
    `;
    skipLink.addEventListener('focus', function () {
        this.style.top = '0';
    });
    skipLink.addEventListener('blur', function () {
        this.style.top = '-40px';
    });
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Ensure all interactive elements are keyboard accessible
    const interactiveElements = document.querySelectorAll('button, a, [tabindex]');
    interactiveElements.forEach(element => {
        if (!element.hasAttribute('tabindex') && element.tagName !== 'A' && element.tagName !== 'BUTTON') {
            element.setAttribute('tabindex', '0');
        }
    });
})();

// ===========================
// CONSOLE WELCOME MESSAGE
// ===========================
(function consoleWelcome() {
    console.log('%c🎉 Wedding Face Forward Documentation', 'font-size: 20px; font-weight: bold; color: #0073aa;');
    console.log('%cBuilt with ❤️ by P-Ranjith Kumar', 'font-size: 14px; color: #5f6368;');
    console.log('%cVersion: 1.0.0 | Date: February 11, 2026', 'font-size: 12px; color: #9e9e9e;');
    console.log('%cGitHub: https://github.com/P-RanjithKumar/Wedding-Face-Forward', 'font-size: 12px; color: #0073aa;');
})();

// ===========================
// AUTOHIDE NAVBAR ON SCROLL
// ===========================
(function initAutohideNavbar() {
    const navbar = document.querySelector('.top-utility-navbar');
    const sidebar = document.querySelector('.sidebar');
    let lastScrollY = window.scrollY;
    const hideThreshold = 100; // Start hiding after 100px scroll

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Hide on scroll down, show on scroll up
        if (currentScrollY > lastScrollY && currentScrollY > hideThreshold) {
            navbar.classList.add('navbar-hidden');
            if (sidebar) sidebar.style.top = '0px';
        } else {
            navbar.classList.remove('navbar-hidden');
            if (sidebar) sidebar.style.top = '60px';
        }

        lastScrollY = currentScrollY;
    }, { passive: true });
})();

// ===========================
// INITIALIZATION COMPLETE
// ===========================
console.log('✅ All interactive features initialized successfully!');
