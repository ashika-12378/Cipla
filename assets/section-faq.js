const summaries = document.querySelectorAll(".collapsible-content summary");

summaries.forEach((summary) => {
  summary.addEventListener("click", closeOpenedDetails);
});

function closeOpenedDetails() {
  summaries.forEach((summary) => {
    let detail = summary.parentNode;
    if (detail != this.parentNode) {
      detail.removeAttribute("open");
    }
  });
}

async function filterElements(value) {
  let searchEle = (await value.split(" ")).filter((item) => item !== "");
  if (value === "") {
    details.classList.remove("d-none");
  } else {
    document
      .querySelectorAll(".collapsible-content details")
      .forEach((details) => {
        let content = details.querySelectorAll("p,a");
        let allText = Array.from(content)
          .map((el) => el.textContent)
          .join(" ");
        
        details.classList.toggle(
          "d-none",
          !searchEle.some((each) => allText.toLowerCase().includes(each))
        );
      });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  inputEl = document.querySelector("#collapsable-tab-input");
  
  inputEl.addEventListener("input", (event) => {
    filterElements(event.target.value);
  });
});
