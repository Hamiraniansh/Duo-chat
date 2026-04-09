// Socket.IO initialization (production-compatible)
const socketURL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000' 
    : window.location.origin;
const socket = io(socketURL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling']
});

// DOM Elements - Basic Chat
const loginScreen = document.getElementById('loginScreen');
const chatScreen = document.getElementById('chatScreen');
const usernameInput = document.getElementById('username');
const joinChatBtn = document.getElementById('joinChat');
const leaveChat = document.getElementById('leaveChat');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessage');
const messagesContainer = document.getElementById('messagesContainer');
const onlineUsers = document.getElementById('onlineUsers');
const userCount = document.getElementById('userCount');
const loader = document.querySelector('.loader');
const toggleSidebar = document.getElementById('toggleSidebar');
const sidebar = document.querySelector('.sidebar');

// DOM Elements - Profile Modal
const profileBtn = document.getElementById('profileBtn');
const profileModal = document.getElementById('profileModal');
const closeProfileModal = document.getElementById('closeProfileModal');
const cancelProfileBtn = document.getElementById('cancelProfileBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const modalOverlay = document.getElementById('modalOverlay');
const userProfileModal = document.getElementById('userProfileModal');
const closeUserProfileModal = document.getElementById('closeUserProfileModal');
const userProfileOverlay = document.getElementById('userProfileOverlay');
const userProfileCard = document.getElementById('userProfileCard');

// DOM Elements - Profile Form
const profileUsername = document.getElementById('profileUsername');
const profileBio = document.getElementById('profileBio');
const profileStatus = document.getElementById('profileStatus');
const profileStreak = document.getElementById('profileStreak');
const profileColor = document.getElementById('profileColor');
const avatarPreview = document.getElementById('avatarPreview');
const bioCount = document.getElementById('bioCount');

// DOM Elements - Couple Features
const themeBtn = document.getElementById('themeBtn');
const coupleFeatureBtn = document.getElementById('coupleFeatureBtn');
const themeModal = document.getElementById('themeModal');
const coupleFeatureModal = document.getElementById('coupleFeatureModal');
const scheduleModal = document.getElementById('scheduleModal');
const secretModal = document.getElementById('secretModal');
const coupleSetupModal = document.getElementById('coupleSetupModal');
const anniversaryModal = document.getElementById('anniversaryModal');
const showReactionsBtn = document.getElementById('showReactions');
const showStickersBtn = document.getElementById('showStickers');
const missYouBtn = document.getElementById('missYouBtn');
const scheduleBtn = document.getElementById('scheduleBtn');
const secretBtn = document.getElementById('secretBtn');
const reactionsBar = document.getElementById('reactionsBar');
const stickersBar = document.getElementById('stickersBar');
const typingIndicator = document.querySelector('.typing-indicator');

// Couple Stats Elements
const loveMeterDisplay = document.getElementById('loveMeter');
const dailyStreakDisplay = document.getElementById('dailyStreak');
const daysTogetherDisplay = document.getElementById('daysTogether');

// State Management
let currentUsername = '';
let currentUserProfile = {
    username: '',
    bio: '',
    status: 'online',
    streak: 0,
    color: '#667eea',
    avatar: '👤',
    socials: { twitter: '', github: '', linkedin: '', instagram: '' }
};

let currentTheme = localStorage.getItem('chatTheme') || 'default';
let currentAuthToken = localStorage.getItem('authToken') || null;
let coupleMode = {
    enabled: false,
    partnerUsername: '',
    nickname1: '',
    nickname2: '',
    loveMeter: 0,
    dailyStreak: 0,
    daysTogether: 0,
    anniversaryDate: null,
    currentMood: 'happy'
};

let isFirstMessage = true;
let allUserProfiles = new Map();

// ==================== AUTHENTICATION FUNCTIONS ====================
async function signup(username, email, password) {
    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(`Signup Error: ${data.error}`);
            return false;
        }

        alert('Account created successfully! You can now log in.');
        switchAuthForm('login');
        return true;
    } catch (error) {
        console.error('Signup error:', error);
        alert('Failed to create account. Please try again.');
        return false;
    }
}

async function login(username, password) {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(`Login Error: ${data.error}`);
            return false;
        }

        // Store auth token
        currentAuthToken = `Bearer ${username}:${password}`;
        localStorage.setItem('authToken', currentAuthToken);
        
        currentUsername = data.username;
        currentUserProfile = data.profile || currentUserProfile;
        
        loadProfileFromStorage();
        loadTheme();
        updateAvatarPreview();
        
        // Join chat with authenticated user
        socket.emit('user_join', { username: data.username, profile: currentUserProfile });
        
        return true;
    } catch (error) {
        console.error('Login error:', error);
        alert('Failed to log in. Please try again.');
        return false;
    }
}

function switchAuthForm(formType) {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const tabTitle = document.getElementById('tabTitle');
    const tabToggle = document.querySelector('.tab-toggle');

    if (formType === 'signup') {
        signupForm.style.display = 'block';
        loginForm.style.display = 'none';
        tabTitle.textContent = 'Create Account';
        tabToggle.textContent = 'Already have an account? Log in';
    } else {
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
        tabTitle.textContent = 'Log In';
        tabToggle.textContent = 'Don\'t have an account? Sign up';
    }
}

function loginAsGuest(prefix) {
    const username = `${prefix}_${Math.floor(Math.random() * 9000 + 1000)}`;
    currentUsername = username;
    loadProfileFromStorage();
    loadTheme();
    updateAvatarPreview();
    socket.emit('user_join', { username, profile: currentUserProfile });
}

// Handle OAuth callback
function handleOAuthCallback() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const user = params.get('user');
    const provider = params.get('provider');

    if (token && user) {
        currentAuthToken = token;
        currentUsername = user;
        localStorage.setItem('authToken', token);
        localStorage.setItem('authProvider', provider || 'oauth');
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        loadProfileFromStorage();
        loadTheme();
        updateAvatarPreview();
        socket.emit('user_join', { username: user, profile: currentUserProfile });
    }
}

// SSO Handler
async function handleSSO(email) {
    try {
        const response = await fetch('/api/auth/sso', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                provider: 'sso',
                providerId: email
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(`SSO Error: ${data.error}`);
            return false;
        }

        currentAuthToken = data.token;
        currentUsername = data.username;
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('authProvider', 'sso');
        
        currentUserProfile = data.profile || currentUserProfile;
        
        loadProfileFromStorage();
        loadTheme();
        updateAvatarPreview();
        socket.emit('user_join', { username: data.username, profile: currentUserProfile });
        
        return true;
    } catch (error) {
        console.error('SSO error:', error);
        alert('SSO login failed. Please try again.');
        return false;
    }
}

// Cursor tracking
const cursor = document.querySelector('.cursor');
const cursor2 = document.querySelector('.cursor2');

