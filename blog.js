// Supabase-powered public blog reader
let sb = null;
let sbClient = null;
let posts = [];

async function waitForSupabase() {
    while (!window.supabase || !window.supabase.createClient) {
        await new Promise(res => setTimeout(res, 50));
    }
}


document.addEventListener('DOMContentLoaded', async function() {
    // Determine mode: list or detail via ?id=
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    // Initialize Supabase from saved config
    const cfg = JSON.parse(localStorage.getItem('supabaseConfig') || '{}');
    if (cfg.url && cfg.key ) {
        await waitForSupabase(); // ✅ ensure Supabase is ready (fixes mobile)
        sb = window.supabase;
        sbClient = sb.createClient(cfg.url, cfg.key);
    }

    if (!sbClient) {
        showToast('Supabase not configured. Open NewAdminblog.html to set it up.', 'warning');
    }

    if (postId) {
        document.getElementById('detailView').style.display = 'block';
        await loadAllPosts();
        renderDetail(postId);
    } else {
        document.getElementById('listView').style.display = 'block';
        await loadAllPosts(true);
        renderList();
    }

    wireSearch();
});

async function loadAllPosts(onlyPublished = false) {
    // Try Supabase
    if (sbClient) {
        const query = sbClient.from('blog_posts').select('*').order('publish_date', { ascending: false });
        const { data, error } = onlyPublished ? await query.eq('published', true) : await query;
        if (!error && Array.isArray(data)) {
            posts = data.map(p => ({
                id: p.id,
                title: p.title,
                slug: p.slug,
                excerpt: p.excerpt,
                content: p.content,
                featuredImage: p.featured_image || 'images/banner.jpg',
                category: p.category || 'Uncategorized',
                tags: p.tags || [],
                author: p.author || 'Spiritan Press Team',
                date: p.publish_date || p.created_at,
                readTime: p.read_time || '5 min read',
                views: p.views || 0,
                comments: p.comments_count || 0,
                featured: !!p.featured,
                published: !!p.published
            }));
            return;
        }
    }
    // Fallback to JSON
    try {
        const res = await fetch('blog-posts.json');
        const data = await res.json();
        posts = (data.posts || []);
        if (onlyPublished) posts = posts.filter(p => p.published);
    } catch (e) {
        posts = [];
    }
}

function renderList() {
    if (!posts.length) {
        document.getElementById('listEmpty').style.display = 'block';
        return;
    }
    const featured = posts.find(p => p.featured) || posts[0];
    const others = posts.filter(p => p.id !== featured.id);
    renderFeatured(featured);
    renderGrid(others);
    renderSidebar(posts);
}

function renderFeatured(p) {
    const el = document.getElementById('featuredPost');
    if (!el) return;
    el.innerHTML = `
        <div class="post-image">
            <img src="${p.featuredImage}" alt="${escapeHtml(p.title)}" width="100%" height="300">
            <div class="post-category">Featured</div>
        </div>
        <div class="post-content">
            <div class="post-meta">
                <span class="post-date"><i class="fas fa-calendar"></i> ${fmtDate(p.date)}</span>
                <span class="post-author"><i class="fas fa-user"></i> ${escapeHtml(p.author)}</span>
                <span class="post-category-tag">${escapeHtml(p.category)}</span>
            </div>
            <h2><a href="blog.html?id=${encodeURIComponent(p.id)}">${escapeHtml(p.title)}</a></h2>
            <p>${escapeHtml(p.excerpt || '')}</p>
            <div class="post-footer">
                <a href="blog.html?id=${encodeURIComponent(p.id)}" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
                <div class="post-stats">
                    <span><i class="fas fa-eye"></i> ${p.views} views</span>
                    <span><i class="fas fa-comment"></i> ${p.comments} comments</span>
                </div>
            </div>
        </div>`;
}

function renderGrid(list) {
    const grid = document.getElementById('postsGrid');
    if (!grid) return;
    grid.innerHTML = list.map(p => `
        <article class="blog-post">
            <div class="post-image">
                <img src="${p.featuredImage}" alt="${escapeHtml(p.title)}" width="100%" height="200">
                <div class="post-category">${escapeHtml(p.category)}</div>
            </div>
            <div class="post-content">
                <div class="post-meta">
                    <span class="post-date"><i class="fas fa-calendar"></i> ${fmtDate(p.date)}</span>
                    <span class="post-author"><i class="fas fa-user"></i> ${escapeHtml(p.author)}</span>
                </div>
                <h3><a href="blog.html?id=${encodeURIComponent(p.id)}">${escapeHtml(p.title)}</a></h3>
                <p>${escapeHtml(p.excerpt || '')}</p>
                <div class="post-footer">
                    <a href="blog.html?id=${encodeURIComponent(p.id)}" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
                    <div class="post-stats"><span><i class="fas fa-eye"></i> ${p.views} views</span></div>
                </div>
            </div>
        </article>`).join('');
}

