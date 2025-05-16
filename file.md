Okay, I understand! A horizontal navigation bar at the top can indeed look very modern and professional. Let's transform your side navigation into a sleek, visually enhanced horizontal navigation bar.

Here's what we'll do:

1.  **HTML Changes:** We'll modify the `<a>` tags in your navigation to directly contain the link text, making the `data-tooltip` attribute redundant for this purpose. We'll also change the class name from `nav-dot` to `nav-link`.
2.  **CSS Overhaul:**
    *   The `main-nav` will be positioned at the top, spanning the width, with a glassmorphic background.
    *   `nav-link` items will be styled as clear, clickable text links.
    *   An animated underline will appear for the active link, providing a modern visual cue.
    *   Hover effects will be subtle and clean.
3.  **JavaScript Adjustments:** We'll update the JavaScript to work with the new class names and structure.

Here are the code changes:

**1. HTML Modifications (within `<nav class="main-nav">`):**

Replace your current `main-nav` block:

```html
    <nav class="main-nav">
        <a href="#hero" class="nav-dot active" data-section="hero" data-tooltip="Home"></a>
        <a href="#about" class="nav-dot" data-section="about" data-tooltip="About Me"></a>
        <a href="#experience" class="nav-dot" data-section="experience" data-tooltip="Experience"></a>
        <a href="#projects" class="nav-dot" data-section="projects" data-tooltip="Projects"></a>
        <a href="#blog" class="nav-dot" data-section="blog" data-tooltip="Blog"></a>
        <a href="#contact" class="nav-dot" data-section="contact" data-tooltip="Contact"></a>
    </nav>
```

With this:

