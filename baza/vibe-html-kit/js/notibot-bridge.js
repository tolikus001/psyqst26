/**
 * Notibot Bridge v2.26
 * SDK для интеграции Vibe-приложений.
 * Поддерживает режимы: Inline, Portal, App.
 */
(function() {
    class NotibotBridgeError extends Error {
        constructor(errorData) {
            if (typeof errorData === 'string') {
                super(errorData);
                this.code = 'ERR_UNKNOWN';
                this.origin = 'unknown';
                this.details = null;
            } else {
                super(errorData.message || 'Failed to submit form');
                this.code = errorData.code || 'ERR_UNKNOWN';
                this.origin = errorData.origin || 'unknown';
                this.details = errorData.details || null;
            }
            this.name = 'NotibotBridgeError';
        }
    }
    window.NotibotBridgeError = NotibotBridgeError;

    class NotibotBridge {
        constructor() {
            this.user = {};
            this.app = {};
            this._updateHandlers = [];
            this._lastActionTimes = {};
            this._responseHandlers = {};
            this._init();
        }

        _init() {
            window.addEventListener('message', (event) => {
                if (event.data?.type === 'NOTIBOT_INIT' && event.data.data) {
                    this.user = event.data.data.user || {};
                    this.app = event.data.data.app || {};
                    this._updateHandlers.forEach(cb => {
                        try { cb(this.user, this.app); } catch(e) { console.error(e); }
                    });
                } else if (event.data?.source === 'vibe-parent' && event.data?.requestId) {
                    const { requestId, success, data, error } = event.data;
                    const handler = this._responseHandlers[requestId];
                    if (handler) {
                        try {
                            handler({ success, data, error });
                        } catch (e) {
                            console.error(e);
                        }
                        delete this._responseHandlers[requestId];
                    }
                }
            });

            this._sendAction('READY_FOR_INIT');

            if (typeof ResizeObserver !== 'undefined') {
                const resizeObserver = new ResizeObserver(entries => {
                    for (let entry of entries) {
                        const height = Math.ceil(entry.contentRect.height);
                        if (height > 0) {
                            this._sendAction('set_height', { height: height + 60 });
                        }
                    }
                });
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => resizeObserver.observe(document.body));
                } else {
                    resizeObserver.observe(document.body);
                }
            }
        }

        /**
         * Развернуть приложение на весь экран (если запущено в Inline режиме)
         */
        openPortal(config = {}) {
            this._sendAction('open_portal', config);
        }

        /**
         * Блокировка/разблокировка скролла родительской страницы
         */
        setScrollLock(locked) {
            this._sendAction('set_scroll_lock', { locked });
        }

        onUpdate(callback) {
            if (typeof callback === 'function') {
                this._updateHandlers.push(callback);
                if (this.user?.id) callback(this.user, this.app);
            }
        }

        // Навигация
        openLink(url) { this._sendAction('open_link', { url }); }
        openStorefront() { this.openLink('/vitrina'); }
        openArticle(id) { this.openLink(`/page/${id}`); }
        openProduct(id) { this.openLink(`/product/${id}`); }
        openUserCard() { this.openLink('/usercard'); }

        // Тактильная отдача
        hapticImpact(style = 'light', fallback = false) { 
            this._sendAction('haptic_feedback', { feedbackType: 'impact', style, fallback }); 
        }
        hapticNotification(type = 'success', fallback = false) { 
            this._sendAction('haptic_feedback', { feedbackType: 'notification', style: type, fallback }); 
        }
        hapticSelection(fallback = false) { 
            this._sendAction('haptic_feedback', { feedbackType: 'selection', fallback }); 
        }

        /**
         * Отправить заполненную форму
         * @param {string|number} formId ID формы
         * @param {Array} answers Ответы в формате [{title: string, answers: string[]}]
         * @returns {Promise} возвращает промис, который разрешается при успешной отправке
         */
        submitForm(formId, answers) {
            return new Promise((resolve, reject) => {
                if (!formId) {
                    reject(new NotibotBridgeError({
                        origin: 'client',
                        code: 'ERR_INVALID_PAYLOAD',
                        message: 'Form ID is required'
                    }));
                    return;
                }
                const requestId = Math.random().toString(36).substring(2, 9);
                this._responseHandlers[requestId] = (response) => {
                    if (response.success) {
                        resolve(response.data);
                    } else {
                        reject(new NotibotBridgeError(response.error));
                    }
                };
                
                if (window.parent) {
                    window.parent.postMessage({
                        source: 'vibe-sandbox',
                        type: 'submit_form',
                        payload: { formId, answers, requestId }
                    }, '*');
                } else {
                    delete this._responseHandlers[requestId];
                    reject(new NotibotBridgeError({
                        origin: 'client',
                        code: 'ERR_NO_PARENT',
                        message: 'Parent window not found'
                    }));
                }
            });
        }

        _sendAction(type, payload = {}) {
            const now = Date.now();
            // Анти-дребезг для команд
            if (this._lastActionTimes[type] && (now - this._lastActionTimes[type] < (type === 'haptic_feedback' ? 50 : 400))) return;
            this._lastActionTimes[type] = now;

            if (window.parent) {
                window.parent.postMessage({ source: 'vibe-sandbox', type, payload }, '*');
            }
        }
    }
    window.notibot = new NotibotBridge();
})();
