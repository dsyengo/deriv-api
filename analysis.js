const analysisContainer = document.getElementById('analysis-tools-container');
fetch('./analysistools.html')
    .then(response => response.text())
    .then(html => {
        analysisContainer.innerHTML = html;
    })
    .catch(error => {
        console.error('Error loading analysis tools:', error);
    });


// Function to load the selected HTML filefunction loadFile() {
function loadFile() {
    const fileSelect = document.getElementById("file-select");
    const contentDiv = document.getElementById("content");

    // Get the selected file path
    const selectedFile = fileSelect.value;

    if (selectedFile) {
        // Fetch the selected HTML file's content
        fetch(selectedFile)
            .then(response => response.text())
            .then(data => {
                // Create a shadow DOM to isolate styles
                const shadowRoot = contentDiv.attachShadow({ mode: 'open' });

                // Clear previous content and append new content
                shadowRoot.innerHTML = data;
            })
            .catch(error => {
                console.error("Error loading file:", error);
                contentDiv.innerHTML = "<p>Error loading content. Please try again.</p>";
            });
    } else {
        // Reset content div if no file is selected
        contentDiv.innerHTML = "<p>Select a file from the dropdown to view its content.</p>";
    }
}

