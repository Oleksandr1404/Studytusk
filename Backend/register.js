document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault(); // Щоб сторінка не перезавантажувалася

  const username = document.getElementById("reg-name").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-pass").value;

  try {
    const response = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Ви успішно зареєструвалися!");
      window.location.href = "login.html"; // Перенаправлення на вхід
    } else {
      alert("Помилка: " + data.error);
    }
  } catch (err) {
    console.error("Помилка мережі:", err);
    alert("Не вдалося з'єднатися з сервером");
  }
});
