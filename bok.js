
// Supabase Blog Admin JavaScript
 let supabase = null;
 let supabaseClient = null;
 let currentEditingPost = null;
 let isConnected = false;

// Wait for Supabase to load
function waitForSupabase() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        const checkSupabase = () => {
            attempts++;
            if (window.supabase && window.supabase.createClient) {
                console.log('Supabase library found');
                resolve(window.supabase);
            } else if (attempts >= maxAttempts) {
                reject(new Error('Supabase library failed to load after 5 seconds'));
            } else {
                setTimeout(checkSupabase, 100);
            }
        };
        
        checkSupabase();
    });
}





// Initialize admin interface
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Supabase Blog Admin loaded, initializing...');
    
    // Set today's date as default
    document.getElementById('postDate').value = new Date().toISOString().split('T')[0];
    
    // Load saved configuration
    // loadConfig();
    
    // Initialize admin features
    initializeAdminNavigation();
    initializePostForm();
    initializeImageUpload();
    initializeTagsInput();
    initializeMediaUpload();
    
    // Wait for Supabase to load, then try to connect if config exists
    try {
        await waitForSupabase();
        console.log('Supabase library loaded successfully');
        
        if (getConfig().url && getConfig().key) {
            initializeSupabase();
        } else {
            updateConnectionStatus(false, 'Configuration required');
        }
    } catch (error) {
        console.error('Failed to load Supabase library:', error);
        updateConnectionStatus(false, 'Supabase library failed to load');
        showNotification('Failed to load Supabase library. Please refresh the page.', 'error');
    }
});

// Configuration Management
// function getConfig() {
//     const config = localStorage.getItem('supabaseConfig');
//     return config ? JSON.parse(config) : { url: '', key: '' };
// }

// function saveConfig() {
//     const url = document.getElementById('supabaseUrl').value.trim();
//     const key = document.getElementById('supabaseKey').value.trim();
    
//     if (!url || !key) {
//         showNotification('Please enter both URL and API key', 'error');
//         return;
//     }
    
//     const config = { url, key };
//     localStorage.setItem('supabaseConfig', JSON.stringify(config));
    
//     showNotification('Configuration saved successfully!', 'success');
    
//     // Initialize Supabase with new config
//     initializeSupabase();
// }

// function loadConfig() {
//     const config = getConfig();
//     if (config.url) {
//         document.getElementById('supabaseUrl').value = config.url;
//     }
//     if (config.key) {
//         document.getElementById('supabaseKey').value = config.key;
//     }
// }

async function testConnection() {
    const url = document.getElementById('supabaseUrl').value.trim();
    const key = document.getElementById('supabaseKey').value.trim();
    
    if (!url || !key) {
        showNotification('Please enter both URL and API key', 'error');
        return;
    }
    
    try {
        // Ensure Supabase is loaded
        if (!window.supabase || !window.supabase.createClient) {
            await waitForSupabase();
        }
        
        // Create temporary client for testing
        const testClient = window.supabase.createClient(url, key);
        
        showNotification('Testing connection...', 'info');
        
        // Test connection by trying to fetch from a table
        const response = await testClient.from('blog_posts').select('count').limit(1);
        
        if (response.error) {
            showNotification(`Connection failed: ${response.error.message}`, 'error');
        } else {
            showNotification('Connection successful!', 'success');
            saveConfig();
        }
    } catch (error) {
        showNotification(`Connection failed: ${error.message}`, 'error');
    }
}

// // Supabase Initialization
// async function initializeSupabase() {
//     const config = getConfig();
//     if (!config.url || !config.key) {
//         updateConnectionStatus(false, 'Configuration required');
//         return;
//     }
    
//     try {
//         // Ensure Supabase is loaded
//         if (!window.supabase || !window.supabase.createClient) {
//             await waitForSupabase();
//         }
        
//         supabaseClient = window.supabase.createClient(config.url, config.key);
//         supabase = supabaseClient;
        
//         console.log('Supabase client created successfully');
        
