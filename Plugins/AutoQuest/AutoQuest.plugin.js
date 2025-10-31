/**
 * @name AutoQuest
 * @description Automatically completes Discord quests and hides UI elements for a clean interface. Use at your own risk.
 * @version 1.3.0
 * @author killerqueen2007
 * @authorId 1035715649672052746
 * @website https://github.com/killerqueen2007/BetterDiscordAddons/tree/main/Plugins/AutoQuest
 * @source https://raw.githubusercontent.com/killerqueen2007/BetterDiscordAddons/refs/heads/main/Plugins/AutoQuest/AutoQuest.plugin.js
 */


var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of __getOwnPropNames(from)) 
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);


// Export
var AutoQuest_exports = {};
__defProp(AutoQuest_exports, "default", { get: () => AutoQuest });
module.exports = __toCommonJS(AutoQuest_exports);

// --- Plugin Base ---
class Plugin {
  constructor(meta, config) {
    this.meta = meta;
    this.config = config;
    this.settings = BdApi.Data.load(this.meta.name, "settings") || {};
  }
  start() {
    BdApi.Logger.info(this.meta.name, `v${this.meta.version} started.`);
    if (typeof this.onStart === "function") this.onStart();
  }
  stop() {
    BdApi.Logger.info(this.meta.name, `v${this.meta.version} stopped.`);
    if (typeof this.onStop === "function") this.onStop();
  }
  saveSettings() {
    BdApi.Data.save(this.meta.name, "settings", this.settings);
  }
}

// --- Manifest / Config ---
const manifest = {
  info: {
    name: "AutoQuest",
    version: "1.3.0",
    description: "Automatically opens Discover and then Quests after Discord starts, and can hide UI elements.",
    authors: [{ name: "killerqueen2007" }]
  },
  changelog: [
    {
      title: "New Toggle Button",
      type: "improved",
      items: [
        "Replaced old toggle button with new power button design.",
        "Button now appears next to Inbox in the top navigation bar.",
        "Removed showToggleButton setting (button always shows when hiding is enabled)."
      ]
    }
  ],
  config: [
    {
      type: "switch",
      id: "enableAutoClick",
      name: "Enable Auto Open Quests Page",
      note: "If enabled, the plugin will automatically open Discover and Quests on startup.",
      value: true
    },
    {
      type: "text",
      id: "token",
      name: "Discord Token",
      note: "Enter your Discord token here to allow the plugin to enroll and complete quests.",
      value: ""
    },
    {
        type: "switch",
        id: "hidingEnabled",
        name: "Enable UI Hiding",
        note: "Hides various UI elements to focus on quests. Use the power button to toggle.",
        value: true
    }
  ]
};

// --- Main Plugin ---
class AutoQuest extends Plugin {
  constructor(meta) {
    super(meta, manifest);
    this.hidingEnabled = this.settings.hidingEnabled ?? true;
    this.toggleButton = null;
    this.hidingObserver = null;
    this.buttonCheckInterval = null;
  }

  getName() {
    return "AutoQuest";
  }

