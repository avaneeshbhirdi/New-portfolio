/**
 * Main Application Script
 * Handles: Custom Cursor, Three.js Background, GSAP Animations
 */

import { db } from './firebase-config.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- Custom Cursor ---
class Cursor {
    constructor() {
        this.cursor = document.getElementById('cursor');
        this.cursorDot = document.getElementById('cursor-dot');
        this.pos = { x: 0, y: 0 };
        this.target = { x: 0, y: 0 };
        this.isHovering = false;

        if (!this.cursor || !this.cursorDot) return;

        // Hide initially
        this.cursor.style.opacity = '0';
        this.cursorDot.style.opacity = '0';

        document.addEventListener('mousemove', (e) => {
            this.target.x = e.clientX;
            this.target.y = e.clientY;

            // Immediate update for dot
            this.cursorDot.style.transform = `translate(${e.clientX - 2}px, ${e.clientY - 2}px)`;
        });

        // Loop for smooth trail
        this.animate();

        // Hover effects
        this.addHoverListeners();

        // Visibility Logic (Hero Only)
        this.initVisibilityControl();
    }

    initVisibilityControl() {
        const hero = document.getElementById('hero');
        if (!hero) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Show custom cursor
                    document.body.classList.add('custom-cursor-active');
                    this.cursor.style.opacity = '1';
                    this.cursorDot.style.opacity = '1';
                } else {
                    // Hide custom cursor, show default
                    document.body.classList.remove('custom-cursor-active');
                    this.cursor.style.opacity = '0';
                    this.cursorDot.style.opacity = '0';
                }
            });
        }, { threshold: 0.1 }); // Trigger when 10% of hero is visible

        observer.observe(hero);
    }

    addHoverListeners() {
        const hoverables = document.querySelectorAll('a, button, .group');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.isHovering = true;
                this.cursor.classList.add('scale-150', 'bg-cyan/10');
            });
            el.addEventListener('mouseleave', () => {
                this.isHovering = false;
                this.cursor.classList.remove('scale-150', 'bg-cyan/10');
            });
        });
    }

    animate() {
        // Lerp for smooth following
        this.pos.x += (this.target.x - this.pos.x) * 0.15;
        this.pos.y += (this.target.y - this.pos.y) * 0.15;

        this.cursor.style.transform = `translate(${this.pos.x - 12}px, ${this.pos.y - 12}px)`;
        requestAnimationFrame(() => this.animate());
    }
}

// --- Three.js Background Scene ---
class BackgroundScene {
    constructor() {
        this.canvas = document.getElementById('bg-canvas');
        if (!this.canvas) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.particles = null;
        this.mouseX = 0;
        this.mouseY = 0;

        this.init();
        this.addEvents();
        this.animate();
    }