//         // Test connection
//         await testSupabaseConnection();
//     } catch (error) {
//         console.error('Failed to initialize Supabase:', error);
//         updateConnectionStatus(false, 'Initialization failed');
//         showNotification(`Failed to initialize Supabase client: ${error.message}`, 'error');
//     }
// }
// Supabase Initialization (Cleaned + Auto)
async function initializeSupabase() {
    try {
      // ✅ Wait for Supabase library to load (important for slow connections)
      const supabaseLib = await waitForSupabase();
  
      // ✅ Pull from hardcoded config (defined in SupaBaseConfig.js)
      const config = {
        url: window.SUPABASE_URL || "https://cgdokqdqpwmbyybpuexv.supabase.co",
        key: window.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZG9rcWRxcHdtYnl5YnB1ZXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDQyODMsImV4cCI6MjA3NjMyMDI4M30.F-xqL511-WIWsLmYUuOVgFtVZPgJyXwxWymrlIdfI1I"
      };
  
      // ✅ Create client
      supabaseClient = supabaseLib.createClient(config.url, config.key);
      supabase = supabaseClient;
      console.log("✅ Supabase client created successfully");
  
      // ✅ Test connection by fetching a sample record
      const { error } = await supabase.from("blog_posts").select("id").limit(1);
      if (error) throw error;
  
      // ✅ Update UI + dashboard
      isConnected = true;
      console.log("✅ Connected to Supabase successfully!");
      document.body.classList.add("connected");
  
      // Optional: your existing dashboard refresh
      if (typeof loadDashboard === "function") loadDashboard();
  
    } catch (error) {
      console.error("❌ Failed to initialize Supabase:", error);
      updateConnectionStatus(false, "Initialization failed");
      showNotification(`Failed to initialize Supabase: ${error.message}`, "error");
    }
  }
  

async function testSupabaseConnection() {
    try {
        updateConnectionStatus(false, 'Testing connection...');
        
        // Try to fetch from blog_posts table
        const { data, error } = await supabaseClient
            .from('blog_posts')
            .select('count')
            .limit(1);
        
        if (error) {
            throw error;
        }
        
        isConnected = true;
        updateConnectionStatus(true, 'Connected');
        showNotification('Successfully connected to Supabase!', 'success');
        
        // Load data
        loadDashboardData();
        
    } catch (error) {
        console.error('Supabase connection test failed:', error);
        isConnected = false;
        updateConnectionStatus(false, 'Connection failed');
        showNotification(`Connection failed: ${error.message}`, 'error');
    }
}

function updateConnectionStatus(connected, message) {
    const statusElement = document.getElementById('connectionStatus');
    const icon = statusElement.querySelector('i');
    const text = statusElement.querySelector('span');
    
    if (connected) {
        statusElement.className = 'connection-status status-connected';
        icon.className = 'fas fa-circle';
        text.textContent = message;
    } else {
        statusElement.className = 'connection-status status-disconnected';
        icon.className = 'fas fa-circle';
        text.textContent = message;
    }
}

// Admin Navigation
function initializeAdminNavigation() {
    const navButtons = document.querySelectorAll('.admin-nav-btn');
    const sections = document.querySelectorAll('.admin-section');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Remove active class from all buttons and sections
            navButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked button and target section
            this.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
            
            // Load section-specific data
            if (targetSection === 'posts') {
                loadAllPosts();
            } else if (targetSection === 'dashboard') {
                loadDashboardData();
            } else if (targetSection === 'media') {
                loadMediaLibrary();
            }
        });
    });
}

// Dashboard Data Loading
async function loadDashboardData() {
    if (!isConnected) {
        showDashboardError('Not connected to database');
        return;
    }
    
    try {
        // Load posts for statistics
        const { data: posts, error } = await supabaseClient
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        updateDashboardStats(posts);
        loadRecentPosts(posts);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showDashboardError('Failed to load dashboard data');
    }
}

