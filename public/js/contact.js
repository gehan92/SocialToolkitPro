async function submitForm() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const subjectEl = document.getElementById("subject");
  const subject = subjectEl ? subjectEl.options[subjectEl.selectedIndex].value : "General question";
  const msg = document.getElementById("message").value.trim();
  const btn = document.getElementById("submit-btn");
  const successEl = document.getElementById("success");
  const errorEl = document.getElementById("error-msg");

  if (!name) {
    alert("Please enter your name.");
    return;
  }
  if (!email || !email.includes("@")) {
    alert("Please enter a valid email address.");
    return;
  }
  if (!msg) {
    alert("Please write a message.");
    return;
  }

  btn.classList.add("loading");
  btn.innerHTML = '<span class="btn-spinner"></span> Sending...';
  successEl.style.display = "none";
  errorEl.style.display = "none";

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: "1ff1ce5d-9112-46b5-afe8-af256d25aa53",
        name: name,
        email: email,
        subject: "SocialToolkit Contact: " + subject,
        message: msg,
        from_name: "SocialToolkit Contact Form",
        botcheck: "",
      }),
    });

    const data = await response.json();

    if (data.success) {
      successEl.style.display = "block";
      document.getElementById("name").value = "";
      document.getElementById("email").value = "";
      document.getElementById("message").value = "";
      successEl.scrollIntoView({ behavior: "smooth", block: "nearest" });

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message: msg }),
      }).catch(() => {});
    } else {
      errorEl.style.display = "block";
    }
  } catch (err) {
    errorEl.style.display = "block";
  }

  btn.classList.remove("loading");
  btn.innerHTML = "Send message →";
}
