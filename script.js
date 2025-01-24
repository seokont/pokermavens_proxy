document.addEventListener("DOMContentLoaded", () => {
  let isRequestInProgress = new Map();
  const uniqueArrays = new Map(); // Хранение данных для каждого окна

  const bannerDiv = document.querySelector(".bannermiddle.center");
  if (bannerDiv) {
    bannerDiv.style.display = "none";
  }

  const observeCardsInDialog = (dialog, ind) => {
    const cardObserver = new MutationObserver((mutations) => {
      const elementsToSend = [];

      mutations.forEach((mutation, index_1) => {
        if (
          Array.from(mutation.addedNodes).some((node) =>
            node.classList?.contains("card")
          ) ||
          mutation.target.classList?.contains("card")
        ) {
          const nameElements = document.querySelector(".title.bold");
          const pc = nameElements?.textContent.trim().split(" ").at(-1);

          const mobileName = document.getElementById("SiteMobile");
          const mob = mobileName
            ? mobileName.textContent.trim().split(" ").at(-1)
            : "";

          let userName = mob !== "" ? mob : pc;

          const parentElement = document.getElementById(dialog.id);

          const currentDiv = Array.from(
            parentElement.querySelectorAll(`.sp_name.center`)
          ).filter((card) => card.textContent === userName);
          let parent;

          if (currentDiv) {
            parent = currentDiv[0].parentElement?.parentElement;
          }

          const previousSixDivs = [];

          if (!parent) {
            // console.error("Не удалось подняться на два уровня вверх");
          } else {
            let sibling = parent.previousElementSibling;

            while (sibling && previousSixDivs.length < 7) {
              if (sibling.tagName === "DIV") {
                previousSixDivs.unshift(sibling);
              }
              sibling = sibling.previousElementSibling;
            }
          }

          previousSixDivs.forEach((cardElement) => {
            const computedStyle = window.getComputedStyle(cardElement);

            if (
              computedStyle.display !== "none" &&
              computedStyle.backgroundPosition !== "-2392px 0px"
            ) {
              if (mob) {
                elementsToSend.push({
                  time: new Date().toISOString(),
                  user: mob,
                  name: nameElements?.textContent,
                  backgroundPosition: computedStyle.backgroundPosition,
                  type: "Mobile",
                  dialogId: dialog.id,
                  index: ind,
                  indexName:index_1,
                  cardElement: cardElement.style.height,
                });
              } else if (pc) {
                elementsToSend.push({
                  time: new Date().toISOString(),
                  name: nameElements?.textContent,
                  user: pc,
                  backgroundPosition: computedStyle.backgroundPosition,
                  type: "PC",
                  dialogId: dialog.id,
                  index: ind,
                  indexName:index_1,
                  cardElement: cardElement.style.height,
                });
              }
            }
          });
        }
      });

      const uniqueArray = elementsToSend.filter(
        (value, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t.backgroundPosition === value.backgroundPosition &&
              t.dialogId === value.dialogId
          )
      );

      // Проверяем, если уникальные элементы есть и запрос ещё не отправлен
      if (uniqueArray.length > 0 && !isRequestInProgress.get(dialog.id)) {
        isRequestInProgress.set(dialog.id, true);

        fetch("https://cards.playesop.com/api/v1/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: uniqueArray }),
        })
          .then((response) => {
            if (response.ok) {
              // Опционально: можно очистить данные после отправки
              uniqueArrays.set(dialog.id, []);
            } else {
              console.error(
                `Ошибка при отправке элементов для окна ${dialog.id}:`,
                response.statusText
              );
            }
          })
          .catch((error) => {
            console.error(
              `Ошибка сети при отправке элементов для окна ${dialog.id}:`,
              error
            );
          })
          .finally(() => {
            isRequestInProgress.set(dialog.id, false);
          });
      }
    });

    const observerConfig = {
      childList: true,
      attributes: true,
      subtree: true,
      attributeFilter: ["style", "class"],
    };

    cardObserver.observe(dialog, observerConfig);
  };

  const initializeObserversForDialogs = () => {
    const dialogs = document.querySelectorAll("div.dialog > div.tablecontent");

    dialogs.forEach((header, ind) => {
      const parentDialog = header.parentElement;
      if (parentDialog && parentDialog.id !== "") {
        observeCardsInDialog(parentDialog, ind);
      }
    });
  };

  const dialogObserver = new MutationObserver(() => {
    initializeObserversForDialogs();
  });

  dialogObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  initializeObserversForDialogs();
});
