import { ref, watch } from 'vue';

function loadTurnstileApi() {
  return Promise.reject(new Error("Turnstile est uniquement disponible dans le navigateur."));
}
function useTurnstileWidget(siteKey, action, options = {}) {
  const container = ref(null);
  const token = ref("");
  const unavailable = ref(false);
  let widgetId = null;
  async function render() {
    if (!siteKey || !container.value || widgetId) return;
    const target = container.value;
    try {
      const turnstile = await loadTurnstileApi();
      if (container.value !== target || widgetId) return;
      widgetId = turnstile.render(target, {
        sitekey: siteKey,
        action,
        theme: "auto",
        callback: (response) => {
          token.value = response;
          unavailable.value = false;
        },
        "expired-callback": () => {
          token.value = "";
          void reset();
        },
        "error-callback": () => {
          token.value = "";
          unavailable.value = true;
        }
      });
    } catch {
      unavailable.value = true;
    }
  }
  async function reset() {
    token.value = "";
    unavailable.value = false;
    if (!widgetId) {
      await render();
      return;
    }
    try {
      const turnstile = await loadTurnstileApi();
      turnstile.reset(widgetId);
    } catch {
      unavailable.value = true;
    }
  }
  watch(container, (element) => {
    if (element && options.autoRender !== false) void render();
  }, { flush: "post" });
  return { container, token, unavailable, render, reset };
}

export { useTurnstileWidget as u };
//# sourceMappingURL=useTurnstileWidget-JtKO0GYz.mjs.map
