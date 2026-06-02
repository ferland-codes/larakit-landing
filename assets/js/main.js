document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS Animation
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50,
            // Disable on phones: the horizontal fade-left/right offsets can cause
            // a sideways scroll, and skipping them is lighter on mobile too.
            disable: () => window.innerWidth < 768,
        });
    }

    // Navbar Scrolled State with extra modern scroll transitions
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        let navTicking = false;
        const updateNavbarScroll = () => {
            navbar.classList.toggle('scrolled', window.scrollY > 30);
            navTicking = false;
        };
        // Throttle to one update per frame (passive) so scrolling never
        // starves the background rAF loop or janks the main thread.
        window.addEventListener('scroll', () => {
            if (!navTicking) {
                navTicking = true;
                requestAnimationFrame(updateNavbarScroll);
            }
        }, { passive: true });
        updateNavbarScroll();
    }

    // ==========================================================
    // Dynamic Command Palette System (WOW Glassmorphism Effect)
    // ==========================================================
    const createCommandPalette = () => {
        if (document.getElementById('command-palette')) return;
        
        const overlay = document.createElement('div');
        overlay.className = 'command-palette-overlay';
        overlay.id = 'command-palette';
        overlay.innerHTML = `
            <div class="command-palette-modal">
                <div class="command-palette-header">
                    <i class="ri-terminal-box-line text-accent fs-5"></i>
                    <input type="text" class="command-palette-input" id="command-palette-search" placeholder="Type a command or search page..." autocomplete="off">
                    <span class="command-palette-shortcut-badge">ESC</span>
                </div>
                <div class="command-palette-results" id="command-palette-results"></div>
                <div class="command-palette-footer">
                    <div class="command-palette-legend">
                        <span><kbd>↑↓</kbd> Navigate</span>
                        <span><kbd>↵</kbd> Select</span>
                        <span><kbd>ESC</kbd> Close</span>
                    </div>
                    <div>LaraKit CLI v1.0.0</div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    };

    createCommandPalette();

    const commandItems = [
        { title: 'Go to Home', desc: 'Navigate to the main landing page', icon: 'ri-home-4-line', action: () => window.location.href = 'index.html' },
        { title: 'Go to Features', desc: 'Explore modular directories and templates', icon: 'ri-stack-line', action: () => window.location.href = 'features.html' },
        { title: 'Go to Pricing', desc: 'View starter, pro, and enterprise license options', icon: 'ri-money-dollar-circle-line', action: () => window.location.href = 'pricing.html' },
        { title: 'Go to FAQ', desc: 'Browse frequently asked developer questions', icon: 'ri-question-line', action: () => window.location.href = 'faq.html' },
        { title: 'Go to Contact', desc: 'Get in touch with support or sales', icon: 'ri-mail-line', action: () => window.location.href = 'contact.html' },
        { title: 'Check System Status', desc: 'Simulate developer dashboard health check', icon: 'ri-shield-check-line', action: () => {
            window.bxToast('Running system check diagnostics...', 'info');
            setTimeout(() => {
                window.bxToast('System Online | PHP 8.3 | v1.0.0 [OK]', 'success');
            }, 1000);
        }},
        { title: 'Copy CLI Installer Command', desc: 'Copy Composer template setup command', icon: 'ri-file-copy-line', action: () => {
            navigator.clipboard.writeText('composer create-project larakit/larakit ./').then(() => {
                window.bxToast('Composer command copied to clipboard!', 'success');
            });
        }},
        { title: 'Toggle Design Blueprint Grid', desc: 'Show or hide the technical grid lines overlay', icon: 'ri-grid-line', action: () => {
            const grid = document.querySelector('.bg-grid-overlay');
            if (grid) {
                const currentDisplay = window.getComputedStyle(grid).display;
                if (currentDisplay === 'none') {
                    grid.style.display = 'block';
                    window.bxToast('Blueprint grid enabled.', 'info');
                } else {
                    grid.style.display = 'none';
                    window.bxToast('Blueprint grid disabled.', 'info');
                }
            } else {
                window.bxToast('Grid overlay container not found on this page.', 'error');
            }
        }}
    ];

    const palette = document.getElementById('command-palette');
    const searchInput = document.getElementById('command-palette-search');
    const resultsContainer = document.getElementById('command-palette-results');
    let selectedIndex = 0;
    let filteredItems = [...commandItems];

    const renderResults = () => {
        resultsContainer.innerHTML = '';
        if (filteredItems.length === 0) {
            resultsContainer.innerHTML = `
                <div class="p-4 text-center text-muted" style="font-family: var(--font-code); font-size: 0.8rem;">
                    <i class="ri-error-warning-line d-block fs-3 mb-2 text-warning"></i>
                    No matches found for "${searchInput.value}"
                </div>
            `;
            return;
        }

        filteredItems.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = `command-palette-item ${index === selectedIndex ? 'selected' : ''}`;
            div.innerHTML = `
                <div class="command-palette-item-left">
                    <div class="command-palette-item-icon">
                        <i class="${item.icon}"></i>
                    </div>
                    <div>
                        <div class="command-palette-item-title">${item.title}</div>
                        <div class="command-palette-item-desc">${item.desc}</div>
                    </div>
                </div>
                <div class="command-palette-item-action">RUN <i class="ri-corner-down-left-line"></i></div>
            `;
            div.addEventListener('click', () => {
                item.action();
                closePalette();
            });
            resultsContainer.appendChild(div);
        });
    };

    const openPalette = () => {
        if (!palette) return;
        palette.classList.add('active');
        searchInput.value = '';
        filteredItems = [...commandItems];
        selectedIndex = 0;
        renderResults();
        setTimeout(() => searchInput.focus(), 50);
    };

    const closePalette = () => {
        if (!palette) return;
        palette.classList.remove('active');
    };

    // Keyboard interaction triggers
    window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (palette && palette.classList.contains('active')) {
                closePalette();
            } else {
                openPalette();
            }
        }

        if (!palette || !palette.classList.contains('active')) return;

        if (e.key === 'Escape') {
            closePalette();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (filteredItems.length > 0) {
                selectedIndex = (selectedIndex + 1) % filteredItems.length;
                renderResults();
                scrollToSelected();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (filteredItems.length > 0) {
                selectedIndex = (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
                renderResults();
                scrollToSelected();
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredItems.length > 0 && filteredItems[selectedIndex]) {
                filteredItems[selectedIndex].action();
                closePalette();
            }
        }
    });

    const scrollToSelected = () => {
        const selectedEl = resultsContainer.querySelector('.command-palette-item.selected');
        if (selectedEl) {
            selectedEl.scrollIntoView({ block: 'nearest' });
        }
    };

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            filteredItems = commandItems.filter(item => 
                item.title.toLowerCase().includes(query) || 
                item.desc.toLowerCase().includes(query)
            );
            selectedIndex = 0;
            renderResults();
        });
    }

    if (palette) {
        palette.addEventListener('click', (e) => {
            if (e.target === palette) {
                closePalette();
            }
        });
    }

    // Global listener for navbar search triggers
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.btn-icon-glass, [data-trigger="command-palette"]');
        if (trigger) {
            e.preventDefault();
            openPalette();
        }
    });

    // Dynamic Toast Notification Helper
    window.bxToast = (message, type = 'success') => {
        let toast = document.querySelector('.bx-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'bx-toast';
            document.body.appendChild(toast);
        }
        
        let icon = 'ri-checkbox-circle-line';
        let color = 'var(--bx-terminal)';
        if (type === 'error') {
            icon = 'ri-error-warning-line';
            color = '#EF4444';
        } else if (type === 'info') {
            icon = 'ri-information-line';
            color = 'var(--bx-cyan)';
        }
        
        toast.style.borderLeftColor = color;
        toast.innerHTML = `
            <i class="${icon}" style="color: ${color}; font-size: 1.25rem;"></i>
            <div>
                <span style="font-family: var(--font-code); font-size: 0.8rem; color: ${color}; display: block; font-weight: 600;">[${type.toUpperCase()}]</span>
                <span style="font-size: 0.875rem; color: #fff;">${message}</span>
            </div>
        `;
        
        toast.classList.add('show');
        
        if (toast.timeoutId) {
            clearTimeout(toast.timeoutId);
        }
        
        toast.timeoutId = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    };

    // Copy to Clipboard Utility
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-copy-code, .terminal-box');
        if (btn) {
            let text = '';
            if (btn.classList.contains('terminal-box')) {
                const cmd = btn.querySelector('.terminal-cmd');
                const prompt = btn.querySelector('.terminal-prompt');
                if (cmd) {
                    text = cmd.textContent.trim();
                } else {
                    text = btn.textContent.trim();
                }
            } else {
                const targetSelector = btn.getAttribute('data-clipboard-target');
                if (targetSelector) {
                    const target = document.querySelector(targetSelector);
                    text = target ? target.textContent.trim() : '';
                } else {
                    text = btn.getAttribute('data-clipboard-text') || '';
                }
            }
            
            if (text) {
                navigator.clipboard.writeText(text).then(() => {
                    window.bxToast('Command copied to clipboard!', 'success');
                }).catch(() => {
                    window.bxToast('Failed to copy to clipboard.', 'error');
                });
            }
        }
    });

    // Contact Form live JSON visualizer
    const contactForm = document.querySelector('.contact-live-form');
    const jsonPreview = document.getElementById('json-live-preview');
    if (contactForm && jsonPreview) {
        const updateJSON = () => {
            const data = {
                first_name: contactForm.querySelector('[name="first_name"]')?.value || '',
                last_name: contactForm.querySelector('[name="last_name"]')?.value || '',
                email: contactForm.querySelector('[name="email"]')?.value || '',
                subject: contactForm.querySelector('[name="subject"]')?.value || '',
                message: contactForm.querySelector('[name="message"]')?.value || '',
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                status: "DRAFTING"
            };
            jsonPreview.innerHTML = syntaxHighlightJSON(data);
        };
        
        contactForm.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', updateJSON);
        });
        
        updateJSON();
    }

    function syntaxHighlightJSON(jsonObj) {
        let json = JSON.stringify(jsonObj, null, 2);
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
            let cls = 'token-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'token-keyword';
                } else {
                    cls = 'token-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'token-boolean';
            } else if (/null/.test(match)) {
                cls = 'token-null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    // Features interactive File Tree
    const fileTreeItems = document.querySelectorAll('.file-tree-item');
    const editorTabName = document.getElementById('editor-tab-name');
    const editorBody = document.getElementById('editor-code-body');
    
    const fileContents = {
        'Storage.php': `// app/Modules/Core/Dashboard/Controllers/SuperAdmin/Storage/Controller.php
namespace App\\Modules\\Core\\Dashboard\\Controllers\\SuperAdmin\\Storage;

use App\\Modules\\Core\\Dashboard\\Controllers\\Controller;
use App\\Modules\\Core\\Dashboard\\Services\\StorageService;
use App\\Modules\\Core\\Dashboard\\Requests\\StorageRequest;
use Illuminate\\Support\\Facades\\DB;

class Controller extends Controller
{
    use HasActivityLog;

    public function install(StorageRequest $request)
    {
        return DB::transaction(function () use ($request) {
            // Isolation setup
            $quota = setting('storage_quota', 1024); // 1GB
            
            $this->logActivity('storage.install', 'Installed Storage Manager');
            return redirect()->back()->with('success', __('storage.installed'));
        });
    }
}`,
        'Email.php': `// app/Modules/Core/Dashboard/Controllers/SuperAdmin/Email/Controller.php
namespace App\\Modules\\Core\\Dashboard\\Controllers\\SuperAdmin\\Email;

use App\\Modules\\Core\\Dashboard\\Controllers\\Controller;
use App\\Modules\\Core\\Dashboard\\Services\\EmailService;
use App\\Modules\\Core\\Dashboard\\Requests\\EmailRequest;
use Illuminate\\Support\\Facades\\DB;

class Controller extends Controller
{
    use HasActivityLog;

    public function testConnection(EmailRequest $request)
    {
        $smtp = EmailService::connect($request->validated());
        
        $this->logActivity('email.test', 'SMTP Connection Check');
        return window_bxToast(__('email.connected'), 'success');
    }
}`,
        'Ai.php': `// app/Modules/Core/Dashboard/Controllers/SuperAdmin/Ai/Controller.php
namespace App\\Modules\\Core\\Dashboard\\Controllers\\SuperAdmin\\Ai;

use App\\Modules\\Core\\Dashboard\\Controllers\\Controller;
use App\\Modules\\Core\\Dashboard\\Services\\AiService;
use App\\Modules\\Core\\Dashboard\\Requests\\AiRequest;

class Controller extends Controller
{
    use HasActivityLog;

    public function query(AiRequest $request)
    {
        $response = AiService::askModel($request->prompt);
        
        $this->logActivity('ai.query', 'AI model response generated');
        return response()->json([
            'status' => 'success',
            'data' => $response
        ]);
    }
}`,
        'Notification.php': `// app/Modules/Core/Dashboard/Controllers/SuperAdmin/Notification/Controller.php
namespace App\\Modules\\Core\\Dashboard\\Controllers\\SuperAdmin\\Notification;

use App\\Modules\\Core\\Dashboard\\Controllers\\Controller;
use App\\Modules\\Core\\Dashboard\\Services\\NotificationService;
use App\\Modules\\Core\\Dashboard\\Requests\\NotificationRequest;

class Controller extends Controller
{
    use HasActivityLog, HasEncryptedId;

    public function send(NotificationRequest $request)
    {
        NotificationService::dispatch($request->users, $request->payload);
        
        $this->logActivity('notification.sent', 'Dispatched alert');
        return redirect()->back()->with('success', __('notification.sent'));
    }
}`,
        'WhatsApp.php': `// app/Modules/Core/Dashboard/Controllers/SuperAdmin/WhatsApp/Controller.php
namespace App\\Modules\\Core\\Dashboard\\Controllers\\SuperAdmin\\WhatsApp;

use App\\Modules\\Core\\Dashboard\\Controllers\\Controller;
use App\\Modules\\Core\\Dashboard\\Services\\WhatsAppService;

class Controller extends Controller
{
    use HasActivityLog;

    public function pairing()
    {
        $qrCode = WhatsAppService::generateQR();
        
        $this->logActivity('whatsapp.pairing', 'Requested QR pairing session');
        return view('modules.core.superadmin.whatsapp.pairing', compact('qrCode'));
    }
}`,
        'Reports.php': `// app/Modules/Core/Dashboard/Controllers/SuperAdmin/Reports/Controller.php
namespace App\\Modules\\Core\\Dashboard\\Controllers\\SuperAdmin\\Reports;

use App\\Modules\\Core\\Dashboard\\Controllers\\Controller;
use App\\Modules\\Core\\Dashboard\\Services\\ReportsService;
use App\\Modules\\Core\\Dashboard\\Requests\\ReportRequest;

class Controller extends Controller
{
    use HasActivityLog, HasEncryptedId;

    public function compile(ReportRequest $request)
    {
        $pdf = ReportsService::generate($request->template_id, $request->data);
        
        $this->logActivity('reports.compiled', 'PDF report built');
        return $pdf->download('report.pdf');
    }
}`
    };
    
    if (fileTreeItems.length > 0 && editorTabName && editorBody) {
        fileTreeItems.forEach(item => {
            item.addEventListener('click', () => {
                fileTreeItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                const fileName = item.getAttribute('data-file');
                if (fileName && fileContents[fileName]) {
                    editorTabName.textContent = fileName;
                    editorBody.innerHTML = highlightPHPCode(fileContents[fileName]);
                }
            });
        });
        
        const firstItem = document.querySelector('.file-tree-item');
        if (firstItem) {
            firstItem.click();
        }
    }
    
    function highlightPHPCode(code) {
        let escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const patterns = [
            { regex: /(\/\/.*)/g, class: 'token-comment' },
            { regex: /(".*?"|'.*?')/g, class: 'token-string' },
            { regex: /\b(namespace|use|class|public|protected|private|function|return|new|extends|compact)\b/g, class: 'token-keyword' },
            { regex: /\b(DB|EmailService|AiService|NotificationService|WhatsAppService|ReportsService|StorageService|Controller)\b/g, class: 'token-class' },
            { regex: /(\$[a-zA-Z0-9_]+)/g, class: 'token-variable' },
            { regex: /\b(install|testConnection|query|send|pairing|compile|logActivity|transaction|validated|setting|redirect|back|with|json|askModel|dispatch|generateQR|generate|download)\b/g, class: 'token-function' }
        ];
        
        let placeholders = [];
        escaped = escaped.replace(/(\/\/.*)/g, (match) => {
            placeholders.push(`<span class="token-comment">${match}</span>`);
            return `___PLACEHOLDER_${placeholders.length - 1}___`;
        });
        
        escaped = escaped.replace(/(".*?"|'.*?')/g, (match) => {
            placeholders.push(`<span class="token-string">${match}</span>`);
            return `___PLACEHOLDER_${placeholders.length - 1}___`;
        });
        
        patterns.forEach(pat => {
            if (pat.class !== 'token-comment' && pat.class !== 'token-string') {
                escaped = escaped.replace(pat.regex, (m) => `<span class="${pat.class}">${m}</span>`);
            }
        });
        
        for (let i = placeholders.length - 1; i >= 0; i--) {
            escaped = escaped.replace(`___PLACEHOLDER_${i}___`, placeholders[i]);
        }
        
        return escaped;
    }

    // === Hero Code Typing Animation ===
    const heroCodeElement = document.getElementById('hero-code-editor');
    if (heroCodeElement) {
        const prefix = `// Laravel 13 Modular Controller
namespace App\\Modules\\Core;

class UserController extends Controller
{
    use HasActivityLog, HasEncryptedId;

    public function store(Request $request)
    {`;

        const suffix = `
    }
}`;

        const textToType = `
        return DB::transaction(function() use ($request) {
            $user = User::create($request->validated());
            
            $this->logActivity('user.create', $user);
            return redirect()->back()
                ->with('success', __('user.created'));
        });`;

        let currentIndex = 0;
        let isDeleting = false;
        
        function highlightPHP(code) {
            let html = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            
            const rules = [
                { re: /(\/\/.*)/g, cls: 'token-comment' },
                { re: /(["'])(?:(?=(\\?))\2.)*?\1/g, cls: 'token-string' },
                { re: /\b(namespace|use|class|extends|public|function|return)\b/g, cls: 'token-keyword' },
                { re: /\b(UserController|Controller|HasActivityLog|HasEncryptedId|Request|DB|User)\b/g, cls: 'token-class' },
                { re: /(\$[a-zA-Z0-9_]+)/g, cls: 'token-variable' },
                { re: /\b(store|transaction|create|validated|logActivity|redirect|back|with|__)\b/g, cls: 'token-function' }
            ];

            let placeholders = [];
            
            // Comments
            html = html.replace(/(\/\/.*)/g, (match) => {
                placeholders.push(`<span class="token-comment">${match}</span>`);
                return `___PH_${placeholders.length - 1}___`;
            });

            // Strings
            html = html.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, (match) => {
                placeholders.push(`<span class="token-string">${match}</span>`);
                return `___PH_${placeholders.length - 1}___`;
            });

            // Keywords, Classes, Variables, Functions
            rules.forEach(rule => {
                if (rule.cls !== 'token-comment' && rule.cls !== 'token-string') {
                    html = html.replace(rule.re, (match) => `<span class="${rule.cls}">${match}</span>`);
                }
            });

            // Restore placeholders
            for (let i = placeholders.length - 1; i >= 0; i--) {
                html = html.replace(`___PH_${i}___`, placeholders[i]);
            }

            return html;
        }

        function typeCode() {
            if (!isDeleting) {
                // Typing phase
                if (currentIndex <= textToType.length) {
                    const currentTyped = textToType.substring(0, currentIndex);
                    heroCodeElement.innerHTML = highlightPHP(prefix + currentTyped) + '<span class="cursor-blink"></span>' + highlightPHP(suffix);
                    
                    currentIndex++;
                    
                    // Typing speed delays
                    let delay = 25 + Math.random() * 30; // base typing speed
                    
                    const lastChar = textToType.charAt(currentIndex - 1);
                    if (lastChar === '\n') {
                        delay = 350; // pause on new line
                    } else if (lastChar === ';') {
                        delay = 250; // pause on statement end
                    } else if (lastChar === '{' || lastChar === '}') {
                        delay = 200; // pause on block structure
                    } else if (lastChar === ' ') {
                        delay = 10; // spaces typed faster
                    }
                    
                    setTimeout(typeCode, delay);
                } else {
                    // Pause for 4 seconds when fully typed, then start deleting
                    setTimeout(() => {
                        isDeleting = true;
                        currentIndex = textToType.length;
                        typeCode();
                    }, 4000);
                }
            } else {
                // Deleting/Backspacing phase
                if (currentIndex >= 0) {
                    const currentTyped = textToType.substring(0, currentIndex);
                    heroCodeElement.innerHTML = highlightPHP(prefix + currentTyped) + '<span class="cursor-blink"></span>' + highlightPHP(suffix);
                    
                    currentIndex--;
                    
                    // Deletion speed: faster and relatively consistent
                    let delay = 10 + Math.random() * 15;
                    
                    // If we delete a newline, pause slightly
                    if (currentIndex >= 0 && textToType.charAt(currentIndex) === '\n') {
                        delay = 80;
                    }
                    
                    setTimeout(typeCode, delay);
                } else {
                    // Pause for 1.5 seconds when empty, then start typing again
                    setTimeout(() => {
                        isDeleting = false;
                        currentIndex = 0;
                        typeCode();
                    }, 1500);
                }
            }
        }
        
        typeCode();
    }

    // ==========================================================
    // Ambient coding background — CSS-driven "code-rain"
    // Columns of monospace glyphs scroll via a transform-only CSS
    // animation (see .code-rain-col / @keyframes codeRainFall), so the
    // motion lives on the compositor thread and NEVER pauses or janks
    // during scroll. JS only builds the static DOM once (and on resize).
    // ==========================================================
    (function initCodeRain() {
        const host = document.getElementById('code-rain');
        if (!host) return;

        const glyphs = '01<>{}[]()=>;:+-*/$_.|&%#abcdef!?';
        const pick = () => glyphs[(Math.random() * glyphs.length) | 0];

        function build() {
            host.innerHTML = '';
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const spacing = vw < 600 ? 30 : 42;            // px between columns
            const cols = Math.max(1, Math.floor(vw / spacing));
            const lineH = (vw < 600 ? 13 : 15) * 1.5;      // keep in sync with CSS line-height
            const linesPerCopy = Math.ceil(vh / lineH) + 6;

            const frag = document.createDocumentFragment();
            for (let c = 0; c < cols; c++) {
                // one "copy" of random glyphs, with a few bright cyan heads
                let copy = '';
                for (let i = 0; i < linesPerCopy; i++) {
                    const ch = pick();
                    copy += (Math.random() > 0.9 ? '<span class="hi">' + ch + '</span>' : ch) + '\n';
                }
                const col = document.createElement('div');
                col.className = 'code-rain-col';
                col.style.left = (c * spacing + spacing * 0.35) + 'px';
                col.innerHTML = copy + copy;               // duplicate → seamless loop
                const dur = 16 + Math.random() * 26;       // 16–42s, varied speeds
                col.style.animationDuration = dur.toFixed(1) + 's';
                col.style.animationDelay = (-Math.random() * dur).toFixed(1) + 's';
                frag.appendChild(col);
            }
            host.appendChild(frag);
        }

        build();

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(build, 300);
        }, { passive: true });
    })();
});
