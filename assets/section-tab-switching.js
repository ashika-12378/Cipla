document.querySelectorAll(".heading_tab_text").forEach((head) => {
  head.addEventListener("click", (event) => {
    let tabId = head.dataset.tab;
    
    document
      .querySelectorAll(".heading_tab_text")
      .forEach((h) => h.classList.remove("is--active"));
    document
      .querySelectorAll(".tab_content")
      .forEach((c) => c.classList.remove("is--active"));
    head.classList.add("is--active");
    document.getElementById(tabId).classList.add("is--active");
  });
});