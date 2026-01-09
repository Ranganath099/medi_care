import api, { setAuthToken } from "../api/api";

export async function ensureCsrf() {
  try {
    await api.get("/csrf/");
    return true;
  } catch (err) {
    console.warn("ensureCsrf failed:", err?.response?.data || err?.message);
    throw err;
  }
}

export async function logout({ navigate } = {}) {
   
  const refresh = sessionStorage.getItem("refresh_token");

  try {
    if (refresh) {
      await api.post("/auth/logout/", { refresh });
      console.log("Logout succeeded");
    } else {
      console.warn("No refresh token found in sessionStorage.");
    }
  } catch (err) {
    console.warn("Logout error:", err?.response?.data || err);
  } finally {
     
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("user");

    setAuthToken(null);

    
    window.dispatchEvent(new CustomEvent("authChanged"));

    if (navigate) navigate("/login");
  }
}
