import { h as useState } from './server.mjs';
import { computed } from 'vue';

function getAdminErrorStatus(error) {
  if (!error || typeof error !== "object") {
    return void 0;
  }
  const candidate = error;
  return candidate.statusCode ?? candidate.status ?? candidate.data?.statusCode ?? candidate.data?.status ?? candidate.response?.status;
}
function getAdminErrorMessage(error, fallback = "Une erreur est survenue.") {
  if (!error || typeof error !== "object") {
    return fallback;
  }
  const candidate = error;
  return candidate.data?.statusMessage || candidate.data?.message || candidate.statusMessage || candidate.message || fallback;
}
function useAdminAuth() {
  const user = useState("admin-user", () => null);
  const status = useState("admin-auth-status", () => "unknown");
  const authError = useState("admin-auth-error", () => "");
  const isAuthenticated = computed(() => status.value === "authenticated" && Boolean(user.value));
  function clearSession(message = "") {
    user.value = null;
    status.value = "anonymous";
    authError.value = message;
  }
  async function checkSession(force = false) {
    if (!force && status.value === "authenticated" && user.value) {
      return user.value;
    }
    status.value = "checking";
    authError.value = "";
    try {
      const response = await $fetch("/api/auth/me", {
        credentials: "same-origin"
      });
      if (!response.user || response.user.privilegeId !== 1) {
        clearSession();
        return null;
      }
      user.value = response.user;
      status.value = "authenticated";
      return response.user;
    } catch (error) {
      if (getAdminErrorStatus(error) === 401) {
        clearSession();
      } else {
        clearSession(getAdminErrorMessage(error, "Impossible de vérifier la session."));
      }
      return null;
    }
  }
  async function login(email, password) {
    authError.value = "";
    try {
      const response = await $fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        body: { email, password }
      });
      user.value = response.user;
      status.value = "authenticated";
      return response.user;
    } catch (error) {
      clearSession(getAdminErrorMessage(error, "Connexion impossible."));
      throw error;
    }
  }
  async function logout() {
    authError.value = "";
    try {
      await $fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin"
      });
      clearSession();
    } catch (error) {
      if (getAdminErrorStatus(error) === 401) {
        clearSession();
        return;
      }
      authError.value = getAdminErrorMessage(error, "Déconnexion impossible.");
      throw error;
    }
  }
  function handleUnauthorized(error) {
    if (getAdminErrorStatus(error) !== 401) {
      return false;
    }
    clearSession("Votre session a expiré. Reconnectez-vous pour continuer.");
    return true;
  }
  return {
    user,
    status,
    authError,
    isAuthenticated,
    checkSession,
    login,
    logout,
    clearSession,
    handleUnauthorized
  };
}

export { getAdminErrorMessage as g, useAdminAuth as u };
//# sourceMappingURL=useAdminAuth-BdfYT3Lh.mjs.map
