import { html2element } from "../util";
import BottomMenu from "./bottomMenu";
import TabController from "./TabController";

import hBottomMenu from "./bottomMenu.html";
import hStyle from "./style.html";

const style = html2element(hStyle) as HTMLStyleElement;
const bottomMenu = html2element(hBottomMenu) as HTMLDivElement;

unsafeWindow.document.head.appendChild(style);
unsafeWindow.document.getElementById("main-div").appendChild(bottomMenu);

const bottomMenuKey = bottomMenu.querySelector("#bottom-menu-key") as HTMLButtonElement;
const bottomMenuTabs = bottomMenu.querySelector("#bottom-menu-tabs") as HTMLUListElement;
const bottomMenuContents = bottomMenu.querySelector("#bottom-menu-contents") as HTMLDivElement;

// メニューのリサイズ
{
  let resizeStart = null;
  const onStart = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const pageY = event.pageY;
    if (target.id != "bottom-menu-tabs") return;
    resizeStart = { y: pageY, height: bottomMenuContents.getBoundingClientRect().height };
  };
  const onMove = (event: MouseEvent) => {
    if (!resizeStart) return;
    event.preventDefault();
    bottomMenuContents.style.height = `${ resizeStart.height - (event.pageY - resizeStart.y) }px`;
  };
  const onEnd = () => {
    resizeStart = null;
  };
  bottomMenuTabs.addEventListener("mousedown", onStart);
  bottomMenuTabs.addEventListener("mousemove", onMove);
  bottomMenuTabs.addEventListener("mouseup", onEnd);
  bottomMenuTabs.addEventListener("mouseleave", onEnd);
}

let tabs = new Set();
let selectedTab: string | null = null;

/** 下メニューの操作 */
const menuController: BottomMenu = {
  /** タブを選択 */
  selectTab(tabId: string) {
    const tab = unsafeWindow.$(`#bottom-menu-tab-${tabId}`);
    if (tab && tab[0]) {
      tab.tab("show"); // Bootstrap 3
      selectedTab = tabId;
    }
  },

  /** 下メニューにタブを追加する */
  addTab(tabId: string, tabLabel: string, paneContent: Node, options: any = {}): TabController {
    console.log(`AtCoder Easy Test: addTab: ${tabLabel} (${tabId})`, paneContent);

    // タブを追加
    const tab = document.createElement("a");
    tab.textContent = tabLabel;
    tab.id = `bottom-menu-tab-${tabId}`;
    tab.href = "#";
    tab.dataset.target = `#bottom-menu-pane-${tabId}`;
    tab.dataset.toggle = "tab";
    tab.addEventListener("click", event => {
      event.preventDefault();
      menuController.selectTab(tabId);
    });
    const tabLi = document.createElement("li");
    tabLi.appendChild(tab);
    bottomMenuTabs.appendChild(tabLi);

    // 内容を追加
    const pane = document.createElement("div");
    pane.className = "tab-pane";
    pane.id = `bottom-menu-pane-${tabId}`;
    pane.appendChild(paneContent);
    bottomMenuContents.appendChild(pane);

    const controller: TabController = {
      get id() {
        return tabId;
      },
      close() {
        bottomMenuTabs.removeChild(tabLi);
        bottomMenuContents.removeChild(pane);
        tabs.delete(tab);
        if (selectedTab == tabId) {
          selectedTab = null;
          if (tabs.size > 0) {
            menuController.selectTab(tabs.values().next().value.id);
          }
        }
      },
      show() {
        menuController.show();
        menuController.selectTab(tabId);
      },
      set color(color: string) {
        tab.style.backgroundColor = color;
      },
    };

    // 選択されているタブがなければ選択
    if (!selectedTab) menuController.selectTab(tabId);

    return controller;
  },

  /** 下メニューを表示する */
  show() {
    if (bottomMenuKey.classList.contains("collapsed")) bottomMenuKey.click();
  },

  /** 下メニューの表示/非表示を切り替える */
  toggle() {
    bottomMenuKey.click();
  },
};

console.info("AtCoder Easy Test: bottomMenu OK");

export default menuController;