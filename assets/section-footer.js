//footer accordion functionality for mobile screens
if(window.innerWidth < 990){
    if(document.querySelector(".footer_contact_heading")){
        document.querySelector(".contact_heading .icon_plus").addEventListener('click', ()=>{
            document.querySelectorAll(".contact_list li").forEach((li)=>{
                li.style.display = "flex";
            })
            document.querySelector(".contact_heading .icon_minus").style.display = "flex";
            document.querySelector(".contact_heading .icon_plus").style.display = "none";
        })
        document.querySelector(".contact_heading .icon_minus").addEventListener('click', ()=>{
            document.querySelectorAll(".contact_list li").forEach((li)=>{
                li.style.display = "none";
            })
            document.querySelector(".contact_heading .icon_plus").style.display = "flex";
            document.querySelector(".contact_heading .icon_minus").style.display = "none";
        })
    }
}