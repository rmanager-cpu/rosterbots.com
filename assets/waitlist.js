// Waitlist forms: posts { email, product, platform } to the waitlist table in Supabase with the
// publishable key (public by design). The table takes inserts only; nobody can read it back
// through the API. A second sign-up for the same email answers 409, which counts as success.
(function () {
  var URL_ = "https://givfmjtlbojhsntceone.supabase.co/rest/v1/waitlist";
  var KEY = "sb_publishable_kWKeng0Nnl7eo2TCc326aA_W2_vCT60";
  var EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  document.querySelectorAll("form[data-waitlist]").forEach(function (form) {
    var product = form.getAttribute("data-product") || "rosterbots";
    var notice = form.querySelector(".notice");
    var button = form.querySelector('button[type="submit"]');
    var android = form.querySelector("[data-hint-android]");
    var iphone = form.querySelector("[data-hint-iphone]");

    function say(text, ok) {
      notice.textContent = text;
      notice.className = "notice " + (ok ? "ok" : "err");
      notice.hidden = false;
    }

    form.querySelectorAll('input[name="platform"]').forEach(function (r) {
      r.addEventListener("change", function () {
        if (android) android.hidden = r.value !== "android" || !r.checked;
        if (iphone) iphone.hidden = r.value !== "iphone" || !r.checked;
      });
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (form.company && form.company.value) return; // a bot filled the hidden field
      var email = (form.email.value || "").trim();
      var checked = form.querySelector('input[name="platform"]:checked');
      var platform = checked ? checked.value : null;
      if (product === "rosterbots" && !platform) return say("Pick Android or iPhone first.", false);
      if (!EMAIL.test(email) || email.length > 254) return say("That email address doesn't look right.", false);

      button.disabled = true;
      fetch(URL_, {
        method: "POST",
        headers: { apikey: KEY, "content-type": "application/json", prefer: "return=minimal" },
        body: JSON.stringify({ email: email, product: product, platform: platform, source: "site" }),
      })
        .then(function (r) {
          if (r.ok || r.status === 409) {
            form.reset();
            if (android) android.hidden = true;
            if (iphone) iphone.hidden = true;
            say(r.status === 409 ? "You're already on the list. We'll email you when it's ready." : "You're on the list. We'll email you when it's ready for your phone.", true);
          } else {
            say("That didn't go through. Try again, or email support@rosterbots.com and we'll add you.", false);
          }
        })
        .catch(function () {
          say("Couldn't reach the waitlist. Check your connection and try again, or email support@rosterbots.com.", false);
        })
        .then(function () {
          button.disabled = false;
        });
    });
  });
})();
