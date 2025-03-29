document.getElementById('scan').addEventListener('click', async () => {
    let status = document.getElementById('status');

    try {
        let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true }); // tabs, activeTab permissions must be allowed
        // we're not allowed to access chrome pages
        if (tab.url.startsWith('chrome://')) {
            status.textContent = "Can't access the page";
            return;
        }
        let list = await chrome.scripting.executeScript({ // scripting permission must be allowed
            target: { tabId: tab.id },
            function: () => {
                let colors = new Set();
                let elements = document.querySelectorAll('*');
                elements.forEach(element => {
                    let style = window.getComputedStyle(element);
                    let color = style.color, bgColor = style.backgroundColor, brColor = style.borderColor;
                    if (color && !color.includes('rgba(0, 0, 0, 0)') && color !== 'transparent')
                        colors.add(color);
                    if (bgColor && !bgColor.includes('rgba(0, 0, 0, 0)') && bgColor !== 'transparent')
                        colors.add(bgColor);
                    if (brColor && !brColor.includes('rgba(0, 0, 0, 0)') && brColor !== 'transparent')
                        colors.add(brColor);
                });
                return Array.from(colors);
            }
        });
        // the list variable now stores an array of frames, with each frame has: {frameId, result = array of colors}
        // so we use list[0] to access the main frame and .result to get the colors in array of strings formatting
        displayColors(list[0].result);
        status.textContent = `Found ${list[0].result.length} colors`;
    } catch (err) {
        status.textContent = `Error: ${err.message}`;
    }
})

function displayColors(colors) {
    let container = document.getElementById("colors");
    container.innerHTML = '';

    colors.forEach(color => {
        let item = document.createElement('div');
        item.className = 'color-item';
        let circle = document.createElement('div');
        circle.className = 'color-circle';
        circle.style.backgroundColor = color;
        let text = document.createElement('div');
        text.className = 'color-value';
        text.textContent = color;

        item.appendChild(circle);
        item.appendChild(text);
        container.appendChild(item);

    });
}