document.addEventListener("DOMContentLoaded", () => {
    const appId = '67110';
    const tickSocketUrl = `wss://ws.binaryws.com/websockets/v3?app_id=${appId}`;
    let tickSocket = null;
    const marketDropdown = document.getElementById("market");
    const latestTickElem = document.getElementById("latest-tick");
    const lastDigitElem = document.getElementById("last-digit");
    const digitCircleContainer = document.getElementById("digit-circle-container");
    const arrow = document.createElement("div");
    const highlightContainer = document.createElement("div");
    highlightContainer.classList.add("highlight");

    let digitFrequencies = Array(10).fill(0);
    let tickCount = 0;

    const mostFrequentElem = document.createElement("p");
    mostFrequentElem.classList.add("most");
    mostFrequentElem.textContent = "Most Frequent: --";
    highlightContainer.appendChild(mostFrequentElem);

    const leastFrequentElem = document.createElement("p");
    leastFrequentElem.classList.add("least");
    leastFrequentElem.textContent = "Least Frequent: --";
    highlightContainer.appendChild(leastFrequentElem);

    // Create the Most Frequent Digit display
    const frequentDigitDisplay = document.createElement("div");
    frequentDigitDisplay.id = "frequent-digit";
    frequentDigitDisplay.style.textAlign = 'center';
    frequentDigitDisplay.style.padding = '10px';
    frequentDigitDisplay.style.marginTop = '20px';
    frequentDigitDisplay.style.fontSize = '18px';
    frequentDigitDisplay.style.fontWeight = 'bold';
    frequentDigitDisplay.style.backgroundColor = '#f8f9fa';
    frequentDigitDisplay.style.borderRadius = '8px';
    frequentDigitDisplay.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
    frequentDigitDisplay.textContent = "Most Frequent Digit: --";
    highlightContainer.appendChild(frequentDigitDisplay);  // Append to the container after the least frequent element.

    document.querySelector(".section").appendChild(highlightContainer);

    arrow.classList.add("arrow");

    // Create digit circles
    for (let i = 0; i < 10; i++) {
        const digitCircle = document.createElement("div");
        digitCircle.textContent = i;
        digitCircle.classList.add("digit-circle");
        digitCircleContainer.appendChild(digitCircle);
    }

    marketDropdown.addEventListener("change", () => {
        const selectedMarket = marketDropdown.value;

        if (tickSocket) {
            tickSocket.close();
        }

        arrow.style.display = "none";
        digitFrequencies.fill(0);
        tickCount = 0;
        mostFrequentElem.textContent = "Most Frequent: --";
        leastFrequentElem.textContent = "Least Frequent: --";

        if (selectedMarket) {
            tickSocket = new WebSocket(tickSocketUrl);

            tickSocket.onopen = () => {
                tickSocket.send(
                    JSON.stringify({
                        ticks: selectedMarket,
                        subscribe: 1
                    })
                );
            };

            tickSocket.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.tick) {
                    const quote = data.tick.quote.toFixed(data.tick.pip_size);
                    const lastDigit = parseInt(quote.slice(-1));

                    latestTickElem.textContent = `Latest Tick: ${quote}`;
                    lastDigitElem.textContent = `Last Digit: ${lastDigit}`;

                    // Update arrow position
                    const targetDigit = digitCircleContainer.children[lastDigit];
                    const targetRect = targetDigit.getBoundingClientRect();
                    const containerRect = digitCircleContainer.getBoundingClientRect();
                    arrow.style.display = "block";
                    arrow.style.left = `${targetRect.left - containerRect.left + targetRect.width / 2 - 10} px`;
                    arrow.style.top = `${targetRect.bottom - containerRect.top} px`;

                    // Update digit frequencies
                    digitFrequencies[lastDigit]++;
                    tickCount++;

                    // Find most and least frequent digits
                    const maxFrequency = Math.max(...digitFrequencies);
                    const minFrequency = Math.min(...digitFrequencies);
                    const mostFrequent = digitFrequencies.indexOf(maxFrequency);
                    const leastFrequent = digitFrequencies.indexOf(minFrequency);

                    mostFrequentElem.textContent = `Most Frequent: ${mostFrequent} (${maxFrequency} times)`;
                    leastFrequentElem.textContent = ` Least Frequent: ${leastFrequent} (${minFrequency} times)`;

                    // Update the most frequent digit every 10 ticks
                    if (tickCount % 10 === 0) {
                        // Update the "Most Frequent Digit" display with new data
                        frequentDigitDisplay.textContent = ` Most Frequent Digit: ${mostFrequent}`;
                    }
                }
            };

            tickSocket.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

            tickSocket.onclose = () => {
                console.log("WebSocket connection closed");
            };
        } else {
            latestTickElem.textContent = "Latest Tick: --";
            lastDigitElem.textContent = "Last Digit: --";
            arrow.style.display = "none";
        }
    });

    digitCircleContainer.appendChild(arrow);
});