    init() {
        // Create Particles
        const geometry = new THREE.BufferGeometry();
        const count = 1500;
        const posArray = new Float32Array(count * 3);

        for (let i = 0; i < count * 3; i++) {
            // Spread particles in a wide area
            posArray[i] = (Math.random() - 0.5) * 15;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const material = new THREE.PointsMaterial({
            size: 0.02,
            color: 0x00f0ff, // Cyan
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        this.camera.position.z = 3;
    }

    addEvents() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX / window.innerWidth - 0.5;
            this.mouseY = e.clientY / window.innerHeight - 0.5;
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Rotate particles slowly
        if (this.particles) {
            this.particles.rotation.y += 0.0005;
            this.particles.rotation.x += 0.0002;

            // Mouse interaction (parallax)
            // Gentle movement based on mouse
            this.particles.rotation.y += this.mouseX * 0.005;
            this.particles.rotation.x += this.mouseY * 0.005;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// --- GSAP Animations ---
class Animations {
    constructor() {
        this.initHero();
        this.initScroll();
    }

    initHero() {
        // Navigation fade in
        gsap.to('nav', {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            delay: 0.5
        });

        // Hero Text Reveal
        gsap.utils.toArray('.reveal-text').forEach((element, i) => {
            // Set initial state explicitly just in case (though CSS handles opacity)
            gsap.set(element, { y: 50 });

            gsap.to(element, {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: 'power3.out',
                delay: 0.8 + (i * 0.2) // Stagger
            });
        });
    }

    initScroll() {
        gsap.registerPlugin(ScrollTrigger);

        // Sections Fade In
        // Sections Fade In
        const sections = ['#work', '#about', '#contact'];
        sections.forEach(id => {
            gsap.fromTo(id,
                { y: 50, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: id,
                        start: 'top 80%',
                    },
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: 'power3.out'
                }
            );
        });

        // Parallax for Images in Work Section
        gsap.utils.toArray('article img').forEach(img => {
            gsap.to(img, {
                scrollTrigger: {
                    trigger: img.parentElement,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                },
                y: 20, // Subtle parallax
                scale: 1.1,
                ease: 'none'
            });
        });
    }
}

// --- 3D Shape in About Section ---
class AboutScene {
    constructor() {
        const container = document.getElementById('about-canvas-container');
        if (!container) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 100);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        this.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(this.renderer.domElement);

        // Icosahedron
        const geometry = new THREE.IcosahedronGeometry(1, 0);
        const material = new THREE.MeshNormalMaterial({
            wireframe: true,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);

        this.camera.position.z = 2.5;

        // Animate
        this.animate = this.animate.bind(this);
        this.animate();

        // Handle resize
        window.addEventListener('resize', () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            this.renderer.setSize(width, height);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        });
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.mesh.rotation.x += 0.005;
        this.mesh.rotation.y += 0.01;
        this.renderer.render(this.scene, this.camera);
    }
}

// --- Auth & Admin System ---
// --- Auth & Admin System (Clerk Integration) ---
class AuthManager {
    constructor() {
        this.elements = {
            loginBtn: document.getElementById('login-btn'),
            signupBtn: document.getElementById('signup-btn'),

            // Profile & Admin
            profileSection: document.getElementById('profile-section'),
            closeProfileBtn: document.getElementById('close-profile'),
            logoutBtn: document.getElementById('logout-btn'),

            navContainer: document.querySelector('nav div.hidden.md\\:flex'),

            // Profile Data Elements
            userName: document.querySelector('#profile-section h3'),
            userEmail: document.querySelector('#profile-section p.text-gray-400'),
            userAvatar: document.querySelector('#profile-section .rounded-full'),
        };

        this.clerk = null;
        this.initClerk();
    }

    async initClerk() {
        // Wait for Clerk to be available
        const checkClerk = setInterval(async () => {
            if (window.Clerk) {
                clearInterval(checkClerk);
                this.clerk = window.Clerk;
                try {
                    await this.clerk.load();
                    this.initEvents();
                    this.updateUI();

                    // Listen for auth changes
                    this.clerk.addListener((payload) => {
                        this.updateUI();
                    });
                } catch (err) {
                    console.error('Error loading Clerk:', err);
                }
            }
        }, 100);
    }

    initEvents() {
        // Login
        if (this.elements.loginBtn) {
            this.elements.loginBtn.addEventListener('click', () => {
                this.clerk.openSignIn();
            });
        }

        // Signup
        if (this.elements.signupBtn) {
            this.elements.signupBtn.addEventListener('click', () => {
                this.clerk.openSignUp();
            });
        }

        // Logout
        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.addEventListener('click', async () => {
                await this.clerk.signOut();
                this.closeProfile();
            });
        }

        // Close Profile
        if (this.elements.closeProfileBtn) {
            this.elements.closeProfileBtn.addEventListener('click', () => this.closeProfile());
        }
    }

    updateUI() {
        if (!this.clerk.user) {
            // Logged Out
            this.elements.loginBtn.classList.remove('hidden');
            this.elements.signupBtn.classList.remove('hidden');

            const profileBtn = document.getElementById('nav-profile-btn');
            if (profileBtn) profileBtn.remove();
        } else {
            // Logged In
            this.elements.loginBtn.classList.add('hidden');
            this.elements.signupBtn.classList.add('hidden');

            // Add Profile Button if needed
            if (!document.getElementById('nav-profile-btn')) {
                const btn = document.createElement('button');
                btn.id = 'nav-profile-btn';
                btn.className = 'text-sm font-medium hover:text-cyan transition-colors ml-4 uppercase';
                // Check if admin (simple check by email for now or metadata)
                const isAdmin = this.checkIfAdmin();
                btn.textContent = isAdmin ? 'ADMIN' : 'PROFILE';

                btn.addEventListener('click', () => {
                    if (isAdmin) {
                        // For now we just open profile, user can implement full admin later
                        // or show the admin dashboard
                        const adminDash = document.getElementById('admin-dashboard');
                        if (adminDash) {
                            adminDash.classList.remove('hidden');
                            // Add close listener for admin dash if not present
                            const closeAdmin = document.getElementById('admin-logout-btn');
                            if (closeAdmin) {
                                closeAdmin.onclick = () => {
                                    adminDash.classList.add('hidden');
                                };
                            }
                        }
                    } else {
                        this.openProfile();
                    }
                });
                this.elements.navContainer.appendChild(btn);
            }
        }
    }

    checkIfAdmin() {
        // Example admin check
        return this.clerk.user?.publicMetadata?.role === 'admin';
    }

    openProfile() {
        const user = this.clerk.user;
        if (!user) return;

        // Populate Profile Data
        if (this.elements.userName) this.elements.userName.textContent = user.fullName || user.username;
        if (this.elements.userEmail) this.elements.userEmail.textContent = user.primaryEmailAddress?.emailAddress;

        if (this.elements.userAvatar) {
            this.elements.userAvatar.innerHTML = `<img src="${user.imageUrl}" class="w-full h-full rounded-full object-cover">`;
        }

        this.elements.profileSection.classList.remove('hidden');
        this.elements.profileSection.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }

    closeProfile() {
        this.elements.profileSection.classList.add('hidden');
        this.elements.profileSection.classList.remove('flex');
        document.body.style.overflow = '';
    }
}

// --- Project Manager (Admin & Rendering) ---
class ProjectManager {
    constructor() {
        this.projects = [];


        this.elements = {
            container: document.getElementById('projects-container'),
            adminBtn: document.getElementById('admin-manage-projects-btn'),
            adminOverview: document.getElementById('admin-overview'),
            editorSection: document.getElementById('admin-projects-editor'),
            backBtn: document.getElementById('back-to-dashboard'),
            projectList: document.getElementById('admin-project-list'),
            addNewBtn: document.getElementById('add-new-project-btn'),
            form: document.getElementById('project-form'),
            formTitle: document.getElementById('form-title'),
            deleteBtn: document.getElementById('delete-project-btn'),

            // Inputs
            inputId: document.getElementById('project-id'),
            inputTitle: document.getElementById('project-title'),
            inputTags: document.getElementById('project-tags'),
            inputColor: document.getElementById('project-color'),
            inputImage: document.getElementById('project-image'),
        };

        this.currentEditId = null;

        this.init();
    }

    init() {
        this.fetchProjects();
        this.initAdminEvents();
    }

    async fetchProjects() {
        try {
            const querySnapshot = await getDocs(collection(db, "projects"));
            this.projects = [];
            querySnapshot.forEach((doc) => {
                this.projects.push({ id: doc.id, ...doc.data() });
            });
            this.renderPublicProjects();
            if (!this.elements.adminOverview.classList.contains('hidden')) {
                // Or just always have data ready for admin
            }
        } catch (e) {
            console.error("Error fetching projects:", e);
        }
    }

    renderPublicProjects() {
        if (!this.elements.container) return;
        this.elements.container.innerHTML = '';

        this.projects.forEach((project, index) => {
            const article = document.createElement('article');
            article.className = `group cursor-pointer ${index === 1 ? 'mt-0 md:mt-20' : ''}`;
            article.innerHTML = `
                <div class="aspect-video bg-gray-900 rounded-lg overflow-hidden border border-white/5 relative mb-6">
                    <img src="${project.image}" alt="${project.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100">
                    <div class="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500"></div>
                </div>
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-2xl font-heading font-bold mb-2 group-hover:text-${project.color === 'purple' ? 'purple' : 'cyan'} transition-colors">${project.title}</h3>
                        <p class="text-gray-400 text-sm">${project.tags.replace(/,/g, ' •')}</p>
                    </div>
                </div>
            `;
            this.elements.container.appendChild(article);
        });

        // Re-trigger GSAP scroll animations if needed as content changed
        if (window.ScrollTrigger) ScrollTrigger.refresh();
    }

    initAdminEvents() {
        if (!this.elements.adminBtn) return;

        // Enter Editor
        this.elements.adminBtn.addEventListener('click', () => {
            this.elements.adminOverview.classList.add('hidden');
            this.elements.editorSection.classList.remove('hidden');
            this.renderAdminList();
            this.clearForm();
        });

        // Exit Editor
        this.elements.backBtn.addEventListener('click', () => {
            this.elements.editorSection.classList.add('hidden');
            this.elements.adminOverview.classList.remove('hidden');
        });

        // Add New
        this.elements.addNewBtn.addEventListener('click', () => {
            this.clearForm();
        });

        // Save
        this.elements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProject();
        });

        // Delete
        this.elements.deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this project?')) {
                this.deleteProject();
            }
        });
    }

    renderAdminList() {
        this.elements.projectList.innerHTML = '';
        this.projects.forEach(project => {
            const item = document.createElement('div');
            item.className = 'p-3 border border-white/10 rounded-lg hover:bg-white/5 cursor-pointer flex justify-between items-center group';
            item.innerHTML = `
                <div>
                    <h4 class="font-bold text-sm">${project.title}</h4>
                    <p class="text-xs text-gray-500 truncate w-32">${project.tags}</p>
                </div>
                <i data-lucide="chevron-right" class="w-4 h-4 text-gray-600 group-hover:text-white"></i>
            `;
            item.addEventListener('click', () => this.loadProjectIntoForm(project));
            this.elements.projectList.appendChild(item);
        });
        lucide.createIcons();
    }

    loadProjectIntoForm(project) {
        this.currentEditId = project.id;
        this.elements.formTitle.textContent = 'Edit Project';
        this.elements.deleteBtn.classList.remove('hidden');

        this.elements.inputId.value = project.id;
        this.elements.inputTitle.value = project.title;
        this.elements.inputTags.value = project.tags;
        this.elements.inputColor.value = project.color;
        this.elements.inputImage.value = project.image;
    }

    clearForm() {
        this.currentEditId = null;
        this.elements.formTitle.textContent = 'New Project';
        this.elements.deleteBtn.classList.add('hidden');
        this.elements.form.reset();
    }

    async saveProject() {
        const newProject = {
            title: this.elements.inputTitle.value,
            tags: this.elements.inputTags.value,
            color: this.elements.inputColor.value,
            image: this.elements.inputImage.value || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1600'
        };

        const btn = this.elements.form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Saving...';
        btn.disabled = true;

        try {
            if (this.currentEditId) {
                // Update existing
                await updateDoc(doc(db, "projects", this.currentEditId), newProject);
            } else {
                // Add new
                await addDoc(collection(db, "projects"), newProject);
            }

            await this.fetchProjects();
            this.renderAdminList();

            btn.textContent = 'Saved!';
        } catch (e) {
            console.error("Error saving project:", e);
            btn.textContent = 'Error!';
        }

        setTimeout(() => {
            btn.textContent = 'Save Project'; // Hardcoded fallback or restore original
            btn.disabled = false;
        }, 1500);

        if (!this.currentEditId) {
            this.clearForm();
        }
    }

    async deleteProject() {
        if (!this.currentEditId) return;

        const btn = this.elements.deleteBtn;
        btn.textContent = 'Deleting...';

        try {
            await deleteDoc(doc(db, "projects", this.currentEditId));
            await this.fetchProjects();
            this.renderAdminList();
            this.clearForm();
        } catch (e) {
            console.error("Error deleting:", e);
            alert("Failed to delete project");
        }
        btn.textContent = 'Delete';
    }
}

