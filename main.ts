import { Plugin } from "obsidian";

export default class FullCalendarColorAddon extends Plugin {
  async onload() {
    console.log("Full Calendar Color Addon loaded");

    // Чтение config.json из директории плагина
    let config: Record<string, string> = {};

    try {
      const raw = await this.app.vault.adapter.read(`${this.app.vault.configDir}/plugins/${this.manifest.id}/config.json`);
      config = JSON.parse(raw);
    } catch (err) {
      console.error("Failed to load color config:", err);
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

    // Наблюдаем за изменениями DOM календаря
    const observer = new MutationObserver(classifyEvents);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Повторная перекраска после отложенной отрисовки
    let attempts = 0;
    const interval = setInterval(() => {
      classifyEvents();
      if (++attempts > 20) clearInterval(interval);
    }, 500);
  }
}
