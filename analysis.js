const analysisContainer = document.getElementById('analysis-tools-container');
fetch('./analysistools.html')
    .then(response => response.text())
    .then(html => {
        analysisContainer.innerHTML = html;
    })
    .catch(error => {
        console.error('Error loading analysis tools:', error);
    });


// Function to load the selected HTML file
async function loadFile() {
    const select = document.getElementById("file-select");
    const contentDiv = document.getElementById("content");

    // Get the selected value
    const selectedFile = select.value;

    if (selectedFile) {
        try {
            // Fetch the content of the selected file
            const response = await fetch(selectedFile);

            if (response.ok) {
                const html = await response.text();
                // Insert the HTML content into the div
                contentDiv.innerHTML = html;
            } else {
                contentDiv.innerHTML =
                    "<p>Error: Unable to load the selected file.</p>";
            }
        } catch (error) {
            contentDiv.innerHTML = `<p>Error: ${error.message}</p>`;
        }
    } else {
        contentDiv.innerHTML =
            "<p>Select a file from the dropdown to view its content.</p>";
    }
}