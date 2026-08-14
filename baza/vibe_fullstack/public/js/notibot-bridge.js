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
                    const { requestId } = event.data;
                    const handler = this._responseHandlers[requestId];
                    if (handler) {
                        try {
                            handler(event.data);
                        } catch (e) {
                            console.error(e);
                        }
                        if (event.data.type !== 'stream_chunk') {
                            delete this._responseHandlers[requestId];
                        }
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

            // Автоматическая обработка атрибутов data-notibot-action и data-haptic
            const bindDataActions = () => {
                document.addEventListener('click', (e) => {
                    const target = e.target.closest('[data-notibot-action], [data-haptic]');
                    if (!target) return;

                    const hapticStyle = target.getAttribute('data-haptic');
                    if (hapticStyle) {
                        this.hapticImpact(hapticStyle);
                    }

                    const action = target.getAttribute('data-notibot-action');
                    if (!action) return;

                    // Если явно задано новое действие в атрибуте — отменяем дублирующие старые события клика
                    e.stopPropagation();

                    const id = target.getAttribute('data-id');
                    const url = target.getAttribute('data-url');

                    if (action === 'openProduct' && id) this.openProduct(id);
                    else if (action === 'openArticle' && id) this.openArticle(id);
                    else if (action === 'openStorefront') this.openStorefront();
                    else if (action === 'openUserCard') this.openUserCard();
                    else if (action === 'openPortal') this.openPortal();
                    else if (action === 'openLink' && url) this.openLink(url);
                });
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', bindDataActions);
            } else {
                bindDataActions();
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

        /**
         * Вызвать AI-Хук
         * @param {string} hookId ID AI-хука
         * @param {string} input Текстовый запрос
         * @param {Object} variables Произвольные переменные
         * @param {Object|string} options Дополнительные опции ({ imageUrl })
         * @returns {Promise}
         */
        callAiHook(hookId, input, variables, options) {
            return new Promise((resolve, reject) => {
                if (!hookId) {
                    reject(new NotibotBridgeError({
                        origin: 'client',
                        code: 'ERR_INVALID_PAYLOAD',
                        message: 'Hook ID is required'
                    }));
                    return;
                }
                const imageUrl = (options && typeof options === 'object') ? options.imageUrl : (typeof options === 'string' ? options : null);
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
                        type: 'call_ai_hook',
                        payload: { hookId, input, variables, imageUrl, requestId }
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

        /**
         * Вызвать AI-Хук в режиме стриминга
         * @param {string} hookId ID AI-хука
         * @param {string} input Текстовый запрос
         * @param {Object} variables Произвольные переменные
         * @param {Function|Object} arg4 Колбэк onChunk или объект { onChunk, imageUrl }
         * @param {Object|string} [arg5] Дополнительные опции ({ imageUrl })
         * @returns {Promise}
         */
        callAiHookStream(hookId, input, variables, arg4, arg5) {
            return new Promise((resolve, reject) => {
                if (!hookId) {
                    reject(new NotibotBridgeError({
                        origin: 'client',
                        code: 'ERR_INVALID_PAYLOAD',
                        message: 'Hook ID is required'
                    }));
                    return;
                }

                let onChunk = null;
                let imageUrl = null;

                if (typeof arg4 === 'function') {
                    onChunk = arg4;
                    if (arg5 && typeof arg5 === 'object') {
                        imageUrl = arg5.imageUrl || null;
                    } else if (typeof arg5 === 'string') {
                        imageUrl = arg5;
                    }
                } else if (arg4 && typeof arg4 === 'object') {
                    onChunk = typeof arg4.onChunk === 'function' ? arg4.onChunk : null;
                    imageUrl = arg4.imageUrl || null;
                }

                const requestId = Math.random().toString(36).substring(2, 9);
                this._responseHandlers[requestId] = (response) => {
                    if (response.type === 'stream_chunk') {
                        if (typeof onChunk === 'function') {
                            try { onChunk(response.chunk); } catch (e) { console.error(e); }
                        }
                    } else if (response.type === 'stream_done' || response.success) {
                        resolve(response.data || true);
                    } else {
                        reject(new NotibotBridgeError(response.error));
                    }
                };
                
                if (window.parent) {
                    window.parent.postMessage({
                        source: 'vibe-sandbox',
                        type: 'call_ai_hook_stream',
                        payload: { hookId, input, variables, imageUrl, requestId }
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

        /**
         * Загрузить изображение в хранилище Yandex Storage
         * @param {File} file Файл типа File (изображение)
         * @returns {Promise<{url: string, fileName: string, fileType: string, fileSize: number}>}
         */
        uploadFile(file) {
            return new Promise((resolve, reject) => {
                if (!file) {
                    reject(new NotibotBridgeError({
                        origin: 'client',
                        code: 'ERR_INVALID_PAYLOAD',
                        message: 'File is required'
                    }));
                    return;
                }

                const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                if (!allowedTypes.includes((file.type || '').toLowerCase())) {
                    reject(new NotibotBridgeError({
                        origin: 'client',
                        code: 'ERR_INVALID_FILE_TYPE',
                        message: 'Разрешены только изображения (JPG, PNG, WEBP, GIF)'
                    }));
                    return;
                }

                if (file.size > 10 * 1024 * 1024) {
                    reject(new NotibotBridgeError({
                        origin: 'client',
                        code: 'ERR_FILE_TOO_LARGE',
                        message: 'Размер файла не должен превышать 10 МБ'
                    }));
                    return;
                }

                const reader = new FileReader();
                reader.onerror = () => {
                    reject(new NotibotBridgeError({
                        origin: 'client',
                        code: 'ERR_READ_FAILED',
                        message: 'Не удалось прочитать файл'
                    }));
                };

                reader.onload = () => {
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
                            type: 'upload_file',
                            payload: {
                                fileData: reader.result,
                                fileName: file.name,
                                fileType: file.type,
                                requestId
                            }
                        }, '*');
                    } else {
                        delete this._responseHandlers[requestId];
                        reject(new NotibotBridgeError({
                            origin: 'client',
                            code: 'ERR_NO_PARENT',
                            message: 'Parent window not found'
                        }));
                    }
                };

                reader.readAsDataURL(file);
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