function updateDashboardStats(posts) {
    const totalPosts = posts.length;
    const publishedPosts = posts.filter(post => post.published).length;
    const draftPosts = totalPosts - publishedPosts;
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
    
    // Calculate changes (simplified - in real app, you'd compare with previous period)
    const thisWeekPosts = posts.filter(post => {
        const postDate = new Date(post.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return postDate > weekAgo;
    }).length;
    
    document.getElementById('totalPosts').textContent = totalPosts;
    document.getElementById('publishedPosts').textContent = publishedPosts;
    document.getElementById('draftPosts').textContent = draftPosts;
    document.getElementById('totalViews').textContent = totalViews.toLocaleString();
    
    document.getElementById('postsChange').textContent = `+${thisWeekPosts} this week`;
    document.getElementById('publishedChange').textContent = `+${thisWeekPosts} this week`;
    document.getElementById('draftChange').textContent = `${draftPosts} pending`;
    document.getElementById('viewsChange').textContent = `+${Math.floor(totalViews * 0.1)} this week`;
}

function loadRecentPosts(posts) {
    const recentPosts = posts.slice(0, 5);
    const container = document.getElementById('recentPostsList');
    
    if (recentPosts.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
                <i class="fas fa-newspaper" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>No posts yet. Create your first post!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentPosts.map(post => createPostItemHTML(post)).join('');
}

function showDashboardError(message) {
    document.getElementById('recentPostsList').innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; color: #ef4444;"></i>
            <p>${message}</p>
        </div>
    `;
}

// Posts Management
async function loadAllPosts() {
    if (!isConnected) {
        showPostsError('Not connected to database');
        return;
    }
    
    try {
        const { data: posts, error } = await supabaseClient
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const container = document.getElementById('allPostsList');
        
        if (posts.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
                    <i class="fas fa-newspaper" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>No posts yet. Create your first post!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = posts.map(post => createPostItemHTML(post)).join('');
        
    } catch (error) {
        console.error('Error loading posts:', error);
        showPostsError('Failed to load posts');
    }
}

function showPostsError(message) {
    document.getElementById('allPostsList').innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; color: #ef4444;"></i>
            <p>${message}</p>
        </div>
    `;
}

function createPostItemHTML(post) {
    const statusClass = post.published ? 'status-published' : 'status-draft';
    const statusText = post.published ? 'Published' : 'Draft';
    const featuredBadge = post.featured ? '<span class="status-badge status-featured">Featured</span>' : '';
    const createdDate = new Date(post.created_at).toLocaleDateString();
    
    return `
        <div class="post-item">
            <div class="post-item-header">
                <div>
                    <h3 class="post-item-title">${post.title}</h3>
                    <div class="post-item-meta">
                        <span><i class="fas fa-calendar"></i> ${createdDate}</span>
                        <span><i class="fas fa-user"></i> ${post.author}</span>
                        <span><i class="fas fa-folder"></i> ${post.category}</span>
                        <span><i class="fas fa-eye"></i> ${post.views || 0} views</span>
                    </div>
                </div>
                <div>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                    ${featuredBadge}
                </div>
            </div>
            <div class="post-item-excerpt">${post.excerpt || 'No excerpt available'}</div>
            <div class="post-item-actions">
                <button class="btn-small btn-preview" onclick="previewPostById('${post.id}')">
                    <i class="fas fa-eye"></i> Preview
                </button>
                <button class="btn-small btn-edit" onclick="editPost('${post.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                ${post.published ? 
                    `<button class="btn-small btn-unpublish" onclick="togglePublish('${post.id}', false)">
                        <i class="fas fa-eye-slash"></i> Unpublish
                    </button>` :
                    `<button class="btn-small btn-publish" onclick="togglePublish('${post.id}', true)">
                        <i class="fas fa-eye"></i> Publish
                    </button>`
                }
                <button class="btn-small btn-delete" onclick="deletePost('${post.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

// Post Form Management
function initializePostForm() {
    const form = document.getElementById('postForm');
    const titleInput = document.getElementById('postTitle');
    const slugInput = document.getElementById('postSlug');
    
    // Auto-generate slug from title
    titleInput.addEventListener('input', function() {
        if (!currentEditingPost) {
            const slug = this.value
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            slugInput.value = slug;
        }
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        savePost();
    });
}

async function savePost() {
    if (!isConnected) {
        showNotification('Not connected to database', 'error');
        return;
    }
    
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.innerHTML;
    
    try {
        saveBtn.innerHTML = '<div class="loading-spinner"></div> Saving...';
        saveBtn.disabled = true;
        
        const formData = {
            title: document.getElementById('postTitle').value,
            slug: document.getElementById('postSlug').value,
            excerpt: document.getElementById('postExcerpt').value,
            content: document.getElementById('postContent').value,
            category: document.getElementById('postCategory').value,
            author: document.getElementById('postAuthor').value,
            publish_date: document.getElementById('postDate').value,
            read_time: document.getElementById('readTime').value,
            tags: getTags(),
            featured_image: document.getElementById('imageUpload').getAttribute('data-image-url') || '',
            published: document.getElementById('postPublished').checked,
            featured: document.getElementById('postFeatured').checked,
            views: currentEditingPost ? currentEditingPost.views : 0,
            comments_count: currentEditingPost ? currentEditingPost.comments_count : 0
        };
        
        let result;
        
        if (currentEditingPost) {
            // Update existing post
            result = await supabaseClient
                .from('blog_posts')
                .update(formData)
                .eq('id', currentEditingPost.id);
        } else {
            // Create new post
            result = await supabaseClient
                .from('blog_posts')
                .insert([formData]);
        }
        
        if (result.error) throw result.error;
        
        showNotification(
            currentEditingPost ? 'Post updated successfully!' : 'Post created successfully!', 
            'success'
        );
        
        // Reset form and update UI
        resetForm();
        loadDashboardData();
        loadAllPosts();
        
        // Switch to posts view
        showSection('posts');
        
    } catch (error) {
        console.error('Error saving post:', error);
        showNotification(`Failed to save post: ${error.message}`, 'error');
    } finally {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

async function editPost(postId) {
    if (!isConnected) {
        showNotification('Not connected to database', 'error');
        return;
    }
    
    try {
        const { data: post, error } = await supabaseClient
            .from('blog_posts')
            .select('*')
            .eq('id', postId)
            .single();
        
        if (error) throw error;
        
        currentEditingPost = post;
        
        // Fill form with post data
        document.getElementById('postId').value = post.id;
        document.getElementById('postTitle').value = post.title;
        document.getElementById('postSlug').value = post.slug;
        document.getElementById('postExcerpt').value = post.excerpt || '';
        document.getElementById('postContent').value = post.content;
        document.getElementById('postCategory').value = post.category;
        document.getElementById('postAuthor').value = post.author;
        document.getElementById('postDate').value = post.publish_date || '';
        document.getElementById('readTime').value = post.read_time || '';
        document.getElementById('postPublished').checked = post.published;
        document.getElementById('postFeatured').checked = post.featured;
        
        // Set tags
        setTags(post.tags || []);
        
        // Set image
        if (post.featured_image) {
            document.getElementById('imagePreview').src = post.featured_image;
            document.getElementById('imagePreview').style.display = 'block';
            document.getElementById('imageUpload').setAttribute('data-image-url', post.featured_image);
        }
        
        // Update form title
        document.getElementById('postFormTitle').textContent = 'Edit Post';
        
        // Switch to add-post section
        showSection('add-post');
        
    } catch (error) {
        console.error('Error loading post:', error);
        showNotification(`Failed to load post: ${error.message}`, 'error');
    }
}

async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
    }
    
    if (!isConnected) {
        showNotification('Not connected to database', 'error');
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('blog_posts')
            .delete()
            .eq('id', postId);
        
        if (error) throw error;
        
        showNotification('Post deleted successfully!', 'success');
        loadDashboardData();
        loadAllPosts();
        
    } catch (error) {
        console.error('Error deleting post:', error);
        showNotification(`Failed to delete post: ${error.message}`, 'error');
    }
}

async function togglePublish(postId, publish) {
    if (!isConnected) {
        showNotification('Not connected to database', 'error');
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('blog_posts')
            .update({ published: publish })
            .eq('id', postId);
        
        if (error) throw error;
        
        showNotification(
            publish ? 'Post published successfully!' : 'Post unpublished successfully!', 
            'success'
        );
        
        loadDashboardData();
        loadAllPosts();
        
    } catch (error) {
        console.error('Error updating post:', error);
        showNotification(`Failed to update post: ${error.message}`, 'error');
    }
}

// Image Upload Management
function initializeImageUpload() {
    const uploadArea = document.getElementById('imageUpload');
    const fileInput = document.getElementById('imageFile');
    const preview = document.getElementById('imagePreview');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageUpload(files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageUpload(e.target.files[0]);
        }
    });
}

async function handleImageUpload(file) {
    if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file.', 'error');
        return;
    }
    
    if (!isConnected) {
        showNotification('Not connected to database', 'error');
        return;
    }
    
    try {
        showNotification('Uploading image...', 'info');
        
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        // Upload to Supabase Storage
        const { data, error } = await supabaseClient.storage
            .from('blog-images')
            .upload(fileName, file);
        
        if (error) throw error;
        
        // Get public URL
        const { data: urlData } = supabaseClient.storage
            .from('blog-images')
            .getPublicUrl(fileName);
        
        // Update preview
        const preview = document.getElementById('imagePreview');
        preview.src = urlData.publicUrl;
        preview.style.display = 'block';
        
        // Store URL for saving
        document.getElementById('imageUpload').setAttribute('data-image-url', urlData.publicUrl);
        
        showNotification('Image uploaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error uploading image:', error);
        showNotification(`Failed to upload image: ${error.message}`, 'error');
    }
}

// Media Library Management
function initializeMediaUpload() {
    const uploadArea = document.getElementById('mediaUpload');
    const fileInput = document.getElementById('mediaFile');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleMediaUpload(files);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleMediaUpload(e.target.files);
        }
    });
}

async function handleMediaUpload(files) {
    if (!isConnected) {
        showNotification('Not connected to database', 'error');
        return;
    }
    
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
        showNotification('Please select image files.', 'error');
        return;
    }
    
    try {
        showNotification(`Uploading ${imageFiles.length} image(s)...`, 'info');
        
        const uploadPromises = imageFiles.map(async (file) => {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            
            const { data, error } = await supabaseClient.storage
                .from('blog-images')
                .upload(fileName, file);
            
            if (error) throw error;
            
            return { fileName, data };
        });
        
        await Promise.all(uploadPromises);
        
        showNotification('Images uploaded successfully!', 'success');
        loadMediaLibrary();
        
    } catch (error) {
        console.error('Error uploading media:', error);
        showNotification(`Failed to upload images: ${error.message}`, 'error');
    }
}

async function loadMediaLibrary() {
    if (!isConnected) {
        document.getElementById('mediaGrid').innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; color: #ef4444;"></i>
                <p>Not connected to database</p>
            </div>
        `;
        return;
    }
    
    try {
        const { data: files, error } = await supabaseClient.storage
            .from('blog-images')
            .list();
        
        if (error) throw error;
        
        const container = document.getElementById('mediaGrid');
        
        if (files.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
                    <i class="fas fa-images" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>No media files yet. Upload some images!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = files.map(file => {
            const { data: urlData } = supabaseClient.storage
                .from('blog-images')
                .getPublicUrl(file.name);
            
            return `
                <div class="media-item" style="border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
                    <img src="${urlData.publicUrl}" alt="${file.name}" style="width: 100%; height: 150px; object-fit: cover;">
                    <div style="padding: 1rem;">
                        <p style="font-size: 0.9rem; color: var(--color-text-muted); margin: 0; word-break: break-all;">${file.name}</p>
                        <button onclick="deleteMedia('${file.name}')" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; margin-top: 0.5rem; cursor: pointer;">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading media library:', error);
        document.getElementById('mediaGrid').innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; color: #ef4444;"></i>
                <p>Failed to load media library</p>
            </div>
        `;
    }
}

async function deleteMedia(fileName) {
    if (!confirm('Are you sure you want to delete this image?')) {
        return;
    }
    
    if (!isConnected) {
        showNotification('Not connected to database', 'error');
        return;
    }
    
    try {
        const { error } = await supabaseClient.storage
            .from('blog-images')
            .remove([fileName]);
        
        if (error) throw error;
        
        showNotification('Image deleted successfully!', 'success');
        loadMediaLibrary();
        
    } catch (error) {
        console.error('Error deleting media:', error);
        showNotification(`Failed to delete image: ${error.message}`, 'error');
    }
}

// Tags Management
function initializeTagsInput() {
    const tagsInput = document.getElementById('tagsInput');
    const tagInput = tagsInput.querySelector('.tag-input');
    
    tagInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(this.value.trim());
            this.value = '';
        }
    });
    
    tagInput.addEventListener('blur', function() {
        if (this.value.trim()) {
            addTag(this.value.trim());
            this.value = '';
        }
    });
}

function addTag(tagText) {
    if (!tagText) return;
    
    const tagsInput = document.getElementById('tagsInput');
    const existingTags = Array.from(tagsInput.querySelectorAll('.tag-item')).map(tag => tag.textContent.trim());
    
    if (existingTags.includes(tagText)) {
        showNotification('Tag already exists.', 'warning');
        return;
    }
    
    const tagElement = document.createElement('div');
    tagElement.className = 'tag-item';
    tagElement.innerHTML = `
        ${tagText}
        <span class="tag-remove" onclick="removeTag(this)">&times;</span>
    `;
    
    const tagInput = tagsInput.querySelector('.tag-input');
    tagsInput.insertBefore(tagElement, tagInput);
}

function removeTag(element) {
    element.parentElement.remove();
}

function getTags() {
    const tagsInput = document.getElementById('tagsInput');
    return Array.from(tagsInput.querySelectorAll('.tag-item')).map(tag => 
        tag.textContent.replace('×', '').trim()
    );
}

function setTags(tags) {
    const tagsInput = document.getElementById('tagsInput');
    const existingTags = tagsInput.querySelectorAll('.tag-item');
    existingTags.forEach(tag => tag.remove());
    
    tags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-item';
        tagElement.innerHTML = `
            ${tag}
            <span class="tag-remove" onclick="removeTag(this)">&times;</span>
        `;
        const tagInput = tagsInput.querySelector('.tag-input');
        tagsInput.insertBefore(tagElement, tagInput);
    });
}

