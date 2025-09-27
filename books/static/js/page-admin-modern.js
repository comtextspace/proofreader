// Modern Page Admin JavaScript Enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initializeDarkMode();
    initializeLayout();
    initializeTextEditor();
    initializeImageViewer();
    initializeKeyboardShortcuts();
    initializeFloatingButtons();
    initializeUndoRedo();

    // Dark Mode Functionality
    function initializeDarkMode() {
        const toggle = document.getElementById('theme-toggle');
        const icon = document.getElementById('theme-icon');
        const body = document.body;
        const root = document.documentElement;

        // Check for saved theme preference or default to light mode
        const savedTheme = localStorage.getItem('page-editor-theme');

        // Only enable dark mode if explicitly saved as 'dark'
        if (savedTheme === 'dark') {
            enableDarkMode();
        } else {
            // Ensure light mode is properly set
            disableDarkMode();
        }

        // Toggle theme on button click
        toggle?.addEventListener('click', () => {
            if (root.getAttribute('data-theme') === 'dark' || body.classList.contains('dark-mode')) {
                disableDarkMode();
            } else {
                enableDarkMode();
            }
        });

        function enableDarkMode() {
            root.setAttribute('data-theme', 'dark');
            body.classList.add('dark-mode');
            if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
            localStorage.setItem('page-editor-theme', 'dark');

            // Apply dark mode to Django admin elements
            applyDarkModeToDjangoAdmin();
        }

        function disableDarkMode() {
            root.setAttribute('data-theme', 'light');
            body.classList.remove('dark-mode');
            if (icon) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
            localStorage.setItem('page-editor-theme', 'light');

            // Remove dark mode from Django admin elements
            removeDarkModeFromDjangoAdmin();
        }

        function applyDarkModeToDjangoAdmin() {
            // Apply dark styles to Django admin elements
            const style = document.createElement('style');
            style.id = 'django-admin-dark-mode';
            style.textContent = `
                body.dark-mode #header {
                    background: var(--card-bg) !important;
                    color: var(--text-color) !important;
                }

                body.dark-mode #branding h1 {
                    color: var(--text-color) !important;
                }

                body.dark-mode #content {
                    background: var(--light-bg) !important;
                }

                body.dark-mode .module {
                    background: var(--card-bg) !important;
                    border: 1px solid var(--border-color) !important;
                }

                body.dark-mode .module h2 {
                    background: var(--toolbar-bg) !important;
                    color: var(--text-color) !important;
                }

                body.dark-mode input[type="text"],
                body.dark-mode input[type="number"],
                body.dark-mode select,
                body.dark-mode textarea {
                    background: var(--textarea-bg) !important;
                    color: var(--textarea-color) !important;
                    border: 1px solid var(--border-color) !important;
                }

                body.dark-mode label {
                    color: var(--text-color) !important;
                }

                body.dark-mode .help {
                    color: var(--text-muted) !important;
                }

                body.dark-mode .errorlist {
                    color: var(--danger-color) !important;
                }
            `;
            document.head.appendChild(style);
        }

        function removeDarkModeFromDjangoAdmin() {
            const style = document.getElementById('django-admin-dark-mode');
            if (style) {
                style.remove();
            }
        }

        // Remove automatic system theme detection to prevent unwanted dark mode
        // Users must explicitly toggle dark mode using the button
    }

    // Reorganize Django form elements into modern layout
    function initializeLayout() {
        // Move text field to text editor section
        const textField = document.querySelector('.field-text');
        const textEditorContainer = document.getElementById('text-editor-container');
        if (textField && textEditorContainer) {
            // Extract just the textarea and move it
            const textarea = textField.querySelector('textarea');
            if (textarea) {
                textEditorContainer.appendChild(textarea);
            }
        }

        // Move image to image viewer section
        const imageField = document.querySelector('.field-page');
        const imageViewerContainer = document.getElementById('image-viewer-container');
        if (imageField && imageViewerContainer) {
            const image = imageField.querySelector('img');
            if (image) {
                image.classList.add('page-image');
                image.id = 'page-image';
                imageViewerContainer.appendChild(image);
            }
        }

        // Hide original form structure
        const originalForm = document.getElementById('original-form');
        if (originalForm) {
            // Move any remaining important fields to appropriate sections
            const statusField = originalForm.querySelector('.field-status');
            if (statusField) {
                // Status is already shown in metadata panel
                statusField.style.display = 'none';
            }
        }
    }

    // Text Editor Enhancements
    function initializeTextEditor() {
        const textarea = document.querySelector('.modern-textarea');
        const textSizeInput = document.getElementById('text-size-input');

        // Text size adjustment
        if (textSizeInput && textarea) {
            // Load saved text size
            const savedSize = localStorage.getItem('page-editor-text-size') || '14';
            textSizeInput.value = savedSize;
            textarea.style.fontSize = savedSize + 'px';

            textSizeInput.addEventListener('input', function() {
                const size = this.value;
                textarea.style.fontSize = size + 'px';
                localStorage.setItem('page-editor-text-size', size);
            });
        }

        // Auto-save draft
        if (textarea) {
            let saveTimeout;
            textarea.addEventListener('input', function() {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    localStorage.setItem('page-draft-' + getPageId(), textarea.value);
                    showNotification('Draft saved', 'info');
                }, 2000);
            });

            // Load draft if exists
            const draft = localStorage.getItem('page-draft-' + getPageId());
            if (draft && !textarea.value) {
                if (confirm('Load saved draft?')) {
                    textarea.value = draft;
                }
            }
        }

        // Enhanced text selection
        if (textarea) {
            textarea.addEventListener('select', function() {
                const selection = this.value.substring(this.selectionStart, this.selectionEnd);
                if (selection) {
                    updateSelectionInfo(selection);
                }
            });
        }
    }

    // Image Viewer Enhancements
    function initializeImageViewer() {
        const image = document.getElementById('page-image');
        if (!image) return;

        let scale = 1;
        let isDragging = false;
        let startX, startY, scrollLeft, scrollTop;

        // Zoom controls
        document.getElementById('zoomInBtn')?.addEventListener('click', () => {
            scale = Math.min(scale + 0.1, 3);
            image.style.transform = `scale(${scale})`;
        });

        document.getElementById('zoomOutBtn')?.addEventListener('click', () => {
            scale = Math.max(scale - 0.1, 0.5);
            image.style.transform = `scale(${scale})`;
        });

        document.getElementById('fitBtn')?.addEventListener('click', () => {
            scale = 1;
            image.style.transform = `scale(${scale})`;
            const container = image.parentElement;
            container.scrollTop = 0;
            container.scrollLeft = 0;
        });

        // Drag to pan
        const container = image.parentElement;
        container.style.overflow = 'auto';

        image.addEventListener('mousedown', (e) => {
            isDragging = true;
            image.style.cursor = 'grabbing';
            startX = e.pageX - container.offsetLeft;
            startY = e.pageY - container.offsetTop;
            scrollLeft = container.scrollLeft;
            scrollTop = container.scrollTop;
        });

        image.addEventListener('mouseleave', () => {
            isDragging = false;
            image.style.cursor = 'grab';
        });

        image.addEventListener('mouseup', () => {
            isDragging = false;
            image.style.cursor = 'grab';
        });

        image.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const y = e.pageY - container.offsetTop;
            const walkX = (x - startX) * 2;
            const walkY = (y - startY) * 2;
            container.scrollLeft = scrollLeft - walkX;
            container.scrollTop = scrollTop - walkY;
        });

        // Double-click to zoom
        image.addEventListener('dblclick', (e) => {
            if (scale === 1) {
                scale = 2;
            } else {
                scale = 1;
            }
            image.style.transform = `scale(${scale})`;
        });
    }

    // Keyboard Shortcuts
    function initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+S - Save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                const saveButton = document.querySelector('button[name="_continue"]');
                if (saveButton) saveButton.click();
            }

            // Alt+Right - Next page
            if (e.altKey && e.key === 'ArrowRight') {
                e.preventDefault();
                const nextButton = document.querySelector('button[name="next_page"]');
                if (nextButton) nextButton.click();
            }

            // Alt+Left - Previous page
            if (e.altKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                const prevButton = document.querySelector('button[name="back_page"]');
                if (prevButton) prevButton.click();
            }

            // Ctrl+Plus - Zoom in
            if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
                e.preventDefault();
                document.getElementById('zoomInBtn')?.click();
            }

            // Ctrl+Minus - Zoom out
            if (e.ctrlKey && e.key === '-') {
                e.preventDefault();
                document.getElementById('zoomOutBtn')?.click();
            }

            // ESC - Close panels
            if (e.key === 'Escape') {
                document.getElementById('shortcuts-panel')?.classList.remove('active');
            }
        });
    }

    // Floating Action Buttons
    function initializeFloatingButtons() {
        // Shortcuts FAB
        const shortcutsFab = document.getElementById('shortcuts-fab');
        const shortcutsPanel = document.getElementById('shortcuts-panel');

        shortcutsFab?.addEventListener('click', () => {
            shortcutsPanel?.classList.toggle('active');
        });

        // Save FAB
        const saveFab = document.getElementById('save-fab');
        saveFab?.addEventListener('click', () => {
            const saveButton = document.querySelector('button[name="_continue"]');
            if (saveButton) saveButton.click();
        });
    }

    // Undo/Redo Functionality
    function initializeUndoRedo() {
        const textarea = document.querySelector('.modern-textarea');
        if (!textarea) return;

        let history = [];
        let historyIndex = -1;
        let isUpdatingFromHistory = false;

        // Initialize with current value
        if (textarea.value) {
            history.push(textarea.value);
            historyIndex = 0;
        }

        // Save state on significant changes
        let saveTimeout;
        textarea.addEventListener('input', function() {
            // Skip if we're updating from history (undo/redo)
            if (isUpdatingFromHistory) {
                isUpdatingFromHistory = false;
                return;
            }

            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                // Remove any states after current index
                if (historyIndex < history.length - 1) {
                    history = history.slice(0, historyIndex + 1);
                }

                // Only add if different from current state
                const currentValue = textarea.value;
                if (history.length === 0 || history[history.length - 1] !== currentValue) {
                    history.push(currentValue);
                    historyIndex = history.length - 1;

                    // Limit history size
                    if (history.length > 100) {
                        history.shift();
                        historyIndex--;
                    }
                }

                updateUndoRedoButtons();
            }, 300);
        });

        // Undo
        document.getElementById('undoBtn')?.addEventListener('click', () => {
            if (historyIndex > 0) {
                // Save current state if it's not in history
                if (historyIndex === history.length - 1 && textarea.value !== history[historyIndex]) {
                    history[historyIndex] = textarea.value;
                }

                historyIndex--;
                isUpdatingFromHistory = true;
                textarea.value = history[historyIndex];

                // Trigger change event for any listeners
                const event = new Event('input', { bubbles: true });
                textarea.dispatchEvent(event);

                updateUndoRedoButtons();
            }
        });

        // Redo
        document.getElementById('redoBtn')?.addEventListener('click', () => {
            if (historyIndex < history.length - 1) {
                historyIndex++;
                isUpdatingFromHistory = true;
                textarea.value = history[historyIndex];

                // Trigger change event for any listeners
                const event = new Event('input', { bubbles: true });
                textarea.dispatchEvent(event);

                updateUndoRedoButtons();
            }
        });

        // Keyboard shortcuts for undo/redo
        textarea.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                document.getElementById('undoBtn')?.click();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                document.getElementById('redoBtn')?.click();
            }
        });

        function updateUndoRedoButtons() {
            const undoBtn = document.getElementById('undoBtn');
            const redoBtn = document.getElementById('redoBtn');

            if (undoBtn) {
                const canUndo = historyIndex > 0;
                undoBtn.disabled = !canUndo;
                undoBtn.style.opacity = canUndo ? '1' : '0.4';
                undoBtn.style.cursor = canUndo ? 'pointer' : 'not-allowed';
            }
            if (redoBtn) {
                const canRedo = historyIndex < history.length - 1;
                redoBtn.disabled = !canRedo;
                redoBtn.style.opacity = canRedo ? '1' : '0.4';
                redoBtn.style.cursor = canRedo ? 'pointer' : 'not-allowed';
            }
        }

        // Initial button state
        updateUndoRedoButtons();
    }

    // Helper Functions
    function getPageId() {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 3] || 'unknown';
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            border-radius: 4px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function updateSelectionInfo(selection) {
        const words = selection.trim().split(/\s+/).length;
        const chars = selection.length;
        console.log(`Selected: ${words} words, ${chars} characters`);
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(-100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(-100%);
                opacity: 0;
            }
        }

        .page-image {
            cursor: grab;
            transition: transform 0.3s ease;
        }

        .page-image:active {
            cursor: grabbing;
        }
    `;
    document.head.appendChild(style);

});