document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    if (cursor) {
        cursor.style.left = x - 10 + 'px';
        cursor.style.top = y - 10 + 'px';
    }
    if (cursor2) {
        cursor2.style.left = x - 4 + 'px';
        cursor2.style.top = y - 4 + 'px';
    }
});

// Apply theme immediately on load to prevent flicker
document.body.className = `theme-${currentTheme}`;

// Hide loader after 2 seconds
setTimeout(() => {
    if (loader) {
        loader.classList.add('hidden');
    }
}, 2000);

// ==================== THEME MANAGEMENT ====================
function setTheme(theme) {
    currentTheme = theme;
    document.body.className = `theme-${theme}`;
    localStorage.setItem('chatTheme', theme);
}

function loadTheme() {
    setTheme(currentTheme);
}

// ==================== COUPLE MODE MANAGEMENT ====================
function loadCoupleMode() {
    try {
        const saved = localStorage.getItem(`coupleMode_${currentUsername}`);
        if (saved) {
            coupleMode = JSON.parse(saved);
            // Calculate days together from anniversary
            if (coupleMode.anniversaryDate) {
                const anniversary = new Date(coupleMode.anniversaryDate);
                const today = new Date();
                const diffTime = Math.abs(today - anniversary);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                coupleMode.daysTogether = diffDays;
            }
        }
    } catch (error) {
        console.error('Error loading couple mode:', error);
    }
}

function saveCoupleMode() {
    try {
        localStorage.setItem(`coupleMode_${currentUsername}`, JSON.stringify(coupleMode));
    } catch (error) {
        console.error('Error saving couple mode:', error);
    }
}

// ==================== MODAL MANAGEMENT ====================
function closeModal(modal) {
    if (modal) modal.style.display = 'none';
}

function openModal(modal) {
    if (modal) modal.style.display = 'flex';
}

// Close modals when clicking overlay
[themeModal, coupleFeatureModal, scheduleModal, secretModal, coupleSetupModal, anniversaryModal].forEach(modal => {
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    }
});

// Prevent content propagation
document.querySelectorAll('.theme-modal, .couple-feature-modal, .schedule-modal, .secret-modal, .couple-setup-modal, .anniversary-modal').forEach(el => {
    el?.addEventListener('click', (e) => e.stopPropagation());
});

// Close buttons
document.querySelectorAll('.close-btn, .modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) closeModal(modal);
    });
});

// ==================== THEME SELECTOR ====================
if (themeBtn) {
    themeBtn.addEventListener('click', () => openModal(themeModal));
}

document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', () => {
        const theme = option.getAttribute('data-theme');
        if (theme) {
            setTheme(theme);
            document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
        }
    });
});

// ==================== REACTIONS & STICKERS ====================
if (showReactionsBtn) {
    showReactionsBtn.addEventListener('click', () => {
        if (reactionsBar) {
            reactionsBar.style.display = reactionsBar.style.display === 'flex' ? 'none' : 'flex';
        }
    });
}

if (showStickersBtn) {
    showStickersBtn.addEventListener('click', () => {
        if (stickersBar) {
            stickersBar.style.display = stickersBar.style.display === 'flex' ? 'none' : 'flex';
        }
    });
}

document.querySelectorAll('.reaction-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (!messageInput) {
            console.error('Message input not found');
            return;
        }
        const emoji = btn.textContent.trim();
        messageInput.value = (messageInput.value || '') + emoji + ' ';
        messageInput.focus();
        if (reactionsBar) reactionsBar.style.display = 'none';
        updateTypingIndicator();
    });
});

document.querySelectorAll('.sticker-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const sticker = btn.textContent.trim();
        socket.emit('send_message', {
            username: currentUsername,
            profile: currentUserProfile,
            message: sticker,
            timestamp: new Date()
        });
        if (stickersBar) stickersBar.style.display = 'none';
    });
});

// ==================== CUTE FEATURES ====================
let typingTimeout;
function updateTypingIndicator() {
    if (typingIndicator) {
        if (messageInput && messageInput.value.length > 0) {
            typingIndicator.style.opacity = '1';
        } else {
            typingIndicator.style.opacity = '0';
        }
    }
}

// Debounced typing indicator (100ms)
messageInput?.addEventListener('input', () => {
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(updateTypingIndicator, 100);
});

if (missYouBtn) {
    missYouBtn.addEventListener('click', () => {
        socket.emit('send_message', {
            username: currentUsername,
            profile: currentUserProfile,
            message: '🥺 I miss you...',
            timestamp: new Date()
        });
        createFloatingHearts(3);
    });
}

function createFloatingHearts(count) {
    for (let i = 0; i < count; i++) {
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style.cssText = `
            position: fixed;
            left: ${Math.random() * window.innerWidth}px;
            top: ${window.innerHeight}px;
            font-size: 2rem;
            pointer-events: none;
            animation: missYouFloat 3s ease-out forwards;
            z-index: 9999;
        `;
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 3000);
    }
}

// ==================== SCHEDULE & SECRET MESSAGES ====================
if (scheduleBtn) {
    scheduleBtn.addEventListener('click', () => openModal(scheduleModal));
}

if (secretBtn) {
    secretBtn.addEventListener('click', () => openModal(secretModal));
}

document.getElementById('confirmScheduleBtn')?.addEventListener('click', () => {
    const scheduleDate = document.getElementById('scheduleDate')?.value;
    const scheduleTime = document.getElementById('scheduleTime')?.value;
    const scheduleMessage = document.getElementById('scheduleMessageText')?.value;
    
    if (!scheduleDate || !scheduleTime || !scheduleMessage) {
        alert('Please fill in all fields');
        return;
    }
    
    try {
        socket.emit('schedule_message', {
            username: currentUsername,
            message: scheduleMessage.trim(),
            scheduledTime: `${scheduleDate}T${scheduleTime}`
        });
        if (scheduleModal) closeModal(scheduleModal);
        document.getElementById('scheduleDate').value = '';
        document.getElementById('scheduleTime').value = '';
        document.getElementById('scheduleMessageText').value = '';
        alert('Message scheduled! (Demo mode - not executed)');
    } catch (error) {
        console.error('Schedule error:', error);
        alert('Failed to schedule message');
    }
});

document.getElementById('sendSecretBtn')?.addEventListener('click', () => {
    const secretMessage = document.getElementById('secretMessageText')?.value;
    
    if (!secretMessage || !secretMessage.trim()) {
        alert('Please enter a secret message');
        return;
    }
    
    try {
        const encoded = btoa(secretMessage.trim());
        socket.emit('send_message', {
            username: currentUsername,
            profile: currentUserProfile,
            message: `🤫 [SECRET] ${encoded}`,
            timestamp: new Date(),
            isSecret: true
        });
        if (secretModal) closeModal(secretModal);
        if (document.getElementById('secretMessageText')) document.getElementById('secretMessageText').value = '';
    } catch (error) {
        console.error('Secret message error:', error);
        alert('Failed to send secret message');
    }
});

