const backToTopButton = document.querySelector("#back-to-top");

window.addEventListener("scroll", () => {
  if (document.body.scrollTop > 1000 || document.documentElement.scrollTop > 1000) {
    backToTopButton.style.display = "block";
  } else {
    backToTopButton.style.display = "none";
  }
});

backToTopButton.addEventListener("click", () => {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE, and Opera
});