// Initialize when DOM is ready
// --- Hero 3D Scene (Torus Knot) ---
class HeroScene {
    constructor() {
        this.container = document.getElementById('hero-3d-container');
        if (!this.container) return;

        this.scene = new THREE.Scene();
        // Safety check
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        const aspect = (height > 0) ? width / height : 1;

        // Perspective Camera
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.time = 0;

        // Mouse State
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.lastMouseMoveTime = 0;

        this.initObjects();
        this.initEvents();

        this.animate = this.animate.bind(this);
        this.animate();

        window.addEventListener('resize', () => this.onResize());
    }

    initEvents() {
        // Track mouse movement
        document.addEventListener('mousemove', (event) => {
            const windowHalfX = window.innerWidth / 2;
            const windowHalfY = window.innerHeight / 2;

            this.mouseX = (event.clientX - windowHalfX) * 0.001;
            this.mouseY = (event.clientY - windowHalfY) * 0.001;

            this.lastMouseMoveTime = Date.now();
        });
    }

    initObjects() {
        // TorusKnot
        const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
        // Use Points for a "tech" look
        const material = new THREE.PointsMaterial({
            color: 0x00f0ff,
            size: 0.15,
            transparent: true,
            opacity: 0.8
        });

        this.mesh = new THREE.Points(geometry, material);
        this.scene.add(this.mesh);

        // Add some floating geometric shapes
        const count = 20;
        const geom2 = new THREE.IcosahedronGeometry(0.5, 0);
        const mat2 = new THREE.MeshBasicMaterial({ color: 0xb026ff, wireframe: true });

        this.floaters = [];
        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(geom2, mat2);
            mesh.position.set(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 20
            );
            mesh.userData = {
                speed: Math.random() * 0.02 + 0.01,
                yOffset: Math.random() * Math.PI * 2
            };
            this.scene.add(mesh);
            this.floaters.push(mesh);
        }

