// Header Sticky on Scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 0);
});

// Mobile Menu (Hamburger) Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navLinkItems = document.querySelectorAll('.nav-links li a');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close menu on link click
navLinkItems.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Form Submission Logic (Email + WhatsApp Fallback)
const contactForm = document.getElementById('booking-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('user-name').value;
        const phone = document.getElementById('user-phone').value;
        const location = document.getElementById('shooting-location').value;
        const message = document.getElementById('user-message').value;
        const submitBtn = contactForm.querySelector('.submit-btn');

        // Show loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        const formData = new FormData(contactForm);
        
        try {
            // NOTE: Formspree usually requires a proper Formspree ID (e.g., https://formspree.io/f/xyza123)
            // Using email directly often requires verification first.
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                alert(`Thank you ${name}! Your message has been sent to our email. We will contact you soon.`);
                
                // WhatsApp Option
                if(confirm("Would you like to send this request via WhatsApp as well?")) {
                    const waMessage = `Hello Bro Cinematic! My name is ${name}. I want to book a shoot. %0A📍 Location: ${location || 'Not specified'} %0A📞 Phone: ${phone} %0A💬 Message: ${message}`;
                    window.open(`https://wa.me/917500431460?text=${waMessage}`, '_blank');
                }
                
                contactForm.reset();
                if(locationStatus) locationStatus.textContent = "No area selected. Use search or click map.";
                if(marker) {
                    map.removeLayer(marker);
                    marker = null;
                }
            } else {
                alert('Oops! Error sending email. Please use WhatsApp for direct booking.');
                // Fallback to WhatsApp if email fails
                const waMessage = `Hello Bro Cinematic! (Email Error Fallback) %0AMy name is ${name}. %0A📍 Location: ${location || 'Not specified'} %0A📞 Phone: ${phone} %0A💬 Message: ${message}`;
                window.open(`https://wa.me/917500431460?text=${waMessage}`, '_blank');
            }
        } catch (error) {
            alert('Network error. Opening WhatsApp for your booking...');
            const waMessage = `Hello Bro Cinematic! %0AMy name is ${name}. %0A📍 Location: ${location || 'Not specified'} %0A📞 Phone: ${phone} %0A💬 Message: ${message}`;
            window.open(`https://wa.me/917500431460?text=${waMessage}`, '_blank');
        } finally {
            submitBtn.textContent = 'Send Message';
            submitBtn.disabled = false;
        }
    });
}

// Map Initialization and Search Logic
let map;
let marker;
let geocoder;
const locationInput = document.getElementById('shooting-location');
const locationStatus = document.getElementById('location-status');

function initMap() {
    if(!document.getElementById('map')) return;

    // Center of Delhi/NCR
    const defaultLocation = [28.6139, 77.2090];
    
    map = L.map('map').setView(defaultLocation, 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Add Geocoder Search
    geocoder = L.Control.geocoder({
        defaultMarkGeocode: false,
        placeholder: "Search shooting area (e.g. Noida, Delhi)..."
    })
    .on('markgeocode', function(e) {
        const latlng = e.geocode.center;
        const name = e.geocode.name;
        
        map.setView(latlng, 15);
        
        if (marker) {
            marker.setLatLng(latlng);
        } else {
            marker = L.marker(latlng, { draggable: true }).addTo(map);
            marker.on('dragend', function(event) {
                const position = marker.getLatLng();
                updateLocationInfo(position.lat.toFixed(6), position.lng.toFixed(6));
            });
        }
        
        updateLocationInfo(latlng.lat.toFixed(6), latlng.lng.toFixed(6), name);
    })
    .addTo(map);

    // Map Click Event
    map.on('click', function(e) {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);

        if (marker) {
            marker.setLatLng(e.latlng);
        } else {
            marker = L.marker(e.latlng, { draggable: true }).addTo(map);
            marker.on('dragend', function(event) {
                const position = marker.getLatLng();
                updateLocationInfo(position.lat.toFixed(6), position.lng.toFixed(6));
            });
        }

        updateLocationInfo(lat, lng);
    });
}

function updateLocationInfo(lat, lng, addressName = "") {
    const locationStr = `Lat: ${lat}, Lng: ${lng}`;
    const fullInfo = addressName ? `${addressName} (${locationStr})` : locationStr;
    
    if(locationInput) locationInput.value = fullInfo;
    if(locationStatus) {
        locationStatus.textContent = `📍 Selected: ${fullInfo}`;
        locationStatus.style.color = '#d4af37';
    }
}

// Initialize map when page loads
window.addEventListener('load', initMap);



// Video Gallery Logic (Click to Play)
document.querySelectorAll('.video-item').forEach(item => {
    item.addEventListener('click', function() {
        const videoId = this.getAttribute('data-video-id');
        const videoSrc = this.getAttribute('data-video-src');
        const videoType = this.getAttribute('data-type');
        
        if (videoType === 'instagram' && videoId) {
            this.innerHTML = `<iframe src="https://www.instagram.com/reel/${videoId}/embed" frameborder="0" scrolling="no" allowtransparency="true" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 10px;"></iframe>`;
        } else if (videoType === 'local' && videoSrc) {
            this.innerHTML = `<video controls autoplay style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;"><source src="${videoSrc}" type="video/mp4">Your browser does not support HTML5 video.</video>`;
        } else if (videoId) {
            this.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        }
    });
});

// Smooth Scroll for all links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add fade-in animations on scroll (Intersection Observer)
const observerOptions = {
    threshold: 0.2
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Select elements to animate
const sections = document.querySelectorAll('.services-grid, .video-gallery, .pricing-grid, .contact-wrapper');
sections.forEach(section => {
    section.classList.add('fade-in');
    observer.observe(section);
});
