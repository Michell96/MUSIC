// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // ===== GLOBAL VARIABLES =====
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    const addLyricsBtn = document.getElementById('add-lyrics-btn');
    const lyricsModal = document.getElementById('lyrics-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const lyricsForm = document.getElementById('lyrics-form');
    const lyricsContainer = document.getElementById('lyrics-container');
    const emptyLyrics = document.getElementById('empty-lyrics');
    const contactForm = document.getElementById('contact-form');
    const songFileInput = document.getElementById('song-file');
    const songLyricsTextarea = document.getElementById('song-lyrics');
    
    // Array to store lyrics (simulating a database)
    let lyricsCollection = JSON.parse(localStorage.getItem('lyrics')) || [];
    
    // ===== FUNCTIONS =====
    
    // Function to change navbar style on scroll
    function handleScroll() {
        if (window.scrollY > 50) {
            navbar.style.padding = '1rem 2rem';
            navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.padding = '1.5rem 2rem';
            navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.05)';
        }
    }
    
    // Function to toggle mobile menu
    function toggleMobileMenu() {
        navMenu.classList.toggle('active');
    }
    
    // Function to close mobile menu when clicking a link
    function closeMenuOnClick() {
        if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }
    }
    
    // Function to open modal
    function openModal() {
        lyricsModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling in the background
    }
    
    // Function to close modal
    function closeModal() {
        lyricsModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
        lyricsForm.reset(); // Clear the form
    }
    
    // Function to read uploaded text file
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                songLyricsTextarea.value = e.target.result;
            };
            reader.readAsText(file);
        }
    }
    
    // Function to save new lyrics
    function saveLyrics(event) {
        event.preventDefault();
        
        const title = document.getElementById('song-title').value;
        const genre = document.getElementById('song-genre').value;
        const lyrics = document.getElementById('song-lyrics').value;
        
        if (!title || !lyrics) {
            alert('Please complete all required fields.');
            return;
        }
        
        // Create a new lyrics object
        const newLyric = {
            id: Date.now(), // Use timestamp as unique ID
            title,
            genre,
            lyrics,
            date: new Date().toLocaleDateString()
        };
        
        // Add to collection
        lyricsCollection.push(newLyric);
        
        // Save to localStorage
        localStorage.setItem('lyrics', JSON.stringify(lyricsCollection));
        
        // Update interface
        renderLyrics();
        
        // Close modal
        closeModal();
    }
    
    // Function to render lyrics in the interface
    function renderLyrics() {
        // Clear container
        lyricsContainer.innerHTML = '';
        
        // Show empty state message if no lyrics
        if (lyricsCollection.length === 0) {
            lyricsContainer.appendChild(emptyLyrics);
            return;
        }
        
        // Hide empty state message
        if (emptyLyrics.parentNode === lyricsContainer) {
            lyricsContainer.removeChild(emptyLyrics);
        }
        
        // Render each lyric as a card
        lyricsCollection.forEach(lyric => {
            const card = createLyricCard(lyric);
            lyricsContainer.appendChild(card);
        });
    }
    
    // Function to create a lyric card
    function createLyricCard(lyric) {
        const card = document.createElement('div');
        card.className = 'lyrics-card';
        card.dataset.id = lyric.id;
        
        // Get genre name to display
        const genreName = getGenreName(lyric.genre);
        
        card.innerHTML = `
            <div class="card-header">
                <h3>${lyric.title}</h3>
                <span class="genre-tag">${genreName}</span>
            </div>
            <div class="card-body">
                <p class="lyrics-text">${lyric.lyrics}</p>
            </div>
            <div class="card-footer">
                <span>${lyric.date}</span>
                <div class="card-actions">
                    <button class="edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        
        // Add event listeners for edit and delete buttons
        const editBtn = card.querySelector('.edit-btn');
        const deleteBtn = card.querySelector('.delete-btn');
        
        editBtn.addEventListener('click', () => editLyric(lyric.id));
        deleteBtn.addEventListener('click', () => deleteLyric(lyric.id));
        
        return card;
    }
    
    // Function to get genre name
    function getGenreName(genreValue) {
        const genres = {
            'pop': 'Pop',
            'rock': 'Rock',
            'hiphop': 'Hip Hop',
            'rb': 'R&B',
            'folk': 'Folk',
            'electronic': 'Electronic',
            'other': 'Other'
        };
        
        return genres[genreValue] || 'Other';
    }
    
    // Function to edit a lyric
    function editLyric(id) {
        const lyric = lyricsCollection.find(item => item.id === id);
        
        if (!lyric) return;
        
        // Fill the form with lyric data
        document.getElementById('song-title').value = lyric.title;
        document.getElementById('song-genre').value = lyric.genre;
        document.getElementById('song-lyrics').value = lyric.lyrics;
        
        // Open modal
        openModal();
        
        // Modify form behavior to update instead of create
        const originalSubmitHandler = lyricsForm.onsubmit;
        lyricsForm.onsubmit = function(event) {
            event.preventDefault();
            
            // Update the lyric
            lyric.title = document.getElementById('song-title').value;
            lyric.genre = document.getElementById('song-genre').value;
            lyric.lyrics = document.getElementById('song-lyrics').value;
            
            // Save to localStorage
            localStorage.setItem('lyrics', JSON.stringify(lyricsCollection));
            
            // Update interface
            renderLyrics();
            
            // Close modal
            closeModal();
            
            // Restore original form behavior
            lyricsForm.onsubmit = originalSubmitHandler;
        };
    }
    
    // Function to delete a lyric
    function deleteLyric(id) {
        if (confirm('Are you sure you want to delete this lyric?')) {
            lyricsCollection = lyricsCollection.filter(item => item.id !== id);
            
            // Save to localStorage
            localStorage.setItem('lyrics', JSON.stringify(lyricsCollection));
            
            // Update interface
            renderLyrics();
        }
    }
    
    // Function to handle contact form submission
    function handleContactSubmit(event) {
        event.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        
        // Here you would normally send data to a server
        // Since it's a static page, we'll just show a success message
        
        alert(`Thank you ${name}! Your message has been sent successfully.`);
        contactForm.reset();
    }
    
    // Function to animate elements when visible in viewport
    function animateOnScroll() {
        const elements = document.querySelectorAll('.section-header, .lyrics-card, .contact-form, .contact-info');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.classList.add('animate');
            }
        });
    }
    
    // ===== EVENT LISTENERS =====
    
    // Scroll event for navbar style
    window.addEventListener('scroll', handleScroll);
    
    // Event for mobile menu
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    
    // Close menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMenuOnClick);
    });
    
    // Events for modal
    addLyricsBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside content
    window.addEventListener('click', function(event) {
        if (event.target === lyricsModal) {
            closeModal();
        }
    });
    
    // Event for lyrics form
    lyricsForm.addEventListener('submit', saveLyrics);
    
    // Event for file upload
    songFileInput.addEventListener('change', handleFileUpload);
    
    // Event for contact form
    contactForm.addEventListener('submit', handleContactSubmit);
    
    // Event for scroll animations
    window.addEventListener('scroll', animateOnScroll);
    
    // ===== INITIALIZATION =====
    
    // Render lyrics when page loads
    renderLyrics();
    
    // Call scroll function to set initial navbar style
    handleScroll();
    
    // Add CSS class for initial animations
    document.querySelector('.hero-text').classList.add('animate');
    document.querySelector('.hero-image').classList.add('animate');
    
    // Add CSS styles for animations
    const style = document.createElement('style');
    style.textContent = `
        .animate {
            animation: fadeInUp 0.8s ease forwards;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .section-header, .lyrics-card, .contact-form, .contact-info, .hero-text, .hero-image {
            opacity: 0;
        }
    `;
    document.head.appendChild(style);
}); 