```html
    <nav class="main-nav">
        <a href="#hero" class="nav-link active" data-section="hero">Home</a>
        <a href="#about" class="nav-link" data-section="about">About</a>
        <a href="#experience" class="nav-link" data-section="experience">Experience</a>
        <a href="#projects" class="nav-link" data-section="projects">Projects</a>
        <a href="#blog" class="nav-link" data-section="blog">Blog</a>
        <a href="#contact" class="nav-link" data-section="contact">Contact</a>
    </nav>
```
*(Note: I've shortened "About Me" to "About" for brevity in a horizontal bar, but you can keep the full text if you prefer.)*

**2. CSS Modifications:**

Remove the old CSS for `.main-nav`, `.nav-dot`, `.nav-dot::before`, `.nav-dot:hover`, and `.nav-dot.active`. Replace it with this new CSS:

```css
        /* --- Horizontal Navigation - START --- */
        .main-nav {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 12px 0; /* Vertical padding for the bar */
            background-color: rgba(var(--color-background-deep-rgb, 13, 12, 16), 0.85); /* Fallback if --rgb var not set */
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px); /* Safari */
            box-shadow: 0 3px 15px rgba(0,0,0,0.15);
            z-index: 1000;
            gap: 15px; /* Space between nav links */
            transition: background-color var(--transition-duration-medium);
        }

        .nav-link {
            padding: 10px 18px; /* Clickable area */
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--color-text-secondary);
            text-decoration: none;
            border-radius: var(--border-radius-medium);
            position: relative; /* For the ::after pseudo-element */
            overflow: hidden; /* Ensures ::after doesn't peek out during animation */
            transition: color var(--transition-duration-fast) var(--easing-cubic), 
                        background-color var(--transition-duration-fast) var(--easing-cubic),
                        transform var(--transition-duration-fast) var(--easing-cubic);
        }

        .nav-link::after { /* Animated underline for active state */
            content: '';
            position: absolute;
            bottom: 6px; /* Position from bottom of link */
            left: 50%;
            width: 0; /* Starts with no width */
            height: 2px;
            background-color: var(--color-accent-primary);
            border-radius: 1px;
            transform: translateX(-50%);
            transition: width var(--transition-duration-medium) var(--easing-cubic);
        }

        .nav-link:hover {
            color: var(--color-text-primary);
            background-color: rgba(var(--color-accent-primary-rgb, 0, 240, 255), 0.1); /* Subtle glow */
            transform: translateY(-1px); /* Slight lift */
        }
        
        .nav-link.active {
            color: var(--color-accent-primary);
            font-weight: 600; /* Bolder active link */
            background-color: transparent; /* Ensure no hover bg interferes */
        }

        .nav-link.active:hover { /* Optional: different hover for active link */
             color: var(--color-accent-primary); /* Keep accent color */
             background-color: rgba(var(--color-accent-primary-rgb, 0, 240, 255), 0.15); /* Slightly stronger glow */
        }

        .nav-link.active::after {
            width: 55%; /* Width of the underline when active, adjust as needed */
        }
        /* --- Horizontal Navigation - END --- */
```

**3. JavaScript Modifications (within your `<script>` tag):**

You need to update the selectors in your JavaScript where it references `.nav-dot`.

Find this section:
```javascript
        const navDots = document.querySelectorAll('.nav-dot');
        const pageSections = document.querySelectorAll('.page-section');
        function updateActiveDot() { // Might rename this function too
            let currentSectionId = 'hero';
            pageSections.forEach(section => {
                const sectionTop = section.offsetTop - window.innerHeight * 0.4; 
                if (window.scrollY >= sectionTop) { currentSectionId = section.id; }
            });
            navDots.forEach(dot => { // And this variable
                dot.classList.remove('active');
                if (dot.dataset.section === currentSectionId) { dot.classList.add('active'); }
            });
        }
        window.addEventListener('scroll', updateActiveDot);
        updateActiveDot();
        navDots.forEach(dot => { // And this variable
            dot.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
            });
        });
```

And change it to:
```javascript
        const navLinks = document.querySelectorAll('.nav-link'); // Changed selector
        const pageSections = document.querySelectorAll('.page-section');
        function updateActiveLink() { // Renamed function for clarity
            let currentSectionId = 'hero';
            // Adjust offset if nav bar height significantly impacts section visibility
            // The new nav bar is approx 50-60px tall. 
            // The old offset was window.innerHeight * 0.4, which is generous.
            // For a top nav, a fixed offset like nav bar height + some margin might be more precise.
            const navBarHeight = document.querySelector('.main-nav')?.offsetHeight || 60;
            pageSections.forEach(section => {
                const sectionTop = section.offsetTop - navBarHeight - Math.min(100, window.innerHeight * 0.1); // Consider nav height and a bit more
                if (window.scrollY >= sectionTop) { 
                    currentSectionId = section.id; 
                }
            });
            navLinks.forEach(link => { // Changed variable name
                link.classList.remove('active');
                if (link.dataset.section === currentSectionId) { 
                    link.classList.add('active'); 
                }
            });
        }
        window.addEventListener('scroll', updateActiveLink);
        updateActiveLink(); // Initial call
        navLinks.forEach(link => { // Changed variable name
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const navBarHeight = document.querySelector('.main-nav')?.offsetHeight || 0;
                    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - navBarHeight - 10; // Adjust 10px for a small margin

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
```

**Explanation of Changes:**

*   **CSS:**
    *   `.main-nav` is now `fixed` to the top, uses `flex` to center its children (`nav-link`s), and has a blurred background for that modern glass effect.
    *   `.nav-link` styles define the appearance of individual links (padding, font, color).
    *   The `::after` pseudo-element on `.nav-link` creates the underline. It starts with `width: 0` and expands to `width: 55%` (or your desired width) when the link has the `.active` class.
    *   Hover effects are subtle, changing text color, adding a slight background glow, and a small upward lift.
*   **JavaScript:**
    *   Selectors are updated from `.nav-dot` to `.nav-link`.
    *   The `updateActiveLink` function's scroll offset calculation is slightly adjusted to better account for the height of the new top navigation bar.
    *   The click handler for smooth scrolling also now considers the navigation bar's height to ensure the section titles aren't hidden underneath it after scrolling.

This setup should give you a clean, professional, and visually appealing horizontal navigation bar that integrates well with your "Synaptic Flow" design. Remember to clear your browser cache if you don't see the changes immediately.