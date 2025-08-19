(function () {
    if (window.CourseChatbot) return;

    const STYLE_ID = "course-chatbot-styles";
    const WIDGET_ID = "course-chatbot-widget";
    const BTN_ID = "course-chatbot-fab";

    const COURSE_CATALOG = [
        {
            id: "web-react-101",
            title: "React for Beginners",
            category: "Web Development",
            level: "Beginner",
            durationWeeks: 4,
            price: 99,
            tags: ["react", "javascript", "frontend"],
            description: "Learn React fundamentals: components, props, state, hooks, and building your first app."
        },
        {
            id: "web-node-201",
            title: "Node.js and Express",
            category: "Web Development",
            level: "Intermediate",
            durationWeeks: 6,
            price: 129,
            tags: ["node", "express", "backend", "api"],
            description: "Build RESTful APIs with Express, connect to databases, and deploy to the cloud."
        },
        {
            id: "data-python-101",
            title: "Python for Data Analysis",
            category: "Data",
            level: "Beginner",
            durationWeeks: 5,
            price: 109,
            tags: ["python", "pandas", "numpy", "data"],
            description: "Use Python, Pandas, and NumPy to clean, analyze, and visualize datasets."
        },
        {
            id: "ai-ml-301",
            title: "Machine Learning Foundations",
            category: "AI/ML",
            level: "Advanced",
            durationWeeks: 8,
            price: 199,
            tags: ["machine learning", "scikit-learn", "ai"],
            description: "Supervised and unsupervised learning, model evaluation, and practical ML pipelines."
        },
        {
            id: "design-ux-101",
            title: "UX Design Basics",
            category: "Design",
            level: "Beginner",
            durationWeeks: 3,
            price: 89,
            tags: ["ux", "design", "research", "wireframes"],
            description: "User research, personas, wireframing, and usability testing fundamentals."
        }
    ];

    const STORAGE_KEY = "course_enrollments";

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const styleTag = document.createElement("style");
        styleTag.id = STYLE_ID;
        styleTag.textContent = `
            :root {
                --cc-primary: #4f46e5;
                --cc-primary-600: #4338ca;
                --cc-surface: #ffffff;
                --cc-bg: #0b1020;
                --cc-muted: #6b7280;
                --cc-border: #e5e7eb;
                --cc-danger: #ef4444;
                --cc-success: #10b981;
                --cc-shadow: 0 10px 30px rgba(0,0,0,0.15);
                --cc-radius: 14px;
            }

            #${BTN_ID} {
                position: fixed;
                bottom: 24px;
                right: 24px;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: var(--cc-primary);
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                box-shadow: var(--cc-shadow);
                cursor: pointer;
                z-index: 2147483647;
                border: none;
            }

            #${BTN_ID}:hover { background: var(--cc-primary-600); }

            #${WIDGET_ID} {
                position: fixed;
                bottom: 96px;
                right: 24px;
                width: 360px;
                max-width: calc(100vw - 24px);
                height: 520px;
                max-height: calc(100vh - 140px);
                background: var(--cc-surface);
                border: 1px solid var(--cc-border);
                border-radius: var(--cc-radius);
                box-shadow: var(--cc-shadow);
                display: none;
                flex-direction: column;
                overflow: hidden;
                z-index: 2147483647;
            }

            #${WIDGET_ID}.open { display: flex; }

            .cc-header {
                background: linear-gradient(135deg, var(--cc-primary), #7c3aed);
                color: white;
                padding: 14px 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .cc-header .cc-title { font-weight: 700; font-size: 16px; }
            .cc-header .cc-subtitle { font-size: 12px; opacity: 0.85; }
            .cc-header .cc-actions { display: flex; gap: 6px; }
            .cc-icon-btn {
                background: rgba(255,255,255,0.12);
                border: 1px solid rgba(255,255,255,0.25);
                color: white;
                padding: 6px 8px;
                border-radius: 10px;
                cursor: pointer;
            }

            .cc-body { flex: 1; background: #fafafa; display: flex; flex-direction: column; }
            .cc-messages { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
            .cc-input { display: flex; gap: 8px; padding: 10px; border-top: 1px solid var(--cc-border); background: white; }
            .cc-input input { flex: 1; border: 1px solid var(--cc-border); border-radius: 10px; padding: 10px 12px; font-size: 14px; }
            .cc-input button { background: var(--cc-primary); border: none; color: white; padding: 10px 14px; border-radius: 10px; cursor: pointer; }
            .cc-input button:hover { background: var(--cc-primary-600); }

            .cc-msg { display: flex; gap: 8px; align-items: flex-start; }
            .cc-msg .cc-bubble { max-width: 80%; padding: 10px 12px; border-radius: 12px; border: 1px solid var(--cc-border); background: white; }
            .cc-msg.user { justify-content: flex-end; }
            .cc-msg.user .cc-bubble { background: #eef2ff; border-color: #e0e7ff; }
            .cc-msg.bot .cc-avatar { width: 28px; height: 28px; background: var(--cc-primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; }
            .cc-timestamp { font-size: 10px; color: var(--cc-muted); margin-top: 4px; }

            .cc-quick { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px 12px; border-top: 1px solid var(--cc-border); background: #fff; }
            .cc-chip { background: #f3f4f6; color: #111827; border: 1px solid #e5e7eb; padding: 6px 10px; border-radius: 999px; cursor: pointer; font-size: 12px; }
            .cc-chip:hover { background: #e5e7eb; }

            .cc-course-card { border: 1px solid var(--cc-border); background: white; border-radius: 12px; padding: 10px; margin-top: 6px; }
            .cc-course-title { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
            .cc-course-meta { font-size: 12px; color: var(--cc-muted); margin-bottom: 6px; }
            .cc-course-actions { display: flex; gap: 8px; }
            .cc-btn {
                border: 1px solid var(--cc-border);
                background: #f9fafb;
                padding: 6px 10px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 12px;
            }
            .cc-btn.primary { background: var(--cc-primary); color: white; border-color: var(--cc-primary); }
            .cc-btn.primary:hover { background: var(--cc-primary-600); }
            .cc-btn.link { background: transparent; border: none; color: var(--cc-primary); }

            @media (max-width: 480px) {
                #${WIDGET_ID} { right: 12px; bottom: 84px; width: calc(100vw - 24px); height: 70vh; }
                #${BTN_ID} { right: 12px; bottom: 12px; }
            }
        `;
        document.head.appendChild(styleTag);
    }

    function createWidget() {
        if (document.getElementById(WIDGET_ID)) return;
        const fab = document.createElement("button");
        fab.id = BTN_ID;
        fab.setAttribute("aria-label", "Open Course Assistant");
        fab.title = "Chat with course assistant";
        fab.textContent = "💬";

        const widget = document.createElement("div");
        widget.id = WIDGET_ID;
        widget.setAttribute("role", "dialog");
        widget.setAttribute("aria-label", "Course Assistant Chatbot");
        widget.innerHTML = `
            <div class="cc-header">
                <div>
                    <div class="cc-title">Course Assistant</div>
                    <div class="cc-subtitle">Find courses and enroll</div>
                </div>
                <div class="cc-actions">
                    <button class="cc-icon-btn" data-cc-action="minimize" title="Minimize">_</button>
                    <button class="cc-icon-btn" data-cc-action="close" title="Close">✕</button>
                </div>
            </div>
            <div class="cc-body">
                <div class="cc-messages" id="cc-messages"></div>
                <div class="cc-quick" id="cc-quick"></div>
                <div class="cc-input">
                    <input id="cc-input" type="text" placeholder="Ask about courses or say 'enroll'..." />
                    <button id="cc-send">Send</button>
                </div>
            </div>
        `;

        document.body.appendChild(fab);
        document.body.appendChild(widget);

        fab.addEventListener("click", toggleOpen);
        widget.querySelector('[data-cc-action="close"]').addEventListener("click", close);
        widget.querySelector('[data-cc-action="minimize"]').addEventListener("click", minimize);
        widget.querySelector('#cc-send').addEventListener("click", onSend);
        widget.querySelector('#cc-input').addEventListener("keydown", function (e) {
            if (e.key === 'Enter') onSend();
        });

        open();
        setTimeout(showWelcome, 150);
    }

    function open() {
        document.getElementById(WIDGET_ID).classList.add("open");
    }
    function close() {
        document.getElementById(WIDGET_ID).classList.remove("open");
    }
    function minimize() {
        close();
    }
    function toggleOpen() {
        const el = document.getElementById(WIDGET_ID);
        el.classList.toggle("open");
    }

    function nowTime() {
        const d = new Date();
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function addMessage(role, html) {
        const container = document.getElementById('cc-messages');
        const row = document.createElement('div');
        row.className = `cc-msg ${role}`;
        const bubble = document.createElement('div');
        bubble.className = 'cc-bubble';
        if (role === 'bot') {
            const avatar = document.createElement('div');
            avatar.className = 'cc-avatar';
            avatar.textContent = 'C';
            row.appendChild(avatar);
        }
        if (typeof html === 'string') {
            bubble.innerHTML = html;
        } else {
            bubble.appendChild(html);
        }
        const ts = document.createElement('div');
        ts.className = 'cc-timestamp';
        ts.textContent = nowTime();
        bubble.appendChild(ts);
        row.appendChild(bubble);
        container.appendChild(row);
        container.scrollTop = container.scrollHeight;
    }

    function setQuickReplies(buttons) {
        const area = document.getElementById('cc-quick');
        area.innerHTML = '';
        buttons.forEach(b => {
            const chip = document.createElement('button');
            chip.className = 'cc-chip';
            chip.textContent = b.label;
            chip.addEventListener('click', () => b.onClick());
            area.appendChild(chip);
        });
    }

    function showWelcome() {
        addMessage('bot', "Hi! I'm your course assistant. I can help you browse courses and enroll. Try 'Find beginner web courses' or 'Enroll in React'.");
        setQuickReplies([
            { label: 'Browse All Courses', onClick: () => showCourses(COURSE_CATALOG) },
            { label: 'Beginner Courses', onClick: () => handleSearch('beginner') },
            { label: 'My Enrollments', onClick: () => showEnrollments() }
        ]);
    }

    function onSend() {
        const input = document.getElementById('cc-input');
        const text = input.value.trim();
        if (!text) return;
        addMessage('user', escapeHtml(text));
        input.value = '';
        handleUserInput(text);
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c;
        });
    }

    const session = {
        userName: null,
        userEmail: null,
        intent: null, // 'search' | 'enroll' | 'enroll:collectName' | 'enroll:collectEmail' | 'show_enrollments'
        selectedCourse: null
    };

    function detectIntent(text) {
        const t = text.toLowerCase();
        if (/my\s+enroll/.test(t) || /enrollments?/.test(t)) return 'show_enrollments';
        if (/enroll/.test(t) || /sign\s*up/.test(t) || /register/.test(t)) return 'enroll';
        if (/course|find|search|learn|class|program/.test(t)) return 'search';
        return 'search';
    }

    function handleUserInput(text) {
        // If in a data collection step
        if (session.intent === 'enroll:collectName') {
            session.userName = text.trim();
            addMessage('bot', `Nice to meet you, <b>${escapeHtml(session.userName)}</b>! What's your email for enrollment?`);
            session.intent = 'enroll:collectEmail';
            return;
        }
        if (session.intent === 'enroll:collectEmail') {
            const email = text.trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                addMessage('bot', 'Please provide a valid email address.');
                return;
            }
            session.userEmail = email;
            if (session.selectedCourse) {
                completeEnrollment(session.selectedCourse);
            } else {
                addMessage('bot', 'Which course would you like to enroll in? You can say the course name or pick from the list below.');
                showCourses(COURSE_CATALOG);
                session.intent = 'enroll';
            }
            return;
        }

        const intent = detectIntent(text);
        if (intent === 'show_enrollments') {
            showEnrollments();
            return;
        }
        if (intent === 'enroll') {
            const matched = fuzzyFindCourse(text);
            if (matched) {
                startEnrollment(matched);
            } else {
                addMessage('bot', 'Sure, which course are you interested in? Here are some popular options:');
                showCourses(COURSE_CATALOG.slice(0, 3));
                session.intent = 'enroll';
            }
            return;
        }
        if (intent === 'search') {
            handleSearch(text);
            return;
        }
    }

    function handleSearch(text) {
        const filters = parseFilters(text);
        const results = searchCourses(text, filters);
        if (results.length === 0) {
            addMessage('bot', 'I did not find matching courses. Try keywords like "beginner web", "python data", or "advanced ml".');
            return;
        }
        addMessage('bot', `I found <b>${results.length}</b> course(s):`);
        showCourses(results);
    }

    function parseFilters(text) {
        const t = text.toLowerCase();
        const level = (/beginner/.test(t) && 'Beginner') || (/intermediate/.test(t) && 'Intermediate') || (/advanced/.test(t) && 'Advanced') || null;
        let category = null;
        if (/web/.test(t) || /frontend/.test(t) || /backend/.test(t)) category = 'Web Development';
        else if (/data/.test(t)) category = 'Data';
        else if (/(ai|ml|machine\s*learning)/.test(t)) category = 'AI/ML';
        else if (/design|ux/.test(t)) category = 'Design';
        return { level, category };
    }

    function searchCourses(text, filters) {
        const t = text.toLowerCase();
        return COURSE_CATALOG.filter(c => {
            const matchesText = !t || c.title.toLowerCase().includes(t) || c.category.toLowerCase().includes(t) || c.tags.join(' ').toLowerCase().includes(t);
            const matchesLevel = !filters.level || c.level === filters.level;
            const matchesCategory = !filters.category || c.category === filters.category;
            return matchesText && matchesLevel && matchesCategory;
        });
    }

    function showCourses(courses) {
        const container = document.createElement('div');
        courses.forEach(course => {
            const div = document.createElement('div');
            div.className = 'cc-course-card';
            div.innerHTML = `
                <div class="cc-course-title">${escapeHtml(course.title)}</div>
                <div class="cc-course-meta">${escapeHtml(course.category)} • ${escapeHtml(course.level)} • ${course.durationWeeks} weeks • $${course.price}</div>
                <div class="cc-course-actions">
                    <button class="cc-btn" data-cc="details">Details</button>
                    <button class="cc-btn primary" data-cc="enroll">Enroll</button>
                </div>
            `;
            div.querySelector('[data-cc="details"]').addEventListener('click', () => showCourseDetails(course));
            div.querySelector('[data-cc="enroll"]').addEventListener('click', () => startEnrollment(course));
            container.appendChild(div);
        });
        addMessage('bot', container);
    }

    function showCourseDetails(course) {
        const html = `
            <div class="cc-course-card">
                <div class="cc-course-title">${escapeHtml(course.title)}</div>
                <div class="cc-course-meta">${escapeHtml(course.category)} • ${escapeHtml(course.level)} • ${course.durationWeeks} weeks • $${course.price}</div>
                <div style="font-size: 13px; margin: 6px 0;">${escapeHtml(course.description)}</div>
                <div style="font-size: 12px; color: var(--cc-muted);">Tags: ${course.tags.map(t => `<span>#${escapeHtml(t)}</span>`).join(' ')}</div>
                <div class="cc-course-actions" style="margin-top:8px;">
                    <button class="cc-btn" data-cc="back">Back</button>
                    <button class="cc-btn primary" data-cc="enroll">Enroll</button>
                </div>
            </div>
        `;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        wrapper.querySelector('[data-cc="back"]').addEventListener('click', () => showCourses(COURSE_CATALOG));
        wrapper.querySelector('[data-cc="enroll"]').addEventListener('click', () => startEnrollment(course));
        addMessage('bot', wrapper);
    }

    function startEnrollment(course) {
        session.selectedCourse = course;
        if (!session.userName) {
            session.intent = 'enroll:collectName';
            addMessage('bot', `Great choice: <b>${escapeHtml(course.title)}</b>! What's your full name?`);
            return;
        }
        if (!session.userEmail) {
            session.intent = 'enroll:collectEmail';
            addMessage('bot', `Thanks, ${escapeHtml(session.userName)}. What's the best email for your enrollment?`);
            return;
        }
        completeEnrollment(course);
    }

    function completeEnrollment(course) {
        const record = {
            id: `${course.id}-${Date.now()}`,
            courseId: course.id,
            courseTitle: course.title,
            userName: session.userName,
            userEmail: session.userEmail,
            createdAt: new Date().toISOString()
        };
        const list = getEnrollments();
        list.push(record);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        addMessage('bot', `✅ You're enrolled in <b>${escapeHtml(course.title)}</b>! A confirmation will be sent to <b>${escapeHtml(session.userEmail)}</b>.`);
        setQuickReplies([
            { label: 'My Enrollments', onClick: () => showEnrollments() },
            { label: 'Browse More', onClick: () => showCourses(COURSE_CATALOG) }
        ]);
        session.intent = null;
        session.selectedCourse = null;
    }

    function getEnrollments() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }

    function showEnrollments() {
        const list = getEnrollments();
        if (list.length === 0) {
            addMessage('bot', 'You have no enrollments yet. Browse courses to get started!');
            setQuickReplies([
                { label: 'Browse All Courses', onClick: () => showCourses(COURSE_CATALOG) }
            ]);
            return;
        }
        const container = document.createElement('div');
        list.forEach(r => {
            const course = COURSE_CATALOG.find(c => c.id === r.courseId);
            const div = document.createElement('div');
            div.className = 'cc-course-card';
            div.innerHTML = `
                <div class="cc-course-title">${escapeHtml(r.courseTitle)}</div>
                <div class="cc-course-meta">Enrolled: ${new Date(r.createdAt).toLocaleDateString()} • ${escapeHtml(r.userName)} (${escapeHtml(r.userEmail)})</div>
            `;
            container.appendChild(div);
        });
        addMessage('bot', container);
    }

    function fuzzyFindCourse(text) {
        const t = text.toLowerCase();
        let best = null;
        let bestScore = 0;
        COURSE_CATALOG.forEach(c => {
            const hay = `${c.title} ${c.category} ${c.tags.join(' ')}`.toLowerCase();
            let score = 0;
            t.split(/\s+/).forEach(w => { if (hay.includes(w)) score += 1; });
            if (score > bestScore) { bestScore = score; best = c; }
        });
        return bestScore >= 2 ? best : null;
    }

    // Public API
    window.CourseChatbot = {
        open,
        close,
        toggle: toggleOpen,
        addCourse: function (course) { COURSE_CATALOG.push(course); },
        listCourses: function () { return COURSE_CATALOG.slice(); }
    };

    // Initialize
    injectStyles();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createWidget);
    } else {
        createWidget();
    }
})();

