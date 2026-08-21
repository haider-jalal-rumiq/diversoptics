/* image-slot — aspect-locked photo mounts for CALIBER Watches */
export function mountImageSlots(root = document) {
  root.querySelectorAll("[data-image-slot]").forEach((el) => {
    const img = el.querySelector("img");
    if (!img) return;
    const role = el.getAttribute("data-image-slot");
    if (role) img.dataset.role = role;
    el.classList.add("image-slot");
  });
}
