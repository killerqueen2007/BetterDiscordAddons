/**
 * @name AutoQuest
 * @description Auto-Open Discord Discover & Complete Quests — Use at Your Own Risk
 * @version 1.0.0
 * @author killerqueen2007
 * @authorId 1035715649672052746
 * @website https://github.com/killerqueen2007/BetterDiscordAddons/tree/main/Plugins/AutoQuest
 * @source https://github.com/killerqueen2007/BetterDiscordAddons/blob/main/Plugins/AutoQuest/AutoQuest.plugin.js
 */

const defaultSettings = {
    enableAutoClick: true,
    customDelay: 10
};

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
var AutoQuestOpener_exports = {};
__defProp(AutoQuestOpener_exports, "default", { get: () => AutoQuestOpener });
module.exports = __toCommonJS(AutoQuestOpener_exports);

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
    name: "AutoQuestOpener",
    version: "1.0.0",
    description: "Automatically opens Discover and then Quests after Discord starts.",
    authors: [{ name: "Ava" }]
  },
  changelog: [
    {
      title: "Initial Release",
      type: "added",
      items: [
        "Automatically opens Discover and Quests when Discord loads.",
        "Standalone (no ZeresPluginLibrary needed)."
      ]
    }
  ],
  config: [
    {
      type: "switch",
      id: "enableAutoClick",
      name: "Enable Auto Click",
      note: "If enabled, the plugin will automatically open Discover and Quests on startup.",
      value: true
    },
    {
      type: "text",
      id: "token",
      name: "Discord Token",
      note: "Enter your Discord token here to allow the plugin to enroll quests.",
      value: ""
    }
  ]
};

// --- Main Plugin ---
class AutoQuestOpener extends Plugin {
  constructor(meta) {
    super(meta, manifest);
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

        // Exclude started, ended, "Use Now", or "Explore the Shop" quests
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
    function enrollQuest(questID) {
        const baseUrls = {
            Stable: "https://discord.com/api/v9/quests/",
            PTB: "https://ptb.discord.com/api/v9/quests/",
            Canary: "https://canary.discord.com/api/v9/quests/"
        };

        const baseUrl = baseUrls[this.settings.appType || "Stable"];

        fetch(`${baseUrl}${questID}/enroll`, {
            method: "POST",
            headers: {
                "accept": "*/*",
                "accept-language": "en-US",
                "authorization": this.settings.token || "",
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
                "x-super-properties": "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiRGlzY29yZCBDbGllbnQiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfdmVyc2lvbiI6IjEuMC45MjA5Iiwib3NfdmVyc2lvbiI6IjEwLjAuMjYxMDAiLCJvc19hcmNoIjoieDY0IiwiYXBwX2FyY2giOiJ4NjQiLCJzeXN0ZW1fbG9jYWxlIjoiZW4tVVMiLCJoYXNfY2xpZW50X21vZHMiOmZhbHNlLCJjbGllbnRfbGF1bmNoX2lkIjoiYTk3YWFmNTUtY2U5Ny00MWUxLTgwYjItYzNlODY4ZWY5MGJlIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgZGlzY29yZC8xLjAuOTIwOSBDaHJvbWUvMTM0LjAuNjk5OC4yMDUgRWxlY3Ryb24vMzUuMy4wIFNhZmFyaS81MzcuMzYiLCJicm93c2VyX3ZlcnNpb24iOiIzNS4zLjAiLCJvc19zZGtfdmVyc2lvbiI6IjI2MTAwIiwiY2xpZW50X2J1aWxkX251bWJlciI6NDQ4ODkzLCJuYXRpdmVfYnVpbGRfbnVtYmVyIjo2OTE4MywiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbCwibGF1bmNoX3NpZ25hdHVyZSI6IjE5NzhlY2E1LWUyMTktNDQ3MC04ZTU2LTIyYWYwNDAzNzIzMiIsImNsaWVudF9oZWFydGJlYXRfc2Vzc2lvbl9pZCI6ImViY2Q2YmJjLThiOTctNGRmMC05OGFhLTQyNDIyZTBlZWI5MCIsImNsaWVudF9hcHBfc3RhdGUiOiJmb2N1c2VkIn0=" // Optional
            },
            body: JSON.stringify({ location: 11, is_targeted: false }),
            mode: "cors",
            credentials: "include"
        })
        .then(response => console.log(`Quest ${questID} enrolled:`, response.status))
        .catch(error => console.error(`Error enrolling quest ${questID}:`, error));
    }

    // Enroll all unstarted quests
    unstartedQuestIDs.forEach(enrollQuest);


    delete window.$;
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
                cmdLine: `C:\\Program Files\\${appData.name}\\${exeName}`,
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
















    // ------------------------------------------------------------
  }

  onStop() {
    this.log("Plugin stopped.");
  }

  log(...args) {
    BdApi.Logger.info("AutoQuestOpener", ...args);
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
            type: "dropdown",
            id: "appType",
            name: "Discord App",
            note: "Select which Discord build you’re using",
            options: apps,
            value: this.settings.appType || "Stable"
          },
          {
            type: "text",
            id: "token",
            name: "Discord Token",
            note: "Enter your Discord token here to allow the plugin to enroll quests",
            value: this.settings.token || ""
          }
        ],
        onChange: (_, id, value) => {
          this.settings[id] = value;
          this.saveSettings();
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
      '[data-list-item-id="guildsnav___guild-discover-button"]',
      () => true,
      el => {
        this.log("Clicking Discover...");
        this.simulateClick(el);

        // Step 2: Wait for Quests tab after Discover loads
        setTimeout(() => {
          this.waitForElement(
            ".navItem__551b0",
            e => e.textContent.trim() === "Quests",
            questEl => {
              this.log("Clicking Quests...");
              this.simulateClick(questEl);
            }
          );
        }, 1000);
      }
    );
  }
}


// Export after class is declared
var AutoQuestOpener_exports = {};
__defProp(AutoQuestOpener_exports, "default", { get: () => AutoQuestOpener });
module.exports = __toCommonJS(AutoQuestOpener_exports);

/*@end@*/

