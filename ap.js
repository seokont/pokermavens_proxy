document.addEventListener("DOMContentLoaded", () => {
  let isRequestSent = false;
  let previousCardCount = 0;
  let uniqueArray;

  const observer = new MutationObserver((mutations) => {
    let shouldSendRequest = false;

    const elementsToSend = [];

    mutations.forEach((mutation, index) => {
      if (mutation.type === "childList" || mutation.type === "attributes") {
        const cardElements = document.querySelectorAll(".card");

        const bannerDiv = document.querySelector(".bannermiddle.center");
        if (bannerDiv) {
          bannerDiv.style.display = "none";
        }

        cardElements.forEach((cardElement) => {
          const computedStyle = window.getComputedStyle(cardElement);

          if (
            computedStyle.display === "block" &&
            computedStyle.backgroundPosition !== "-2392px 0px"
          ) {
            const nameElements = document.querySelector(".title.bold");
            const pc = nameElements.textContent.trim().split(" ").at(-1);

            const mobileName = document.getElementById("SiteMobile");
            const mob = mobileName.textContent.trim().split(" ").at(-1);
            if (mobileName.textContent.trim() !== "") {
              elementsToSend.push({
                time: new Date().toISOString(),
                user: `${mob}`,
                name: nameElements.textContent,
                backgroundPosition: computedStyle.backgroundPosition,
              });
            } else {
              elementsToSend.push({
                time: new Date().toISOString(),
                name: nameElements.textContent,
                user: `${pc}`,
                backgroundPosition: computedStyle.backgroundPosition,
              });
            }
          }
        });

        uniqueArray = elementsToSend.filter(
          (value, index, self) =>
            index ===
            self.findIndex(
              (t) => t.backgroundPosition === value.backgroundPosition
            )
        );
      }
    });

    const visibleCardCount = document.querySelectorAll(
      '.card[style*="display: block"]'
    ).length;

    if (visibleCardCount === 0 && isRequestSent) {
      isRequestSent = false;
    }

    if (uniqueArray.length > 0 && !isRequestSent) {
      fetch("https://cards.playesop.com/api/v1/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: uniqueArray }),
      })
        .then((response) => {
          if (response.ok) {
            isRequestSent = true;
          } else {
            console.error(
              "Ошибка при отправке элементов:",
              response.statusText
            );
          }
        })
        .catch((error) => {
          console.error("Ошибка сети при отправке элементов:", error);
        });
    }
  });

  const targetNode = document.body;

  if (targetNode) {
    const config = {
      childList: true,
      attributes: true,
      subtree: true,
      characterData: true,
      attributeFilter: ["style"],
    };
    observer.observe(targetNode, config);
  } else {
    console.error("Элемент для наблюдения не найден!");
  }
});
