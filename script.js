// script.js — интерактив сайта «АкваЛайн»
// Четыре части: меню на телефоне, появление секций, калькулятор, форма заявки.

// --- 1. Бургер-меню на телефоне ---

const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", isOpen); // для screen readers
});

// Закрыть меню после клика по ссылке
nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// --- 2. Плавное появление секций при скролле ---

const revealTargets = document.querySelectorAll(
  ".section-inner, .hero-content, .hero-visual"
);

revealTargets.forEach((el) => el.classList.add("reveal"));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // анимация один раз
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);

revealTargets.forEach((el) => observer.observe(el));

// --- 3. Калькулятор стоимости ---

// Тарифы: base — выезд, perCubic — цена за кубометр воды.
// Цены учебные: меняй числа здесь, на сайте пересчитается само.
const SERVICES = {
  cleaning: {
    base: 800,
    perCubic: 60,
    hint: "Разовая чистка: дно, стенки, поверхность, промывка фильтра.",
  },
  monthly: {
    base: 2500,
    perCubic: 90,
    hint: "Сезонное обслуживание: 2 выезда в месяц, химия включена.",
  },
  chemistry: {
    base: 600,
    perCubic: 35,
    hint: "Химия и анализ воды: замеры pH и хлора, подбор дозировки.",
  },
  winter: {
    base: 1200,
    perCubic: 70,
    hint: "Консервация: слив воды, продувка труб, компенсаторы, чехол.",
  },
};

const calcForm = document.getElementById("calc-form");
const calcError = document.getElementById("calc-error");
const outVolume = document.getElementById("out-volume");
const outTotal = document.getElementById("out-total");
const outHint = document.getElementById("out-hint");

// Поля берём по id: у формы есть свои свойства length и name,
// поэтому обращаться как calcForm.length нельзя — вернётся не то.
const inputLength = document.getElementById("length");
const inputWidth = document.getElementById("width");
const inputDepth = document.getElementById("depth");
const inputService = document.getElementById("service");

// Разделяем разряды пробелом: 6820 -> "6 820"
function formatNumber(value) {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function updateCalc() {
  const length = parseFloat(inputLength.value);
  const width = parseFloat(inputWidth.value);
  const depth = parseFloat(inputDepth.value);
  const service = SERVICES[inputService.value];

  // Если поле пустое или не число — просим исправить и не считаем
  const sizes = [length, width, depth];
  const isValid = sizes.every((n) => Number.isFinite(n) && n > 0);

  calcError.hidden = isValid;
  if (!isValid) {
    calcError.textContent = "Заполните длину, ширину и глубину числами больше нуля.";
    return;
  }

  const volume = length * width * depth;            // объём воды в м³
  const total = service.base + volume * service.perCubic;

  // Объём: округляем до 0.1 и убираем «.0» в целых числах
  outVolume.textContent = Number(volume.toFixed(1)).toString().replace(".", ",");
  outTotal.textContent = formatNumber(total);
  outHint.textContent = service.hint;
}

calcForm.addEventListener("input", updateCalc);
calcForm.addEventListener("change", updateCalc);
updateCalc(); // первый расчёт сразу при загрузке

// --- 4. Форма заявки (без бэкенда: только проверка и сообщение) ---

const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
const inputName = document.getElementById("name");
const inputPhone = document.getElementById("phone");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault(); // не перезагружаем страницу

  const name = inputName.value.trim();
  const phone = inputPhone.value.trim();
  const digits = phone.replace(/\D/g, ""); // оставляем только цифры

  inputName.classList.toggle("invalid", name.length < 2);
  inputPhone.classList.toggle("invalid", digits.length < 9);

  if (name.length < 2) {
    formStatus.textContent = "Напишите имя — хотя бы 2 буквы.";
    formStatus.className = "form-status error";
    return;
  }

  if (digits.length < 9) {
    formStatus.textContent = "Проверьте телефон: нужно минимум 9 цифр.";
    formStatus.className = "form-status error";
    return;
  }

  formStatus.textContent = `Спасибо, ${name}! Заявка принята — перезвоним на ${phone}.`;
  formStatus.className = "form-status ok";
  contactForm.reset();
});

// Убираем красную рамку, как только человек начал править поле
contactForm.querySelectorAll("input, textarea").forEach((field) => {
  field.addEventListener("input", () => field.classList.remove("invalid"));
});
