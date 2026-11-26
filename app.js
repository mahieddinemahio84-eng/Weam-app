let appSession = { sessionToken: null, user: null };

function onIncompletePaymentFound(payment) {
  console.warn("تم العثور على دفعة غير مكتملة:", payment.identifier);
}

async function authenticateWithPi() {
  const statusEl = document.getElementById("status-message");
  const loginBtn = document.getElementById("login-btn");
  const userInfoEl = document.getElementById("user-info");

  try {
    loginBtn.disabled = true;
    statusEl.innerText = "جاري الاتصال بشبكة Pi...";

    if (!window.Pi) {
      throw new Error("يرجى فتح التطبيق من داخل متصفح Pi Browser.");
    }

    await window.Pi.init({ version: "2.0" });
    const authResult = await window.Pi.authenticate(["username"], onIncompletePaymentFound);
    const accessToken = authResult.accessToken;

    statusEl.innerText = "جاري التحقق من الهوية...";

    const response = await fetch("https://piappengine.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: accessToken })
    });

    if (!response.ok) {
      throw new Error(`فشل التحقق: ${response.status}`);
    }

    const data = await response.json();
    appSession.sessionToken = data.sessionToken;
    appSession.user = data.user;

    loginBtn.style.display = "none";
    statusEl.innerText = "تم تسجيل الدخول بنجاح!";
    userInfoEl.style.display = "block";
    userInfoEl.innerHTML = `
      <p><strong>اسم المستخدم:</strong> ${appSession.user.username}</p>
      <p><strong>المعرف الموثوق (UID):</strong> ${appSession.user.uid}</p>
    `;
  } catch (error) {
    statusEl.innerText = "حدث خطأ: " + error.message;
    loginBtn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) loginBtn.addEventListener("click", authenticateWithPi);
  authenticateWithPi();
});
