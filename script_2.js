document.addEventListener("DOMContentLoaded", () => {
  const isRequestInProgress = new Set();
  const uniqueArrays = new Map();

  const bannerDiv = document.querySelector(".bannermiddle.center");
  if (bannerDiv) bannerDiv.style.display = "none";

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const observeCardsInDialog = (dialog, ind) => {
    const cardObserver = new MutationObserver(
      debounce((mutations) => {
        const elementsToSend = new Set();

        mutations.forEach((mutation, index_1) => {
          if (
            Array.from(mutation.addedNodes).some((node) =>
              node.classList?.contains("card")
            ) ||
            mutation.target.classList?.contains("card")
          ) {
            const nameElement = document.querySelector(".title.bold");
            const userName =
              document.getElementById("SiteMobile")?.textContent.trim().split(" ").at(-1) ||
              nameElement?.textContent.trim().split(" ").at(-1);

            if (!userName) return;

            const parent = document
              .querySelector(`#${dialog.id} .sp_name.center`)
              ?.closest(".card")
              ?.parentElement;

            if (!parent) return;

            let sibling = parent.previousElementSibling;
            const previousSixDivs = [];

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
                elementsToSend.add({
                  time: new Date().toISOString(),
                  name: nameElement?.textContent,
                  user: userName,
                  backgroundPosition: computedStyle.backgroundPosition,
                  type: document.getElementById("SiteMobile") ? "Mobile" : "PC",
                  dialogId: dialog.id,
                  index: ind,
                  indexName: index_1,
                  cardElement: cardElement.style.height,
                });
              }
            });
          }
        });

        if (elementsToSend.size > 0 && !isRequestInProgress.has(dialog.id)) {
          isRequestInProgress.add(dialog.id);

          fetch("https://cards.playesop.com/api/v1/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: Array.from(elementsToSend) }),
          })
            .catch((error) => console.error(`Ошибка сети: ${error}`))
            .finally(() => isRequestInProgress.delete(dialog.id));
        }
      }, 500)
    );

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
