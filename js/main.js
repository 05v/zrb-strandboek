/**
 * Reddingsbrigade Zandvoort - Main JavaScript
 * Using OOP principles for code organization
 */

// Main App Class
class ReddingsbrigadeApp {
    constructor() {
        // Initialize components
        this.navigation = new Navigation();
        this.currentYear = new CurrentYear();
        
        // DOM Ready
        document.addEventListener('DOMContentLoaded', () => {
            this.init();
        });
    }
    
    init() {
        // Initialize all components
        this.navigation.init();
        this.currentYear.init();
        
        // Add additional initialization here
        console.log('Reddingsbrigade Zandvoort app initialized');
    }
}

// Navigation Class - handles mobile menu
class Navigation {
    constructor() {
        this.menuToggle = null;
        this.navMenu = null;
        this.isOpen = false;
    }
    
    init() {
        // Get DOM elements
        this.menuToggle = document.querySelector('.menu-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        
        if (this.menuToggle && this.navMenu) {
            // Add event listeners
            this.menuToggle.addEventListener('click', () => this.toggleMenu());
            
            // Close menu on window resize (for mobile to desktop transitions)
            window.addEventListener('resize', () => {
                if (window.innerWidth > 576 && this.isOpen) {
                    this.closeMenu();
                }
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (this.isOpen && !e.target.closest('.main-nav')) {
                    this.closeMenu();
                }
            });
        }
    }
    
    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
        this.navMenu.classList.add('active');
        this.isOpen = true;
        
        // Add active state to hamburger
        this.menuToggle.classList.add('active');
    }
    
    closeMenu() {
        this.navMenu.classList.remove('active');
        this.isOpen = false;
        
        // Remove active state from hamburger
        this.menuToggle.classList.remove('active');
    }
}

// Current Year - Updates copyright year
class CurrentYear {
    constructor() {
        this.yearElement = null;
    }
    
    init() {
        this.yearElement = document.getElementById('year');
        
        if (this.yearElement) {
            this.yearElement.textContent = new Date().getFullYear();
        }
    }
}

// Content Loader - For dynamically loading content
class ContentLoader {
    constructor() {
        this.contentContainer = null;
        this.apiEndpoint = '/api';
    }
    
    init(containerId) {
        this.contentContainer = document.getElementById(containerId);
        
        if (!this.contentContainer) {
            console.error(`Content container with ID '${containerId}' not found`);
            return false;
        }
        
        return true;
    }
    
    async loadContent(endpoint, params = {}) {
        if (!this.contentContainer) return;
        
        try {
            // Show loading state
            this.showLoading();
            
            // Build URL with parameters
            const url = new URL(this.apiEndpoint + endpoint, window.location.origin);
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
            
            // Fetch data
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Render content
            this.renderContent(data);
        } catch (error) {
            console.error('Error loading content:', error);
            this.showError(error.message);
        } finally {
            // Hide loading state
            this.hideLoading();
        }
    }
    
    showLoading() {
        // Create loading element
        const loader = document.createElement('div');
        loader.className = 'content-loader';
        loader.innerHTML = '<span class="loader-spinner"></span><p>Laden...</p>';
        
        // Add loading element to container
        this.contentContainer.innerHTML = '';
        this.contentContainer.appendChild(loader);
    }
    
    hideLoading() {
        const loader = this.contentContainer.querySelector('.content-loader');
        if (loader) {
            loader.remove();
        }
    }
    
    showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'content-error';
        errorElement.innerHTML = `<p>Er is een fout opgetreden: ${message}</p>`;
        
        this.contentContainer.innerHTML = '';
        this.contentContainer.appendChild(errorElement);
    }
    
    renderContent(data) {
        // Override this method in child classes
        console.warn('renderContent method should be overridden in child class');
        this.contentContainer.innerHTML = '<p>Content loaded, but no renderer available</p>';
    }
}

// Knowledge Base - extends ContentLoader
class KnowledgeBase extends ContentLoader {
    constructor() {
        super();
        this.categories = [];
    }
    
    async init(containerId) {
        if (!super.init(containerId)) return false;
        
        // Load categories
        await this.loadCategories();
        
        return true;
    }
    
    async loadCategories() {
        try {
            // Fetch categories
            const response = await fetch(`${this.apiEndpoint}/categories`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            this.categories = await response.json();
        } catch (error) {
            console.error('Error loading categories:', error);
            this.categories = [];
        }
    }
    
    renderContent(data) {
        if (!data || !data.items) {
            this.contentContainer.innerHTML = '<p>Geen content gevonden</p>';
            return;
        }
        
        // Create HTML for content items
        const html = data.items.map(item => `
            <article class="kb-item">
                <h3>${item.title}</h3>
                <div class="kb-meta">
                    <span class="kb-date">Bijgewerkt: ${new Date(item.updated).toLocaleDateString('nl-NL')}</span>
                    <span class="kb-category">${item.category}</span>
                </div>
                <div class="kb-content">
                    ${item.content}
                </div>
            </article>
        `).join('');
        
        // Add pagination if needed
        let paginationHtml = '';
        if (data.pagination && data.pagination.totalPages > 1) {
            paginationHtml = '<div class="kb-pagination">';
            
            // Previous button
            if (data.pagination.currentPage > 1) {
                paginationHtml += `<a href="#" class="kb-prev" data-page="${data.pagination.currentPage - 1}">Vorige</a>`;
            }
            
            // Page numbers
            for (let i = 1; i <= data.pagination.totalPages; i++) {
                if (i === data.pagination.currentPage) {
                    paginationHtml += `<span class="kb-page current">${i}</span>`;
                } else {
                    paginationHtml += `<a href="#" class="kb-page" data-page="${i}">${i}</a>`;
                }
            }
            
            // Next button
            if (data.pagination.currentPage < data.pagination.totalPages) {
                paginationHtml += `<a href="#" class="kb-next" data-page="${data.pagination.currentPage + 1}">Volgende</a>`;
            }
            
            paginationHtml += '</div>';
        }
        
        // Render to container
        this.contentContainer.innerHTML = `
            <div class="kb-container">
                ${html}
                ${paginationHtml}
            </div>
        `;
        
        // Add event listeners to pagination buttons
        const paginationLinks = this.contentContainer.querySelectorAll('.kb-pagination a');
        paginationLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(link.getAttribute('data-page'), 10);
                if (page) {
                    this.loadContent('/knowledge', { page });
                }
            });
        });
    }
}

// Initialize the application
const app = new ReddingsbrigadeApp(); 