// ==UserScript==
// @name         GitHub: Expand workflows branch names
// @namespace    http://tampermonkey.net/
// @version      2024-04-26
// @description  Long branch names in GitHub Workflows are pain to deal with
// @author       Timmy Chan
// @match        https://github.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// ==/UserScript==


// Random uuid to create unique html elements
const UUID = "c04bacd2-32f6-4495-882b-55d60f355e46";

function addGlobalStyle(css) {
    const head = document.getElementsByTagName('head')[0];
    if (!head) return; // Skip if head does not exist
    if (document.getElementById("global_style_"+UUID)) return; // Skip if already added before
    const style = document.createElement('style');
    style.id = "global_style_"+UUID;
    style.innerHTML = css;
    head.appendChild(style);
}

function addCustomStyleToPage() {
    addGlobalStyle(`
@media only screen and (min-width: 544px) {
    #repo-content-turbo-frame > split-page-layout > div > div > div.PageLayout-region.PageLayout-content > div > div > div.Box.Box--responsive.mt-3 > div.flash.flash-full.d-flex.flex-justify-between > details > div > div,
    #repo-content-pjax-container > split-page-layout > div > div > div.PageLayout-region.PageLayout-content > div > div > div.Box.Box--responsive.mt-3 > div.flash.flash-full.d-flex.flex-justify-between > details > div > div {
        & .SelectMenu-modal {
            min-width: calc(100% - 2*var(--base-size-16));
            margin: var(--base-size-16);
            right: 0;
            width: fit-content;
            & .SelectMenu-list {
                display: contents;
                & > div  {
                    height: auto !important;
                    & > div {
                        position: relative !important;
                        & button.SelectMenu-item {
                            border: 0;
                            max-width: min(calc(100vw - 100px), 1280px);
                            overflow: auto;
                            & span.css-truncate.css-truncate-overflow {
                                overflow: visible;
                            }
                        }
                        & button.SelectMenu-item + button.SelectMenu-item {
                            border-top: 1px solid var(--borderColor-muted, var(--color-border-muted));
                        }
                        & .SelectMenu-item[aria-checked=false] .SelectMenu-icon--check {
                            display:none;
                        }
                    }
                }
            }
        }
    }
}`);
}

const observeUrlChange = () => {
    let currentHref = "";
    const body = document.querySelector("body");
    const observer = new MutationObserver(_ => {
        if (currentHref !== document.location.href) {
            const newHref = document.location.href;
            //console.debug("URL changed to: " + newHref);
            const urlChangeEvent = new CustomEvent("onurlchange", {
                bubbles: true,
                cancelable: true,
                detail: {
                    from: currentHref,
                    to: newHref,
                }
            });
            currentHref = newHref;
            window.dispatchEvent(urlChangeEvent);
        }
    });
    observer.observe(body, { childList: true, subtree: true });
};
window.addEventListener("load", _ => observeUrlChange());

// Add event listener for the custom event
window.addEventListener("onurlchange", _ => {
    addCustomStyleToPage()
});
