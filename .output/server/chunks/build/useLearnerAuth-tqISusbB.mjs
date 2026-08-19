import { h as useState, j as useRequestHeaders } from './server.mjs';
import { computed } from 'vue';

function learnerErrorStatus(error) {
  if (!error || typeof error !== "object") return void 0;
  const candidate = error;
  return candidate.statusCode ?? candidate.status ?? candidate.data?.statusCode ?? candidate.data?.status ?? candidate.response?.status;
}
function useLearnerAuth() {
  const user = useState("learner-user", () => null);
  const status = useState("learner-auth-status", () => "unknown");
  function setUser(nextUser) {
    user.value = nextUser;
    status.value = "authenticated";
  }
  function clearUser() {
    user.value = null;
    status.value = "anonymous";
  }
  async function checkSession(force = false) {
    if (!force && status.value === "authenticated" && user.value) return user.value;
    if (!force && status.value === "anonymous") return null;
    status.value = "checking";
    try {
      const headers = true ? useRequestHeaders(["cookie"]) : void 0;
      const response = await $fetch("/api/learner/me", {
        credentials: "same-origin",
        headers
      });
      setUser(response.user);
      return response.user;
    } catch (error) {
      clearUser();
      if (learnerErrorStatus(error) !== 401) {
        console.error("[learner] Impossible de vérifier la session.", error);
      }
      return null;
    }
  }
  async function logout() {
    try {
      await $fetch("/api/learner/logout", {
        method: "POST",
        credentials: "same-origin"
      });
    } finally {
      clearUser();
    }
  }
  return {
    user,
    status,
    isAuthenticated: computed(() => status.value === "authenticated" && Boolean(user.value)),
    setUser,
    clearUser,
    checkSession,
    logout
  };
}

export { useLearnerAuth as u };
//# sourceMappingURL=useLearnerAuth-tqISusbB.mjs.map
