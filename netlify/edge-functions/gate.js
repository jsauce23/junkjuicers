// Junk Juicers "coming soon" gate (Netlify Edge Function).
// Password lives in the Netlify environment variable SITE_PASSWORD (never in this file).
// To launch the site publicly, set SITE_LOCKED = off in Netlify and redeploy.

const COOKIE = "jj_access";

async function token(pw) {
  const data = new TextEncoder().encode("junk-juicers::" + pw);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function page(error) {
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>Junk Juicers | Coming soon</title>
<link rel="icon" href="/favicon.ico" sizes="48x48"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700&family=Big+Shoulders+Display:wght@800;900&family=Big+Shoulders+Stencil+Display:wght@900&display=swap" rel="stylesheet">
<style>
:root{--ink:#141414;--orange:#FF5A00;--stripe:repeating-linear-gradient(-45deg,#FF5A00 0 12px,#141414 12px 24px)}
*{box-sizing:border-box}html,body{height:100%;margin:0}
body{background:var(--ink);color:#fff;font-family:Archivo,Arial,sans-serif;display:flex;flex-direction:column;
  padding:env(safe-area-inset-top,0) 0 env(safe-area-inset-bottom,0)}
body::before,body::after{content:"";display:block;height:14px;background:var(--stripe);flex:none}
main{flex:1;display:flex;flex-direction:column;justify-content:center;max-width:760px;width:100%;margin:0 auto;padding:48px 24px}
.logo{display:block;width:min(380px,80vw);height:auto;margin:0 0 40px}
h1{font-family:"Big Shoulders Stencil Display",Impact,sans-serif;font-weight:900;text-transform:uppercase;font-size:clamp(64px,15vw,150px);line-height:.86;margin:0 0 20px}
h1 em{font-style:normal;color:var(--orange)}
p{font-size:19px;color:#cfcfcf;max-width:46ch;margin:0 0 40px;line-height:1.55}
form{display:flex;gap:10px;flex-wrap:wrap;max-width:460px}
label{width:100%;font-family:"Big Shoulders Display",Impact,sans-serif;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#9a9a9a;font-size:16px}
input{flex:1;min-width:180px;font:inherit;font-size:16px;padding:14px;border:2px solid #fff;background:transparent;color:#fff;border-radius:0}
input:focus{outline:none;border-color:var(--orange)}
button{font-family:"Big Shoulders Display",Impact,sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:.05em;font-size:19px;padding:0 22px;border:3px solid var(--orange);background:var(--orange);color:#141414;cursor:pointer;box-shadow:4px 4px 0 #fff}
button:active{transform:translate(4px,4px);box-shadow:none}
.pw{text-align:center;color:#8a8a8a;font-size:13px;padding:14px 24px 16px}
.err{width:100%;color:var(--orange);font-weight:700;margin:4px 0 0;font-size:15px}
</style></head><body><main>
<img class="logo" src="/assets/img/logo-640.webp" srcset="/assets/img/logo-640.webp 1x, /assets/img/logo-1200.webp 2x" width="380" height="177" alt="Junk Juicers Junk Removal, Texas Strong">
<h1>Coming <em>soon.</em></h1>
<p>Something fresh is being squeezed. San Antonio's toughest junk removal crew is almost ready to haul.</p>
<form method="POST" action="/__unlock">
<label for="pw">Crew access</label>
<input id="pw" name="password" type="password" autocomplete="current-password" placeholder="Password" required>
<button type="submit">Let me in</button>
${error ? '<p class="err" role="alert">Wrong password. Try again.</p>' : ""}
</form>
</main><footer class="pw">Powered by JRNEE Technologies LLC</footer></body></html>`;
  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" },
  });
}

export default async (request, context) => {
  if ((Netlify.env.get("SITE_LOCKED") || "").toLowerCase() === "off") return context.next();

  const pw = Netlify.env.get("SITE_PASSWORD");
  const url = new URL(request.url);

  if (url.pathname === "/__unlock" && request.method === "POST") {
    const form = await request.formData();
    if (pw && form.get("password") === pw) {
      return new Response(null, {
        status: 303,
        headers: {
          location: "/",
          "cache-control": "no-store",
          "set-cookie": `${COOKIE}=${await token(pw)}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`,
        },
      });
    }
    return page(true);
  }

  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(new RegExp(COOKIE + "=([a-f0-9]{64})"));
  if (pw && match && match[1] === (await token(pw))) {
    const res = await context.next();
    res.headers.set("cache-control", "no-store");
    return res;
  }
  return page(false);
};

export const config = {
  path: "/*",
  excludedPath: ["/assets/*", "/favicon.ico", "/apple-touch-icon.png", "/site.webmanifest", "/robots.txt", "/thank-you", "/thank-you/"],
};