  onStart() {
    if (this.settings.enableAutoClick ?? true) {
      this.log("AutoQuestOpener enabled.");
      this.runOnLoad();
    } else {
      this.log("AutoQuestOpener is disabled in settings.");
    }


    console.log("Waiting 10s before doing quests");

    (async () => {
    await new Promise(r => setTimeout(r, 10000));
    

    if (this.settings.enableAutoClick ?? true) {
        // Get all quest tiles
        const questTiles = document.querySelectorAll('[id^="quest-tile-"]');

        // Filter only unstarted quests
        const unstartedQuests = Array.from(questTiles).filter(tile => {
            const button = tile.querySelector('button');
            if (!button) return false;

            const text = (button.innerText || "").trim();
            const isDisabled = button.disabled;
            const isVisible = button.offsetParent !== null;
            const isDone = tile.querySelector('.completionAnimation__956c6, .confetti__956c6');

            // Quests to not look at
            const hasStarted =
                text.includes("Watch") ||
                text.includes("Quest Accepted") ||
                text.includes("Quest ended") ||
                text.includes("Use Now") ||
                text.includes("Explore the Shop") ||
                text.includes("See Code") ||
                text.includes("Launch Quest")

            return isVisible && !isDisabled && !hasStarted && !isDone;
        });


        console.log(unstartedQuests);

        // Extract quest names and IDs
        const unstartedQuestInfo = unstartedQuests.map(tile => {
            const id = tile.id.replace('quest-tile-', '');
            const nameElement = tile.querySelector('.questName__956c6');
            const name = nameElement ? nameElement.innerText.trim() : 'Unknown Quest';
            return { id, name };
        });

        // Log formatted quest names with IDs
        console.log("Unstarted Quests:");
        unstartedQuestInfo.forEach(q => console.log(`${q.name} : ${q.id}`));

        // Collect IDs only for enrolling
        const unstartedQuestIDs = unstartedQuestInfo.map(q => q.id);

        // Function to enroll a quest
        const enrollQuest = (questID) => {
            const baseUrls = {
                Stable: "https://discord.com/api/v9/quests/",
                PTB: "https://ptb.discord.com/api/v9/quests/",
                Canary: "https://canary.discord.com/api/v9/quests/"
            };

            // Capture plugin instance correctly
            const appType = this?.settings?.appType || "Stable";
            const token = this?.settings?.token || "";

            const baseUrl = baseUrls[appType];

            return fetch(`${baseUrl}${questID}/enroll`, {
                method: "POST",
                headers: {
                    "accept": "*/*",
                    "accept-language": "en-US",
                    "authorization": token,
                    "content-type": "application/json",
                    "priority": "u=1, i",
                    "sec-ch-ua": "\"Not:A-Brand\";v=\"24\", \"Chromium\";v=\"134\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-debug-options": "bugReporterEnabled",
                    "x-discord-locale": "en-US",
                    "x-discord-timezone": "America/New_York",
                    "x-super-properties": "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiRGlzY29yZCBDbGllbnQiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfdmVyc2lvbiI6IjEuMC45MjA5Iiwib3NfdmVyc2lvbiI6IjEwLjAuMjYxMDAiLCJvc19hcmNoIjoieDY0IiwiYXBwX2FyY2giOiJ4NjQiLCJzeXN0ZW1fbG9jYWxlIjoiZW4tVVMiLCJoYXNfY2xpZW50X21vZHMiOmZhbHNlLCJjbGllbnRfbGF1bmNoX2lkIjoiYTk3YWFmNTUtY2U5Ny00MWUxLTgwYjItYzNlODY4ZWY5MGJlIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgZGlzY29yZC8xLjAuOTIwOSBDaHJvbWUvMTM0LjAuNjk5OC4yMDUgRWxlY3Ryb24vMzUuMy4wIFNhZmFyaS81MzcuMzYiLCJicm93c2VyX3ZlcnNpb24iOiIzNS4zLjAiLCJvc19zZGtfdmVyc2lvbiI6IjI2MTAwIiwiY2xpZW50X2J1aWxkX251bWJlciI6NDQ4ODkzLCJuYXRpdmVfYnVpbGRfbnVtYmVyIjo2OTE4MywiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbCwibGF1bmNoX3NpZ25hdHVyZSI6IjE5NzhlY2E1LWUyMTktNDQ3MC04ZTU2LTIyYWYwNDAzNzIzMiIsImNsaWVudF9oZWFydGJlYXRfc2Vzc2lvbl9pZCI6ImViY2Q2YmJjLThiOTctNGRmMC05OGFhLTQyNDIyZTBlZWI5MCIsImNsaWVudF9hcHBfc3RhdGUiOiJmb2N1c2VkIn0="
                },
                body: JSON.stringify({ location: 11, is_targeted: false }),
                mode: "cors",
                credentials: "include"
            })
            .then(response => console.log(`Quest ${questID} enrolled:`, response.status))
            .catch(error => console.error(`Error enrolling quest ${questID}:`, error));
        }

        // Enroll all unstarted quests
        await Promise.all(unstartedQuestIDs.map(enrollQuest));
        console.log("All enrollment requests sent. Waiting 5 seconds for Discord to process them...");
        await new Promise(r => setTimeout(r, 5000));
    }

    delete window.$
    let wpRequire = webpackChunkdiscord_app.push([[Symbol()], {}, r => r]);
    webpackChunkdiscord_app.pop();

    const ApplicationStreamingStore = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.getStreamerActiveStreamMetadata).exports.Z;
    const RunningGameStore = Object.values(wpRequire.c).find(x => x?.exports?.ZP?.getRunningGames).exports.ZP;
    const QuestsStore = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.getQuest).exports.Z;
    const ChannelStore = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.getAllThreadsForParent).exports.Z;
    const GuildChannelStore = Object.values(wpRequire.c).find(x => x?.exports?.ZP?.getSFWDefaultChannel).exports.ZP;
    const FluxDispatcher = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.flushWaitQueue).exports.Z;
    const api = Object.values(wpRequire.c).find(x => x?.exports?.tn?.get).exports.tn;

    const isApp = typeof DiscordNative !== "undefined";

    function getUncompletedQuests() {
        return [...QuestsStore.quests.values()].filter(q => 
            q.id !== "1248385850622869556" &&
            q.userStatus?.enrolledAt &&
            !q.userStatus?.completedAt &&
            new Date(q.config.expiresAt).getTime() > Date.now()
        );
    }

    async function spoofVideoQuest(quest) {
        const maxFuture = 10, speed = 7, interval = 1;
        const enrolledAt = new Date(quest.userStatus.enrolledAt).getTime();
        const secondsNeeded = quest.taskConfig.tasks[quest.taskName].target;
        let secondsDone = quest.userStatus?.progress?.[quest.taskName]?.value ?? 0;
        let completed = false;

        console.log(`Spoofing video for ${quest.config.messages.questName}.`);

        while (secondsDone < secondsNeeded) {
            const maxAllowed = Math.floor((Date.now() - enrolledAt)/1000) + maxFuture;
            const diff = maxAllowed - secondsDone;
            const timestamp = secondsDone + speed;

            if(diff >= speed) {
                const res = await api.post({url: `/quests/${quest.id}/video-progress`, body: {timestamp: Math.min(secondsNeeded, timestamp + Math.random())}});
                completed = res.body.completed_at != null;
                secondsDone = Math.min(secondsNeeded, timestamp);
            }

            await new Promise(r => setTimeout(r, interval * 1000));
        }

        if(!completed) {
            await api.post({url: `/quests/${quest.id}/video-progress`, body: {timestamp: secondsNeeded}});
        }

        console.log(`Quest "${quest.config.messages.questName}" completed!`);
    }

    async function playActivityQuest(quest) {
        const secondsNeeded = quest.taskConfig.tasks[quest.taskName].target;
        const channelId = ChannelStore.getSortedPrivateChannels()[0]?.id ??
            Object.values(GuildChannelStore.getAllGuilds()).find(x => x?.VOCAL?.length)?.VOCAL[0].channel.id;
        const streamKey = `call:${channelId}:1`;

        console.log(`Completing activity quest: ${quest.config.messages.questName}`);

        while(true) {
            const res = await api.post({url: `/quests/${quest.id}/heartbeat`, body: {stream_key: streamKey, terminal: false}});
            const progress = res.body.progress.PLAY_ACTIVITY.value;
            console.log(`Quest progress (${quest.config.messages.questName}): ${progress}/${secondsNeeded}`);

            if(progress >= secondsNeeded) {
                await api.post({url: `/quests/${quest.id}/heartbeat`, body: {stream_key: streamKey, terminal: true}});
                break;
            }

            await new Promise(r => setTimeout(r, 20000));
        }

        console.log(`Quest "${quest.config.messages.questName}" completed!`);
    }

    async function processQuest(quest) {
        quest.taskConfig = quest.config.taskConfig ?? quest.config.taskConfigV2;
        quest.taskName = ["WATCH_VIDEO","PLAY_ON_DESKTOP","STREAM_ON_DESKTOP","PLAY_ACTIVITY","WATCH_VIDEO_ON_MOBILE"]
            .find(x => quest.taskConfig.tasks[x] != null);

        if(!quest.taskName) return;

        const taskName = quest.taskName;

        if(taskName === "WATCH_VIDEO" || taskName === "WATCH_VIDEO_ON_MOBILE") {
            await spoofVideoQuest(quest);
        }
        else if(taskName === "PLAY_ACTIVITY") {
            await playActivityQuest(quest);
        }
        else if(taskName === "PLAY_ON_DESKTOP") {
            if(!isApp) return console.log(`Desktop app required for ${quest.config.messages.questName}!`);
            const pid = Math.floor(Math.random() * 30000) + 1000;
            const applicationId = quest.config.application.id;
            const applicationName = quest.config.application.name;

            const res = await api.get({url: `/applications/public?application_ids=${applicationId}`});
            const appData = res.body[0];
            const exeName = appData.executables.find(x => x.os === "win32").name.replace(">", "");

            const fakeGame = {
                cmdLine: `C:\\Program Files\\${appData.name}\\\${exeName}`,
                exeName,
                exePath: `c:/program files/${appData.name.toLowerCase()}/${exeName}`,
                hidden: false,
                isLauncher: false,
                id: applicationId,
                name: appData.name,
                pid,
                pidPath: [pid],
                processName: appData.name,
                start: Date.now(),
            };

            const realGames = RunningGameStore.getRunningGames();
            const fakeGames = [fakeGame];
            const realGetRunningGames = RunningGameStore.getRunningGames;
            const realGetGameForPID = RunningGameStore.getGameForPID;

            RunningGameStore.getRunningGames = () => fakeGames;
            RunningGameStore.getGameForPID = pid => fakeGames.find(x => x.pid === pid);
            FluxDispatcher.dispatch({type: "RUNNING_GAMES_CHANGE", removed: realGames, added: [fakeGame], games: fakeGames});

            await new Promise(resolve => {
                const updateProgress = data => {
                    const progress = quest.config.configVersion === 1 ? data.userStatus.streamProgressSeconds : Math.floor(data.userStatus.progress.PLAY_ON_DESKTOP.value);
                    console.log(`Quest progress (${quest.config.messages.questName}): ${progress}/${quest.taskConfig.tasks.PLAY_ON_DESKTOP.target}`);

                    if(progress >= quest.taskConfig.tasks.PLAY_ON_DESKTOP.target) {
                        console.log(`Quest "${quest.config.messages.questName}" completed!`);
                        RunningGameStore.getRunningGames = realGetRunningGames;
                        RunningGameStore.getGameForPID = realGetGameForPID;
                        FluxDispatcher.dispatch({type: "RUNNING_GAMES_CHANGE", removed: [fakeGame], added: [], games: []});
                        FluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", updateProgress);
                        resolve();
                    }
                };
                FluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", updateProgress);
            });
        }
        else if(taskName === "STREAM_ON_DESKTOP") {
            if(!isApp) return console.log(`Desktop app required for ${quest.config.messages.questName}!`);
            const pid = Math.floor(Math.random() * 30000) + 1000;
            const applicationId = quest.config.application.id;
            const applicationName = quest.config.application.name;
            const realFunc = ApplicationStreamingStore.getStreamerActiveStreamMetadata;

            ApplicationStreamingStore.getStreamerActiveStreamMetadata = () => ({
                id: applicationId,
                pid,
                sourceName: null
            });

            await new Promise(resolve => {
                const updateProgress = data => {
                    const progress = quest.config.configVersion === 1 ? data.userStatus.streamProgressSeconds : Math.floor(data.userStatus.progress.STREAM_ON_DESKTOP.value);
                    console.log(`Quest progress (${quest.config.messages.questName}): ${progress}/${quest.taskConfig.tasks.STREAM_ON_DESKTOP.target}`);

                    if(progress >= quest.taskConfig.tasks.STREAM_ON_DESKTOP.target) {
                        console.log(`Quest "${quest.config.messages.questName}" completed!`);
                        ApplicationStreamingStore.getStreamerActiveStreamMetadata = realFunc;
                        FluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", updateProgress);
                        resolve();
                    }
                };
                FluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", updateProgress);
            });
        }
    }

    // Sequential auto-processing loop (with 5s wait before starting)
    (async () => {
        while (true) {
            const quests = getUncompletedQuests();
            if (!quests.length) {
                console.log("No more uncompleted quests left!");
                break;
            }

            const quest = quests[0];
            console.log(`Waiting 5 seconds before starting quest: ${quest.config.messages.questName}`);

            // Wait 5 seconds before starting quest
            await new Promise(r => setTimeout(r, 5000));

            console.log(`Starting quest: ${quest.config.messages.questName}`);
            await processQuest(quest);

            // Small delay to avoid spamming (after completing one quest)
            await new Promise(r => setTimeout(r, 2000));
        }

        console.log("All quests completed!");
    })();
    })();

    // Add new power button
    this.addPowerButton();

    if (this.hidingEnabled) {
        this.applyHiding();
    }

    this.hidingObserver = new MutationObserver(() => {
        if (this.hidingEnabled) this.hideElements();
        this.addQuestsButtonToShop();
        this.ensurePowerButton();
    });

    this.hidingObserver.observe(document.body, { childList: true, subtree: true });
  }

  onStop() {
    this.log("Plugin stopped.");
    
    if (this.hidingObserver) {
        this.hidingObserver.disconnect();
        this.hidingObserver = null;
    }
    
    // Remove power button by class instead of stored reference
    const powerBtn = document.querySelector('.togglePowerButton');
    if (powerBtn) {
        powerBtn.remove();
    }
    this.toggleButton = null;
    
    this.showAll();

    const shopButton = document.getElementById('quests-shop-button');
    if (shopButton) shopButton.remove();
  }

  log(...args) {
    BdApi.Logger.info("AutoQuest", ...args);
  }

  getSettingsPanel() {
      const apps = [
        { label: "Stable", value: "Stable" },
        { label: "PTB", value: "PTB" },
        { label: "Canary", value: "Canary" }
      ];

      return BdApi.UI.buildSettingsPanel({
        settings: [
          {
            type: "switch",
            id: "enableAutoClick",
            name: "Enable Auto Open Quests Page",
            note: "If enabled, the plugin will automatically open Discover and Quests on startup.",
            value: this.settings.enableAutoClick ?? true
          },
          {
            type: "dropdown",
            id: "appType",
            name: "Discord App",
            note: "Select which Discord build you're using",
            options: apps,
            value: this.settings.appType || "Stable"
          },
          {
            type: "text",
            id: "token",
            name: "Discord Token",
            note: "Enter your Discord token here to allow the plugin to enroll quests",
            value: this.settings.token || ""
          },
          {
            type: "switch",
            id: "hidingEnabled",
            name: "Enable UI Hiding",
            note: "Hides various UI elements to focus on quests. Reload Discord for changes to take effect.",
            value: this.settings.hidingEnabled ?? true
          }
        ],
        onChange: (_, id, value) => {
          this.settings[id] = value;
          this.saveSettings();
          if (id === 'hidingEnabled') {
              this.hidingEnabled = value;
              if (this.hidingEnabled) this.applyHiding();
              else this.showAll();
              this.updatePowerButtonState();
          }
        }
      });
  }


  simulateClick(el) {
    if (!el) return;
    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
    el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  }

  waitForElement(selector, filterFn, callback) {
    const tryFind = () => {
      const els = Array.from(document.querySelectorAll(selector));
      const match = els.find(filterFn);
      if (match) {
        callback(match);
        return true;
      }
      return false;
    };

    if (tryFind()) return;
    const observer = new MutationObserver(() => {
      if (tryFind()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  runOnLoad() {
    // Step 1: Wait for Discover button
    this.waitForElement(
      '.wrapper__6e9f8',
      () => true,
      el => {
        this.log("Clicking Discover...");
        this.simulateClick(el);

        // Step 2: Wait for Quests tab after Discover loads
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

  addQuestsButtonToShop() {
    const tabsContainer = document.querySelector('.tabs__80679');
    if (!tabsContainer) return;

    if (document.getElementById('quests-shop-button')) return;
    
    const tabWrapper = document.createElement('div');
    tabWrapper.id = 'quests-shop-button';
    tabWrapper.className = 'tabWrapper__80679 titleWrapper__9293f';
    tabWrapper.setAttribute('role', 'button');
    tabWrapper.setAttribute('tabindex', '0');
    
    const btn = document.createElement('h1');
    btn.className = 'defaultColor__4bd52 text-md/medium_cf4812 defaultColor__5345c tab__80679 title__9293f titleClickable__9293f';
    btn.setAttribute('data-text-variant', 'text-md/medium');
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('role', 'img');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.style.marginRight = '8px';
    svg.style.verticalAlign = 'middle';
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'currentColor');
    path.setAttribute('d', 'M7.5 21.7a8.95 8.95 0 0 1 9 0 1 1 0 0 0 1-1.73c-.6-.35-1.24-.64-1.9-.87.54-.3 1.05-.65 1.52-1.07a3.98 3.98 0 0 0 5.49-1.8.77.77 0 0 0-.24-.95 3.98 3.98 0 0 0-2.02-.76A4 4 0 0 0 23 10.47a.76.76 0 0 0-.71-.71 4.06 4.06 0 0 0-1.6.22 3.99 3.99 0 0 0 .54-5.35.77.77 0 0 0-.95-.24c-.75.36-1.37.95-1.77 1.67V6a4 4 0 0 0-4.9-3.9.77.77 0 0 0-.6.72 4 4 0 0 0 3.7 4.17c.89 1.3 1.3 2.95 1.3 4.51 0 3.66-2.75 6.5-6 6.5s-6-2.84-6-6.5c0-1.56.41-3.21 1.3-4.51A4 4 0 0 0 11 2.82a.77.77 0 0 0-.6-.72 4.01 4.01 0 0 0-4.9 3.96A4.02 4.02 0 0 0 3.73 4.4a.77.77 0 0 0-.95.24 3.98 3.98 0 0 0 .55 5.35 4 4 0 0 0-1.6-.22.76.76 0 0 0-.72.71l-.01.28a4 4 0 0 0 2.65 3.77c-.75.06-1.45.33-2.02.76-.3.22-.4.62-.24.95a4 4 0 0 0 5.49 1.8c.47.42.98.78 1.53 1.07-.67.23-1.3.52-1.91.87a1 1 0 1 0 1 1.73Z');
    
    svg.appendChild(path);
    
    btn.appendChild(svg);
    btn.appendChild(document.createTextNode('Quests'));
    
    tabWrapper.addEventListener('click', () => {
      const questsButton = [...document.querySelectorAll('a.link__972a0')]
        .find(a => a.textContent.trim() === 'Quests');
      
      if (questsButton) {
        questsButton.click();
      }
    });
    
    tabWrapper.appendChild(btn);
    
    tabsContainer.appendChild(tabWrapper);
  }

  addPowerButton() {
    const inboxButton = document.querySelector('.clickable_c99c29[aria-label="Inbox"]');
    if (!inboxButton || document.querySelector('.togglePowerButton')) return;

    const powerBtn = document.createElement('div');
    powerBtn.className = inboxButton.className + ' togglePowerButton';
    powerBtn.setAttribute('role', 'button');
    powerBtn.setAttribute('tabindex', '0');
    powerBtn.setAttribute('aria-label', 'Toggle UI Hiding');
    powerBtn.style.cursor = 'pointer';

    powerBtn.innerHTML = `
      <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
        fill="none" viewBox="0 0 24 24">
        <path fill="currentColor"
          d="M12 2a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 20a9 9 0 0 1-9-9 9 9 0 0 1 5-8.05 
             1 1 0 0 1 .89 1.79A7 7 0 1 0 19 13a7 7 0 0 0-3.11-5.86 
             1 1 0 1 1 1.13-1.64A9 9 0 0 1 12 22Z"/>
      </svg>
    `;

    inboxButton.parentElement.insertBefore(powerBtn, inboxButton);

    powerBtn.style.color = this.hidingEnabled ? '#43b581' : '';
    powerBtn.style.transform = this.hidingEnabled ? 'scale(1.1)' : '';
    powerBtn.style.transition = 'all 0.2s ease';

    powerBtn.addEventListener('click', () => {
      this.hidingEnabled = !this.hidingEnabled;
      this.settings.hidingEnabled = this.hidingEnabled;
      this.saveSettings();
      
      powerBtn.style.color = this.hidingEnabled ? '#43b581' : '';
      powerBtn.style.transform = this.hidingEnabled ? 'scale(1.1)' : '';
      
      console.log(`UI Hiding ${this.hidingEnabled ? 'ON' : 'OFF'}`);
      this.log(`UI Hiding ${this.hidingEnabled ? 'enabled' : 'disabled'}`);

      if (this.hidingEnabled) {
        this.applyHiding();
      } else {
        this.showAll();
      }
    });

    this.toggleButton = powerBtn;
  }

  ensurePowerButton() {
    this.addPowerButton();
  }

  updatePowerButtonState() {
    const powerBtn = document.querySelector('.togglePowerButton');
    if (powerBtn) {
      powerBtn.style.color = this.hidingEnabled ? '#43b581' : '';
      powerBtn.style.transform = this.hidingEnabled ? 'scale(1.1)' : '';
    }
  }

  applyHiding() {
    if (this.hidingEnabled) this.hideElements();
  }

  showAll() {
    document.querySelectorAll('*').forEach(el => {
      if (el.style.display === 'none') el.style.display = '';
    });
  }

  hideElements() {
    const selectorsToHide = [
      '.title_c38106',
      ".sidebar__5e434"
    ];

    selectorsToHide.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.style.display = 'none';
      });
    });
  }
}

// Export after class is declared
var AutoQuest_exports = {};
__defProp(AutoQuest_exports, "default", { get: () => AutoQuest });
module.exports = __toCommonJS(AutoQuest_exports);

/*@end@*/
