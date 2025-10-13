/**
 * @name Questcord
 * @version 1.0.0
 * @description Hides specific elements in Discord to clean up the UI.
 * @author killerqueen2007
 * @authorId 1035715649672052746
 */

module.exports = class Questcord {
    constructor() {
        this.observer = null;
    }

    // Called when the plugin starts
    start() {
        this.hideElements();

        // Observe DOM for new elements
        this.observer = new MutationObserver(() => {
            this.hideElements();
        });

        this.observer.observe(document.body, { childList: true, subtree: true });
        console.log('%c[Questcord] Plugin started', 'color: #00ff00');
    }

    // Called when the plugin stops
    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        // Optional: Restore display for all hidden elements
        document.querySelectorAll('*').forEach(el => {
            if (el.style.display === 'none') el.style.display = '';
        });

        console.log('%c[Questcord] Plugin stopped', 'color: #ff0000');
    }

    // The main hiding function
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
            '.container__960ef',
            '.orbsLottieContainer_a3e8db',
            '.topRow_b5b7aa',
            '.bottomRow_b5b7aa'
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
