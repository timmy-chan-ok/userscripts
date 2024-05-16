// ==UserScript==
// @name         GitHub: Jira issue button
// @namespace    http://tampermonkey.net/
// @version      2024-05-03
// @description  Add a floating button that links to referred Jira issue
// @author       Timmy Chan
// @match        https://github.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

// Random uuid to create unique html elements
const UUID_PANEL = "f1f24d57-e7eb-4f0c-bbad-abd0dfc10473";
const UUID = "e62ae145-170a-4044-91b3-64b66e119157";
const JIRA_ISSUE_URL = "https://oslo-kommune.atlassian.net/browse/"


const Utils = {
    addGlobalStyle: (css) => {
        const head = document.getElementsByTagName('head')[0];
        if (!head) return; // Skip if head does not exist
        if (document.getElementById("global_style_" + UUID)) return; // Skip if already added before
        const style = document.createElement('style');
        style.id = "global_style_" + UUID;
        style.innerHTML = css;
        head.appendChild(style);
    },

    // This supports iframe nodes
    observeCustomEventOnAnyNodeChange(node, eventName, predicate, initialState) {
        let currentState = initialState;
        const observer = new MutationObserver(_ => {
            const newState = predicate()
            if (currentState !== newState) {
                const changeEvent = new CustomEvent(eventName, {
                    bubbles: true,
                    cancelable: true,
                    detail: {
                        from: currentState,
                        to: newState,
                    }
                });
                currentState = newState;
                window.dispatchEvent(changeEvent);
            }
        });
        observer.observe(node, { childList: true, subtree: true });
    },

    observeCustomEventOnBodyChange(eventName, predicate, initialState) {
        const body = document.querySelector("body");
        this.observeCustomEventOnAnyNodeChange(body, eventName, predicate, initialState);
    },

    observeUrlChange() {
        this.observeCustomEventOnBodyChange("onUrlChange", () => document.location.href, "");
    },

    // Wait till an element appears, returns a Promise
    waitForElm(selector) {
        return new Promise(resolve => {
            let querySelector
            if (querySelector = document.querySelector(selector)) {
                return resolve(querySelector);
            }

            const observer = new MutationObserver(_ => {
                if (querySelector = document.querySelector(selector)) {
                    console.log("found");
                    observer.disconnect();
                    resolve(querySelector);
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
        });
    }
}


function addCustomStyleToPage() {
    Utils.addGlobalStyle(`
#${UUID_PANEL} {
    display: flex;
    position: fixed;
    bottom: 0;
    right: 0;
    margin: 20px;
    flex-direction: column;
    font-size: large;
    gap: 8px;
    & button {
        display: flex;
        flex-direction: row-reverse;
        gap: 6px;
        height: 40px;
        padding: 8px 16px;
        color: white;
        background-color: #007bff;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
        &:hover {
            background-color: #0056b3;
        }
        &:active {
            background-color: #074281;
        }
        & img {
            height: 100%;
        }
    }
    & button.visible {
        animation-duration: .5s;
        animation-fill-mode: forwards;
        animation-name: slideIn;
    }
    & button.hidden {
        animation-duration: .5s;
        animation-fill-mode: forwards;
        animation-name: slideOut;
    }
}


@keyframes slideIn {
    from {
        transform: translateX(50px);
        opacity: 0;
    }
    to {
        transform: translateX(0px);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0px);
        opacity: 1;
    }
    to {
        transform: translateX(50px);
        opacity: 0;
    }
}
`);
}
console.log("LOADED Jira button")
addCustomStyleToPage();
Utils.observeUrlChange();
Utils.observeCustomEventOnBodyChange("onPullRequestBranchNameChange", () => document.querySelector(`#partial-discussion-header .commit-ref.head-ref`)?.textContent);


(function() {
    'use strict';

    // Create the panel if not exist

    function createPanelIfNotExist() {
        if (document.getElementById(UUID_PANEL)) return document.getElementById(UUID_PANEL);
        const panel = document.createElement('div');
        panel.id = UUID_PANEL;
        document.body.appendChild(panel);
        return panel;
    }
    const panel = createPanelIfNotExist();

    function createButton(panel) {
        const jiraImg = ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJkAAACZCAYAAAA8XJi6AAAKUElEQVR4Xu',
                         '2dy3bbRhKG8ySxHEuiLrbs3mcxj9Kr3Gas2LJ8iWPL8wg5s8ail5PbjGxLli+xLeVklVVWWWExjzBvgP',
                         'SPqBWqVCQB4tZdrO+c/1gmCaAK/R0QAEHwgw+Uylx982CXPqYorTE6uP3rjeO9wvz8xNHnFKUxy0+3fz',
                         '8VLMTR1yjK3ECwrbcPxwVT0ZT2uLJ/M994eY/KpaIp7QDBVp59SaXi4ui0ijITCHb5h88Lsh82LY7OQ1',
                         'EmAsE+/PaT4uqbr6hIs+LovBTlAkGw5f1tKlDVODpPRTkjCIZcf/+IylMnjs5bUc4JVnFnf1YcXYaywI',
                         'wL1sJWbDyOLktZQKhgLW3FxuPoMpUFggo25xFllTi6bGUB4ATDeTFGkLbiaA2KYDjBkPWjXSpG23G0Fk',
                         'UgkwRDJnwI3nYcrUkRxDTBOn6rpHG0NkUA0wRDOjiqnBVHa1QSZpZgyIzLebqKo7UqCVJFMKSjUxdV4m',
                         'jNSkJUFQxhBr/POFq7kgB1BOt5p39SHO1BiZg6giFX/vsPOuBDxdFelAhZ9oJdYkSalogkQxztSYmIla',
                         'fb+aXvPi3KMDJNytrhDh3ooeNob0oErDz7Ml/6/rMCqStahJIhjvaoDMjq81vllz6WkDlEi1QyxNFelQ',
                         'GAYB/9+EVxGZlTtIglQxztWemR0cHt/KP//L0o00A0Px86sLHF0d6VHhgd7uQ4KkSaihbZ0eWkOLoOlA',
                         '5ZO7yTL+/fLK4gLYiWiGSIo+tC6YC1F3fylafbxTLSkmh4jBnQWOPoOlFaZP1ot7w3RZmWRatxO4IY4u',
                         'i6UVpg/ehu7o8kC6QL0Qa8CmPeOLqOlAZsvLyb4whw9TnSjWiRn8aYFEfXlTIHG6/u5RBgdIB0J1qDe1',
                         '8MHUfXmVKDzVf3c7+j77cySLei4W9mAFOJo+tOqcDm6wc5vqK2/mK36Eu0zdf36eClFEfXoTKFq28e5H',
                         '4/rPA7++V3IfsSDfNhBi+lOLouFYZrP32V+/2w8osdfYuGv5mBSy2OrlNljGs/PczxluX3xYqhRMNymY',
                         'FLLY6uW8Wz9fbr3L9NFldfPyj3jYYSLeGjTBpH1/FCs/Xu69y/TZYnRGMQDbUwg5ZiHF3XC8n1d4/ya2',
                         '8f+oFF4hANr2UGLNU4us4XiuvvH+d+K1b4t8oiNtEEbc0QR9f9QnDj+HGO22b6LVkRo2h4nhmslOPoGI',
                         'jmxsle7iUr/JasvD9rrKJhGcxgpRxHx0Ik5uRJ7iUrL62JXTT83eJNimOJo2MiCt/g72WjJ0+KVETD88',
                         'xApR5Hx0YEaOxcowmJhumZgUo9jo5R0qAhpsmkREv8w/NJcXSskgSNMM39lYREw3Iv1J9+HB2zpEADTF',
                         'MXk4ho+Bf1XKg//Tg6dkmAwplmJicR0fy8/32hdhlxdAyjBgUzTcxO5KKtPL+1d9qfvVC7jDgylHGCQp',
                         'niqydS0VZPBRvrU0UbAhTIFF0/kYnmX3NOsIBR0foFhTHFzp9IRBsd7rCCBYyK1g8oiCmyeQYWzb9mqm',
                         'ABo6J1CwphimsvA4m2XlGwgFHRugEFMEW1n55F88/VEixgVLR2wYKZYrpLT6JtHN2dS7CAUdHaAQtkiu',
                         'g+HYvmH28kWMCoaM3AgpiF95eORPOPtyJYwKho84EFMAvtPy2L5h9rVbCAUdHqgRkzCxsuLYnmH+tEsI',
                         'BR0aqBGTILGT4NRfP/71SwgFHRpoMZMTOPJ3OK5v/fi2ABo6LxYAbMTONLTdH8370KFjAq2nkwITOzeF',
                         'NRNP/3IIIFjIr2J5iAmUn8mSGa/3dQwQJm0UXzL/yGmTidTBLt/eMoBAsYuaL9k/Z6Dv+CvzETpRcimk',
                         '9UggWMXNGWaK9nmFTfJrkE0U72ohQsYGSK5mifZ/gn/8dMkG5OnkQtWMDIE+2Y9ngG8+KUs0/7ixlf7y',
                         '9MD6nmmPZ3hn/yN2aClGNpjzHit7gZ3t6Z+lPNMe3xDCNpn+yvWNpnTPh9xgwHKOYEuVB7qvmG9nmGf3',
                         'KJmUBCLO01BvxRb4ZTLH8eAYsR7f9m2tElMPJ2QkMs7XVIvFwZThKfnsOTJJqlvbLghczEEmJpr0Pgxc',
                         'rwMdfppxCSRLO016lgAmYmEmJpr32y9e5Rhg/qt/A5qizRLO21EpiQmZmEWNprH3ipMlxqVF4JIks0S3',
                         'utBWbAzFRCLO21S7xQGS6WLC+alCWapb3OBWbEzFxCLO21C655wcpLvnE1rizRLO21EZghsxAJsbTXNv',
                         'EiZfguwSYiSzRLe20FzJhZmIRY2msbeJEyfBuqjCzRLO21VbAAZqESYmmvTYBg5ReHfYSJZmmvnYAFMQ',
                         'uXEEt7nQcvUFbe+sBHmGiW9topWCBThIRY2msdNl/dz0aHO+V9NYSJZmmvvYAFM8VIiKW9VsHLk+GuQG',
                         'VkiWZpr72CApiiJMTSXqfhxcnCDfSEiWZpr4OAQpjiJMTSXjkgWLgFqDDRLO11UFAQU6SEWNrrOF6YDD',
                         'cwxv1lhYlmaa9RgMKYYiXE0l7B+gsv2P7N8g7ZwkSztNeoQIFM0RJix/v0omThhySEiXauz2hBoUzxEm',
                         'LRnxclCz+FI0y0sr9kQMFME8nHC/FL+au+pz/oJUg0S8cwCVA400zSwaBCLGGiWTp2SYEGmKaSjjDRLB',
                         '2zJEEjTHNJB7cDvfzD56mLZulYJQ0aYppMOpAhYdEsHSMRoDE6UKkH8iQoWkbHRhRGmGgYyPI3ypMRTb',
                         'hgASNMNAhQSha7aCd7iyFYwAgTDSLFLJrfki2WYAEjSDQM7tL3n0Upmt+KLaZgASNItOX97ehE82+Viy',
                         '1YwAgRLWzNYhENt0Sg63qhMUJEgzgxiObfJlUwDiNANAz40nefDiqa3xdTwaZhBIhWCjaQaLglAl2nCo',
                         'NJXLTVZ7eKS5CsZ9H8PqEKVgeTsGh4y7r07Se9iuZ39lWweTAJi/YhJOtJNBWsISZR0SBMH6L5raYK1g',
                         'YmQdGwlYFkXYqGWyLQdaU0wCQmGk6GBsm6EM0fSapgXWASEg1XPoxL1qZo/khSBesSk5BoVLI2RFPBes',
                         'IkIhqEoZI1EW39aFcF6xOTgGjhCJNLXdFwSwS6DpQeMJGLNk2yOqKtvbijgg2JiVg07KRTsWhmibZ2uK',
                         'OCxYCJVLTxc2XTMkm0kQoWFyZC0apsySaJNjq4rYLFiIlMtFn7ZDRBtNXnt1SwmDERiVZXMkQFSwQTiW',
                         'h1JVt9poIlhYlANCrRtKhgiWIGFA23BKAiTYoKljhmINHoVRiTooIJwQwgWpVzZCqYMEzPos3a6VfBhG',
                         'J6FI1KpYItEKYH0fBtJSqWCrZgmI5Fm/Rxkgq2YJgORcNHQyqYUmI6EG3j5T0VTDmPaVk0elSpgiklpi',
                         'XR6AlYFUw5h2lBtPGtmAqmsJgGoo1vxVQwZSrziha2YiqYUom6ouHWTSqYUpuqouF2BOUl0yqYMg9VRM',
                         'PbpAqmNGKaaLicRwVTWoETDWf2VTClVcZFw8/JjA5u/4u+RlEaA9FUMKVzRgc7H9PHlNn8AZntPB+kTE',
                         'eSAAAAAElFTkSuQmCC'].join("");
        const button = document.createElement('button');
        button.style.display = "none";
        button.className = 'panel-button';
        button.textContent = 'Jira';
        const img = document.createElement('img');
        img.draggable = false;
        img.src = jiraImg;
        button.appendChild(img);
        panel.appendChild(button);
        return button;
    }

    const jiraButton = createButton(panel);

    window.addEventListener("onPullRequestBranchNameChange", event => {
        function getIssueByBranchName(branchName) {
            const regex = /^[A-Z]+-[0-9]+/;
            return branchName.match(regex)[0]
        }
        console.log(event.detail);
        if (event.detail?.to) {
            const result = getIssueByBranchName(event.detail.to)
            if (result) {
                jiraButton.title = result;
                jiraButton.onclick = () => {
                    const issueLink = JIRA_ISSUE_URL + result;
                    window.open(issueLink, '_blank');
                };
                jiraButton.style.display = "";
                jiraButton.classList.remove("hidden");
                jiraButton.classList.add("visible");
            }
        }
        else {
            jiraButton.classList.remove("visible");
            //jiraButton.style.display = "none";
            jiraButton.classList.add("hidden");
        }
    });
})();