// Reveal secret messages on click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('message-secret') || e.target.closest('.message-secret')) {
        const secretEl = e.target.closest('.message-secret');
        if (secretEl && secretEl.classList.contains('blurred')) {
            secretEl.classList.remove('blurred');
            const encoded = secretEl.textContent.replace('[SECRET] ', '').trim();
            try {
                secretEl.textContent = '🔓 ' + atob(encoded);
            } catch (e) {
                console.error('Failed to decode secret', e);
            }
        }
    }
});

// ==================== COUPLE FEATURES ====================
if (coupleFeatureBtn) {
    coupleFeatureBtn.addEventListener('click', () => {
        if (!coupleMode.enabled) {
            openModal(coupleSetupModal);
        } else {
            openModal(coupleFeatureModal);
            updateCoupleStats();
        }
    });
}

// Fixed: Using startCoupleBtn instead of setupCoupleBtn
document.getElementById('startCoupleBtn')?.addEventListener('click', () => {
    const partnerUsername = document.getElementById('partnerUsername')?.value?.trim();
    const nickname1 = document.getElementById('coupleNickname1')?.value?.trim() || 'Partner 1';
    const nickname2 = document.getElementById('coupleNickname2')?.value?.trim() || 'Partner 2';
    const anniversaryDate = document.getElementById('coupleAnniversary')?.value;
    
    if (!partnerUsername) {
        alert('Please enter partner username');
        return;
    }
    
    if (partnerUsername === currentUsername) {
        alert('You cannot pair with yourself!');
        return;
    }
    
    try {
        coupleMode = {
            enabled: true,
            partnerUsername,
            nickname1,
            nickname2,
            loveMeter: 0,
            dailyStreak: 1,
            daysTogether: 0,
            anniversaryDate: anniversaryDate || null,
            currentMood: 'happy'
        };
        
        localStorage.setItem(`coupleMode_${currentUsername}`, JSON.stringify(coupleMode));
        socket.emit('couple_setup', { username: currentUsername, coupleData: coupleMode });
        closeModal(coupleSetupModal);
        document.getElementById('partnerUsername').value = '';
        document.getElementById('coupleNickname1').value = '';
        document.getElementById('coupleNickname2').value = '';
        document.getElementById('coupleAnniversary').value = '';
        setTimeout(() => openModal(coupleFeatureModal), 300);
    } catch (error) {
        console.error('Couple setup error:', error);
        alert('Failed to setup couple mode');
    }
});

// Tabs in couple feature modal
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        document.querySelectorAll('[data-tab-content]').forEach(content => {
            content.style.display = content.getAttribute('data-tab-content') === tabName ? 'block' : 'none';
        });
    });
});

// Mood selector
document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const mood = btn.getAttribute('data-mood');
        coupleMode.currentMood = mood;
        saveCoupleMode();
        
        document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        socket.emit('mood_update', {
            username: currentUsername,
            mood: mood
        });
    });
});

// Games
document.getElementById('truthDareBtn')?.addEventListener('click', () => {
    const questions = [
        'What is your biggest dream with me?',
        'What was your first impression of me?',
        'What makes you laugh the most?',
        'What is your favorite memory with me?',
        'What do you appreciate most about me?'
    ];
    const question = questions[Math.floor(Math.random() * questions.length)];
    alert('Truth or Dare: ' + question);
});

document.getElementById('loveQuizBtn')?.addEventListener('click', () => {
    alert('How many days have we been together? Start the quiz!');
});

document.getElementById('spinWheelBtn')?.addEventListener('click', () => {
    const tasks = [
        '💕 Send a sweet message',
        '🎬 Watch a movie together',
        '🎮 Play a game together',
        '📞 Voice call',
        '🍕 Suggest dinner date',
        '💌 Write a love note'
    ];
    const task = tasks[Math.floor(Math.random() * tasks.length)];
    alert('Your task: ' + task);
});

function updateCoupleStats() {
    if (loveMeterDisplay) loveMeterDisplay.textContent = coupleMode.loveMeter;
    if (dailyStreakDisplay) dailyStreakDisplay.textContent = coupleMode.dailyStreak;
    if (daysTogetherDisplay) daysTogetherDisplay.textContent = coupleMode.daysTogether;
    
    if (coupleMode.anniversaryDate) {
        const anniversary = new Date(coupleMode.anniversaryDate);
        const today = new Date();
        const daysLeft = Math.ceil((anniversary - today) / (1000 * 60 * 60 * 24));
        document.getElementById('anniversaryCountdown').textContent = 
            daysLeft > 0 ? `${daysLeft} days until anniversary` : 'Anniversary today! 🎉';
    }
}

// ==================== AVATAR GENERATION ====================
function generateAvatar(name) {
    const emojis = ['👤', '😀', '😎', '🤖', '🎨', '🚀', '💻', '🎭', '🌟', '⚡', '🔥', '💡', '🎯', '🎪'];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return emojis[hash % emojis.length];
}

function updateAvatarPreview() {
    currentUserProfile.avatar = generateAvatar(currentUsername);
    if (avatarPreview) avatarPreview.textContent = currentUserProfile.avatar;
}

// ==================== LOCAL STORAGE ====================
function saveProfileToStorage() {
    localStorage.setItem(`profile_${currentUsername}`, JSON.stringify(currentUserProfile));
}

function loadProfileFromStorage() {
    const saved = localStorage.getItem(`profile_${currentUsername}`);
    if (saved) {
        currentUserProfile = JSON.parse(saved);
    } else {
        currentUserProfile = {
            username: currentUsername,
            bio: '',
            status: 'online',
            streak: 0,
            color: '#667eea',
            avatar: generateAvatar(currentUsername),
            socials: { twitter: '', github: '', linkedin: '', instagram: '' }
        };
    }
    
    const savedCouple = localStorage.getItem(`coupleMode_${currentUsername}`);
    if (savedCouple) {
        coupleMode = JSON.parse(savedCouple);
    }
}

// ==================== PROFILE MODAL ====================
if (profileBtn) {
    profileBtn.addEventListener('click', () => {
        if (!currentUsername) return;
        populateProfileForm();
        openModal(profileModal);
    });
}

if (closeProfileModal) closeProfileModal.addEventListener('click', () => closeModal(profileModal));
if (cancelProfileBtn) cancelProfileBtn.addEventListener('click', () => closeModal(profileModal));
if (closeUserProfileModal) closeUserProfileModal.addEventListener('click', () => closeModal(userProfileModal));
if (modalOverlay) modalOverlay.addEventListener('click', () => closeModal(profileModal));
if (userProfileOverlay) userProfileOverlay.addEventListener('click', () => closeModal(userProfileModal));

if (profileBio) {
    profileBio.addEventListener('input', () => {
        if (bioCount) bioCount.textContent = `${profileBio.value.length}/150`;
    });
}

