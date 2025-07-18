import { Plugin } from "obsidian";

export default class FullCalendarColorAddon extends Plugin {
  async onload() {
    console.log("Full Calendar Color Addon loaded");

    let config: Record<string, string> = {};
    let refreshInterval = 30_000; // fallback по умолчанию

    try {
      const raw = await this.app.vault.adapter.read(
        `${this.app.vault.configDir}/plugins/${this.manifest.id}/config.json`
      );
      config = JSON.parse(raw);

      // Забираем refreshInterval, если указан
      if ("refreshInterval" in config) {
        const rawInterval = Number(config["refreshInterval"]);
        if (!isNaN(rawInterval) && rawInterval >= 1000) {
          refreshInterval = rawInterval;
        }
        delete config["refreshInterval"]; // Удалим, чтобы не обрабатывался как keyword
      }
    } catch (err) {
      console.error("Failed to load config:", err);
      return;
    }

    function classifyEvents() {
      document.querySelectorAll("a.fc-timegrid-event").forEach((el) => {
        const titleEl = el.querySelector(".fc-event-title");
        const title = (titleEl?.textContent || "").toLowerCase();

        for (const keyword in config) {
          if (title.includes(keyword.toLowerCase())) {
            const color = config[keyword];
            el.setAttribute("data-type", keyword);
            (el as HTMLElement).style.setProperty("background-color", color, "important");
            (el as HTMLElement).style.setProperty("border-color", "white", "important");
            break;
          }
        }
      });
    }

    // Слежение за DOM-обновлениями
    const observer = new MutationObserver(classifyEvents);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Повторная перекраска (на случай отложенной отрисовки)
    let attempts = 0;
    const interval = setInterval(() => {
      classifyEvents();
      if (++attempts > 20) clearInterval(interval);
    }, 500);

    // Обновление событий Full Calendar с интервалом из конфига
    this.registerInterval(
      setInterval(() => {
        // @ts-ignore
        const plugin = app.plugins.plugins["obsidian-full-calendar"];
        plugin?.cache?.revalidateRemoteCalendars(true);
      }, refreshInterval)
    );

    console.log(`Revalidation every ${refreshInterval}ms`);
  }
}
