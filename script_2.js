document.addEventListener("DOMContentLoaded", () => {
  const isRequestInProgress = new Set();
  const uniqueArrays = new Map();

  const bannerDiv = document.querySelector(".bannermiddle.center");
  if (bannerDiv) bannerDiv.style.display = "none";

  const observeCardsInDialog = (dialog, ind) => {
    const cardObserver = new MutationObserver((mutations) => {
      const elementsToSend = new Set();

      mutations.forEach((mutation, index_1) => {
        if (
          [...mutation.addedNodes].some((node) => node.classList?.contains("card")) ||
          mutation.target.classList?.contains("card")
        ) {
          const nameElement = document.querySelector(".title.bold");
          const userName =
            document.getElementById("SiteMobile")?.textContent.trim().split(" ").at(-1) ||
            nameElement?.textContent.trim().split(" ").at(-1);

          if (!userName) return;

          const parentElement = document.getElementById(dialog.id);
          if (!parentElement) return;

          const currentDiv = [...parentElement.querySelectorAll(".sp_name.center")].find(
            (card) => card.textContent === userName
          );

          if (!currentDiv) return;

          const parent = currentDiv.closest(".card")?.parentElement;
          if (!parent) return;

          const previousSixDivs = [];
          let sibling = parent.previousElementSibling;

          while (sibling && previousSixDivs.length < 7) {
            if (sibling.tagName === "DIV") previousSixDivs.unshift(sibling);
            sibling = sibling.previousElementSibling;
          }

          previousSixDivs.forEach((cardElement) => {
            const computedStyle = window.getComputedStyle(cardElement);
            if (
              computedStyle.display !== "none" &&
              computedStyle.backgroundPosition !== "-2392px 0px"
            ) {
              elementsToSend.add(
                JSON.stringify({
                  time: new Date().toISOString(),
                  user: userName,
                  name: nameElement?.textContent,
                  backgroundPosition: computedStyle.backgroundPosition,
                  type: document.getElementById("SiteMobile") ? "Mobile" : "PC",
                  dialogId: dialog.id,
                  index: ind,
                  indexName: index_1,
                  cardElement: cardElement.style.height,
                })
              );
            }
          });
        }
      });

      const uniqueArray = [...elementsToSend].map((jsonStr) => JSON.parse(jsonStr));

      if (uniqueArray.length > 0 && !isRequestInProgress.has(dialog.id)) {
        isRequestInProgress.add(dialog.id);

        fetch("https://cards.playesop.com/api/v1/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: uniqueArray }),
        })
          .then((response) => {
            if (response.ok) {
              uniqueArrays.set(dialog.id, []);
            } else {
              console.error(`Ошибка HTTP ${response.status}: ${response.statusText}`);
            }
          })
          .catch((error) => console.error(`Ошибка сети: ${error}`))
          .finally(() => isRequestInProgress.delete(dialog.id));
      }
    });

    cardObserver.observe(dialog, {
      childList: true,
      attributes: true,
      subtree: true,
      attributeFilter: ["style", "class"],
    });
  };

  const initializeObserversForDialogs = () => {
    document
      .querySelectorAll("div.dialog > div.tablecontent")
      .forEach((header, ind) => {
        const parentDialog = header.parentElement;
        if (parentDialog?.id) observeCardsInDialog(parentDialog, ind);
      });
  };

  new MutationObserver(initializeObserversForDialogs).observe(document.body, {
    childList: true,
    subtree: true,
  });

  initializeObserversForDialogs();
});
