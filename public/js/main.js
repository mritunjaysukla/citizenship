document.addEventListener("DOMContentLoaded", function () {
  const registrationForm = document.getElementById("registrationForm");
  const errorMessage = document.getElementById("errorMessage");

  if (registrationForm) {
    registrationForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      errorMessage.style.display = "none";

      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (password !== confirmPassword) {
        errorMessage.textContent = "Passwords do not match";
        errorMessage.style.display = "block";
        return;
      }

      try {
        const formData = new FormData(registrationForm);
        const response = await fetch("/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.get("email"),
            password: formData.get("password"),
          }),
        });

        const data = await response.json();

        if (response.ok) {
          window.location.href = "/login";
        } else {
          errorMessage.textContent = data.message || "Registration failed";
          errorMessage.style.display = "block";
        }
      } catch (error) {
        console.error("Registration error:", error);
        errorMessage.textContent = "An error occurred during registration";
        errorMessage.style.display = "block";
      }
    });
  }

  // District data by province
  const districtsByProvince = {
    Province1: [
      "Taplejung",
      "Panchthar",
      "Ilam",
      "Jhapa",
      "Morang",
      "Sunsari",
      "Dhankuta",
      "Terhathum",
      "Sankhuwasabha",
      "Bhojpur",
      "Solukhumbu",
      "Okhaldhunga",
      "Khotang",
      "Udayapur",
    ],
    Madhesh: [
      "Saptari",
      "Siraha",
      "Dhanusa",
      "Mahottari",
      "Sarlahi",
      "Bara",
      "Parsa",
      "Rautahat",
    ],
    Bagmati: [
      "Sindhuli",
      "Ramechhap",
      "Dolakha",
      "Sindhupalchok",
      "Kavrepalanchok",
      "Lalitpur",
      "Bhaktapur",
      "Kathmandu",
      "Nuwakot",
      "Rasuwa",
      "Dhading",
      "Makwanpur",
      "Chitwan",
    ],
    Gandaki: [
      "Gorkha",
      "Manang",
      "Mustang",
      "Myagdi",
      "Kaski",
      "Lamjung",
      "Tanahu",
      "Nawalparasi East",
      "Syangja",
      "Parbat",
      "Baglung",
    ],
    Lumbini: [
      "Rukum East",
      "Rolpa",
      "Pyuthan",
      "Gulmi",
      "Arghakhanchi",
      "Palpa",
      "Nawalparasi West",
      "Rupandehi",
      "Kapilvastu",
      "Dang",
      "Banke",
      "Bardiya",
    ],
    Karnali: [
      "Dolpa",
      "Mugu",
      "Humla",
      "Jumla",
      "Kalikot",
      "Dailekh",
      "Jajarkot",
      "Rukum West",
      "Salyan",
      "Surkhet",
    ],
    Sudurpashchim: [
      "Bajura",
      "Bajhang",
      "Darchula",
      "Baitadi",
      "Dadeldhura",
      "Doti",
      "Achham",
      "Kailali",
      "Kanchanpur",
    ],
  };

  // Form submission handling
  const contactForm = document.querySelector("form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      // Only handle contact form submissions
      if (contactForm.getAttribute("action")?.includes("contact-details")) {
        e.preventDefault();

        // Create address object with null checks
        const permanentAddress = {
          province: document.getElementById("permanentProvince")?.value || "",
          district: document.getElementById("permanentDistrict")?.value || "",
          municipality:
            document.getElementById("permanentMunicipality")?.value || "",
          ward: document.getElementById("permanentWard")?.value || "",
          tole: document.getElementById("permanentTole")?.value || null,
        };

        // Create hidden input for address data
        const addressInput = document.createElement("input");
        addressInput.type = "hidden";
        addressInput.name = "permanentAddress";
        addressInput.value = JSON.stringify(permanentAddress);

        // Add to form
        this.appendChild(addressInput);

        // Submit form
        this.submit();
      }
    });
  }

  // Handle province-district relationship
  const provinceSelect = document.getElementById("permanentProvince");
  const districtSelect = document.getElementById("permanentDistrict");

  if (provinceSelect && districtSelect) {
    provinceSelect.addEventListener("change", function () {
      const selectedProvince = this.value;
      const districts = districtsByProvince[selectedProvince] || [];

      // Clear and populate district options
      districtSelect.innerHTML = '<option value="">Select District</option>';
      districts.forEach((district) => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
    });
  }

  // Phone number validation
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach((input) => {
    input.addEventListener("input", function () {
      // Remove non-numeric characters
      this.value = this.value.replace(/[^\d]/g, "");

      // Validate length (10 digits for Nepal phone numbers)
      if (this.value.length > 10) {
        this.value = this.value.slice(0, 10);
      }
    });
  });

  // Form validation
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", function (event) {
      let isValid = true;

      // Validate required fields
      const requiredFields = form.querySelectorAll("[required]");
      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add("error");
          showError(field, "This field is required");
        } else {
          field.classList.remove("error");
          removeError(field);
        }
      });

      // Validate phone numbers
      const phoneNumber = document.getElementById("phoneNumber");
      const mobileNumber = document.getElementById("mobileNumber");

      if (phoneNumber && phoneNumber.value.length < 10) {
        isValid = false;
        showError(phoneNumber, "Phone number must be 10 digits");
      }

      if (mobileNumber && mobileNumber.value.length < 10) {
        isValid = false;
        showError(mobileNumber, "Mobile number must be 10 digits");
      }

      // Validate email if provided
      const email = document.getElementById("email");
      if (email && email.value && !isValidEmail(email.value)) {
        isValid = false;
        showError(email, "Please enter a valid email address");
      }

      if (!isValid) {
        event.preventDefault();
      }
    });
  }

  // Helper functions
  function showError(field, message) {
    removeError(field);
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
  }

  function removeError(field) {
    const existingError = field.parentNode.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Date format conversion (AD to BS and vice versa)
  const adDateInput = document.getElementById("dateOfBirth");
  const bsDateInput = document.getElementById("dateOfBirthNp");

  if (adDateInput && bsDateInput) {
    adDateInput.addEventListener("change", function () {
      // This would require a Nepali date converter library
      // For demonstration, we're just copying the value
      const adDate = new Date(this.value);
      if (!isNaN(adDate.getTime())) {
        // Format as YYYY-MM-DD
        const year = adDate.getFullYear();
        const month = String(adDate.getMonth() + 1).padStart(2, "0");
        const day = String(adDate.getDate()).padStart(2, "0");
        bsDateInput.value = `${year}-${month}-${day}`;
      }
    });
  }

  // Dynamic form fields based on selection
  const citizenshipTypeSelect = document.getElementById("citizenshipType");
  const citizenshipField = document.getElementById("citizenship");

  if (citizenshipTypeSelect && citizenshipField) {
    citizenshipTypeSelect.addEventListener("change", function () {
      const selectedType = this.value;
      if (selectedType === "naturalized") {
        citizenshipField.setAttribute(
          "placeholder",
          "Enter naturalization certificate number"
        );
      } else {
        citizenshipField.setAttribute("placeholder", "");
      }
    });
  }

  // Contact form handling
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      // Only prevent default for contact form, not family form
      if (contactForm.getAttribute("action").includes("contact-details")) {
        e.preventDefault();

        // Create address object only for contact form
        const permanentAddress = {
          province: document.getElementById("permanentProvince")?.value || "",
          district: document.getElementById("permanentDistrict")?.value || "",
          municipality:
            document.getElementById("permanentMunicipality")?.value || "",
          ward: document.getElementById("permanentWard")?.value || "",
          tole: document.getElementById("permanentTole")?.value || null,
        };

        // Add hidden input for address data
        const addressInput = document.createElement("input");
        addressInput.type = "hidden";
        addressInput.name = "permanentAddress";
        addressInput.value = JSON.stringify(permanentAddress);
        this.appendChild(addressInput);
      }

      // Let the form submit
      return true;
    });
  }

  // Family form specific handling
  const familyForm = document.querySelector(
    'form[action^="/application/family-details/"]'
  );
  if (familyForm) {
    familyForm.addEventListener("submit", function (e) {
      // Let the form submit normally without preventDefault
      return true;
    });
  }

  // Tab navigation visual feedback
  const tabs = document.querySelectorAll(".tab");
  const currentPath = window.location.pathname;

  if (tabs.length > 0) {
    tabs.forEach((tab, index) => {
      // Reset all tabs
      tab.classList.remove("active");

      // Set active tab based on the current URL path
      if (currentPath.includes("applicant-data") && index === 0) {
        tab.classList.add("active");
      } else if (currentPath.includes("contact-details") && index === 1) {
        tab.classList.add("active");
      } else if (currentPath.includes("family-details") && index === 2) {
        tab.classList.add("active");
      } else if (currentPath.includes("appointment") && index === 3) {
        tab.classList.add("active");
      } else if (currentPath.includes("preview") && index === 4) {
        tab.classList.add("active");
      }
    });
  }

  // Additional tab navigation handling
  if (tabs.length > 0) {
    tabs.forEach((tab, index) => {
      // Reset all tabs
      tab.classList.remove("active");

      // Set active tab based on current URL path
      if (currentPath.includes("family-details") && index === 2) {
        tab.classList.add("active");
      }
      // ... other tab conditions
    });
  }

  // Login form handling
  const loginForm = document.getElementById("loginForm");
  const loginErrorMessage = document.getElementById("errorMessage");

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      loginErrorMessage.style.display = "none";

      try {
        const formData = new FormData(loginForm);
        const response = await fetch("/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.get("email"),
            password: formData.get("password"),
          }),
        });

        const data = await response.json();

        if (data.success) {
          window.location.href = data.redirectUrl;
        } else {
          loginErrorMessage.textContent = data.message;
          loginErrorMessage.style.display = "block";
        }
      } catch (error) {
        console.error("Login error:", error);
        loginErrorMessage.textContent =
          "An error occurred during login. Please try again.";
        loginErrorMessage.style.display = "block";
      }
    });
  }
});