// Color Presets
document.querySelectorAll('.color-preset').forEach(preset => {
    preset.addEventListener('click', () => {
        const color = preset.getAttribute('data-color');
        if (profileColor) profileColor.value = color;
    });
});

function populateProfileForm() {
    if (profileUsername) profileUsername.value = currentUserProfile.username;
    if (profileBio) profileBio.value = currentUserProfile.bio;
    if (profileStatus) profileStatus.value = currentUserProfile.status;
    if (profileStreak) profileStreak.value = currentUserProfile.streak;
    if (profileColor) profileColor.value = currentUserProfile.color;
    if (bioCount) bioCount.textContent = `${currentUserProfile.bio.length}/150`;
    if (document.getElementById('socialTwitter')) document.getElementById('socialTwitter').value = currentUserProfile.socials?.twitter || '';
    if (document.getElementById('socialGithub')) document.getElementById('socialGithub').value = currentUserProfile.socials?.github || '';
    if (document.getElementById('socialLinkedin')) document.getElementById('socialLinkedin').value = currentUserProfile.socials?.linkedin || '';
    if (document.getElementById('socialInstagram')) document.getElementById('socialInstagram').value = currentUserProfile.socials?.instagram || '';
}

if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => {
        if (profileBio) currentUserProfile.bio = profileBio.value;
        if (profileStatus) currentUserProfile.status = profileStatus.value;
        if (profileStreak) currentUserProfile.streak = parseInt(profileStreak.value) || 0;
        if (profileColor) currentUserProfile.color = profileColor.value;
        
        currentUserProfile.socials = {
            twitter: document.getElementById('socialTwitter')?.value || '',
            github: document.getElementById('socialGithub')?.value || '',
            linkedin: document.getElementById('socialLinkedin')?.value || '',
            instagram: document.getElementById('socialInstagram')?.value || ''
        };
        
        saveProfileToStorage();
        socket.emit('profile_update', currentUserProfile);
        closeModal(profileModal);
    });
}

// ==================== CHAT FUNCTIONS ====================
function validateUsername(username) {
    username = username.trim();
    if (!username) return { valid: false, message: 'Username cannot be empty' };
    if (username.length < 3) return { valid: false, message: 'Username must be at least 3 characters' };
    if (username.length > 20) return { valid: false, message: 'Username cannot exceed 20 characters' };
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) return { valid: false, message: 'Only letters, numbers, hyphens, and underscores allowed' };
    return { valid: true, message: '' };
}

function joinChatHandler() {
    const username = usernameInput.value.trim();
    const validation = validateUsername(username);
    if (!validation.valid) {
        alert(`Invalid username: ${validation.message}`);
        return;
    }
    currentUsername = username;
    loadProfileFromStorage();
    loadTheme();
    updateAvatarPreview();
    socket.emit('user_join', { username, profile: currentUserProfile });
}

// ==================== AUTHENTICATION EVENT LISTENERS ====================

// Tab Switching
document.querySelectorAll('.auth-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const tabName = e.currentTarget.dataset.tab;
        
        // Update active tab button
        document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        // Show/hide tab content
        document.querySelectorAll('.auth-tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`${tabName}-tab`).style.display = 'block';
    });
});

// Tab Toggle (switching between signup and login)
const tabToggle = document.querySelector('.tab-toggle');
if (tabToggle) {
    tabToggle.addEventListener('click', () => {
        const signupForm = document.getElementById('signupForm');
        if (signupForm.style.display !== 'none') {
            switchAuthForm('login');
        } else {
            switchAuthForm('signup');
        }
    });
}

// Signup Form
const signupBtn = document.getElementById('signupBtn');
if (signupBtn) {
    signupBtn.addEventListener('click', async () => {
        const username = document.getElementById('signupUsername').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        const validation = validateUsername(username);
        if (!validation.valid) {
            alert(`Invalid username: ${validation.message}`);
            return;
        }

        const success = await signup(username, email, password);
        if (success) {
            document.getElementById('signupUsername').value = '';
            document.getElementById('signupEmail').value = '';
            document.getElementById('signupPassword').value = '';
            document.getElementById('signupConfirmPassword').value = '';
        }
    });
}

// Login Form
if (joinChatBtn) {
    joinChatBtn.addEventListener('click', async () => {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            alert('Please enter username and password');
            return;
        }

        const success = await login(username, password);
        if (success) {
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        }
    });
}

if (usernameInput) {
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') joinChatHandler();
    });
}

// SSO Button
const ssoBtn = document.getElementById('ssoBtn');
if (ssoBtn) {
    ssoBtn.addEventListener('click', async () => {
        const email = document.getElementById('ssoEmail').value.trim();
        
        if (!email) {
            alert('Please enter your company email');
            return;
        }

        const success = await handleSSO(email);
        if (success) {
            document.getElementById('ssoEmail').value = '';
        }
    });
}

// Check OAuth callback on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        handleOAuthCallback();
    });
} else {
    handleOAuthCallback();
}

if (joinChatBtn) joinChatBtn.addEventListener('click', joinChatHandler);
if (usernameInput) usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinChatHandler();
});

if (leaveChat) {
    leaveChat.addEventListener('click', () => {
        socket.emit('user_leave');
        currentUsername = '';
        if (loginScreen) loginScreen.style.display = 'flex';
        if (chatScreen) chatScreen.style.display = 'none';
        if (usernameInput) usernameInput.value = '';
        if (messagesContainer) messagesContainer.innerHTML = '<div class="welcome-message"><div class="welcome-icon"><i class="fas fa-rocket"></i></div><h3>Welcome to ChatSphere!</h3><p>Start chatting with others around the world</p></div>';
        isFirstMessage = true;
    });
}

function sendMessage() {
    if (!messageInput) {
        console.error('Message input element not found');
        return;
    }
    
    const message = messageInput.value.trim();
    if (!message) return;
    
    if (message.length > 500) {
        alert('Message is too long (max 500 characters)');
        return;
    }
    
    try {
        coupleMode.loveMeter += 5;
        saveCoupleMode();
        
        socket.emit('send_message', {
            username: currentUsername,
            profile: currentUserProfile,
            message: message,
            timestamp: new Date()
        });
        
        messageInput.value = '';
        if (typingIndicator) typingIndicator.style.opacity = '0';
    } catch (error) {
        console.error('Send message error:', error);
        alert('Failed to send message');
    }
}

if (sendMessageBtn) sendMessageBtn.addEventListener('click', sendMessage);
if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// ==================== SOCKET.IO EVENTS ====================
socket.on('connect', () => console.log('Connected to server'));

socket.on('user_joined', (data) => {
    const { username, profile } = data;
    if (profile) allUserProfiles.set(username, profile);
    if (username !== currentUsername) showSystemMessage(`${username} joined the chat 👋`);
});

socket.on('user_list_updated', (data) => {
    const { users, profiles } = data;
    if (profiles) Object.entries(profiles).forEach(([u, p]) => allUserProfiles.set(u, p));
    updateOnlineUsers(users, profiles);
    if (userCount) updateUserCount(users.length);
});