function renderSidebar(all) {
    // Recent
    const recent = [...all].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,3);
    const recentEl = document.getElementById('recentPosts');
    if (recentEl) {
        recentEl.innerHTML = recent.map(p => `
            <div class="recent-post">
                <img src="${p.featuredImage}" alt="${escapeHtml(p.title)}" width="60" height="60">
                <div class="recent-post-content">
                    <h4><a href="blog.html?id=${encodeURIComponent(p.id)}">${escapeHtml(p.title)}</a></h4>
                    <span class="recent-post-date">${fmtDate(p.date)}</span>
                </div>
            </div>`).join('');
    }
    // Categories
    const categories = [...new Set(all.map(p => p.category || 'Uncategorized'))];
    const catEl = document.getElementById('categoryList');
    if (catEl) {
        catEl.innerHTML = categories.map(c => {
            const count = all.filter(p => (p.category||'Uncategorized')===c).length;
            return `<li><a href="#" data-category="${escapeHtml(c)}"><i class="fas fa-folder"></i> ${escapeHtml(c)} <span>(${count})</span></a></li>`;
        }).join('');
        // Wire category filters
        catEl.querySelectorAll('a').forEach(a => a.addEventListener('click', (e)=>{
            e.preventDefault();
            const cat = a.getAttribute('data-category');
            const filtered = posts.filter(p => (p.category||'Uncategorized') === cat);
            renderFeatured(filtered[0] || posts[0]);
            renderGrid(filtered.slice(1));
        }));
    }
    // Tags
    const tags = [...new Set(all.flatMap(p => p.tags || []))];
    const tagEl = document.getElementById('tagCloud');
    if (tagEl) {
        tagEl.innerHTML = tags.map(t => `<a href="#" class="tag" data-tag="${escapeHtml(t)}">${escapeHtml(t)}</a>`).join('');
        tagEl.querySelectorAll('a').forEach(a => a.addEventListener('click',(e)=>{
            e.preventDefault();
            const t = a.getAttribute('data-tag');
            const filtered = posts.filter(p => (p.tags||[]).includes(t));
            renderFeatured(filtered[0] || posts[0]);
            renderGrid(filtered.slice(1));
        }));
    }
}

function renderDetail(id) {
    const idx = posts.findIndex(p => String(p.id) === String(id));
    const post = posts[idx];
    if (!post) {
        document.getElementById('detailBody').innerHTML = '<p>Post not found.</p>';
        return;
    }
    document.getElementById('breadcrumb').innerHTML = `
        <a href="index.html">Home</a> <i class="fas fa-chevron-right"></i> 
        <a href="blog.html">Blog</a> <i class="fas fa-chevron-right"></i> 
        <span>${escapeHtml(post.title)}</span>`;
    document.getElementById('detailImage').src = post.featuredImage;
    document.getElementById('detailImage').alt = post.title;
    document.getElementById('detailCategory').textContent = post.category || 'Uncategorized';
    document.getElementById('detailTitle').textContent = post.title;
    document.getElementById('detailMeta').innerHTML = `
        <div class="post-meta-item"><i class="fas fa-calendar"></i><span>${fmtDate(post.date)}</span></div>
        <div class="post-meta-item"><i class="fas fa-user"></i><span>${escapeHtml(post.author||'')}</span></div>
        <div class="post-meta-item"><i class="fas fa-clock"></i><span>${escapeHtml(post.readTime||'')}</span></div>
        <div class="post-meta-item"><i class="fas fa-eye"></i><span>${post.views||0} views</span></div>`;
    document.getElementById('detailExcerpt').textContent = post.excerpt || '';
    document.getElementById('detailBody').innerHTML = formatContent(post.content || '');
    document.getElementById('detailTags').innerHTML = (post.tags||[]).map(t=>`<a href="#" class="tag">${escapeHtml(t)}</a>`).join('');

    const prev = posts[idx-1];
    const next = posts[idx+1];
    document.getElementById('postNavigation').innerHTML = `
        ${prev ? `<a href="blog.html?id=${encodeURIComponent(prev.id)}" class="nav-post prev"><i class="fas fa-chevron-left"></i><div><span>Previous Post</span><h5>${escapeHtml(prev.title)}</h5></div></a>` : '<div></div>'}
        ${next ? `<a href="blog.html?id=${encodeURIComponent(next.id)}" class="nav-post next"><div><span>Next Post</span><h5>${escapeHtml(next.title)}</h5></div><i class="fas fa-chevron-right"></i></a>` : '<div></div>'}`;

    // Related
    const related = posts.filter(p => String(p.id)!==String(post.id) && (p.category===post.category || (p.tags||[]).some(t => (post.tags||[]).includes(t)))).slice(0,3);
    const relEl = document.getElementById('relatedPosts');
    if (relEl) {
        relEl.innerHTML = related.map(p => `
            <div class="related-post">
                <img src="${p.featuredImage}" alt="${escapeHtml(p.title)}" width="60" height="60">
                <div class="related-post-content">
                    <h4><a href="blog.html?id=${encodeURIComponent(p.id)}">${escapeHtml(p.title)}</a></h4>
                    <span class="related-post-date">${fmtDate(p.date)}</span>
                </div>
            </div>`).join('');
    }
}

function wireSearch() {
    const input = document.getElementById('blogSearch');
    const btn = document.getElementById('searchBtn');
    if (!input || !btn) return;
    const run = () => {
        const q = (input.value || '').toLowerCase().trim();
        if (!q) return renderList();
        const filtered = posts.filter(p =>
            (p.title||'').toLowerCase().includes(q) ||
            (p.excerpt||'').toLowerCase().includes(q) ||
            (p.content||'').toLowerCase().includes(q)
        );
        if (filtered.length) {
            renderFeatured(filtered[0]);
            renderGrid(filtered.slice(1));
        }
    };
    btn.addEventListener('click', run);
    input.addEventListener('keypress', e => { if (e.key==='Enter') run(); });
}

function fmtDate(d) {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(s='') {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatContent(content) {
    return (content || '')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        .replace(/^<p>/, '<p>')
        .replace(/<\/p>$/, '</p>');
}

function showToast(msg, type='info') {
    const colors = { success:'#10b981', error:'#ef4444', warning:'#f59e0b', info:'#3b82f6' };
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;top:20px;right:20px;background:${colors[type]||colors.info};color:#fff;padding:12px 16px;border-radius:8px;z-index:10000;box-shadow:0 5px 15px rgba(0,0,0,.2)`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(()=>{ if (el.parentNode) el.parentNode.removeChild(el); }, 4000);
}