// Utility Functions
function resetForm() {
    document.getElementById('postForm').reset();
    document.getElementById('postDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('postAuthor').value = 'Spiritan Press Team';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('imageUpload').removeAttribute('data-image-url');
    document.getElementById('postFormTitle').textContent = 'Add New Post';
    currentEditingPost = null;
    
    // Clear tags
    const tagsInput = document.getElementById('tagsInput');
    const existingTags = tagsInput.querySelectorAll('.tag-item');
    existingTags.forEach(tag => tag.remove());
}

function showSection(sectionId) {
    const navButtons = document.querySelectorAll('.admin-nav-btn');
    const sections = document.querySelectorAll('.admin-section');
    
    navButtons.forEach(btn => btn.classList.remove('active'));
    sections.forEach(section => section.classList.remove('active'));
    
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
    document.getElementById(sectionId).classList.add('active');
}

function previewPost() {
    const formData = {
        title: document.getElementById('postTitle').value || 'Untitled Post',
        content: document.getElementById('postContent').value || 'No content yet...',
        excerpt: document.getElementById('postExcerpt').value || 'No excerpt...',
        author: document.getElementById('postAuthor').value || 'Author',
        date: document.getElementById('postDate').value || new Date().toISOString().split('T')[0],
        category: document.getElementById('postCategory').value || 'Uncategorized',
        tags: getTags(),
        featuredImage: document.getElementById('imageUpload').getAttribute('data-image-url') || 'images/banner.jpg'
    };
    
    showPostPreview(formData);
}

function previewPostById(postId) {
    // This would open the actual blog post in a new tab
    window.open(`blog-post.html?id=${postId}`, '_blank');
}

function showPostPreview(post) {
    // Create a simple preview modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 15px; padding: 2rem; max-width: 800px; max-height: 80vh; overflow-y: auto; position: relative;">
            <button onclick="this.closest('.modal').remove()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666;">&times;</button>
            <h2>${post.title}</h2>
            <p><strong>Category:</strong> ${post.category}</p>
            <p><strong>Author:</strong> ${post.author}</p>
            <p><strong>Date:</strong> ${post.date}</p>
            <p><strong>Excerpt:</strong> ${post.excerpt}</p>
            <div style="margin-top: 1rem;">
                <h3>Content Preview:</h3>
                <div style="border: 1px solid #ddd; padding: 1rem; border-radius: 8px; background: #f9f9f9;">
                    ${post.content.substring(0, 500)}${post.content.length > 500 ? '...' : ''}
                </div>
            </div>
        </div>
    `;
    
    modal.className = 'modal';
    document.body.appendChild(modal);
}

function saveSettings() {
    const settings = {
        blogTitle: document.getElementById('blogTitle').value,
        blogDescription: document.getElementById('blogDescription').value,
        postsPerPage: document.getElementById('postsPerPage').value,
        enableComments: document.getElementById('enableComments').checked
    };
    
    localStorage.setItem('blogSettings', JSON.stringify(settings));
    showNotification('Settings saved successfully!', 'success');
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('blogSettings') || '{}');
    
    if (settings.blogTitle) document.getElementById('blogTitle').value = settings.blogTitle;
    if (settings.blogDescription) document.getElementById('blogDescription').value = settings.blogDescription;
    if (settings.postsPerPage) document.getElementById('postsPerPage').value = settings.postsPerPage;
    if (settings.enableComments !== undefined) document.getElementById('enableComments').checked = settings.enableComments;
}

// Notification System
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    });
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Load settings on page load
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
});