        this.camera.position.z = 35;
    }

    onResize() {
        if (!this.container) return;
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.time += 0.01;

        if (this.mesh) {
            // Check if mouse is active (moved in last 2 seconds)
            const isMouseActive = (Date.now() - (this.lastMouseMoveTime || 0)) < 2000;

            if (isMouseActive) {
                // Follow mouse smoothly
                this.targetRotationY = this.mouseX * 4;
                this.targetRotationX = this.mouseY * 4;

                // Linear interpolation (Lerp) for smoothness - LOWERED speed for smoother feel
                this.mesh.rotation.y += 0.02 * (this.targetRotationY - this.mesh.rotation.y);
                this.mesh.rotation.x += 0.02 * (this.targetRotationX - this.mesh.rotation.x);
            } else {
                // Idle State: Rotate slowly
                this.mesh.rotation.y += 0.002;
                // Transition x back to the bobbing motion smoothly
                this.mesh.rotation.x += 0.02 * ((Math.sin(this.time * 0.5) * 0.2) - this.mesh.rotation.x);
            }

            // Constant subtle z-rotation for "tech" feel
            this.mesh.rotation.z += 0.001;
        }

        // Animate floaters
        this.floaters.forEach(f => {
            f.rotation.x += f.userData.speed;
            f.rotation.y += f.userData.speed;
            f.position.y += Math.sin(this.time + f.userData.yOffset) * 0.05;
        });

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is ready
const initApp = () => {
    console.log('Initializing App...');
    try {
        new Cursor();
        console.log('Cursor initialized');
        new BackgroundScene();
        console.log('Background initialized');
        new HeroScene();
        console.log('HeroScene initialized');
        new Animations();
        console.log('Animations initialized');
        setTimeout(() => new AboutScene(), 100);

        const projectManager = new ProjectManager();
        console.log('ProjectManager initialized', projectManager);

        const auth = new AuthManager();
        console.log('AuthManager initialized', auth);
    } catch (error) {
        console.error('Error during initialization:', error);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