socket.on('receive_message', (data) => {
    const { username, profile, message, timestamp, isSecret } = data;
    displayMessage(username, profile, message, timestamp, username === currentUsername, isSecret);
});

socket.on('user_left', (data) => {
    showSystemMessage(`${data.username} left the chat 👋`);
    allUserProfiles.delete(data.username);
});

socket.on('user_login_accepted', (data) => {
    const { users, profiles } = data;
    if (loginScreen) loginScreen.style.display = 'none';
    if (chatScreen) chatScreen.style.display = 'flex';
    if (profiles) Object.entries(profiles).forEach(([u, p]) => allUserProfiles.set(u, p));
    loadCoupleMode();
    updateOnlineUsers(users, profiles);
    if (userCount) updateUserCount(users.length);
    clearWelcomeMessage();
});

socket.on('user_login_rejected', (data) => {
    alert(data.reason || 'Cannot join chat');
});

socket.on('profile_updated', (data) => {
    const { username, profile } = data;
    allUserProfiles.set(username, profile);
    if (username === currentUsername) {
        currentUserProfile = profile;
        saveProfileToStorage();
    }
});

socket.on('mood_update', (data) => {
    if (data.username === coupleMode.partnerUsername && data.mood === coupleMode.currentMood) {
        createFloatingHearts(5);
        showSystemMessage('🥰 Mood sync! Your partner feels the same way!');
    }
});

socket.on('couple_setup', (data) => {
    showSystemMessage(`💕 ${data.username} is now your couple partner!`);
});

socket.on('disconnect', () => console.log('Disconnected from server'));
socket.on('error', (error) => console.error('Socket error:', error));

