/**
 * @name Questcord
 * @version 1.1.6
 * @description Hides specific elements in Discord and automatically opens Discover → Quests tab, then closes the popup — with a toggle button (bottom-left corner) to unhide everything.
 * @author killerqueen2007
 * @source https://raw.githubusercontent.com/killerqueen2007/BetterDiscordAddons/refs/heads/main/Plugins/Questcord/Questcord.plugin.js
 */

module.exports = class Questcord {
    constructor() {
        this.observer = null;
        this.enabled = true;
        this.toggleButton = null;
    }

    start() {
        this.addToggleButton();
        this.applyHiding();

        this.runOnLoad();

        this.observer = new MutationObserver(() => {
            if (this.enabled) this.hideElements();
        });

        this.observer.observe(document.body, { childList: true, subtree: true });
        console.log('%c[Questcord] Plugin started', 'color: #00ff00');
    }

    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        if (this.toggleButton) {
            this.toggleButton.remove();
            this.toggleButton = null;
        }

        this.showAll();
        console.log('%c[Questcord] Plugin stopped', 'color: #ff0000');
    }

    // --- Logging helper ---
    log(msg) {
        console.log(`[Questcord] ${msg}`);
    }

    // --- Simulate mouse click ---
    simulateClick(el) {
        el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        el.click();
    }

    // --- Wait for element that matches condition ---
    waitForElement(selector, condition, callback) {
        const check = () => {
            const els = document.querySelectorAll(selector);
            for (const el of els) {
                if (condition(el)) {
                    callback(el);
                    return;
                }
            }
            requestAnimationFrame(check);
        };
        check();
    }

    // --- Auto open Quest page
    runOnLoad() {

        // Step 1: Click Close button first (if it exists)
        this.waitForElement(
            ".closeButton_c2b141",
            () => true,
            closeEl => {
                this.log("Clicking Close first...");
                this.simulateClick(closeEl);

                // Step 2: Then click Discover
                this.waitForElement(
                    '.wrapper__6e9f8',
                    () => true,
                    el => {
                        this.log("Clicking Discover...");
                        this.simulateClick(el);

                        // Step 3: Then click Quests
                        this.waitForElement(
                            ".link__972a0",
                            e => e.textContent.trim() === "Quests",
                            questEl => {
                                this.log("Clicking Quests...");
                                this.simulateClick(questEl);
                            }
                        );
                    }
                );
            }
        );
    }

    // --- UI toggle button ---
    addToggleButton() {
        this.toggleButton = document.createElement('button');
        this.toggleButton.innerText = 'Questcord: ON';
        Object.assign(this.toggleButton.style, {
            position: 'fixed',
            bottom: '10px',
            left: '10px',
            zIndex: 9999,
            padding: '6px 10px',
            background: '#5865F2',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            opacity: '0.8'
        });

        this.toggleButton.addEventListener('mouseenter', () => this.toggleButton.style.opacity = '1');
        this.toggleButton.addEventListener('mouseleave', () => this.toggleButton.style.opacity = '0.8');

        this.toggleButton.onclick = () => {
            this.enabled = !this.enabled;
            this.toggleButton.innerText = `Questcord: ${this.enabled ? 'ON' : 'OFF'}`;
            this.toggleButton.style.background = this.enabled ? '#5865F2' : '#43B581';

            if (this.enabled) {
                this.applyHiding();
                console.log('[Questcord] Hiding enabled');
            } else {
                this.showAll();
                console.log('[Questcord] Hiding disabled');
            }
        };

        document.body.appendChild(this.toggleButton);
    }

    // --- Apply hiding ---
    applyHiding() {
        this.hideElements();
    }

    // --- Show all elements ---
    showAll() {
        document.querySelectorAll('*').forEach(el => {
            if (el.style.display === 'none') el.style.display = '';
        });
    }

    // --- Hide targeted elements ---
    hideElements() {
        const selectorsToHide = [
            '.title_c38106',
            '.clickable_c99c29',
            '.button__85643.iconWrapper__9293f.clickable__9293f',
            '.sidebar_c48ade',
            '.sidebarList_c48ade',
            '.container_e9ef78.bannerContainer__955a3.orbsContainer__955a3',
            '.container__26669',
            '.headingWrapper__57454',
            '.orbsLottieContainer_a3e8db',
            '.topRow_b5b7aa',
            '.bottomRow_b5b7aa',
            '.uploadArea_f75fb0',
            '.uploadArea_dbca3c',
            '.uploadDropModal_dbca3c',
            '.inner_dbca3c',
            '.icons_dbca3c',
            '.title_dbca3c',
            '.instructions_dbca3c',
            '.subtitleContainer_f75fb0',
            '.title_f75fb0',
            '.toolbar__9293f',
            '.header_c04f35',
            '.content__49fc1',
            '.footer_c04f35',
            '.footerSeparator__49fc1',
            '.footerTitle_c04f35',
            '.templatesList_c04f35',
            '.optionHeader_c04f35',
            '.container_eb2cd2',
            '.closeButton_c04f35',
            '.title_c04f35',
            '.small__49fc1',
            '.container__024d4',
            '.chat_f75fb0',
            '.scrim__40128',
            '.container_d08938',
            '.innerContainer_e1147e',
            '.container__89463',
            '.container__133bf',
            '.standardSidebarView__23e6b',
        ];

        selectorsToHide.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                el.style.display = 'none';
            });
        });

        // Hide all standalone SVGs safely
        document.querySelectorAll('svg').forEach(el => el.style.display = 'none');
    }
};
