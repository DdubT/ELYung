// 사용자 정보
const profile = {
  name: "E.LessYong",
  job: "자동화 시스템 개발 대표",
  email: "ELY@gapboo.com",
  phone: "010-8992-2626",
  tagline: "반복업무 지겨우시죠? 자동화로 편리성과 시간을 얻으세요!"
};

const linkedinUrl = "https://blog.naver.com/hn-fan";
const youtubeUrl = "https://www.youtube.com/@FreeDDM";

const el = (id) => document.getElementById(id);

el("name").textContent = profile.name;
el("job").textContent = profile.job;
el("email").textContent = profile.email;
el("phone").textContent = profile.phone;
el("tagline").textContent = profile.tagline;

function showToast(text){
  const t = el("toast");
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove("show"), 1200);
}

async function copyText(text){
  try {
    await navigator.clipboard.writeText(text);
    showToast("복사됨");
  } catch (e) {
    // clipboard 권한이 없을 때를 위한 폴백
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast("복사됨");
  }
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-copy]");
  if (!btn) return;

  const kind = btn.getAttribute("data-copy");
  if (kind === "email") copyText(profile.email);
  if (kind === "phone") copyText(profile.phone);
});

function escapeVCardValue(value){
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function makeVCard(){
  // vCard 문자열을 QR에 담아서 스캔하면 연락처로 저장하기 쉽게 구성합니다.
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVCardValue(profile.name)}`,
    `TITLE:${escapeVCardValue(profile.job)}`,
    `EMAIL;TYPE=INTERNET:${escapeVCardValue(profile.email)}`,
    `TEL;TYPE=CELL:${escapeVCardValue(profile.phone)}`,
    `URL:${escapeVCardValue(linkedinUrl)}`,
    `NOTE:${escapeVCardValue("YouTube: " + youtubeUrl)}`,
    "END:VCARD"
  ].join("\n");
}

function waitForQRCodeReady(timeoutMs = 3000){
  return new Promise((resolve) => {
    const start = Date.now();
    const timer = setInterval(() => {
      if (window.QRCode) {
        clearInterval(timer);
        resolve(true);
        return;
      }
      if (Date.now() - start > timeoutMs) {
        clearInterval(timer);
        resolve(false);
      }
    }, 100);
  });
}

async function renderQRCode(){
  const qrEl = el("qr");
  const qrStatusEl = el("qrStatus");
  if (!qrEl) return;

  if (qrStatusEl) qrStatusEl.textContent = "QR 생성 중...";
  qrEl.innerHTML = "";

  const ok = await waitForQRCodeReady();
  if (!ok || !window.QRCode) {
    if (qrStatusEl) qrStatusEl.textContent = "QR 생성 실패(라이브러리 로드 실패)";
    return;
  }

  const vcard = makeVCard();
  // qrcodejs: new QRCode(domElementOrId, options)
  // 색/배경은 명함 톤에 맞게 조정했습니다.
  new window.QRCode(qrEl, {
    text: vcard,
    width: 180,
    height: 180,
    colorDark: "#ffffff",
    colorLight: "rgba(255,255,255,0.06)"
  });

  if (qrStatusEl) qrStatusEl.textContent = "";
}

// defer로 로드되지만, 요소가 확실히 준비됐을 때 생성합니다.
window.addEventListener("DOMContentLoaded", renderQRCode);