// ==================== UI DISPLAY FUNCTIONS ====================
function displayMessage(username, profile, message, timestamp, isOwn, isSecret = false) {
    if (isFirstMessage) {
        clearWelcomeMessage();
        isFirstMessage = false;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isOwn ? 'own' : 'other'}`;
    const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const avatar = profile?.avatar || generateAvatar(username);
    const userColor = profile?.color || '#667eea';
    
    let messageContent = escapeHtml(message);
    let secretClass = '';
    
    if (isSecret && message.includes('[SECRET]')) {
        secretClass = ' message-secret blurred';
        messageContent = '🔒 Tap to reveal secret message';
    }
    
    messageDiv.innerHTML = `
        <div class="message-content${secretClass}" style="${!isOwn ? `border-left: 3px solid ${userColor};` : ''}">
            ${!isOwn ? `<div class="message-author" style="cursor: pointer; color: ${userColor}; font-weight: 700;">${avatar} ${username}</div>` : ''}
            <div class="message-text">${messageContent}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    if (!isOwn) {
        messageDiv.addEventListener('click', () => {
            if (allUserProfiles.has(username)) showUserProfile(username, allUserProfiles.get(username));
        });
    }
    
    if (messagesContainer) {
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function showSystemMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = 'text-align: center; color: var(--text-secondary); font-size: 0.9rem; margin: 1rem 0; padding: 0.5rem; opacity: 0.7;';
    messageDiv.innerHTML = `<i class="fas fa-info-circle"></i> ${text}`;
    if (messagesContainer) {
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function updateOnlineUsers(users, profiles = {}) {
    if (!onlineUsers) return;
    onlineUsers.innerHTML = '';
    users.forEach(user => {
        const profile = profiles[user] || allUserProfiles.get(user);
        const avatar = profile?.avatar || generateAvatar(user);
        const color = profile?.color || '#667eea';
        const userColor = profile?.status === 'online' ? '#10b981' : profile?.status === 'away' ? '#f59e0b' : '#ef4444';
        
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.style.cursor = 'pointer';
        userItem.innerHTML = `
            <div class="user-avatar" style="background: ${color};">${avatar}</div>
            <div class="user-info" style="flex: 1;">
                <div class="user-name">${user}</div>
                <div class="user-status" style="color: ${userColor};">${profile?.status || 'online'}</div>
            </div>
            ${profile?.streak > 0 ? `<div style="font-size: 0.9rem; color: #f59e0b;">🔥 ${profile.streak}</div>` : ''}
        `;
        
        userItem.addEventListener('click', () => {
            if (profile) showUserProfile(user, profile);
        });
        
        onlineUsers.appendChild(userItem);
    });
}

function updateUserCount(count) {
    if (userCount) userCount.textContent = `${count} online`;
}

function clearWelcomeMessage() {
    if (messagesContainer) {
        const welcomeMsg = messagesContainer.querySelector('.welcome-message');
        if (welcomeMsg) welcomeMsg.remove();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function hasActiveSocials(socials) {
    return socials && Object.values(socials).some(v => v);
}

function showUserProfile(username, profile) {
    if (!userProfileCard) return;
    
    userProfileCard.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar-large" style="background: ${profile.color};">${profile.avatar}</div>
            <div class="profile-name">${username}</div>
            <div class="profile-status-badge">
                ${profile.status === 'online' ? '🟢' : profile.status === 'away' ? '🟡' : '🔴'} ${profile.status}
            </div>
        </div>
        ${profile.bio ? `<p class="profile-bio">${escapeHtml(profile.bio)}</p>` : ''}
        <div class="profile-stats">
            ${profile.streak !== undefined ? `<div class="stat-item"><div class="stat-value">🔥</div><div class="stat-label">Streak</div><div class="stat-value" style="font-size: 1.4rem;">${profile.streak}</div></div>` : ''}
            <div class="stat-item"><div class="stat-value">⭐</div><div class="stat-label">Member</div></div>
        </div>
        ${hasActiveSocials(profile.socials) ? `
            <div class="profile-socials">
                ${profile.socials.twitter ? `<a class="social-link" href="https://twitter.com/${profile.socials.twitter}" target="_blank" title="Twitter"><i class="fab fa-twitter"></i></a>` : ''}
                ${profile.socials.github ? `<a class="social-link" href="https://github.com/${profile.socials.github}" target="_blank" title="GitHub"><i class="fab fa-github"></i></a>` : ''}
                ${profile.socials.linkedin ? `<a class="social-link" href="https://linkedin.com/in/${profile.socials.linkedin}" target="_blank" title="LinkedIn"><i class="fab fa-linkedin"></i></a>` : ''}
                ${profile.socials.instagram ? `<a class="social-link" href="https://instagram.com/${profile.socials.instagram}" target="_blank" title="Instagram"><i class="fab fa-instagram"></i></a>` : ''}
            </div>
        ` : ''}
    `;
    
    if (userProfileModal) userProfileModal.style.display = 'flex';
}

if (toggleSidebar) toggleSidebar.addEventListener('click', () => sidebar?.classList.toggle('collapsed'));
if (usernameInput) usernameInput.focus();

// Initialize theme on page load
loadTheme();

// ==================== CONTACT FORM HANDLING ====================
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');
const contactSection = document.getElementById('contactSection');
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mjgpdozq';

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('contactName')?.value;
        const email = document.getElementById('contactEmail')?.value;
        const message = document.getElementById('contactMessage')?.value;
        
        if (!name || !email || !message) {
            showFormError('Please fill in all fields');
            return;
        }
        
        // Disable submit button
        const submitBtn = contactForm.querySelector('.send-love-btn');
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.6';
        submitBtn.style.cursor = 'not-allowed';
        
        try {
            const response = await fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    message: message
                })
            });
            
            if (response.ok) {
                showFormSuccess('Message sent 💖');
                contactForm.reset();
                
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Formspree error:', error);
            showFormError('Failed to send message. Please try again.');
            
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        }
    });
}

function showFormSuccess(message) {
    if (formMessage) {
        formMessage.textContent = message;
        formMessage.className = 'form-message success';
        
        setTimeout(() => {
            formMessage.textContent = '';
            formMessage.className = 'form-message';
        }, 4000);
    }
}

function showFormError(message) {
    if (formMessage) {
        formMessage.textContent = message;
        formMessage.className = 'form-message error';
        
        setTimeout(() => {
            formMessage.textContent = '';
            formMessage.className = 'form-message';
        }, 4000);
    }
}
// ==================== AI ASSISTANT FUNCTIONS ====================

// AI Assistant DOM Elements
const aiFloatBtn = document.getElementById('aiFloatBtn');
const aiCloseBtn = document.getElementById('aiCloseBtn');
const aiChatPanel = document.getElementById('aiChatPanel');
const aiMessages = document.getElementById('aiMessages');
const aiInput = document.getElementById('aiInput');
const aiSendBtn = document.getElementById('aiSendBtn');
const aiQuickActions = document.getElementById('aiQuickActions');
const aiTypingIndicator = document.getElementById('aiTypingIndicator');
const aiBadge = document.getElementById('aiBadge');

let aiConversationHistory = [];
let aiUnreadMessages = 0;

// Toggle AI Chat Panel
function toggleAIPanel() {
    const isHidden = aiChatPanel.style.display === 'none';
    aiChatPanel.style.display = isHidden ? 'flex' : 'none';
    
    if (isHidden) {
        aiUnreadMessages = 0;
        aiBadge.style.display = 'none';
        aiInput.focus();
    }
}

// Send AI Message
async function sendAIMessage() {
    const message = aiInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addAIMessage(message, 'user');
    aiInput.value = '';

    // Show typing indicator
    aiTypingIndicator.style.display = 'flex';

    try {
        const response = await getMockAIResponse(message);
        aiConversationHistory.push({ role: 'assistant', content: response });
        
        // Add bot response
        addAIMessage(response, 'bot');
    } catch (error) {
        console.error('AI Chat error:', error);
        addAIMessage('Sorry, I encountered an error. Please try again.', 'bot');
    } finally {
        aiTypingIndicator.style.display = 'none';
    }
}

// Add Message to AI Chat
function addAIMessage(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ai-${role}-message`;

    if (role === 'bot') {
        messageDiv.innerHTML = `
            <div class="ai-message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="ai-message-content">${formatAIResponse(content)}</div>
            <span class="ai-message-time">now</span>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="ai-message-content">${escapeHtml(content)}</div>
            <span class="ai-message-time">now</span>
        `;
    }

    aiMessages.appendChild(messageDiv);
    aiMessages.scrollTop = aiMessages.scrollHeight;

    // Store in history
    aiConversationHistory.push({ role, content });
}

// Format AI Response
function formatAIResponse(content) {
    let formatted = escapeHtml(content);
    formatted = formatted.replace(/\n/g, '<br>');
    formatted = formatted.replace(/� /g, '� ');
    return formatted;
}

// AI Response Database
const aiResponses = {
    help: `I can help you with:
� ?? Chatting and conversation tips
� ?? Discussion strategies
� ?? App feature explanations
� ????? Developer contact information
� ?? Troubleshooting common issues
� ?? Couple mode features
� ?? Theme and customization

What would you like help with?`,

    tips: `Here are chatting tips:
� Listen actively to others
� Use emojis to express emotions ??
� Ask open-ended questions
� Be respectful and kind
� Keep messages clear and concise
� Use reactions to show appreciation
� Set your status so others know availability

Need specific tips?`,

    features: `ChatSphere features:
� ?? Real-time global chat
� ?? Customizable user profiles
� ?? Online user list
� ?? Couple Mode with streaks
� ?? Multiple themes & colors
� ? Reactions & stickers
� ?? Secret messages
� ?? Scheduled messages
� ?? Dark theme

Need more details?`,

    contact: `Reach the developer:
?? Email: developer@chatsphere.com
?? GitHub: github.com/developer
?? Twitter: @chatsphere_dev

Report issues and suggest features!`,

    couple: `Couple Mode features:
� ?? Love Meter tracking
� ?? Daily Streaks
� ?? Anniversary tracking
� ?? Couple themes
� ?? Secret messages
� ?? Message scheduler
� ? Special effects

Click Couple Features button!`,

    default: `I'm ChatSphere AI! I can help with:
� Chatting advice
� Feature explanations
� Troubleshooting
� Developer contact

What do you need?`
};

// Process User Input
function processAIInput(userMessage) {
    const lower = userMessage.toLowerCase();
    
    if (lower.includes('couple') || lower.includes('partner') || lower.includes('streak')) {
        return aiResponses.couple;
    } else if (lower.includes('feature')) {
        return aiResponses.features;
    } else if (lower.includes('tip') || lower.includes('advice')) {
        return aiResponses.tips;
    } else if (lower.includes('contact') || lower.includes('developer') || lower.includes('email')) {
        return aiResponses.contact;
    } else if (lower.includes('help')) {
        return aiResponses.help;
    } else {
        return aiResponses.default;
    }
}

// Mock AI Response (will be replaced with real API)
// Get AI Response from Backend
async function getMockAIResponse(message) {
    try {
        const apiURL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://localhost:5000' 
            : window.location.origin;

        const response = await fetch(`${apiURL}/api/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: message,
                history: aiConversationHistory 
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get AI response');
        }

        const data = await response.json();
        return data.reply;
    } catch (error) {
        console.error('AI API error:', error);
        return "Sorry, I couldn't process that. Please try again or contact the developer at developer@chatsphere.com";
    }
}

// Event Listeners
if (aiFloatBtn) aiFloatBtn.addEventListener('click', toggleAIPanel);
if (aiCloseBtn) aiCloseBtn.addEventListener('click', toggleAIPanel);
if (aiSendBtn) aiSendBtn.addEventListener('click', sendAIMessage);

if (aiInput) {
    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendAIMessage();
        }
    });
}

// Quick Action Buttons
document.querySelectorAll('.ai-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const messages = {
            help: "Can you help me?",
            tips: "Give me chatting tips",
            features: "Tell me about features",
            contact: "How do I contact the developer?"
        };
        
        if (messages[action]) {
            aiInput.value = messages[action];
            sendAIMessage();
        }
    });
});

// ==================== PREMIUM FEATURES ====================

// Premium Features State
let premiumState = {
    dndMode: false,
    readReceipts: true,
    activeStatus: true,
    encryptionMode: true,
    disappearingMode: false,
    voiceMessages: [],
    pinnedMessages: [],
    chatHistory: [],
    messageReactions: {},
    scheduledMessages: [],
};

// DOM Elements - Premium Features
const voiceRecordBtn = document.getElementById('voiceRecordBtn');
const searchBtn = document.getElementById('searchBtn');
const premiumSettingsBtn = document.getElementById('premiumSettingsBtn');
const recordBtn = document.getElementById('recordBtn');
const playVoiceBtn = document.getElementById('playVoiceBtn');
const sendVoiceBtn = document.getElementById('sendVoiceBtn');
const closeVoiceModal = document.getElementById('closeVoiceModal');
const closeSearchModal = document.getElementById('closeSearchModal');
const closePremiumSettingsModal = document.getElementById('closePremiumSettingsModal');
const dndMode = document.getElementById('dndMode');
const readReceipts = document.getElementById('readReceipts');
const activeStatus = document.getElementById('activeStatus');
const encryptionMode = document.getElementById('encryptionMode');
const disappearingMode = document.getElementById('disappearingMode');
const exportChatBtn = document.getElementById('exportChatBtn');
const pinMessageBtn = document.getElementById('pinMessageBtn');

// Voice Recording Variables
let mediaRecorder;
let audioChunks = [];
let recordingStartTime;
let recordingTime = 0;
let recordingInterval;

// Initialize Premium Features
function initPremiumFeatures() {
    // Voice Record Button
    if (voiceRecordBtn) {
        voiceRecordBtn.addEventListener('click', () => {
            const modal = document.getElementById('voiceModal');
            if (modal) modal.style.display = 'flex';
            initVoiceRecorder();
        });
    }

    // Search Button
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const modal = document.getElementById('searchModal');
            if (modal) modal.style.display = 'flex';
            document.getElementById('searchInput')?.focus();
        });
    }

    // Premium Settings Button
    if (premiumSettingsBtn) {
        premiumSettingsBtn.addEventListener('click', () => {
            const modal = document.getElementById('premiumSettingsModal');
            if (modal) modal.style.display = 'flex';
        });
    }

    // Record Button
    if (recordBtn) {
        recordBtn.addEventListener('click', toggleVoiceRecording);
    }

    // Play Voice Button
    if (playVoiceBtn) {
        playVoiceBtn.addEventListener('click', playVoiceMessage);
    }

    // Send Voice Button
    if (sendVoiceBtn) {
        sendVoiceBtn.addEventListener('click', sendVoiceMessage);
    }

    // Modal Close Buttons
    if (closeVoiceModal) {
        closeVoiceModal.addEventListener('click', () => {
            document.getElementById('voiceModal').style.display = 'none';
            stopVoiceRecording();
        });
    }

    if (closeSearchModal) {
        closeSearchModal.addEventListener('click', () => {
            document.getElementById('searchModal').style.display = 'none';
        });
    }

    if (closePremiumSettingsModal) {
        closePremiumSettingsModal.addEventListener('click', () => {
            document.getElementById('premiumSettingsModal').style.display = 'none';
        });
    }

    // Toggle Switches
    if (dndMode) {
        dndMode.addEventListener('change', (e) => {
            premiumState.dndMode = e.target.checked;
            updateDNDStatus();
        });
    }

    if (readReceipts) {
        readReceipts.addEventListener('change', (e) => {
            premiumState.readReceipts = e.target.checked;
        });
    }

    if (activeStatus) {
        activeStatus.addEventListener('change', (e) => {
            premiumState.activeStatus = e.target.checked;
        });
    }

    if (encryptionMode) {
        encryptionMode.addEventListener('change', (e) => {
            premiumState.encryptionMode = e.target.checked;
        });
    }

    if (disappearingMode) {
        disappearingMode.addEventListener('change', (e) => {
            premiumState.disappearingMode = e.target.checked;
        });
    }

    // Export Chat Button
    if (exportChatBtn) {
        exportChatBtn.addEventListener('click', exportChatHistory);
    }

    // Pin Message Button
    if (pinMessageBtn) {
        pinMessageBtn.addEventListener('click', showPinnedMessages);
    }

    // Search Functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
    }

    // Message Reactions
    const reactionBtns = document.querySelectorAll('.reaction-btn');
    reactionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            addReactionToMessage(btn.dataset.reaction);
        });
    });

    // Export Analytics
    setupAnalyticsDashboard();
}

// ==================== VOICE MESSAGE FUNCTIONS ====================

function initVoiceRecorder() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (e) => {
                audioChunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const playbackDiv = document.getElementById('voicePlayback');
                const recordDiv = document.getElementById('voiceRecorder');
                
                if (playbackDiv && recordDiv) {
                    recordDiv.style.display = 'none';
                    playbackDiv.style.display = 'flex';
                }

                if (playVoiceBtn) {
                    playVoiceBtn.onclick = () => {
                        const audio = new Audio(audioUrl);
                        audio.play();
                    };
                }

                // Store for sending
                window.voiceBlob = audioBlob;
            };
        })
        .catch(err => {
            console.error('Microphone access denied:', err);
            alert('Please allow microphone access to use voice messages!');
        });
}

function toggleVoiceRecording() {
    if (!mediaRecorder) return;

    if (mediaRecorder.state === 'inactive') {
        recordingStartTime = Date.now();
        recordingTime = 0;
        recordingInterval = setInterval(() => {
            recordingTime++;
            const mins = Math.floor(recordingTime / 60);
            const secs = recordingTime % 60;
            const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            const timeDisplay = document.getElementById('recordTime');
            if (timeDisplay) timeDisplay.textContent = timeStr;
        }, 1000);

        mediaRecorder.start();
        recordBtn.classList.add('recording');
        const status = document.getElementById('recordStatus');
        if (status) status.textContent = 'Recording... Click to stop';
    } else if (mediaRecorder.state === 'recording') {
        stopVoiceRecording();
    }
}

function stopVoiceRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        recordBtn.classList.remove('recording');
        clearInterval(recordingInterval);
        const status = document.getElementById('recordStatus');
        if (status) status.textContent = 'Recording complete!';
    }
}

function playVoiceMessage() {
    // Play logic handled in toggleVoiceRecording
}

function sendVoiceMessage() {
    if (!window.voiceBlob) {
        alert('No voice message recorded!');
        return;
    }

    const formData = new FormData();
    formData.append('audio', window.voiceBlob, 'voice-message.mp3');
    formData.append('username', currentUsername);

    sendMessageViaSocket({
        type: 'voice',
        size: window.voiceBlob.size,
        encrypted: premiumState.encryptionMode,
    });

    const playbackDiv = document.getElementById('voicePlayback');
    const recordDiv = document.getElementById('voiceRecorder');
    if (playbackDiv && recordDiv) {
        playbackDiv.style.display = 'none';
        recordDiv.style.display = 'flex';
    }

    document.getElementById('voiceModal').style.display = 'none';
}

// ==================== MESSAGE SEARCH FUNCTIONS ====================

function performSearch(e) {
    const query = e.target.value.toLowerCase();
    const filter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const resultsDiv = document.getElementById('searchResults');

    if (!query) {
        resultsDiv.innerHTML = '<p class="search-hint">Start typing to search...</p>';
        return;
    }

    const messages = Array.from(document.querySelectorAll('.message'));
    let results = messages.filter(msg => {
        const text = msg.textContent.toLowerCase();
        return text.includes(query);
    });

    if (filter !== 'all') {
        results = results.filter(msg => {
            if (filter === 'user') return msg.classList.contains('own-message');
            if (filter === 'media') return msg.querySelector('img, video, audio');
            if (filter === 'links') return msg.textContent.includes('http');
            return true;
        });
    }

    if (results.length === 0) {
        resultsDiv.innerHTML = '<p class="search-hint">No messages found</p>';
        return;
    }

    resultsDiv.innerHTML = results.map((msg, idx) => `
        <div class="search-result-item" onclick="scrollToMessage(${idx})">
            <p>${msg.textContent.substring(0, 100)}...</p>
            <small>${msg.dataset.time || 'Just now'}</small>
        </div>
    `).join('');
}

// ==================== MESSAGE REACTIONS ====================

function addReactionToMessage(reaction) {
    const lastMessage = document.querySelector('.message:last-child');
    if (!lastMessage) {
        alert('No messages to react to!');
        return;
    }

    const msgId = lastMessage.id || Date.now();
    if (!premiumState.messageReactions[msgId]) {
        premiumState.messageReactions[msgId] = [];
    }

    premiumState.messageReactions[msgId].push({
        emoji: reaction,
        user: currentUsername,
        time: new Date(),
    });

    displayMessageReactions(msgId);
    document.getElementById('reactionsModal').style.display = 'none';
}

function displayMessageReactions(msgId) {
    const msg = document.getElementById(msgId);
    if (!msg) return;

    const reactions = premiumState.messageReactions[msgId] || [];
    const reactionsStr = [...new Set(reactions.map(r => r.emoji))].join(' ');

    let reactionsEl = msg.querySelector('.message-reactions');
    if (!reactionsEl) {
        reactionsEl = document.createElement('div');
        reactionsEl.className = 'message-reactions';
        msg.appendChild(reactionsEl);
    }

    reactionsEl.textContent = reactionsStr;
}

// ==================== CHAT EXPORT & ANALYTICS ====================

function exportChatHistory() {
    const messages = Array.from(document.querySelectorAll('.message'));
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Username,Message,Type,Timestamp,Reactions\\n';

    messages.forEach(msg => {
        const username = msg.querySelector('.message-author')?.textContent || 'Unknown';
        const text = msg.textContent.replace(/,/g, '').replace(/\\n/g, ' ');
        const time = msg.dataset.time || new Date().toLocaleString();
        const reactions = Object.values(premiumState.messageReactions).flat()
            .filter(r => r.message === msg.id).map(r => r.emoji).join('');

        csvContent += `"${username}","${text}","text","${time}","${reactions}"\\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chat-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
}

function showPinnedMessages() {
    const modal = document.getElementById('pinnedModal');
    const pinnedList = document.getElementById('pinnedList');

    if (premiumState.pinnedMessages.length === 0) {
        pinnedList.innerHTML = '<p class="empty-state">No pinned messages yet!</p>';
    } else {
        pinnedList.innerHTML = premiumState.pinnedMessages.map(msg => `
            <div class="pinned-message" onclick="scrollToMessage('${msg.id}')">
                <p>${msg.text}</p>
                <small>${msg.username} � ${msg.time}</small>
            </div>
        `).join('');
    }

    if (modal) modal.style.display = 'flex';
}

function pinMessage(messageId) {
    const msg = document.getElementById(messageId);
    if (!msg) return;

    premiumState.pinnedMessages.push({
        id: messageId,
        text: msg.textContent,
        username: msg.dataset.username || 'Unknown',
        time: new Date().toLocaleTimeString(),
    });

    alert('Message pinned! ');
}

// ==================== DO NOT DISTURB MODE ====================

function updateDNDStatus() {
    const indicator = document.querySelector('.dnd-indicator') || createDNDIndicator();

    if (premiumState.dndMode) {
        indicator.classList.add('active');
    } else {
        indicator.classList.remove('active');
    }
}

function createDNDIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'dnd-indicator';
    indicator.innerHTML = '?? Do Not Disturb Mode';
    document.body.appendChild(indicator);
    return indicator;
}

// ==================== ANALYTICS DASHBOARD ====================

function setupAnalyticsDashboard() {
    document.querySelectorAll('.modal-content').forEach(modal => {
        if (modal.classList.contains('analytics-modal')) {
            updateAnalytics();
        }
    });
}

function updateAnalytics() {
    const messages = Array.from(document.querySelectorAll('.message'));
    const totalMessages = messages.length;
    const avgResponse = Math.floor(Math.random() * 30) + 5; // Demo: 5-35 seconds

    const totalMsgs = document.getElementById('totalMessages');
    const avgResp = document.getElementById('avgResponse');
    const mostActive = document.getElementById('mostActive');
    const chatScore = document.getElementById('chatScore');

    if (totalMsgs) totalMsgs.textContent = totalMessages;
    if (avgResp) avgResp.textContent = avgResponse + 's';
    if (mostActive) mostActive.textContent = new Date().getHours() > 12 ? 'Evening' : 'Morning';
    if (chatScore) chatScore.textContent = Math.min(100, Math.floor((totalMessages / 100) * 100)) + '/100';
}

// ==================== ENCRYPTION INDICATOR ====================

function addEncryptionBadge(messageElement) {
    if (!premiumState.encryptionMode) return;

    const badge = document.createElement('span');
    badge.className = 'encryption-badge';
    badge.innerHTML = '<i class="fas fa-lock"></i> Encrypted';
    messageElement.appendChild(badge);
}

// ==================== READ RECEIPTS ====================

function addReadReceipt(messageElement) {
    if (!premiumState.readReceipts) return;

    const receipt = document.createElement('span');
    receipt.className = 'read-receipt double-check';
    receipt.innerHTML = '??';
    receipt.title = 'Read at ' + new Date().toLocaleTimeString();
    messageElement.appendChild(receipt);
}

// ==================== START PREMIUM FEATURES ====================
document.addEventListener('DOMContentLoaded', initPremiumFeatures);

